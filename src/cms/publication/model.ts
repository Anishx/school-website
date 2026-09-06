import { ValidationError, type PayloadRequest, type RequestContext, type Where } from 'payload'

import { hasContentPermission, resolvePrincipal } from '../../access/roles'
import { isDeepStrictEqual } from 'node:util'

export const PUBLICATION_STATES = ['draft', 'scheduled', 'published', 'expired', 'archived'] as const
export type PublicationState = (typeof PUBLICATION_STATES)[number]

const transitions: Readonly<Record<PublicationState, readonly PublicationState[]>> = {
  draft: ['draft', 'scheduled', 'published', 'archived'],
  scheduled: ['draft', 'scheduled', 'published', 'archived'],
  published: ['draft', 'published', 'expired', 'archived'],
  expired: ['draft', 'scheduled', 'published', 'expired', 'archived'],
  archived: ['draft', 'archived'],
}

export const PUBLICATION_SYSTEM_CONTEXT = Symbol('publication-system-transition')

export function publicationSystemContext(context?: RequestContext): RequestContext {
  return { ...context, [PUBLICATION_SYSTEM_CONTEXT]: true }
}

export type PublicationRecord = Readonly<Record<string, unknown> & {
  publicationState?: unknown
  publishAt?: unknown
  expiresAt?: unknown
}>

function validDate(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function publicationError(req: PayloadRequest, path: string, message: string): never {
  throw new ValidationError({ errors: [{ path, message }], req })
}

export function isPublicationState(value: unknown): value is PublicationState {
  return typeof value === 'string' && PUBLICATION_STATES.includes(value as PublicationState)
}

export function isPubliclyEligible(record: PublicationRecord, now = new Date()): boolean {
  if (record.publicationState !== 'published' || !validDate(record.publishAt)) return false
  const instant = now.getTime()
  if (Date.parse(record.publishAt) > instant) return false
  return !validDate(record.expiresAt) || Date.parse(record.expiresAt) > instant
}

export function preparePublicationChange(args: Readonly<{
  data: Record<string, unknown>
  originalDoc?: PublicationRecord
  req: PayloadRequest
  now?: Date
}>): Record<string, unknown> {
  const now = args.now ?? new Date()
  const principal = resolvePrincipal(args.req.user)
  const trustedSystem = (args.req.context as Record<PropertyKey, unknown> | undefined)?.[PUBLICATION_SYSTEM_CONTEXT] === true
  const previous = isPublicationState(args.originalDoc?.publicationState)
    ? args.originalDoc.publicationState
    : 'draft'
  let next = isPublicationState(args.data.publicationState)
    ? args.data.publicationState
    : previous

  if (principal?.role === 'teacher' && !hasContentPermission(principal, 'approve')) next = 'draft'
  if (principal?.role === 'teacher' && principal.contentAccess === 'custom'
    && hasContentPermission(principal, 'approve') && !hasContentPermission(principal, 'edit') && !trustedSystem) {
    const approvalFields = new Set(['id', 'updatedAt', 'createdAt', 'publicationState', 'publishAt', 'expiresAt',
      'publishedAt', 'publicationActor', 'publicationChangedAt'])
    for (const [field, value] of Object.entries(args.data)) {
      if (!approvalFields.has(field) && !isDeepStrictEqual(value, args.originalDoc?.[field])) {
        return publicationError(args.req, field, 'Your account may approve content, but does not have permission to edit it.')
      }
    }
  }
  if ((!principal || principal.role === 'parent') && !trustedSystem) next = 'draft'
  if (!transitions[previous].includes(next)) {
    return publicationError(args.req, 'publicationState', `Cannot move from ${previous} to ${next}.`)
  }

  const publishAt = args.data.publishAt ?? args.originalDoc?.publishAt
  const expiresAt = args.data.expiresAt ?? args.originalDoc?.expiresAt
  if (publishAt != null && publishAt !== '' && !validDate(publishAt)) {
    return publicationError(args.req, 'publishAt', 'Enter a valid publication time.')
  }
  if (expiresAt != null && expiresAt !== '' && !validDate(expiresAt)) {
    return publicationError(args.req, 'expiresAt', 'Enter a valid expiration time.')
  }
  if (validDate(publishAt) && validDate(expiresAt) && Date.parse(expiresAt) <= Date.parse(publishAt)) {
    return publicationError(args.req, 'expiresAt', 'Expiration must be after publication.')
  }
  if (next === 'scheduled' && (!validDate(publishAt) || Date.parse(publishAt) <= now.getTime())) {
    return publicationError(args.req, 'publishAt', 'Scheduled content needs a future publication time.')
  }
  if (next === 'published' && validDate(publishAt) && Date.parse(publishAt) > now.getTime()) {
    return publicationError(args.req, 'publishAt', 'Future content must use the scheduled state.')
  }

  const changed = next !== previous
  const result: Record<string, unknown> = { ...args.data, publicationState: next }
  if ((next === 'published' || next === 'scheduled') && !validDate(publishAt)) {
    result.publishAt = now.toISOString()
  }
  if (changed) {
    result.publicationChangedAt = now.toISOString()
    result.publicationActor = principal?.id ?? null
    if (next === 'published') result.publishedAt = now.toISOString()
  }
  return result
}

export function publicEligibilityWhere(now = new Date()): Where {
  const instant = now.toISOString()
  return {
    and: [
      { publicationState: { equals: 'published' } },
      { publishAt: { less_than_equal: instant } },
      { or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than: instant } }] },
    ] as Where[],
  }
}
