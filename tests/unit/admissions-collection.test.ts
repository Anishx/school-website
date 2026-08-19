import { ValidationError, type CollectionConfig, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  ADMISSION_FIELD_NAMES,
} from '../../src/cms/admissions/schema'
import {
  buildAdmissionStatusAuditEvent,
  createAdmissionsCollection,
  generateAdmissionReferenceCode,
} from '../../src/collections/Admissions'
import {
  maskAadhaar,
  projectAnonymousAdmissionCreate,
} from '../../src/cms/admissions/present'
import { buildUser } from '../fixtures'

const NOW = new Date('2030-01-15T10:00:00.000Z')

function request(user: Record<string, unknown> | null = null): PayloadRequest {
  return { context: {}, payload: {}, user } as unknown as PayloadRequest
}

function validAdmission(overrides: Record<string, unknown> = {}) {
  return {
    studentName: ' Synthetic Student ', grade: 'Grade 5', dateOfBirth: '2015-06-15',
    gender: 'other', fatherName: 'Parent One', motherName: 'Parent Two',
    contactNumber: '+91 90000 12345', address: ' 1 Fixture Lane ', ...overrides,
  }
}

function namedFields(config: CollectionConfig): string[] {
  return config.fields.flatMap((field) => 'name' in field ? [field.name] : [])
}

describe('admissions collection schema and access', () => {
  it('preserves every current field and appends compatible workflow metadata', () => {
    const config = createAdmissionsCollection()
    const names = namedFields(config)
    for (const field of ADMISSION_FIELD_NAMES) expect(names).toContain(field)
    expect(names.slice(-4)).toEqual([
      'referenceCode', 'submittedAt', 'statusChangedBy', 'statusChangedAt',
    ])
    expect(config.admin).toMatchObject({
      useAsTitle: 'studentName',
      defaultColumns: [
        'studentName', 'grade', 'fatherName', 'contactNumber', 'submittedAt', 'status',
      ],
    })
    const aadhaar = config.fields.find((field) => 'name' in field && field.name === 'aadharNo')
    expect(aadhaar).toMatchObject({
      admin: { components: { Cell: '/components/payload/MaskedAadhaarCell#MaskedAadhaarCell' } },
    })
  })

  it('allows narrow anonymous create while denying anonymous private operations', async () => {
    const config = createAdmissionsCollection()
    const principal = request(buildUser({ role: 'principal', active: true }))
    const admin = request(buildUser({ role: 'admin', active: true }))
    const teacher = request(buildUser({ role: 'teacher', active: true }))
    const anonymous = request()

    expect(await config.access?.create?.({ req: anonymous } as never)).toBe(true)
    for (const operation of ['read', 'update', 'delete'] as const) {
      expect(await config.access?.[operation]?.({ req: anonymous } as never)).toBe(false)
      expect(await config.access?.[operation]?.({ req: teacher } as never)).toBe(false)
      expect(await config.access?.[operation]?.({ req: principal } as never)).toBe(true)
      expect(await config.access?.[operation]?.({ req: admin } as never)).toBe(true)
    }
    expect(await config.access?.create?.({ req: teacher } as never)).toBe(false)
  })
})

