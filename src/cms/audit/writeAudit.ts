import type { PayloadRequest, RequestContext } from 'payload'

import {
  registerUserAccessAuditWriter,
  type UserAccessAuditEvent,
} from '../../collections/Users'
import {
  SUPPORTED_ROLES,
  type PrincipalID,
  type SupportedRole,
} from '../../access/roles'
import { isSensitiveKey, sanitizeText } from '../errors/sanitize'

const TRUSTED_AUDIT_WRITE = Symbol('trusted-audit-write')
const MAX_METADATA_DEPTH = 6
const MAX_METADATA_ITEMS = 50
const MAX_METADATA_STRING_LENGTH = 120

export const AUDIT_OUTCOMES = ['success', 'failure', 'denied'] as const
export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number]

export type AuditActor = 'system' | Readonly<{
  id: PrincipalID
  role: SupportedRole
}>

export type AuditTarget = Readonly<{
  collection: string
  id: PrincipalID
}>

export interface AuditMetadata {
  readonly [key: string]: AuditMetadataValue
}
export type AuditMetadataValue =
  | null
  | boolean
  | number
  | string
  | AuditMetadata

export type AuditWriteEvent = Readonly<{
  actor: AuditActor
  action: string
  target: AuditTarget
  timestamp?: string
  outcome?: AuditOutcome
  metadata?: unknown
}>

export type AuditRecordData = Readonly<{
  actorType: 'system' | 'user'
  actorId?: string
  actorRole?: SupportedRole
  action: string
  targetCollection: string
  targetId: string
  occurredAt: string
  outcome: AuditOutcome
  metadata?: AuditMetadata
}>

const metadataKeys = new Set([
  'changes',
  'from',
  'to',
  'role',
  'active',
  'contentAccess',
  'mode',
  'edit',
  'remove',
  'approve',
  'publicationState',
  'admissionStatus',
  'notificationEnabled',
  'recipientChanged',
  'submissionReviewStatus',
  'reviewStatus',
  'status',
  'sourceType',
  'attemptNumber',
  'reasonCode',
  'errorCode',
])

const unsafeMetadataText = /(?:aadh?aar|address|authorization|bearer|credential|password|secret|session|token)/i
const safeMetadataText = /^[a-z0-9][a-z0-9._:-]*$/i
const safeName = /^[a-z0-9][a-z0-9._-]*$/i

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function sanitizedMetadataValue(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
): AuditMetadataValue | undefined {
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed || trimmed.length > MAX_METADATA_STRING_LENGTH) return undefined
    if (!safeMetadataText.test(trimmed) || unsafeMetadataText.test(trimmed)) return undefined
    if (sanitizeText(trimmed) !== trimmed) return undefined
    return trimmed
  }
  if (!isRecord(value) || depth >= MAX_METADATA_DEPTH || seen.has(value)) return undefined

  seen.add(value)
  const result: Record<string, AuditMetadataValue> = {}
  for (const [key, nested] of Object.entries(value).slice(0, MAX_METADATA_ITEMS)) {
    if (!metadataKeys.has(key) || isSensitiveKey(key)) continue
    const sanitized = sanitizedMetadataValue(nested, seen, depth + 1)
    if (sanitized !== undefined) result[key] = sanitized
  }
  return Object.keys(result).length > 0 ? Object.freeze(result) : undefined
}

/** Keeps only state-transition metadata; free-form submission and secret data is discarded. */
export function sanitizeAuditMetadata(value: unknown): AuditMetadata | undefined {
  const sanitized = sanitizedMetadataValue(value, new WeakSet<object>(), 0)
  return isRecord(sanitized) ? sanitized as AuditMetadata : undefined
}

function requiredIdentifier(value: unknown, field: string, maxLength = 200): string {
  const normalized = typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : typeof value === 'string' ? value.trim() : ''
  if (!normalized || normalized.length > maxLength) {
    throw new Error(`Invalid audit ${field}.`)
  }
  return normalized
}

function requiredName(value: unknown, field: string): string {
  const normalized = requiredIdentifier(value, field, 80)
  if (!safeName.test(normalized) || isSensitiveKey(normalized)) {
    throw new Error(`Invalid audit ${field}.`)
  }
  return normalized
}

function requiredTimestamp(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid audit timestamp.')
  const time = Date.parse(value)
  if (!Number.isFinite(time)) throw new Error('Invalid audit timestamp.')
  return new Date(time).toISOString()
}

function isSupportedRole(value: unknown): value is SupportedRole {
  return typeof value === 'string' && SUPPORTED_ROLES.includes(value as SupportedRole)
}

function isAuditOutcome(value: unknown): value is AuditOutcome {
  return typeof value === 'string' && AUDIT_OUTCOMES.includes(value as AuditOutcome)
}

export function buildAuditRecordData(
  event: AuditWriteEvent,
  now: Date = new Date(),
): AuditRecordData {
  const occurredAt = requiredTimestamp(event.timestamp ?? now.toISOString())
  const action = requiredName(event.action, 'action')
  const targetCollection = requiredName(event.target?.collection, 'target collection')
  const targetId = requiredIdentifier(event.target?.id, 'target id')
  const outcome = event.outcome ?? 'success'
  if (!isAuditOutcome(outcome)) throw new Error('Invalid audit outcome.')

  const metadata = sanitizeAuditMetadata(event.metadata)
  if (event.actor === 'system') {
    return Object.freeze({
      actorType: 'system', action, targetCollection, targetId, occurredAt, outcome,
      ...(metadata ? { metadata } : {}),
    })
  }

  if (!isRecord(event.actor) || !isSupportedRole(event.actor.role)) {
    throw new Error('Invalid audit actor.')
  }
  const actorId = requiredIdentifier(event.actor.id, 'actor id')
  return Object.freeze({
    actorType: 'user', actorId, actorRole: event.actor.role,
    action, targetCollection, targetId, occurredAt, outcome,
    ...(metadata ? { metadata } : {}),
  })
}

/** Only this module can mint the context marker accepted by AuditRecords. */
function trustedAuditContext(context: RequestContext | undefined): RequestContext {
  return { ...context, [TRUSTED_AUDIT_WRITE]: true }
}

export function isTrustedAuditWriteRequest(req: Pick<PayloadRequest, 'context'>): boolean {
  const context = req.context as Record<PropertyKey, unknown> | undefined
  return context?.[TRUSTED_AUDIT_WRITE] === true
}

/** Creates one append-only record while preserving the caller's transaction and request context. */
export async function writeAudit(
  event: AuditWriteEvent,
  req: PayloadRequest,
): Promise<void> {
  const data = buildAuditRecordData(event)
  const originalContext = req.context
  try {
    await req.payload.create({
      collection: 'audit-records',
      data,
      context: trustedAuditContext(originalContext),
      overrideAccess: false,
      req,
    })
  } finally {
    req.context = originalContext
  }
}

export async function writeUserAccessAudit(
  event: UserAccessAuditEvent,
  req: PayloadRequest,
): Promise<void> {
  await writeAudit({
    actor: event.actor,
    action: event.action,
    target: event.target,
    timestamp: event.timestamp,
    outcome: 'success',
    metadata: { changes: event.changes },
  }, req)
}

// Importing AuditRecords installs the Task 2.2 seam; the returned guard prevents stale cleanup.
export const unregisterUserAccessAuditWriter = registerUserAccessAuditWriter(writeUserAccessAudit)
