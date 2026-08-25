import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
  ACCESS_RESOURCES,
  type AccessDecision,
  type AccessRecord,
  type AccessResource,
  type CollectionOperation,
  canAccessCollectionRecord,
  collectionAccessDecision,
  hasEnforcedLocalAccessContext,
} from '../../src/access/collectionAccess'
import {
  canReadSensitiveData,
  fieldAccessDecision,
} from '../../src/access/fieldAccess'
import {
  type AccessSubject,
  type SupportedRole,
} from '../../src/access/roles'

// Feature: payload-cms-expansion, Property 6: Authorization matches the role matrix and fails closed
// **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.10, 6.9, 11.4, 11.9**

type ActorCase = Readonly<{
  user: AccessSubject
  role: SupportedRole | null
  id: string | null
}>

type RelationShape = 'scalar' | 'object'
type LocalMode = 'enforced' | 'override' | 'missing-override' | 'missing-request' | 'missing-user'

const draftResources: ReadonlySet<AccessResource> = new Set([
  'content-sections', 'editorial', 'documents', 'galleries',
])

const adminResources: ReadonlySet<AccessResource> = new Set([
  'admissions', 'notification-settings', 'forms', 'form-submissions',
  'content-sections', 'editorial', 'documents', 'galleries', 'media',
])

const supportedRoleArbitrary = fc.constantFrom<SupportedRole>(
  'principal', 'admin', 'teacher', 'parent',
)

const actorArbitrary: fc.Arbitrary<ActorCase> = fc.oneof(
  supportedRoleArbitrary.map((role) => ({
    user: { id: `actor-${role}`, role, active: true },
    role,
    id: `actor-${role}`,
  })),
  supportedRoleArbitrary.map((role) => ({
    user: { id: `inactive-${role}`, role, active: false },
    role: null,
    id: null,
  })),
  fc.constantFrom<ActorCase>(
    { user: null, role: null, id: null },
    { user: undefined, role: null, id: null },
    { user: {}, role: null, id: null },
    { user: { id: 'legacy-staff', role: 'staff', active: true }, role: null, id: null },
    { user: { id: 'unknown-role', role: 'superuser', active: true }, role: null, id: null },
    { user: { id: '', role: 'admin', active: true }, role: null, id: null },
    { user: { id: ['malformed'], role: 'principal', active: true }, role: null, id: null },
    { user: { id: 'malformed-role', role: 42, active: true }, role: null, id: null },
    { user: { id: 'malformed-active', role: 'admin', active: 'true' }, role: null, id: null },
  ),
)

const targetRoleArbitrary = fc.constantFrom<unknown>(
  'principal', 'admin', 'teacher', 'parent', 'staff', 'unknown', undefined, 42,
)

const publicationStateArbitrary = fc.constantFrom<unknown>(
  'draft', 'scheduled', 'published', 'expired', 'archived', null, 'unknown', 7,
)

const operationArbitrary = fc.constantFrom<CollectionOperation>(
  'create', 'read', 'update', 'delete',
)

const relationShapeArbitrary = fc.constantFrom<RelationShape>('scalar', 'object')
const localModeArbitrary = fc.constantFrom<LocalMode>(
  'enforced', 'override', 'missing-override', 'missing-request', 'missing-user',
)

function relation(id: string, shape: RelationShape): string | Readonly<{ id: string }> {
  return shape === 'object' ? { id } : id
}

function buildRecord(input: Readonly<{
  actor: ActorCase
  ownProfile: boolean
  owned: boolean
  assigned: boolean
  relationShape: RelationShape
  publicationState: unknown
  targetRole: unknown
}>): AccessRecord {
  const actorID = input.actor.id ?? 'denied-actor'
  const otherID = 'other-user'
  const ownerID = input.owned ? actorID : otherID
  const targetID = input.ownProfile ? actorID : otherID
  const assignedID = input.assigned ? actorID : otherID

  return {
    id: relation(targetID, input.relationShape),
    role: input.targetRole,
    createdBy: relation(ownerID, input.relationShape),
    uploadedBy: relation(ownerID, input.relationShape),
    assignedEditors: [relation(assignedID, input.relationShape)],
    publicationState: input.publicationState,
  }
}

function expectedQueryDecision(
  actor: ActorCase,
  resource: AccessResource,
  operation: CollectionOperation,
  requestedPublicationState: unknown,
): AccessDecision {
  if (!actor.role || actor.id === null) return false

  if (actor.role === 'principal') {
    return resource === 'audit-records' || resource === 'notification-deliveries'
      ? operation === 'read'
      : true
  }

  if (actor.role === 'parent') return false

  if (actor.role === 'admin') {
    if (resource === 'audit-records') return false
    if (resource === 'notification-deliveries') return operation === 'read'
    if (resource === 'users') {
      return operation === 'read' || operation === 'update'
        ? { id: { equals: actor.id } }
        : false
    }
    return adminResources.has(resource)
  }

  if (resource === 'users') {
    return operation === 'read' || operation === 'update'
      ? { id: { equals: actor.id } }
      : false
  }
  if (resource === 'media') {
    if (operation === 'create') return true
    return { uploadedBy: { equals: actor.id } }
  }
  if (!draftResources.has(resource)) return false
  if (operation === 'create') return requestedPublicationState === 'draft'
  if (operation !== 'read' && operation !== 'update') return false

  return {
    and: [
      { publicationState: { equals: 'draft' } },
      {
        or: [
          { createdBy: { equals: actor.id } },
          { assignedEditors: { contains: actor.id } },
        ],
      },
    ],
  }
}

