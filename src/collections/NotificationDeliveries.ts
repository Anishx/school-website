import { Forbidden, ValidationError, type CollectionConfig, type PayloadRequest, type RequestContext } from 'payload'

import { collectionAccessDecision } from '../access/collectionAccess'
import { fieldAccessDecision } from '../access/fieldAccess'
import { type PrincipalID, isPrincipalID } from '../access/roles'
import { sanitizeText } from '../cms/errors/sanitize'

const TRUSTED_DELIVERY_WRITE = Symbol('trusted-notification-delivery-write')
const DELIVERY_WRITE_MODES = ['create-attempt', 'update-result'] as const
const RESULT_FIELDS = new Set([
  'status', 'recipient', 'attemptedAt', 'providerMessageId', 'errorCode', 'errorMessage',
])

export const DELIVERY_STATUSES = [
  'pending', 'sent', 'failed', 'disabled', 'not_configured',
] as const
export const TERMINAL_DELIVERY_STATUSES = [
  'sent', 'failed', 'disabled', 'not_configured',
] as const
export const NOTIFICATION_SOURCE_TYPES = ['admission', 'form_submission'] as const

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number]
export type TerminalDeliveryStatus = (typeof TERMINAL_DELIVERY_STATUSES)[number]
export type NotificationSourceType = (typeof NOTIFICATION_SOURCE_TYPES)[number]
type DeliveryWriteMode = (typeof DELIVERY_WRITE_MODES)[number]

export type DeliveryAttemptInput = Readonly<{
  sourceType: NotificationSourceType
  sourceId: PrincipalID
  attemptNumber: number
  previousAttempt?: PrincipalID | null
  initiatedBy?: PrincipalID | null
}>

export type DeliveryResultInput = Readonly<{
  status: TerminalDeliveryStatus
  recipient?: string | null
  attemptedAt?: string
  providerMessageId?: string | null
  errorCode?: string | null
  errorMessage?: string | null
}>

function trustedMode(req: Pick<PayloadRequest, 'context'>): DeliveryWriteMode | null {
  const context = req.context as Record<PropertyKey, unknown> | undefined
  const mode = context?.[TRUSTED_DELIVERY_WRITE]
  return typeof mode === 'string' && DELIVERY_WRITE_MODES.includes(mode as DeliveryWriteMode)
    ? mode as DeliveryWriteMode
    : null
}

function trustedContext(
  context: RequestContext | undefined,
  mode: DeliveryWriteMode,
): RequestContext {
  return { ...context, [TRUSTED_DELIVERY_WRITE]: mode }
}

function deny(req: PayloadRequest): never {
  throw new Forbidden(req.t)
}

function validationFailure(req: Partial<PayloadRequest> | undefined, path: string, message: string): never {
  throw new ValidationError({
    collection: 'notification-deliveries',
    errors: [{ path, message }],
    req,
  })
}

function requiredTimestamp(value: unknown, req?: Partial<PayloadRequest>): string {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    return validationFailure(req, 'attemptedAt', 'Provide a valid attempt time.')
  }
  return new Date(Date.parse(value)).toISOString()
}

function optionalSafeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const sanitized = sanitizeText(value.trim()).slice(0, maxLength)
  return sanitized || undefined
}

