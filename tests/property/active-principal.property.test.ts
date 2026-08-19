import fc from 'fast-check'
import { Forbidden, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { type SupportedRole } from '../../src/access/roles'
import {
  createUsersCollection,
  wouldRemoveActivePrincipal,
  type UserAccessDocument,
} from '../../src/collections/Users'

// Feature: payload-cms-expansion, Property 7: An active Principal always remains
// **Validates: Requirements 4.13**

type SyntheticUser = Readonly<{
  id: string
  role: SupportedRole
  active: boolean
}>

type UserOperation =
  | Readonly<{ kind: 'delete'; targetIndex: number }>
  | Readonly<{
      kind: 'update'
      targetIndex: number
      role: SupportedRole
      active: boolean
    }>

const roleArbitrary = fc.constantFrom<SupportedRole>(
  'principal', 'admin', 'teacher', 'parent',
)

const userSetArbitrary: fc.Arbitrary<readonly SyntheticUser[]> = fc
  .array(fc.record({ role: roleArbitrary, active: fc.boolean() }), {
    minLength: 1,
    maxLength: 16,
  })
  .map((states) => states.map((state, index) => ({
    id: `synthetic-user-${index}`,
    role: index === 0 ? 'principal' : state.role,
    active: index === 0 ? true : state.active,
  })))
const caseArbitrary = userSetArbitrary.chain((users) => {
  const targetIndexArbitrary = fc.integer({ min: 0, max: users.length - 1 })
  const operationArbitrary: fc.Arbitrary<UserOperation> = fc.oneof(
    targetIndexArbitrary.map((targetIndex) => ({
      kind: 'delete' as const,
      targetIndex,
    })),
    fc.record({
      kind: fc.constant('update' as const),
      targetIndex: targetIndexArbitrary,
      role: roleArbitrary,
      active: fc.boolean(),
    }),
  )

  return fc.record({ users: fc.constant(users), operation: operationArbitrary })
})

function activePrincipalCount(users: readonly SyntheticUser[]): number {
  return users.filter((user) => user.role === 'principal' && user.active).length
}

function applyOperation(
  users: readonly SyntheticUser[],
  operation: UserOperation,
): readonly SyntheticUser[] {
  if (operation.kind === 'delete') {
    return users.filter((_, index) => index !== operation.targetIndex)
  }

  return users.map((user, index) => index === operation.targetIndex
    ? { ...user, role: operation.role, active: operation.active }
    : user)
}

function requestFor(
  users: readonly SyntheticUser[],
  target: SyntheticUser,
  countQueries: unknown[],
): PayloadRequest {
  return {
    user: { id: 'operation-actor', role: 'principal', active: true },
    payload: {
      count: async (options: { where?: unknown }) => {
        countQueries.push(options.where)
        return {
          totalDocs: activePrincipalCount(users.filter((user) => user.id !== target.id)),
        }
      },
      findByID: async () => target,
    },
  } as unknown as PayloadRequest
}
async function operationIsAcceptedByHooks(
  users: readonly SyntheticUser[],
  operation: UserOperation,
): Promise<Readonly<{ accepted: boolean; countQueries: readonly unknown[] }>> {
  const target = users[operation.targetIndex]
  const countQueries: unknown[] = []
  const req = requestFor(users, target, countQueries)
  const hooks = createUsersCollection().hooks

  try {
    if (operation.kind === 'delete') {
      await hooks?.beforeDelete?.[0]?.({ id: target.id, req } as never)
    } else {
      await hooks?.beforeChange?.[0]?.({
        data: { role: operation.role, active: operation.active },
        operation: 'update',
        originalDoc: target as UserAccessDocument,
        req,
      } as never)
    }
    return { accepted: true, countQueries }
  } catch (error) {
    expect(error).toBeInstanceOf(Forbidden)
    return { accepted: false, countQueries }
  }
}

describe('active Principal invariant property', () => {
  it('rejects exactly the updates and deletions that would remove every active Principal', async () => {
    await fc.assert(
      fc.asyncProperty(caseArbitrary, async ({ users, operation }) => {
        const snapshot = structuredClone(users)
        const target = users[operation.targetIndex]
        const candidate = applyOperation(users, operation)
        const preservesInvariant = activePrincipalCount(candidate) > 0

        if (operation.kind === 'update') {
          expect(wouldRemoveActivePrincipal(target, candidate[operation.targetIndex]))
            .toBe(target.role === 'principal'
              && target.active
              && (operation.role !== 'principal' || !operation.active))
        }

        const result = await operationIsAcceptedByHooks(users, operation)
        const expectedCountQuery = operation.kind === 'delete'
          ? target.role === 'principal' && target.active
          : wouldRemoveActivePrincipal(target, candidate[operation.targetIndex])

        expect(result.accepted).toBe(preservesInvariant)
        expect(result.countQueries).toHaveLength(expectedCountQuery ? 1 : 0)
        expect(users).toEqual(snapshot)

        const committed = result.accepted ? candidate : users
        expect(activePrincipalCount(committed)).toBeGreaterThan(0)
        if (!preservesInvariant) expect(committed).toEqual(snapshot)
      }),
      { numRuns: 200, seed: 20250413 },
    )
  })
})
