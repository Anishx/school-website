import type { Where } from 'payload'

import {
  type AccessSubject,
  type AuthenticatedPrincipal,
  type PrincipalID,
  resolvePrincipal,
} from './roles'

export const ACCESS_RESOURCES = [
  'users',
  'admissions',
  'notification-settings',
  'forms',
  'form-submissions',
  'content-sections',
  'editorial',
  'documents',
  'galleries',
  'media',
  'notification-deliveries',
  'audit-records',
] as const

export type AccessResource = (typeof ACCESS_RESOURCES)[number]
export type CollectionOperation = 'create' | 'read' | 'update' | 'delete'
export type AccessDecision = boolean | Where
export type AccessRecord = Readonly<Record<string, unknown>>

export type CollectionAccessInput = Readonly<{
  user: AccessSubject
  resource: AccessResource
  operation: CollectionOperation
  record?: AccessRecord | null
  requestedPublicationState?: unknown
}>

export type LocalAccessOptions = Readonly<{
  overrideAccess?: unknown
  req?: Readonly<{ user?: AccessSubject }> | null
}>

const DRAFT_RESOURCES: ReadonlySet<AccessResource> = new Set([
  'content-sections', 'editorial', 'documents', 'galleries',
])

const ADMIN_RESOURCES: ReadonlySet<AccessResource> = new Set([
  'admissions', 'notification-settings', 'forms', 'form-submissions',
  'content-sections', 'editorial', 'documents', 'galleries', 'media',
])

const accessResourceSet: ReadonlySet<string> = new Set(ACCESS_RESOURCES)
const collectionOperationSet: ReadonlySet<string> = new Set(['create', 'read', 'update', 'delete'])

export function isAccessResource(value: unknown): value is AccessResource {
  return typeof value === 'string' && accessResourceSet.has(value)
}

export function isCollectionOperation(value: unknown): value is CollectionOperation {
  return typeof value === 'string' && collectionOperationSet.has(value)
}

function relationID(value: unknown): PrincipalID | null {
  if (typeof value === 'string' && value.trim().length > 0) return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return relationID((value as { id?: unknown }).id)
}

function sameID(left: unknown, right: PrincipalID): boolean {
  const resolved = relationID(left)
  return resolved !== null && typeof resolved === typeof right && resolved === right
}
export function isOwner(
  user: AccessSubject,
  record: AccessRecord | null | undefined,
  ownerField = 'createdBy',
): boolean {
  const principal = resolvePrincipal(user)
  return principal !== null && record != null && sameID(record[ownerField], principal.id)
}

export function isAssigned(
  user: AccessSubject,
  record: AccessRecord | null | undefined,
  assignmentField = 'assignedEditors',
): boolean {
  const principal = resolvePrincipal(user)
  const assignments = record?.[assignmentField]
  return principal !== null
    && Array.isArray(assignments)
    && assignments.some((assignment) => sameID(assignment, principal.id))
}

export function isDraft(record: AccessRecord | null | undefined): boolean {
  return record?.publicationState === 'draft'
}

export function isOwnedOrAssignedDraft(
  user: AccessSubject,
  record: AccessRecord | null | undefined,
): boolean {
  return isDraft(record) && (isOwner(user, record) || isAssigned(user, record))
}

export function isPublishedRecord(
  record: AccessRecord | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!record || record.publicationState !== 'published') return false
  const currentTime = now.getTime()
  if (!Number.isFinite(currentTime) || typeof record.publishAt !== 'string') return false

  const publishTime = Date.parse(record.publishAt)
  if (!Number.isFinite(publishTime) || publishTime > currentTime) return false
  if (record.expiresAt === null || record.expiresAt === undefined) return true
  if (typeof record.expiresAt !== 'string') return false

  const expirationTime = Date.parse(record.expiresAt)
  return Number.isFinite(expirationTime) && expirationTime > currentTime
}

export function ownerWhere(userID: PrincipalID, ownerField = 'createdBy'): Where {
  return { [ownerField]: { equals: userID } }
}

