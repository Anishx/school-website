import { AuthenticationError, Forbidden, ValidationError, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  LEGACY_STAFF_ROLE,
  MINIMUM_PASSWORD_LENGTH,
  assertAuthenticationEligible,
  bootstrapFirstUser,
  buildUserAccessAuditEvent,
  createUsersCollection,
  isPasswordAccepted,
  validateSuppliedPassword,
  wouldRemoveActivePrincipal,
  type UserAccessAuditEvent,
} from '../../src/collections/Users'
import { buildUser } from '../fixtures'

function requestWithCounts(
  counts: readonly number[],
  user: Record<string, unknown> | null = null,
): PayloadRequest {
  let index = 0
  return {
    user,
    payload: {
      count: async () => ({ totalDocs: counts[Math.min(index++, counts.length - 1)] ?? 0 }),
    },
  } as unknown as PayloadRequest
}

function field(config: ReturnType<typeof createUsersCollection>, name: string) {
  return config.fields.find((candidate) => 'name' in candidate && candidate.name === name)
}

describe('users collection schema', () => {
  it('preserves existing fields and adds supported roles, legacy staff, active, and assignments', () => {
    const config = createUsersCollection({ isProduction: true })
    const role = field(config, 'role')

    expect(config.slug).toBe('users')
    expect(field(config, 'name')).toBeDefined()
    expect(field(config, 'active')).toMatchObject({ defaultValue: true, saveToJWT: true })
    expect(field(config, 'assignedSections')).toMatchObject({
      type: 'relationship', relationTo: 'content-sections', hasMany: true,
    })
    expect(role).toMatchObject({ type: 'select', defaultValue: 'parent', saveToJWT: true })
    expect(role && 'options' in role
      ? role.options.map((option) => typeof option === 'string' ? option : option.value)
      : []).toEqual(['principal', 'admin', 'teacher', 'parent', LEGACY_STAFF_ROLE])
  })

  it('configures production cookies as Secure and SameSite=Lax', () => {
    expect(createUsersCollection({ isProduction: true }).auth).toMatchObject({
      cookies: { secure: true, sameSite: 'Lax' },
    })
    expect(createUsersCollection({ isProduction: false }).auth).toMatchObject({
      cookies: { secure: false, sameSite: 'Lax' },
    })
  })
})

describe('users password and authentication policy', () => {
  it('requires at least twelve Unicode characters when a password is supplied', () => {
    expect(MINIMUM_PASSWORD_LENGTH).toBe(12)
    expect(isPasswordAccepted('12345678901')).toBe(false)
    expect(isPasswordAccepted('123456789012')).toBe(true)
    expect(isPasswordAccepted('🔐'.repeat(12))).toBe(true)
    expect(() => validateSuppliedPassword({ password: 'too-short' })).toThrow(ValidationError)
    expect(() => validateSuppliedPassword({ name: 'No password update' })).not.toThrow()
  })

  it('returns the same generic authentication error for inactive accounts', () => {
    let failure: unknown
    try {
      assertAuthenticationEligible({ active: false })
    } catch (error) {
      failure = error
    }

    expect(failure).toBeInstanceOf(AuthenticationError)
    expect((failure as Error).message).toBe('The email or password provided is incorrect.')
    expect(() => assertAuthenticationEligible({ active: true })).not.toThrow()
  })
})

describe('users bootstrap and Principal invariant', () => {
  it('forces the first stored user to active Principal regardless of submitted defaults', async () => {
    const data = await bootstrapFirstUser(
      { role: 'staff', active: false, password: '123456789012' },
      requestWithCounts([0]),
    )

    expect(data).toMatchObject({ role: 'principal', active: true })
  })

  it('allows later user creation only by an active Principal', async () => {
    await expect(bootstrapFirstUser({}, requestWithCounts([1]))).rejects.toBeInstanceOf(Forbidden)
    await expect(bootstrapFirstUser({}, requestWithCounts([1], buildUser({
      id: 'principal-001', role: 'principal', active: true,
    })))).resolves.toEqual({})
  })

  it('detects role changes and disabling that remove an active Principal', () => {
    const principal = { id: 'principal-001', role: 'principal', active: true } as const
    expect(wouldRemoveActivePrincipal(principal, { ...principal, active: false })).toBe(true)
    expect(wouldRemoveActivePrincipal(principal, { ...principal, role: 'admin' })).toBe(true)
    expect(wouldRemoveActivePrincipal(principal, principal)).toBe(false)
    expect(wouldRemoveActivePrincipal(
      { role: 'admin', active: true },
      { role: 'parent', active: false },
    )).toBe(false)
  })
})

describe('users access-state audits', () => {
  it('contains only allowlisted role and active changes and never password data', () => {
    const previous = buildUser({
      id: 'user-001', role: 'teacher', active: true, password: 'Previous-Secret-001!',
    })
    const current = buildUser({
      id: 'user-001', role: 'admin', active: false, password: 'Current-Secret-002!',
    })
    const event = buildUserAccessAuditEvent(
      current,
      previous,
      buildUser({ id: 'principal-001', role: 'principal', active: true }),
      '2030-01-01T00:00:00.000Z',
    )

    expect(event).toEqual({
      actor: { id: 'principal-001', role: 'principal' },
      action: 'user-access-changed',
      target: { collection: 'users', id: 'user-001' },
      timestamp: '2030-01-01T00:00:00.000Z',
      changes: {
        role: { from: 'teacher', to: 'admin' },
        active: { from: true, to: false },
      },
    })
    expect(JSON.stringify(event)).not.toContain('Secret')
    expect(event).not.toHaveProperty('password')
  })

  it('invokes the narrow audit seam only for role or active changes', async () => {
    const events: UserAccessAuditEvent[] = []
    const config = createUsersCollection({
      writeAudit: (event) => { events.push(event) },
    })
    const afterChange = config.hooks?.afterChange?.[0]
    const principal = buildUser({ id: 'principal-001', role: 'principal', active: true })
    const previous = buildUser({ id: 'user-001', role: 'teacher', active: true })

    await afterChange?.({
      doc: { ...previous, role: 'admin', password: 'Never-Audited-001!' },
      operation: 'update',
      previousDoc: previous,
      req: requestWithCounts([1], principal),
    } as never)
    await afterChange?.({
      doc: { ...previous, name: 'Renamed only' },
      operation: 'update',
      previousDoc: previous,
      req: requestWithCounts([1], principal),
    } as never)

    expect(events).toHaveLength(1)
    expect(JSON.stringify(events)).not.toContain('Never-Audited')
  })
})
