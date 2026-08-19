import { randomBytes } from 'node:crypto'

import {
  ValidationError,
  type CollectionConfig,
  type PayloadRequest,
} from 'payload'

import { collectionAccessDecision } from '../access/collectionAccess'
import { canReadSensitiveData } from '../access/fieldAccess'
import {
  isPrincipalID,
  resolvePrincipal,
  type PrincipalID,
} from '../access/roles'
import {
  createNotificationDeliveryAttempt,
  type DeliveryAttemptInput,
} from './NotificationDeliveries'
import { writeAudit, type AuditWriteEvent } from '../cms/audit/writeAudit'
import { projectAnonymousAdmissionCreate } from '../cms/admissions/present'
import { isAdmissionSubmissionRequest } from '../cms/admissions/submit'
import {
  ADMISSION_FIELD_NAMES,
  ADMISSION_GENDERS,
  ADMISSION_STATUSES,
  NARRATIVE_ADMISSION_LIMIT,
  SINGLE_LINE_ADMISSION_LIMIT,
  type AdmissionStatus,
} from '../cms/admissions/schema'
import { StructuredError } from '../cms/errors/structured-error'
import { validateAdmission } from '../cms/admissions/validate'

export type AdmissionDocument = Readonly<Record<string, unknown> & {
  id: PrincipalID
  referenceCode?: string | null
  status?: AdmissionStatus | null
  submittedAt?: string | null
  statusChangedAt?: string | null
  statusChangedBy?: unknown
}>

export type AdmissionAuditWriter = (
  event: AuditWriteEvent,
  req: PayloadRequest,
) => Promise<void> | void

export type AdmissionDeliveryEnqueuer = (
  input: DeliveryAttemptInput,
  req: PayloadRequest,
) => Promise<unknown>

export type CreateAdmissionsCollectionOptions = Readonly<{
  now?: () => Date
  referenceCode?: () => string
  writeAudit?: AdmissionAuditWriter
  enqueueDelivery?: AdmissionDeliveryEnqueuer
}>

const fieldNames = new Set<string>(ADMISSION_FIELD_NAMES)

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key)
}

export function generateAdmissionReferenceCode(): string {
  return `ADM-${randomBytes(16).toString('hex').toUpperCase()}`
}

function canonicalBirthDate(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const timestamp = Date.parse(trimmed)
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : value
}

function admissionFields(value: Readonly<Record<string, unknown>> | null | undefined) {
  const result: Record<string, unknown> = {}
  if (!value) return result
  for (const field of ADMISSION_FIELD_NAMES) {
    if (hasOwn(value, field)) {
      result[field] = field === 'dateOfBirth' ? canonicalBirthDate(value[field]) : value[field]
    }
  }
  return result
}

function payloadValidationError(error: StructuredError, req: PayloadRequest): ValidationError {
  return new ValidationError({
    collection: 'admissions',
    errors: error.fieldErrors.map(({ field, message }) => ({ path: field, message })),
    req,
  })
}

export function prepareAdmissionData(args: Readonly<{
  data?: Readonly<Record<string, unknown>>
  operation: 'create' | 'update'
  originalDoc?: Readonly<Record<string, unknown>>
  req: PayloadRequest
  now: Date
  referenceCode: () => string
}>): Record<string, unknown> {
  const raw = { ...(args.data ?? {}) }
  const candidate: Record<string, unknown> = args.operation === 'create'
    ? { ...raw, status: 'pending' }
    : { ...admissionFields(args.originalDoc), ...raw }
  if (hasOwn(candidate, 'dateOfBirth')) candidate.dateOfBirth = canonicalBirthDate(candidate.dateOfBirth)

  let validated: Readonly<Record<string, unknown>>
  try {
    validated = validateAdmission(candidate, { now: args.now })
  } catch (error) {
    if (error instanceof StructuredError) throw payloadValidationError(error, args.req)
    throw error
  }

  if (args.operation === 'create') {
    const submittedAt = args.now.toISOString()
    return {
      ...validated,
      referenceCode: args.referenceCode(),
      submittedAt,
      status: 'pending',
      statusChangedAt: submittedAt,
    }
  }

  const result: Record<string, unknown> = {}
  for (const key of Object.keys(raw)) {
    if (fieldNames.has(key)) result[key] = validated[key]
  }
  return result
}

