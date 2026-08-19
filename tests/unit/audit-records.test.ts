import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { createAuditRecordsCollection } from '../../src/collections/AuditRecords'
import { createUsersCollection } from '../../src/collections/Users'
import {
  buildAuditRecordData,
  isTrustedAuditWriteRequest,
  sanitizeAuditMetadata,
  writeAudit,
} from '../../src/cms/audit/writeAudit'
import { buildUser } from '../fixtures'
import { SENTINEL_SECRET_VALUES, SENTINEL_SECRETS } from '../fixtures/sentinels'

function request(user: Record<string, unknown> | null = null): PayloadRequest {
  return {
    context: {},
    payload: {},
    user,
  } as unknown as PayloadRequest
}

function fieldNames(config: ReturnType<typeof createAuditRecordsCollection>): string[] {
  return config.fields.flatMap((field) => 'name' in field ? [field.name] : [])
}

describe('audit record collection', () => {
  it('exposes only allowlisted fields and Principal read access', () => {
    const config = createAuditRecordsCollection()
    const principal = buildUser({ id: 'principal-001', role: 'principal', active: true })
    const admin = buildUser({ id: 'admin-001', role: 'admin', active: true })

    expect(config.timestamps).toBe(false)
    expect(fieldNames(config)).toEqual([
      'actorType', 'actorId', 'actorRole', 'action', 'targetCollection',
      'targetId', 'occurredAt', 'outcome', 'metadata',
    ])
    expect(config.access?.read?.({ req: request(principal) } as never)).toBe(true)
    expect(config.access?.read?.({ req: request(admin) } as never)).toBe(false)
    expect(config.access?.read?.({ req: request() } as never)).toBe(false)
    expect(config.access?.create?.({ req: request(principal) } as never)).toBe(false)
    expect(config.access?.update?.({ req: request(principal) } as never)).toBe(false)
    expect(config.access?.delete?.({ req: request(principal) } as never)).toBe(false)
  })

  it('blocks update and delete hooks even when ordinary access could be overridden', () => {
    const config = createAuditRecordsCollection()
    const req = request(buildUser({ id: 'principal-001', role: 'principal', active: true }))

    expect(() => config.hooks?.beforeChange?.[0]?.({
      data: {}, operation: 'update', req,
    } as never)).toThrow()
    expect(() => config.hooks?.beforeDelete?.[0]?.({ id: 'audit-001', req } as never)).toThrow()
  })
})

describe('trusted audit writer', () => {
  it('recursively allowlists transition metadata and removes forbidden values', () => {
    const circular: Record<string, unknown> = {
      changes: {
        role: { from: 'teacher', to: 'admin', password: SENTINEL_SECRETS.smtpPassword },
        active: { from: true, to: false },
        address: '1 Private Street',
      },
      rawSubmission: { status: 'new' },
      credentials: SENTINEL_SECRETS.authToken,
      fileBytes: Uint8Array.from([1, 2, 3]),
      status: SENTINEL_SECRETS.payloadSecret,
    }
    circular.self = circular

    const metadata = sanitizeAuditMetadata(circular)
    const serialized = JSON.stringify(metadata)

    expect(metadata).toEqual({
      changes: {
        role: { from: 'teacher', to: 'admin' },
        active: { from: true, to: false },
      },
    })
    for (const sentinel of SENTINEL_SECRET_VALUES) expect(serialized).not.toContain(sentinel)
    expect(serialized).not.toMatch(/address|rawSubmission|credentials|fileBytes/i)
  })

  it('creates through private trusted context, uses minimal data, and restores request context', async () => {
    const req = request(buildUser({ id: 'principal-001', role: 'principal', active: true }))
    const originalContext = req.context
    let stored: Record<string, unknown> | undefined

    req.payload.create = (async (options: Record<string, unknown>) => {
      const trustedReq = { context: options.context } as PayloadRequest
      expect(options).toMatchObject({ collection: 'audit-records', overrideAccess: false, req })
      expect(isTrustedAuditWriteRequest(trustedReq)).toBe(true)
      stored = options.data as Record<string, unknown>
      return stored
    }) as unknown as typeof req.payload.create

    await writeAudit({
      actor: { id: 'principal-001', role: 'principal' },
      action: 'user-access-changed',
      target: { collection: 'users', id: 'user-001' },
      timestamp: '2030-01-01T00:00:00.000Z',
      outcome: 'success',
      metadata: {
        changes: { role: { from: 'teacher', to: 'admin' } },
        password: SENTINEL_SECRETS.smtpPassword,
      },
    }, req)

    expect(req.context).toBe(originalContext)
    expect(isTrustedAuditWriteRequest(req)).toBe(false)
    expect(stored).toEqual(buildAuditRecordData({
      actor: { id: 'principal-001', role: 'principal' },
      action: 'user-access-changed',
      target: { collection: 'users', id: 'user-001' },
      timestamp: '2030-01-01T00:00:00.000Z',
      outcome: 'success',
      metadata: { changes: { role: { from: 'teacher', to: 'admin' } } },
    }))
    expect(JSON.stringify(stored)).not.toContain(SENTINEL_SECRETS.smtpPassword)
  })

  it('persists Users role changes through the registered trusted seam without passwords', async () => {
    const req = request(buildUser({ id: 'principal-001', role: 'principal', active: true }))
    let stored: Record<string, unknown> | undefined
    req.payload.create = (async (options: Record<string, unknown>) => {
      stored = options.data as Record<string, unknown>
      return stored
    }) as unknown as typeof req.payload.create
    const users = createUsersCollection()
    const afterChange = users.hooks?.afterChange?.[0]
    const previous = buildUser({
      id: 'user-001', role: 'teacher', active: true, password: 'Previous-Password-001!',
    })

    await afterChange?.({
      doc: { ...previous, role: 'admin', password: 'Current-Password-002!' },
      operation: 'update',
      previousDoc: previous,
      req,
    } as never)

    expect(stored).toMatchObject({
      actorType: 'user',
      actorId: 'principal-001',
      actorRole: 'principal',
      action: 'user-access-changed',
      targetCollection: 'users',
      targetId: 'user-001',
      outcome: 'success',
      metadata: { changes: { role: { from: 'teacher', to: 'admin' } } },
    })
    expect(JSON.stringify(stored)).not.toContain('Password-00')
  })
})
