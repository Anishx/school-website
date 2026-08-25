import { ValidationError, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import {
  buildDeliveryAttemptData,
  buildDeliveryResultData,
  createNotificationDeliveriesCollection,
  createNotificationDeliveryAttempt,
  updateNotificationDeliveryResult,
} from '../../src/collections/NotificationDeliveries'
import {
  buildNotificationSettingsAuditEvent,
  createNotificationSettingsGlobal,
  validateNotificationRecipient,
} from '../../src/globals/NotificationSettings'
import { buildUser } from '../fixtures'

function request(user: Record<string, unknown> | null = null): PayloadRequest {
  return { context: {}, payload: {}, user } as unknown as PayloadRequest
}

function schemaNames(fields: readonly unknown[]): string[] {
  const names: string[] = []
  for (const value of fields) {
    if (!value || typeof value !== 'object') continue
    const field = value as { name?: unknown; fields?: unknown[] }
    if (typeof field.name === 'string') names.push(field.name)
    if (Array.isArray(field.fields)) names.push(...schemaNames(field.fields))
  }
  return names
}

function accessArgs(req: PayloadRequest) {
  return { req } as never
}

describe('notification settings global', () => {
  it('allows only active Principal/Admin management and exposes no SMTP connection fields', () => {
    const config = createNotificationSettingsGlobal()
    const principal = request(buildUser({ id: 'principal-001', role: 'principal', active: true }))
    const admin = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    const teacher = request(buildUser({ id: 'teacher-001', role: 'teacher', active: true }))
    const names = schemaNames(config.fields)

    expect(config.access?.read?.(accessArgs(principal))).toBe(true)
    expect(config.access?.update?.(accessArgs(admin))).toBe(true)
    expect(config.access?.read?.(accessArgs(teacher))).toBe(false)
    expect(config.access?.update?.(accessArgs(request()))).toBe(false)
    expect(names).toEqual([
      'admissionEnabled', 'admissionRecipient', 'defaultFormEnabled',
      'defaultFormRecipient', 'formOverrides', 'form', 'enabled', 'recipient',
    ])
    expect(names.join(' ')).not.toMatch(/smtp|host|port|secure|user|password|token|secret/i)
  })

  it('validates optional recipients and rejects duplicate per-form overrides', () => {
    const config = createNotificationSettingsGlobal()
    const hook = config.hooks?.beforeValidate?.[0]

    expect(validateNotificationRecipient(undefined)).toBe(true)
    expect(validateNotificationRecipient(' alerts@example.edu ')).toBe(true)
    expect(validateNotificationRecipient('not-an-address')).toBeTypeOf('string')
    expect(() => hook?.({
      data: {
        formOverrides: [
          { form: 'form-001', enabled: true, recipient: 'one@example.edu' },
          { form: { id: 'form-001' }, enabled: false, recipient: 'two@example.edu' },
        ],
      },
      req: request(buildUser({ id: 'admin-001', role: 'admin', active: true })),
    } as never)).toThrow(ValidationError)
  })

  it('audits recipient changes without including email addresses', async () => {
    const events: unknown[] = []
    const config = createNotificationSettingsGlobal({
      writeAudit: (event) => { events.push(event) },
    })
    const req = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    const afterChange = config.hooks?.afterChange?.[0]

    await afterChange?.({
      doc: { admissionEnabled: true, admissionRecipient: 'new@example.edu' },
      previousDoc: { admissionEnabled: true, admissionRecipient: 'old@example.edu' },
      req,
    } as never)

    expect(events).toEqual([expect.objectContaining({
      action: 'notification-recipient-changed',
      target: { collection: 'notification-settings', id: 'notification-settings' },
      metadata: { recipientChanged: true },
    })])
    expect(JSON.stringify(events)).not.toContain('@example.edu')
    expect(buildNotificationSettingsAuditEvent(
      { admissionEnabled: false, admissionRecipient: 'same@example.edu' },
      { admissionEnabled: true, admissionRecipient: 'same@example.edu' },
      req.user,
    )).toBeNull()
  })
})


describe('immutable notification delivery attempts', () => {
  it('allows Principal/Admin reads but denies ordinary create, update, and delete', () => {
    const config = createNotificationDeliveriesCollection()
    const principal = request(buildUser({ id: 'principal-001', role: 'principal', active: true }))
    const admin = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    const teacher = request(buildUser({ id: 'teacher-001', role: 'teacher', active: true }))

    expect(config.timestamps).toBe(false)
    expect(config.access?.read?.(accessArgs(principal))).toBe(true)
    expect(config.access?.read?.(accessArgs(admin))).toBe(true)
    expect(config.access?.read?.(accessArgs(teacher))).toBe(false)
    for (const actor of [principal, admin, teacher, request()]) {
      expect(config.access?.create?.(accessArgs(actor))).toBe(false)
      expect(config.access?.update?.(accessArgs(actor))).toBe(false)
      expect(config.access?.delete?.(accessArgs(actor))).toBe(false)
    }
    expect(schemaNames(config.fields)).not.toEqual(expect.arrayContaining([
      'smtpHost', 'smtpUser', 'smtpPassword', 'smtpToken',
    ]))
  })

  it('requires linked retry chains and creates every attempt as pending', () => {
    expect(buildDeliveryAttemptData({
      sourceType: 'admission', sourceId: 'admission-001', attemptNumber: 1,
    })).toEqual({
      channel: 'email',
      sourceType: 'admission',
      source: { relationTo: 'admissions', value: 'admission-001' },
      status: 'pending',
      attemptNumber: 1,
    })
    expect(() => buildDeliveryAttemptData({
      sourceType: 'form_submission', sourceId: 'submission-001', attemptNumber: 2,
    })).toThrow(ValidationError)
    expect(buildDeliveryAttemptData({
      sourceType: 'form_submission',
      sourceId: 'submission-001',
      attemptNumber: 2,
      previousAttempt: 'delivery-001',
      initiatedBy: 'admin-001',
    })).toMatchObject({
      source: { relationTo: 'form-submissions', value: 'submission-001' },
      status: 'pending', attemptNumber: 2, previousAttempt: 'delivery-001',
    })
  })

  it('accepts only terminal results, requires sent metadata, and sanitizes failures', () => {
    expect(buildDeliveryResultData({
      status: 'sent',
      recipient: ' Staff@Example.edu ',
      attemptedAt: '2030-01-01T12:00:00+05:30',
      providerMessageId: 'provider-001',
    })).toEqual({
      status: 'sent',
      recipient: 'staff@example.edu',
      attemptedAt: '2030-01-01T06:30:00.000Z',
      providerMessageId: 'provider-001',
    })
    expect(() => buildDeliveryResultData({ status: 'sent' })).toThrow(ValidationError)
    expect(() => buildDeliveryResultData({ status: 'failed' })).toThrow(ValidationError)

    const failed = buildDeliveryResultData({
      status: 'failed',
      attemptedAt: '2030-01-01T00:00:00.000Z',
      errorCode: 'SMTP_REJECTED',
      errorMessage: 'smtp://mailer:private-password@example.edu rejected recipient@example.edu',
    })
    expect(failed).toMatchObject({ status: 'failed', errorCode: 'SMTP_REJECTED' })
    expect(JSON.stringify(failed)).not.toContain('private-password')
    expect(JSON.stringify(failed)).not.toContain('recipient@example.edu')
  })

  it('mints private service context and blocks identity mutation during result updates', async () => {
    const config = createNotificationDeliveriesCollection()
    const req = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    let createOptions: Record<string, unknown> | undefined
    let updateOptions: Record<string, unknown> | undefined

    req.payload.create = (async (options: Record<string, unknown>) => {
      createOptions = options
      return options.data
    }) as unknown as typeof req.payload.create
    req.payload.update = (async (options: Record<string, unknown>) => {
      updateOptions = options
      return options.data
    }) as unknown as typeof req.payload.update

    await createNotificationDeliveryAttempt({
      sourceType: 'admission', sourceId: 'admission-001', attemptNumber: 1,
    }, req)
    await updateNotificationDeliveryResult('delivery-001', {
      status: 'disabled', attemptedAt: '2030-01-01T00:00:00.000Z',
    }, req)

    const createReq = { ...req, context: createOptions?.context } as PayloadRequest
    const updateReq = { ...req, context: updateOptions?.context } as PayloadRequest
    expect(config.access?.create?.(accessArgs(createReq))).toBe(true)
    expect(config.access?.update?.(accessArgs(updateReq))).toBe(true)
    expect(createOptions).toMatchObject({
      collection: 'notification-deliveries', overrideAccess: false, req,
      data: { status: 'pending', attemptNumber: 1 },
    })
    expect(updateOptions).toMatchObject({
      collection: 'notification-deliveries', id: 'delivery-001', overrideAccess: false, req,
      data: { status: 'disabled', attemptedAt: '2030-01-01T00:00:00.000Z' },
    })

    expect(() => config.hooks?.beforeValidate?.[0]?.({
      data: { status: 'sent', sourceType: 'admission' },
      operation: 'update',
      req: updateReq,
    } as never)).toThrow()
    expect(() => config.hooks?.beforeDelete?.[0]?.({ id: 'delivery-001', req: updateReq } as never))
      .toThrow()
  })
})