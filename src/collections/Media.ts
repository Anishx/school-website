import {
  Forbidden,
  ValidationError,
  type CollectionConfig,
  type PayloadRequest,
  type RequestContext,
  type Where,
} from 'payload'

import { collectionAccessDecision } from '../access/collectionAccess'
import { canEnterPayloadAdmin, resolvePrincipal } from '../access/roles'
import { assertMediaCanBeDeleted } from '../cms/media/references'

export const MEDIA_VERIFICATION_STATUSES = ['pending', 'verified', 'failed'] as const
export const MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

export type MediaVerificationStatus = (typeof MEDIA_VERIFICATION_STATUSES)[number]

export type PublicMediaDTO = Readonly<{
  url: string
  alt: string
  decorative: boolean
  width?: number
  height?: number
  caption?: string
}>

export type MediaDocument = Readonly<Record<string, unknown> & {
  verificationStatus?: unknown
  url?: unknown
  alt?: unknown
  decorative?: unknown
  caption?: unknown
  width?: unknown
  height?: unknown
  uploadedBy?: unknown
  uploadedAt?: unknown
}>

export type CreateMediaCollectionOptions = Readonly<{
  now?: () => Date
}>

/**
 * Allows the server-side verification finalizer to transition an uploaded asset
 * after it has checked the stored bytes. It is intentionally not exported as a
 * client-visible value and ordinary collection mutations cannot set this marker.
 */
export const MEDIA_VERIFICATION_CONTEXT = Symbol('media-verification-context')

const MAX_TITLE_LENGTH = 160
const MAX_FILENAME_LENGTH = 255
const MAX_CATEGORY_LENGTH = 100
const MAX_ALT_LENGTH = 250
const MAX_CAPTION_LENGTH = 500
const verificationStatusSet: ReadonlySet<string> = new Set(MEDIA_VERIFICATION_STATUSES)

export function verifiedMediaWhere(): Where {
  return { verificationStatus: { equals: 'verified' } }
}

export function isVerifiedMedia(record: MediaDocument | null | undefined): boolean {
  return record?.verificationStatus === 'verified'
}

export function publicMediaProjection(record: MediaDocument | null | undefined): PublicMediaDTO | null {
  if (!isVerifiedMedia(record) || typeof record?.url !== 'string' || record.url.trim().length === 0) {
    return null
  }

  const decorative = record.decorative === true
  const alt = decorative ? '' : typeof record.alt === 'string' ? record.alt.trim() : ''
  if (!decorative && alt.length === 0) return null

  const width = typeof record.width === 'number' && Number.isFinite(record.width) && record.width > 0
    ? record.width
    : undefined
  const height = typeof record.height === 'number' && Number.isFinite(record.height) && record.height > 0
    ? record.height
    : undefined
  const caption = typeof record.caption === 'string' && record.caption.trim().length > 0
    ? record.caption.trim()
    : undefined

  return Object.freeze({
    url: record.url,
    alt,
    decorative,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(caption !== undefined ? { caption } : {}),
  })
}

export function withMediaVerificationContext(context?: RequestContext): RequestContext {
  return { ...context, [MEDIA_VERIFICATION_CONTEXT]: true }
}

function isVerificationContext(req: Pick<PayloadRequest, 'context'>): boolean {
  const context = req.context as Record<PropertyKey, unknown> | undefined
  return context?.[MEDIA_VERIFICATION_CONTEXT] === true
}

function payloadValidationFailure(
  req: PayloadRequest,
  path: string,
  message: string,
): never {
  throw new ValidationError({
    collection: 'media',
    errors: [{ path, message }],
    req,
  })
}

function normalizedRequiredText(
  value: unknown,
  path: string,
  maxLength: number,
  req: PayloadRequest,
): string {
  if (typeof value !== 'string') payloadValidationFailure(req, path, 'Provide a value.')
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) payloadValidationFailure(req, path, 'Provide a value.')
  if (normalized.length > maxLength) payloadValidationFailure(req, path, 'This value is too long.')
  return normalized
}

function normalizedOptionalText(
  value: unknown,
  path: string,
  maxLength: number,
  req: PayloadRequest,
): string | undefined {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value !== 'string') payloadValidationFailure(req, path, 'This value is invalid.')
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (!normalized) return undefined
  if (normalized.length > maxLength) payloadValidationFailure(req, path, 'This value is too long.')
  return normalized
}

function normalizedAccessibility(
  data: Record<string, unknown>,
  req: PayloadRequest,
): Pick<Record<string, unknown>, 'decorative' | 'alt'> {
  const decorative = data.decorative === true
  if (data.decorative !== undefined && typeof data.decorative !== 'boolean') {
    return payloadValidationFailure(req, 'decorative', 'This value is invalid.')
  }

  if (decorative) return { decorative: true, alt: '' }
  if (data.mimeType === 'application/pdf') return { decorative: false, alt: '' }

  return {
    decorative: false,
    alt: normalizedRequiredText(data.alt, 'alt', MAX_ALT_LENGTH, req),
  }
}