function validRecipient(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function buildDeliveryAttemptData(
  input: DeliveryAttemptInput,
  req?: Partial<PayloadRequest>,
): Record<string, unknown> {
  if (!NOTIFICATION_SOURCE_TYPES.includes(input.sourceType)) {
    return validationFailure(req, 'sourceType', 'Select a supported notification source.')
  }
  if (!isPrincipalID(input.sourceId)) {
    return validationFailure(req, 'source', 'Select a notification source.')
  }
  if (!Number.isSafeInteger(input.attemptNumber) || input.attemptNumber < 1) {
    return validationFailure(req, 'attemptNumber', 'Attempt number must be a positive integer.')
  }
  const previous = input.previousAttempt ?? null
  if ((input.attemptNumber === 1 && previous !== null)
    || (input.attemptNumber > 1 && !isPrincipalID(previous))) {
    return validationFailure(
      req,
      'previousAttempt',
      input.attemptNumber === 1
        ? 'The first attempt cannot link to a previous attempt.'
        : 'A retry must link to its previous attempt.',
    )
  }
  if (input.initiatedBy != null && !isPrincipalID(input.initiatedBy)) {
    return validationFailure(req, 'initiatedBy', 'Select a valid initiating user.')
  }

  const relationTo = input.sourceType === 'admission' ? 'admissions' : 'form-submissions'
  return Object.freeze({
    channel: 'email',
    sourceType: input.sourceType,
    source: { relationTo, value: input.sourceId },
    status: 'pending',
    attemptNumber: input.attemptNumber,
    ...(previous !== null ? { previousAttempt: previous } : {}),
    ...(input.initiatedBy != null ? { initiatedBy: input.initiatedBy } : {}),
  })
}

export function buildDeliveryResultData(
  input: DeliveryResultInput,
  req?: Partial<PayloadRequest>,
): Record<string, unknown> {
  if (!TERMINAL_DELIVERY_STATUSES.includes(input.status)) {
    return validationFailure(req, 'status', 'Select a terminal delivery outcome.')
  }
  const attemptedAt = requiredTimestamp(input.attemptedAt ?? new Date().toISOString(), req)
  const recipient = validRecipient(input.recipient) ? input.recipient.trim().toLowerCase() : undefined
  if (input.status === 'sent' && !recipient) {
    return validationFailure(req, 'recipient', 'A sent delivery requires a valid recipient.')
  }
  const providerMessageId = optionalSafeText(input.providerMessageId, 200)
  const errorCode = optionalSafeText(input.errorCode, 80)
  const errorMessage = optionalSafeText(input.errorMessage, 500)
  if (input.status === 'failed' && !errorCode && !errorMessage) {
    return validationFailure(req, 'errorMessage', 'A failed delivery requires a sanitized reason.')
  }

  return Object.freeze({
    status: input.status,
    attemptedAt,
    ...(recipient ? { recipient } : {}),
    ...(input.status === 'sent' && providerMessageId ? { providerMessageId } : {}),
    ...(input.status === 'failed' && errorCode ? { errorCode } : {}),
    ...(input.status === 'failed' && errorMessage ? { errorMessage } : {}),
  })
}

export async function createNotificationDeliveryAttempt(
  input: DeliveryAttemptInput,
  req: PayloadRequest,
): Promise<unknown> {
  return req.payload.create({
    collection: 'notification-deliveries',
    data: buildDeliveryAttemptData(input, req),
    context: trustedContext(req.context, 'create-attempt'),
    overrideAccess: false,
    req,
  })
}

export async function updateNotificationDeliveryResult(
  id: PrincipalID,
  result: DeliveryResultInput,
  req: PayloadRequest,
): Promise<unknown> {
  if (!isPrincipalID(id)) validationFailure(req, 'id', 'Select a delivery attempt.')
  return req.payload.update({
    collection: 'notification-deliveries',
    id,
    data: buildDeliveryResultData(result, req),
    context: trustedContext(req.context, 'update-result'),
    overrideAccess: false,
    req,
  })
}

function resultFieldAccess(operation: 'create' | 'read' | 'update', req: PayloadRequest): boolean {
  if (operation === 'create') return trustedMode(req) === 'create-attempt'
  if (operation === 'update') return trustedMode(req) === 'update-result'
  return fieldAccessDecision({
    user: req.user, policy: 'delivery-result', operation: 'read',
  })
}

function identityFieldAccess(operation: 'create' | 'read' | 'update', req: PayloadRequest): boolean {
  if (operation === 'create') return trustedMode(req) === 'create-attempt'
  if (operation === 'update') return false
  return fieldAccessDecision({
    user: req.user, policy: 'delivery-result', operation: 'read',
  })
}

function immutableFieldAccess() {
  return {
    create: ({ req }: { req: PayloadRequest }) => identityFieldAccess('create', req),
    read: ({ req }: { req: PayloadRequest }) => identityFieldAccess('read', req),
    update: ({ req }: { req: PayloadRequest }) => identityFieldAccess('update', req),
  }
}

function resultAccess() {
  return {
    create: ({ req }: { req: PayloadRequest }) => resultFieldAccess('create', req),
    read: ({ req }: { req: PayloadRequest }) => resultFieldAccess('read', req),
    update: ({ req }: { req: PayloadRequest }) => resultFieldAccess('update', req),
  }
}

export function createNotificationDeliveriesCollection(): CollectionConfig {
  const readAccess = ({ req }: { req: PayloadRequest }) => collectionAccessDecision({
    user: req.user,
    resource: 'notification-deliveries',
    operation: 'read',
  })

  return {
    slug: 'notification-deliveries',
    timestamps: false,
    admin: {
      useAsTitle: 'status',
      defaultColumns: ['sourceType', 'status', 'attemptNumber', 'attemptedAt', 'recipient'],
      description: 'Immutable notification attempts. Retries are stored as linked new attempts.',
    },
    access: {
      create: ({ req }) => trustedMode(req) === 'create-attempt',
      read: readAccess,
      update: ({ req }) => trustedMode(req) === 'update-result',
      delete: () => false,
    },
    fields: [
      {
        name: 'channel', type: 'select', required: true, defaultValue: 'email',
        options: [{ label: 'Email', value: 'email' }], access: immutableFieldAccess(),
      },
      {
        name: 'sourceType', type: 'select', required: true, index: true,
        options: [
          { label: 'Admission', value: 'admission' },
          { label: 'Form submission', value: 'form_submission' },
        ],
        access: immutableFieldAccess(),
      },
      {
        name: 'source', type: 'relationship', required: true, index: true,
        relationTo: ['admissions', 'form-submissions'], access: immutableFieldAccess(),
      },
      {
        name: 'status', type: 'select', required: true, defaultValue: 'pending', index: true,
        options: DELIVERY_STATUSES.map((status) => ({
          label: status.replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase()), value: status,
        })),
        access: resultAccess(),
      },
      {
        name: 'attemptNumber', type: 'number', required: true, min: 1,
        access: immutableFieldAccess(),
      },
      {
        name: 'attemptedAt', type: 'date', index: true,
        admin: { date: { pickerAppearance: 'dayAndTime' } }, access: resultAccess(),
      },
      { name: 'recipient', type: 'email', access: resultAccess() },
      { name: 'providerMessageId', type: 'text', maxLength: 200, access: resultAccess() },
      { name: 'errorCode', type: 'text', maxLength: 80, access: resultAccess() },
      { name: 'errorMessage', type: 'textarea', maxLength: 500, access: resultAccess() },
      {
        name: 'initiatedBy', type: 'relationship', relationTo: 'users',
        access: immutableFieldAccess(),
      },
      {
        name: 'previousAttempt', type: 'relationship', relationTo: 'notification-deliveries',
        index: true, access: immutableFieldAccess(),
      },
    ],
    hooks: {
      beforeValidate: [
        ({ data, operation, req }) => {
          const mode = trustedMode(req)
          if (operation === 'create' && mode === 'create-attempt') return data
          if (operation === 'update' && mode === 'update-result') {
            const record = (data ?? {}) as Record<string, unknown>
            if (Object.keys(record).some((key) => !RESULT_FIELDS.has(key))) return deny(req)
            return buildDeliveryResultData(record as DeliveryResultInput, req)
          }
          return deny(req)
        },
      ],
      beforeChange: [
        ({ data, operation, req }) => {
          const expected = operation === 'create' ? 'create-attempt' : 'update-result'
          if (trustedMode(req) !== expected) return deny(req)
          if (operation === 'update'
            && Object.keys((data ?? {}) as object).some((key) => !RESULT_FIELDS.has(key))) {
            return deny(req)
          }
          return data
        },
      ],
      beforeDelete: [({ req }) => deny(req)],
    },
  }
}

export const NotificationDeliveries: CollectionConfig = createNotificationDeliveriesCollection()
export default NotificationDeliveries