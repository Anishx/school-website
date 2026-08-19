import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { submitAdmission } from '../../src/cms/admissions/submit'

function validAdmission(overrides: Record<string, unknown> = {}) {
  return {
    studentName: 'Synthetic Student', grade: 'Grade 5', dateOfBirth: '2015-06-15',
    gender: 'other', fatherName: 'Parent One', motherName: 'Parent Two',
    contactNumber: '+91 90000 12345', address: '1 Fixture Lane', ...overrides,
  }
}

function request(options: Readonly<{ fail?: 'admission' | 'delivery' | 'commit' }> = {}) {
  const calls: string[] = []
  const req = {
    context: {},
    payload: {
      db: {
        beginTransaction: async () => { calls.push('begin'); return 'transaction-001' },
        commitTransaction: async () => {
          calls.push('commit')
          if (options.fail === 'commit') throw new Error('commit failed')
        },
        rollbackTransaction: async () => { calls.push('rollback') },
      },
      create: async ({ collection }: { collection: string }) => {
        calls.push(`create:${collection}`)
        if (collection === 'admissions') {
          if (options.fail === 'admission') throw new Error('admission failed')
          return { id: 'admission-001', referenceCode: 'ADM-PUBLIC-001' }
        }
        if (options.fail === 'delivery') throw new Error('delivery failed')
        return { id: 'delivery-001', status: 'pending' }
      },
    },
  } as unknown as PayloadRequest
  return { req, calls }
}

describe('narrow admission submission service', () => {
  it('validates, creates exactly one admission and one pending delivery, then commits before delivery', async () => {
    const { req, calls } = request()
    const createdDeliveries: unknown[] = []
    const delivered: unknown[] = []

    const result = await submitAdmission(validAdmission(), req, {
      createDelivery: async (input, transactionReq) => {
        createdDeliveries.push({ input, transactionReq })
        calls.push('create:notification-deliveries')
        return { id: 'delivery-001', status: 'pending' }
      },
      deliver: async (id) => { delivered.push(id); calls.push('deliver'); return { status: 'sent' } },
    })

    expect(result).toEqual({ ok: true, reference: 'ADM-PUBLIC-001' })
    expect(Object.keys(result)).toEqual(['ok', 'reference'])
    expect(calls).toEqual([
      'begin', 'create:admissions', 'create:notification-deliveries', 'commit', 'deliver',
    ])
    expect(createdDeliveries).toHaveLength(1)
    expect(createdDeliveries[0]).toMatchObject({
      input: { sourceType: 'admission', sourceId: 'admission-001', attemptNumber: 1 },
    })
    expect(delivered).toEqual(['delivery-001'])
  })

  it.each(['sent', 'failed', 'disabled', 'not_configured'] as const)(
    'preserves source success when delivery reaches %s',
    async (status) => {
      const { req, calls } = request()
      const result = await submitAdmission(validAdmission(), req, {
        createDelivery: async () => ({ id: 'delivery-001', status: 'pending' }),
        deliver: async () => { calls.push(`deliver:${status}`); return { status } },
      })

      expect(result).toEqual({ ok: true, reference: 'ADM-PUBLIC-001' })
      expect(calls).toContain('commit')
      expect(calls).toContain(`deliver:${status}`)
    },
  )

  it('returns no reference, rolls back, and does not invoke delivery when persistence fails', async () => {
    for (const fail of ['admission', 'delivery', 'commit'] as const) {
      const { req, calls } = request({ fail })
      const delivered: unknown[] = []
      const result = await submitAdmission(validAdmission(), req, {
        deliver: async (id) => { delivered.push(id); return { status: 'sent' } },
      })

      expect(result).toEqual({ ok: false })
      expect(result).not.toHaveProperty('reference')
      expect(calls).toContain('rollback')
      expect(delivered).toEqual([])
    }
  })

  it('preserves validator failures without starting persistence', async () => {
    const { req, calls } = request()

    await expect(submitAdmission(validAdmission({ contactNumber: '123' }), req)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    })
    expect(calls).toEqual([])
  })
})