function expectedRecordDecision(input: Readonly<{
  actor: ActorCase
  resource: AccessResource
  operation: CollectionOperation
  ownProfile: boolean
  owned: boolean
  assigned: boolean
  publicationState: unknown
  requestedPublicationState: unknown
  targetRole: unknown
}>): boolean {
  const { actor, resource, operation } = input
  if (!actor.role || actor.id === null || actor.role === 'parent') return false

  if (actor.role === 'principal') {
    return resource === 'audit-records' || resource === 'notification-deliveries'
      ? operation === 'read'
      : true
  }

  if (actor.role === 'admin') {
    if (resource === 'audit-records') return false
    if (resource === 'notification-deliveries') return operation === 'read'
    if (resource === 'users') {
      return (operation === 'read' || operation === 'update')
        && input.ownProfile
        && input.targetRole !== 'principal'
    }
    return adminResources.has(resource)
  }

  if (resource === 'users') {
    return (operation === 'read' || operation === 'update') && input.ownProfile
  }
  if (resource === 'media') return operation === 'create' || input.owned
  if (!draftResources.has(resource)) return false
  if (operation === 'create') return input.requestedPublicationState === 'draft'
  return (operation === 'read' || operation === 'update')
    && input.publicationState === 'draft'
    && (input.owned || input.assigned)
}

function localOptions(mode: LocalMode, actor: ActorCase) {
  switch (mode) {
    case 'enforced':
      return { overrideAccess: false, req: { user: actor.user } }
    case 'override':
      return { overrideAccess: true, req: { user: actor.user } }
    case 'missing-override':
      return { req: { user: actor.user } }
    case 'missing-request':
      return { overrideAccess: false }
    case 'missing-user':
      return { overrideAccess: false, req: {} }
  }
}

function expectedPublicationFieldDecision(
  actor: ActorCase,
  operation: 'create' | 'read' | 'update',
  recordState: unknown,
  owned: boolean,
  assigned: boolean,
  nextState: unknown,
): boolean {
  if (!actor.role || actor.role === 'parent') return false
  if (operation === 'read') {
    return actor.role === 'principal'
      || actor.role === 'admin'
      || (actor.role === 'teacher'
        && recordState === 'draft'
        && (owned || assigned))
  }
  return (actor.role === 'principal' || actor.role === 'admin')
    && ['draft', 'scheduled', 'published', 'expired', 'archived'].includes(String(nextState))
}

describe('authorization matrix property', () => {
  it('matches the role matrix and denies unsupported or unenforced contexts', () => {
    fc.assert(
      fc.property(
        fc.record({
          actor: actorArbitrary,
          resource: fc.constantFrom<AccessResource>(...ACCESS_RESOURCES),
          operation: operationArbitrary,
          ownProfile: fc.boolean(),
          owned: fc.boolean(),
          assigned: fc.boolean(),
          relationShape: relationShapeArbitrary,
          publicationState: publicationStateArbitrary,
          requestedPublicationState: publicationStateArbitrary,
          targetRole: targetRoleArbitrary,
          fieldOperation: fc.constantFrom<'create' | 'read' | 'update'>('create', 'read', 'update'),
          localMode: localModeArbitrary,
        }),
        (combination) => {
          const record = buildRecord(combination)
          const collectionInput = {
            user: combination.actor.user,
            resource: combination.resource,
            operation: combination.operation,
            record,
            requestedPublicationState: combination.requestedPublicationState,
          } as const
          const expectedRecord = expectedRecordDecision(combination)
          const options = localOptions(combination.localMode, combination.actor)

          expect(collectionAccessDecision(collectionInput)).toEqual(expectedQueryDecision(
            combination.actor,
            combination.resource,
            combination.operation,
            combination.requestedPublicationState,
          ))
          expect(canAccessCollectionRecord(collectionInput)).toBe(expectedRecord)

          const expectedContext = combination.localMode === 'enforced'
            && combination.actor.role !== null
          expect(hasEnforcedLocalAccessContext(options)).toBe(expectedContext)
          expect(hasEnforcedLocalAccessContext(options) && canAccessCollectionRecord(collectionInput))
            .toBe(expectedContext && expectedRecord)

          expect(canReadSensitiveData(combination.actor.user)).toBe(
            combination.actor.role === 'principal' || combination.actor.role === 'admin',
          )
          expect(fieldAccessDecision({
            user: combination.actor.user,
            policy: 'publication-state',
            operation: combination.fieldOperation,
            record,
            value: combination.requestedPublicationState,
          })).toBe(expectedPublicationFieldDecision(
            combination.actor,
            combination.fieldOperation,
            combination.publicationState,
            combination.owned,
            combination.assigned,
            combination.requestedPublicationState,
          ))
        },
      ),
      { numRuns: 200 },
    )
  })
})
