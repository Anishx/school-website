import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { createAdmissionPostHandler } from '../../src/cms/admissions/public-route'
import { createNotificationRetryPostHandler } from '../../src/cms/notifications/retry-route'
import { SENTINEL_SECRETS } from '../fixtures/sentinels'

const validAdmission = {
  studentName: 'Synthetic Student', grade: 'Grade 5', dateOfBirth: '2015-06-15',
  gender: 'other', fatherName: 'Parent One', motherName: 'Parent Two',
  contactNumber: '+91 90000 12345', address: '1 Fixture Lane',
}

function request(body: unknown, options: RequestInit = {}): Request {
  return new Request('http://school.example.test/api/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...options.headers },
    body: JSON.stringify(body),
    ...options,
  })
}

function payloadRequest(user: Record<string, unknown> | null = null): PayloadRequest {
  return { context: {}, payload: {}, user } as unknown as PayloadRequest
}

async function json(response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>
}

describe('public admissions route', () => {
  it('returns only the public reference after successful persistence', async () => {
    const submitted: unknown[] = []
    const handler = createAdmissionPostHandler({
      createRequest: async () => payloadRequest(),
      submit: async (input) => {
        submitted.push(input)
        return { ok: true, reference: 'ADM-PUBLIC-001' }
      },
    })

    const response = await handler(request(validAdmission))
    expect(response.status).toBe(201)
    expect(await json(response)).toEqual({ ok: true, reference: 'ADM-PUBLIC-001' })
    expect(submitted).toEqual([validAdmission])
  })

  it.each([
    ['non-JSON content type', request(validAdmission, { headers: { 'content-type': 'text/plain' } }), 415],
    ['oversized body', request({ payload: 'x'.repeat(32 * 1024) }), 413],
    ['non-object JSON', request(['not', 'an', 'object']), 400],
  ])('rejects %s before submission', async (_scenario, input, status) => {
    let submissions = 0
    const handler = createAdmissionPostHandler({
      createRequest: async () => payloadRequest(),
      submit: async () => { submissions += 1; return { ok: true, reference: 'unexpected' } },
    })

    const response = await handler(input)
    expect(response.status).toBe(status)
    expect(await json(response)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION_ERROR' },
    })
    expect(submissions).toBe(0)
  })

  it('projects persistence and unexpected failures without references or private details', async () => {
    for (const submit of [
      async () => ({ ok: false } as const),
      async () => { throw new Error(SENTINEL_SECRETS.databaseUrl) },
    ]) {
      const handler = createAdmissionPostHandler({
        createRequest: async () => payloadRequest(), submit,
      })
      const response = await handler(request(validAdmission))
      const body = await json(response)

      expect(response.status).toBe(503)
      expect(body).toMatchObject({ ok: false, error: { code: 'SERVICE_UNAVAILABLE' } })
      expect(body).not.toHaveProperty('reference')
      expect(JSON.stringify(body)).not.toContain(SENTINEL_SECRETS.databaseUrl)
    }
  })
})

describe('notification retry route', () => {
  it.each([
    ['unauthenticated', null, 401],
    ['parent', { id: 'parent-001', role: 'parent', active: true }, 403],
    ['teacher', { id: 'teacher-001', role: 'teacher', active: true }, 403],
    ['inactive admin', { id: 'admin-001', role: 'admin', active: false }, 403],
    ['legacy staff', { id: 'staff-001', role: 'staff', active: true }, 403],
    ['unknown role', { id: 'unknown-001', role: 'unknown', active: true }, 403],
  ])('denies %s without invoking retry', async (_scenario, user, status) => {
    let retries = 0
    const handler = createNotificationRetryPostHandler({
      authenticate: async () => payloadRequest(user),
      retry: async () => { retries += 1; return { status: 'sent' } },
    })

    const response = await handler(request({ deliveryId: 'delivery-001' }))
    expect(response.status).toBe(status)
    expect(await json(response)).toMatchObject({
      ok: false,
      error: { code: status === 401 ? 'NOT_AUTHENTICATED' : 'NOT_AUTHORIZED' },
    })
    expect(retries).toBe(0)
  })

  it('accepts an active Principal/Admin retry but exposes no delivery fields', async () => {
    const calls: unknown[] = []
    const handler = createNotificationRetryPostHandler({
      authenticate: async () => payloadRequest({ id: 'admin-001', role: 'admin', active: true }),
      retry: async (id) => {
        calls.push(id)
        return {
          id: 'delivery-002', status: 'sent', recipient: 'private@example.test',
          errorMessage: SENTINEL_SECRETS.smtpPassword,
        }
      },
    })

    const response = await handler(request({ deliveryId: 'delivery-001' }))
    expect(response.status).toBe(200)
    expect(await json(response)).toEqual({ ok: true })
    expect(calls).toEqual(['delivery-001'])
  })

  it('validates the retry identifier before calling the retry service', async () => {
    let retries = 0
    const handler = createNotificationRetryPostHandler({
      authenticate: async () => payloadRequest({ id: 'principal-001', role: 'principal', active: true }),
      retry: async () => { retries += 1; return { status: 'sent' } },
    })

    const response = await handler(request({ deliveryId: '', unexpected: true }))
    expect(response.status).toBe(422)
    expect(await json(response)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION_ERROR' },
    })
    expect(retries).toBe(0)
  })
})