function normalizedMetadata(data: Record<string, unknown>, req: PayloadRequest): Record<string, unknown> {
  const caption = normalizedOptionalText(data.caption, 'caption', MAX_CAPTION_LENGTH, req)
  return {
    ...data,
    title: normalizedRequiredText(data.title, 'title', MAX_TITLE_LENGTH, req),
    originalFilename: normalizedRequiredText(
      data.originalFilename,
      'originalFilename',
      MAX_FILENAME_LENGTH,
      req,
    ),
    category: normalizedRequiredText(data.category, 'category', MAX_CATEGORY_LENGTH, req),
    ...normalizedAccessibility(data, req),
    ...(caption !== undefined ? { caption } : { caption: undefined }),
  }
}

/**
 * Normalizes editable metadata and stamps immutable uploader/time values. Pending
 * is the only status that an ordinary create may produce; only the trusted
 * finalizer context can set a verified or failed state after byte verification.
 */
export function prepareMediaData(args: Readonly<{
  data?: Readonly<Record<string, unknown>>
  operation: 'create' | 'update'
  originalDoc?: MediaDocument
  req: PayloadRequest
  now: Date
}>): Record<string, unknown> {
  const raw = { ...(args.data ?? {}) }
  const merged = args.operation === 'update' ? { ...(args.originalDoc ?? {}), ...raw } : raw
  const data = normalizedMetadata(merged, args.req)

  if (args.operation === 'create') {
    const uploader = resolvePrincipal(args.req.user)
    if (!uploader) throw new Forbidden(args.req.t)
    return {
      ...data,
      uploadedBy: uploader.id,
      uploadedAt: args.now.toISOString(),
      verificationStatus: 'pending',
    }
  }

  const verificationStatus = isVerificationContext(args.req)
    ? data.verificationStatus
    : args.originalDoc?.verificationStatus
  if (typeof verificationStatus !== 'string' || !verificationStatusSet.has(verificationStatus)) {
    return payloadValidationFailure(args.req, 'verificationStatus', 'Select a supported verification status.')
  }

  return {
    ...data,
    uploadedBy: args.originalDoc?.uploadedBy,
    uploadedAt: args.originalDoc?.uploadedAt,
    verificationStatus,
  }
}

function mediaReadAccess({ req }: { req: PayloadRequest }) {
  if (!req.user) return verifiedMediaWhere()
  return collectionAccessDecision({ user: req.user, resource: 'media', operation: 'read' })
}

function mediaMutationAccess(operation: 'create' | 'update' | 'delete') {
  return ({ req }: { req: PayloadRequest }) => collectionAccessDecision({
    user: req.user,
    resource: 'media',
    operation,
  })
}

export function createMediaCollection(options: CreateMediaCollectionOptions = {}): CollectionConfig {
  const now = options.now ?? (() => new Date())

  return {
    slug: 'media',
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'mimeType', 'filesize', 'category', 'verificationStatus', 'uploadedAt'],
      description: 'Reusable image and PDF assets become available only after server-side verification.',
    },
    upload: {
      mimeTypes: [...MEDIA_MIME_TYPES],
      imageSizes: [
        { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
        { name: 'card', width: 1200, height: 900, position: 'centre' },
      ],
      adminThumbnail: 'thumbnail',
    },
    access: {
      admin: ({ req }) => canEnterPayloadAdmin(req.user),
      create: mediaMutationAccess('create'),
      read: mediaReadAccess,
      update: mediaMutationAccess('update'),
      delete: mediaMutationAccess('delete'),
    },
    fields: [
      { name: 'title', type: 'text', required: true, maxLength: MAX_TITLE_LENGTH },
      {
        name: 'originalFilename', type: 'text', required: true, maxLength: MAX_FILENAME_LENGTH,
        admin: { readOnly: true },
      },
      { name: 'category', type: 'text', required: true, maxLength: MAX_CATEGORY_LENGTH },
      { name: 'alt', type: 'text', maxLength: MAX_ALT_LENGTH, label: 'Alternative text' },
      {
        name: 'decorative', type: 'checkbox', defaultValue: false,
        label: 'Decorative image',
        admin: { description: 'Decorative images are rendered with an empty alternative text attribute.' },
      },
      { name: 'caption', type: 'textarea', maxLength: MAX_CAPTION_LENGTH },
      {
        name: 'uploadedBy', type: 'relationship', relationTo: 'users', required: true, index: true,
        admin: { position: 'sidebar', readOnly: true },
      },
      {
        name: 'uploadedAt', type: 'date', required: true, index: true,
        admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
      },
      {
        name: 'verificationStatus', type: 'select', required: true, defaultValue: 'pending', index: true,
        options: MEDIA_VERIFICATION_STATUSES.map((status) => ({
          label: status[0].toUpperCase() + status.slice(1), value: status,
        })),
        admin: { position: 'sidebar', readOnly: true },
      },
    ],
    hooks: {
      beforeChange: [
        ({ data, operation, originalDoc, req }) => prepareMediaData({
          data: data as Record<string, unknown> | undefined,
          operation,
          originalDoc: originalDoc as MediaDocument | undefined,
          req,
          now: now(),
        }),
      ],
      beforeDelete: [
        ({ id, req }) => assertMediaCanBeDeleted(id, req),
      ],
      afterRead: [
        ({ doc, req }) => !req.user
          ? publicMediaProjection(doc as MediaDocument)
          : doc,
      ],
    },
  }
}

export const Media: CollectionConfig = createMediaCollection()
export default Media
