import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { createAdmissionsCollection } from '../../src/collections/Admissions'
import { maskAadhaar } from '../../src/cms/admissions/present'
import { createAdmissionPostHandler } from '../../src/cms/admissions/public-route'
import { submitAdmission } from '../../src/cms/admissions/submit'
import { validateAdmission } from '../../src/cms/admissions/validate'
import { retryNotificationDelivery } from '../../src/cms/notifications/retry'
import { buildUser, createMockSmtpTransport, SYNTHETIC_RECIPIENTS } from '../fixtures'

const NOW = new Date('2030-01-15T10:00:00.000Z')
const admission = {
  studentName: 'Synthetic Student', grade: 'Grade 5', dateOfBirth: '2015-06-15',
  gender: 'other', fatherName: 'Parent One', motherName: 'Parent Two',
  contactNumber: '+91 90000 12345', address: '1 Fixture Lane',
}

function request(user: Record<string, unknown> | null = null): PayloadRequest {
  return { context: {}, payload: {}, user } as unknown as PayloadRequest
}

async function json(response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>
}

describe('admissions synthetic integration regression coverage', () => {
  it('returns only a reference, bounds field errors, and denies anonymous private operations', async () => {
    const accepted = createAdmissionPostHandler({
      createRequest: async () => request(),
      submit: async () => ({ ok: true, reference: 'ADM-SYNTHETIC-001' }),
    })
    const success = await accepted(new Request('https://school.example.test/api/admissions', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(admission),
    }))
    expect(success.status).toBe(201)
    expect(await json(success)).toEqual({ ok: true, reference: 'ADM-SYNTHETIC-001' })

    const validating = createAdmissionPostHandler({
      createRequest: async () => request(),
      submit: async (input) => {
        validateAdmission(input, { now: NOW })
        return { ok: true, reference: 'unexpected' }
      },
    })
    const invalid = await validating(new Request('https://school.example.test/api/admissions', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...admission, studentName: ' ', contactNumber: '123', unexpected: 'do-not-echo' }),
    }))
    const invalidBody = await json(invalid)
    expect(invalid.status).toBe(422)
    expect(invalidBody).toMatchObject({ ok: false, error: { code: 'VALIDATION_ERROR' } })
    expect((invalidBody.error as { fields?: unknown }).fields).toEqual([
      { field: 'studentName', code: 'REQUIRED', message: 'This field is required.' },
      { field: 'contactNumber', code: 'INVALID_FORMAT', message: 'Use a valid format.' },
      { field: 'unexpected', code: 'INVALID', message: 'This field is invalid.' },
    ])
    expect(JSON.stringify(invalidBody)).not.toContain('do-not-echo')

    const collection = createAdmissionsCollection()
    for (const operation of ['read', 'update', 'delete'] as const) {
      expect(await collection.access?.[operation]?.({ req: request() } as never)).toBe(false)
    }
  })

  it('masks Aadhaar in list configuration and audits status without Sensitive_Data', async () => {
    const audits: unknown[] = []
    const collection = createAdmissionsCollection({
      now: () => NOW,
      writeAudit: async (event) => { audits.push(event) },
    })
    const aadhaar = collection.fields.find((field) => 'name' in field && field.name === 'aadharNo')
    expect(aadhaar).toMatchObject({
      admin: { components: { Cell: '/components/payload/MaskedAadhaarCell#MaskedAadhaarCell' } },
    })
    expect(maskAadhaar('1111 2222-3333')).toBe('••••••••3333')

    const req = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    const previous = {
      id: 'admission-001', status: 'pending', aadharNo: '111122223333', address: 'Private address',
    }
    const changed = await collection.hooks?.beforeChange?.[0]?.({
      data: { status: 'reviewed' }, operation: 'update', originalDoc: previous, req,
    } as never) as Record<string, unknown>
    expect(changed).toMatchObject({
      status: 'reviewed', statusChangedBy: 'admin-001', statusChangedAt: NOW.toISOString(),
    })
    await collection.hooks?.afterChange?.[0]?.({
      doc: { ...previous, ...changed }, operation: 'update', previousDoc: previous, req,
    } as never)
    expect(audits).toEqual([expect.objectContaining({
      action: 'admission-status-changed',
      metadata: { admissionStatus: { from: 'pending', to: 'reviewed' } },
    })])
    expect(JSON.stringify(audits)).not.toMatch(/111122223333|Private address/)
  })

  it('preserves committed persistence when mock SMTP fails', async () => {
    const calls: string[] = []
    const req = {
      context: {},
      payload: {
        db: {
          beginTransaction: async () => { calls.push('begin'); return 'transaction-001' },
          commitTransaction: async () => { calls.push('commit') },
          rollbackTransaction: async () => { calls.push('rollback') },
        },
        create: async ({ collection }: { collection: string }) => {
          calls.push(`create:${collection}`)
          return { id: 'admission-001', referenceCode: 'ADM-SYNTHETIC-002' }
        },
      },
    } as unknown as PayloadRequest
    const smtp = createMockSmtpTransport({ failWith: new Error('synthetic SMTP failure') })
    const result = await submitAdmission(admission, req, {
      createDelivery: async () => {
        calls.push('create:notification-deliveries')
        return { id: 'delivery-001' }
      },
      deliver: async () => await smtp.sendMail({ to: SYNTHETIC_RECIPIENTS.admission, subject: 'Synthetic admission' }),
    })

    expect(result).toEqual({ ok: true, reference: 'ADM-SYNTHETIC-002' })
    expect(calls).toEqual(['begin', 'create:admissions', 'create:notification-deliveries', 'commit'])
    expect(smtp.deliveries).toEqual([])
  })

  it('retries only as a linked delivery without duplicating its synthetic admission', async () => {
    const source = Object.freeze({ id: 'admission-001', referenceCode: 'ADM-SYNTHETIC-003' })
    const attempts: unknown[] = []
    const audits: unknown[] = []
    const result = await retryNotificationDelivery('delivery-001', request(buildUser({
      id: 'principal-001', role: 'principal', active: true,
    })), {
      loadDelivery: async () => ({
        id: 'delivery-001', sourceType: 'admission', status: 'failed', attemptNumber: 1,
        source: { relationTo: 'admissions', value: source.id },
      }),
      createAttempt: async (input) => { attempts.push(input); return { id: 'delivery-002' } },
      writeAudit: async (event) => { audits.push(event) },
      deliver: async (id) => ({ id, status: 'sent' }),
      now: () => NOW,
    })

    expect(result).toEqual({ id: 'delivery-002', status: 'sent' })
    expect(source).toEqual({ id: 'admission-001', referenceCode: 'ADM-SYNTHETIC-003' })
    expect(attempts).toEqual([{
      sourceType: 'admission', sourceId: 'admission-001', attemptNumber: 2,
      previousAttempt: 'delivery-001', initiatedBy: 'principal-001',
    }])
    expect(audits).toEqual([expect.objectContaining({
      action: 'notification-delivery-retried',
      target: { collection: 'notification-deliveries', id: 'delivery-002' },
    })])
  })
})