export function applyAdmissionStatusMetadata(args: Readonly<{
  data: Record<string, unknown>
  originalDoc?: AdmissionDocument
  req: PayloadRequest
  now: Date
}>): Record<string, unknown> {
  if (!hasOwn(args.data, 'status') || args.data.status === args.originalDoc?.status) return args.data
  const actor = resolvePrincipal(args.req.user)
  if (!actor || (actor.role !== 'principal' && actor.role !== 'admin')) return args.data
  return {
    ...args.data,
    statusChangedBy: actor.id,
    statusChangedAt: args.now.toISOString(),
  }
}

export function buildAdmissionStatusAuditEvent(
  doc: AdmissionDocument,
  previous: AdmissionDocument | null | undefined,
  actorInput: unknown,
  timestamp: string,
): AuditWriteEvent | null {
  if (!previous || doc.status === previous.status || !doc.status) return null
  const actor = resolvePrincipal(actorInput as Parameters<typeof resolvePrincipal>[0])
  if (!actor || (actor.role !== 'principal' && actor.role !== 'admin')) return null
  return Object.freeze({
    actor: Object.freeze({ id: actor.id, role: actor.role }),
    action: 'admission-status-changed',
    target: Object.freeze({ collection: 'admissions', id: doc.id }),
    timestamp,
    outcome: 'success',
    metadata: Object.freeze({
      admissionStatus: Object.freeze({
        from: previous.status ?? 'pending',
        to: doc.status,
      }),
    }),
  })
}

function privateAccess(operation: 'read' | 'update' | 'delete') {
  return ({ req }: { req: PayloadRequest }) => collectionAccessDecision({
    user: req.user,
    resource: 'admissions',
    operation,
  })
}

function publicOrPrivateCreate({ req }: { req: PayloadRequest }): boolean {
  if (!req.user) return true
  return collectionAccessDecision({
    user: req.user,
    resource: 'admissions',
    operation: 'create',
  }) === true
}

const statusOptions = ADMISSION_STATUSES.map((status) => ({
  label: status[0].toUpperCase() + status.slice(1),
  value: status,
}))