describe('admission creation preparation and projection', () => {
  it('generates collision-resistant non-sequential references and masks all but four digits', () => {
    const references = Array.from({ length: 32 }, generateAdmissionReferenceCode)
    expect(new Set(references)).toHaveLength(references.length)
    for (const reference of references) expect(reference).toMatch(/^ADM-[0-9A-F]{32}$/)
    expect(maskAadhaar('1111 2222-3333')).toBe('••••••••3333')
    expect(maskAadhaar('123')).toBe('•••')
    expect(maskAadhaar(undefined)).toBe('—')
  })

  it('normalizes valid create data and forces immutable UTC/pending metadata', async () => {
    const config = createAdmissionsCollection({
      now: () => NOW,
      referenceCode: () => 'ADM-00112233445566778899AABBCCDDEEFF',
    })
    const beforeValidate = config.hooks?.beforeValidate?.[0]
    const prepared = await beforeValidate?.({
      data: validAdmission({ status: 'accepted', aadharNo: '1111 2222-3333' }),
      operation: 'create', req: request(),
    } as never) as Record<string, unknown>

    expect(prepared).toMatchObject({
      studentName: 'Synthetic Student', address: '1 Fixture Lane', status: 'pending',
      aadharNo: '111122223333', referenceCode: 'ADM-00112233445566778899AABBCCDDEEFF',
      submittedAt: NOW.toISOString(), statusChangedAt: NOW.toISOString(),
    })
    expect(prepared).not.toHaveProperty('statusChangedBy')
  })

  it('returns Payload field errors and projects anonymous responses to only outcome/reference', async () => {
    const config = createAdmissionsCollection({ now: () => NOW })
    expect(() => config.hooks?.beforeValidate?.[0]?.({
      data: validAdmission({ contactNumber: '123', privateExtra: 'do-not-echo' }),
      operation: 'create', req: request(),
    } as never)).toThrow(ValidationError)

    const projected = await config.hooks?.afterRead?.[0]?.({
      doc: {
        id: 'admission-001', referenceCode: 'ADM-PUBLIC-001',
        studentName: 'Private Student', aadharNo: '111122223333', address: 'Private address',
      },
      req: request(),
    } as never)
    expect(projected).toEqual({ ok: true, reference: 'ADM-PUBLIC-001' })
    expect(Object.keys(projected as object)).toEqual(['ok', 'reference'])
    expect(projectAnonymousAdmissionCreate({ referenceCode: 'ADM-PUBLIC-002' }))
      .toEqual({ ok: true, reference: 'ADM-PUBLIC-002' })
  })
})

describe('admission status audit and delivery enqueue hooks', () => {
  it('stores status actor/time and creates a sanitized audit event for Principal/Admin changes', async () => {
    const actor = buildUser({ id: 'admin-001', role: 'admin', active: true })
    const config = createAdmissionsCollection({ now: () => NOW })
    const previous = { id: 'admission-001', status: 'pending' } as const
    const changed = await config.hooks?.beforeChange?.[0]?.({
      data: { status: 'reviewed' }, operation: 'update', originalDoc: previous,
      req: request(actor),
    } as never) as Record<string, unknown>

    expect(changed).toEqual({
      status: 'reviewed', statusChangedBy: 'admin-001', statusChangedAt: NOW.toISOString(),
    })
    expect(buildAdmissionStatusAuditEvent(
      { id: 'admission-001', status: 'reviewed' }, previous, actor, NOW.toISOString(),
    )).toEqual(expect.objectContaining({
      actor: { id: 'admin-001', role: 'admin' }, action: 'admission-status-changed',
      target: { collection: 'admissions', id: 'admission-001' },
      metadata: { admissionStatus: { from: 'pending', to: 'reviewed' } },
    }))
  })

  it('enqueues one persisted delivery on create without contacting SMTP, and audits updates', async () => {
    const deliveries: unknown[] = []
    const audits: unknown[] = []
    let smtpCalls = 0
    const admin = buildUser({ id: 'admin-001', role: 'admin', active: true })
    const config = createAdmissionsCollection({
      now: () => NOW,
      enqueueDelivery: async (input, req) => {
        deliveries.push({ input, req })
        return { id: 'delivery-001' }
      },
      writeAudit: async (event) => { audits.push(event) },
    })
    const req = request(admin)
    req.payload.sendEmail = (async () => { smtpCalls += 1 }) as typeof req.payload.sendEmail
    const afterChange = config.hooks?.afterChange?.[0]

    await afterChange?.({
      doc: { id: 'admission-001', status: 'pending' }, operation: 'create', req,
    } as never)
    await afterChange?.({
      doc: { id: 'admission-001', status: 'accepted' }, operation: 'update',
      previousDoc: { id: 'admission-001', status: 'reviewed' }, req,
    } as never)

    expect(deliveries).toEqual([{
      input: { sourceType: 'admission', sourceId: 'admission-001', attemptNumber: 1 }, req,
    }])
    expect(audits).toHaveLength(1)
    expect(audits[0]).toMatchObject({
      action: 'admission-status-changed',
      metadata: { admissionStatus: { from: 'reviewed', to: 'accepted' } },
    })
    expect(smtpCalls).toBe(0)
  })
})