export function assignedWhere(userID: PrincipalID, assignmentField = 'assignedEditors'): Where {
  return { [assignmentField]: { contains: userID } }
}

export function ownedOrAssignedDraftWhere(userID: PrincipalID): Where {
  return {
    and: [
      { publicationState: { equals: 'draft' } },
      { or: [ownerWhere(userID), assignedWhere(userID)] },
    ],
  }
}

export function uploaderWhere(userID: PrincipalID): Where {
  return ownerWhere(userID, 'uploadedBy')
}
function principalDecision(
  resource: AccessResource,
  operation: CollectionOperation,
): boolean {
  if (resource === 'audit-records' || resource === 'notification-deliveries') {
    return operation === 'read'
  }
  return true
}

function adminDecision(
  principal: AuthenticatedPrincipal,
  resource: AccessResource,
  operation: CollectionOperation,
): AccessDecision {
  if (resource === 'audit-records') return false
  if (resource === 'notification-deliveries') return operation === 'read'
  if (resource === 'users') {
    return operation === 'read' || operation === 'update'
      ? { id: { equals: principal.id } }
      : false
  }
  return ADMIN_RESOURCES.has(resource)
}

function teacherDecision(
  principal: AuthenticatedPrincipal,
  resource: AccessResource,
  operation: CollectionOperation,
  requestedPublicationState: unknown,
): AccessDecision {
  if (resource === 'users') {
    return operation === 'read' || operation === 'update'
      ? { id: { equals: principal.id } }
      : false
  }

  if (resource === 'media') {
    if (operation === 'create') return true
    return uploaderWhere(principal.id)
  }

  if (!DRAFT_RESOURCES.has(resource)) return false
  if (operation === 'create') {
    return requestedPublicationState === 'draft'
  }
  if (operation === 'read' || operation === 'update') {
    return ownedOrAssignedDraftWhere(principal.id)
  }
  return false
}

export function collectionAccessDecision(input: CollectionAccessInput): AccessDecision {
  if (!isAccessResource(input.resource) || !isCollectionOperation(input.operation)) return false
  const principal = resolvePrincipal(input.user)
  if (!principal) return false

  switch (principal.role) {
    case 'principal':
      return principalDecision(input.resource, input.operation)
    case 'admin':
      return adminDecision(principal, input.resource, input.operation)
    case 'teacher':
      return teacherDecision(
        principal,
        input.resource,
        input.operation,
        input.requestedPublicationState,
      )
    case 'parent':
      return false
    default:
      return false
  }
}
export function canAccessCollectionRecord(input: CollectionAccessInput): boolean {
  if (!isAccessResource(input.resource) || !isCollectionOperation(input.operation)) return false
  const principal = resolvePrincipal(input.user)
  if (!principal) return false

  if (principal.role === 'principal') {
    return principalDecision(input.resource, input.operation)
  }
  if (principal.role === 'parent') return false

  if (principal.role === 'admin') {
    if (input.resource === 'users') {
      return (input.operation === 'read' || input.operation === 'update')
        && input.record != null
        && sameID(input.record.id, principal.id)
        && input.record.role !== 'principal'
    }
    return adminDecision(principal, input.resource, input.operation) === true
  }

  if (input.resource === 'users') {
    return (input.operation === 'read' || input.operation === 'update')
      && input.record != null
      && sameID(input.record.id, principal.id)
  }
  if (input.resource === 'media') {
    return input.operation === 'create'
      || isOwner(principal, input.record, 'uploadedBy')
  }
  if (!DRAFT_RESOURCES.has(input.resource)) return false
  if (input.operation === 'create') {
    return input.requestedPublicationState === 'draft'
  }
  return (input.operation === 'read' || input.operation === 'update')
    && isOwnedOrAssignedDraft(principal, input.record)
}

export function hasEnforcedLocalAccessContext(
  options: LocalAccessOptions | null | undefined,
): boolean {
  return options?.overrideAccess === false
    && options.req != null
    && resolvePrincipal(options.req.user) !== null
}