export function createAdmissionsCollection(
  options: CreateAdmissionsCollectionOptions = {},
): CollectionConfig {
  const now = options.now ?? (() => new Date())
  const referenceCode = options.referenceCode ?? generateAdmissionReferenceCode
  const audit = options.writeAudit ?? writeAudit
  const enqueue = options.enqueueDelivery ?? createNotificationDeliveryAttempt

  return {
    slug: 'admissions',
    admin: {
      useAsTitle: 'studentName',
      defaultColumns: [
        'studentName', 'grade', 'fatherName', 'contactNumber', 'submittedAt', 'status',
      ],
    },
    access: {
      admin: ({ req }) => canReadSensitiveData(req.user),
      create: publicOrPrivateCreate,
      read: privateAccess('read'),
      update: privateAccess('update'),
      delete: privateAccess('delete'),
    },
    fields: [
      { name: 'studentName', type: 'text', required: true, maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Student Full Name' },
      { name: 'grade', type: 'text', required: true, maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Class Applying For' },
      {
        name: 'dateOfBirth', type: 'date', required: true, label: 'Date of Birth',
        admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' } },
      },
      {
        name: 'gender', type: 'select', required: true,
        options: ADMISSION_GENDERS.map((value) => ({
          label: value[0].toUpperCase() + value.slice(1), value,
        })),
      },
      { name: 'bloodGroup', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Blood Group' },
      { name: 'category', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Category (Gen/OBC/SC/ST/EWS)' },
      {
        name: 'aadharNo', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Aadhar No.',
        admin: {
          components: { Cell: '/components/payload/MaskedAadhaarCell#MaskedAadhaarCell' },
          description: 'Aadhaar numbers are masked in collection lists.',
        },
      },
      { name: 'motherTongue', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Mother Tongue / Nationality' },
      { name: 'previousSchool', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Previous School Name' },
      { name: 'previousSchoolAddress', type: 'textarea', maxLength: NARRATIVE_ADMISSION_LIMIT, label: 'Previous School Address' },
      { name: 'board', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Board' },
      { name: 'classLastStudied', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Class Last Studied' },
      { name: 'transferCertificateNo', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Transfer Certificate No.' },
      { name: 'fatherName', type: 'text', required: true, maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: "Father's Name" },
      { name: 'fatherOccupation', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: "Father's Occupation" },
      { name: 'fatherQualification', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: "Father's Qualification" },
      { name: 'motherName', type: 'text', required: true, maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: "Mother's Name" },
      { name: 'motherOccupation', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: "Mother's Occupation" },
      { name: 'motherQualification', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: "Mother's Qualification" },
      { name: 'contactNumber', type: 'text', required: true, maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Contact Number' },
      { name: 'alternatePhone', type: 'text', maxLength: SINGLE_LINE_ADMISSION_LIMIT, label: 'Alternate Contact Number' },
      { name: 'parentEmail', type: 'email', label: 'Email ID' },
      { name: 'address', type: 'textarea', required: true, maxLength: NARRATIVE_ADMISSION_LIMIT, label: 'Residential Address' },
      { name: 'permanentAddress', type: 'textarea', maxLength: NARRATIVE_ADMISSION_LIMIT, label: 'Permanent Address' },
      { name: 'documentsEnclosed', type: 'json', label: 'Documents Enclosed' },
      {
        name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true,
        admin: { position: 'sidebar' }, options: statusOptions,
      },
      {
        name: 'referenceCode', type: 'text', unique: true, index: true,
        admin: { position: 'sidebar', readOnly: true },
      },
      {
        name: 'submittedAt', type: 'date', index: true,
        admin: {
          position: 'sidebar', readOnly: true,
          date: { pickerAppearance: 'dayAndTime' },
        },
      },
      {
        name: 'statusChangedBy', type: 'relationship', relationTo: 'users',
        admin: { position: 'sidebar', readOnly: true },
      },
      {
        name: 'statusChangedAt', type: 'date',
        admin: {
          position: 'sidebar', readOnly: true,
          date: { pickerAppearance: 'dayAndTime' },
        },
      },
    ],
    hooks: {
      beforeValidate: [
        ({ data, operation, originalDoc, req }) => prepareAdmissionData({
          data: data as Record<string, unknown> | undefined,
          operation,
          originalDoc: originalDoc as Record<string, unknown> | undefined,
          req,
          now: now(),
          referenceCode,
        }),
      ],
      beforeChange: [
        ({ data, operation, originalDoc, req }) => operation === 'update'
          ? applyAdmissionStatusMetadata({
              data: data as Record<string, unknown>,
              originalDoc: originalDoc as AdmissionDocument | undefined,
              req,
              now: now(),
            })
          : data,
      ],
      afterChange: [
        async ({ doc, operation, previousDoc, req }) => {
          const admission = doc as AdmissionDocument
          if (operation === 'create') {
            if (!isPrincipalID(admission.id)) {
              throw new Error('Created admission has no persistent identifier.')
            }
            if (!isAdmissionSubmissionRequest(req)) {
              await enqueue({
                sourceType: 'admission',
                sourceId: admission.id,
                attemptNumber: 1,
              }, req)
            }
          } else {
            const event = buildAdmissionStatusAuditEvent(
              admission,
              previousDoc as AdmissionDocument | undefined,
              req.user,
              now().toISOString(),
            )
            if (event) await audit(event, req)
          }
          return doc
        },
      ],
      afterRead: [
        ({ doc, req }) => canReadSensitiveData(req.user)
          ? doc
          : projectAnonymousAdmissionCreate(doc as Record<string, unknown>),
      ],
    },
  }
}

export const Admissions: CollectionConfig = createAdmissionsCollection()
export default Admissions
