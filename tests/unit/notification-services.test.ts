import { ValidationError, type PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { deliverNotification } from '../../src/cms/notifications/deliver'
import { selectNotificationRecipient } from '../../src/cms/notifications/recipient'
import { renderNotification } from '../../src/cms/notifications/render'
import { retryNotificationDelivery } from '../../src/cms/notifications/retry'
import { buildAdmission, buildFormSubmission, buildUser, createMockSmtpTransport } from '../fixtures'
import { SENTINEL_SECRET_VALUES, SENTINEL_SECRETS, SYNTHETIC_RECIPIENTS } from '../fixtures/sentinels'

function request(user: Record<string, unknown> | null = null): PayloadRequest {
  return { context: {}, payload: {}, user } as unknown as PayloadRequest
}

function deliveryRequest(input: Readonly<{
  delivery?: Record<string, unknown>
  source?: Record<string, unknown>
  settings?: Record<string, unknown>
  user?: Record<string, unknown> | null
}> = {}) {
  const req = request(input.user ?? null)
  const updates: Record<string, unknown>[] = []
  const delivery = input.delivery ?? {
    id: 'delivery-001', sourceType: 'admission', status: 'pending',
    attemptNumber: 1, source: { relationTo: 'admissions', value: 'admission-001' },
  }
  const source = input.source ?? buildAdmission({ id: 'admission-001' })

  req.payload.findByID = (async (options: Record<string, unknown>) =>
    options.collection === 'notification-deliveries' ? delivery : source) as typeof req.payload.findByID
  req.payload.findGlobal = (async () => input.settings ?? {
    admissionEnabled: true, admissionRecipient: SYNTHETIC_RECIPIENTS.admission,
    defaultFormEnabled: true, defaultFormRecipient: SYNTHETIC_RECIPIENTS.forms,
  }) as typeof req.payload.findGlobal
  req.payload.update = (async (options: Record<string, unknown>) => {
    updates.push(options)
    return { ...delivery, ...(options.data as object) }
  }) as unknown as typeof req.payload.update
  return { req, updates, delivery, source }
}
describe('notification recipient selection', () => {
  it('prefers CMS recipients, falls back to environment, and handles terminal skips', () => {
    expect(selectNotificationRecipient({
      sourceType: 'admission',
      settings: { admissionEnabled: true, admissionRecipient: 'Cms@Example.test' },
      environmentRecipient: 'fallback@example.test',
    })).toEqual({ outcome: 'configured', recipient: 'cms@example.test', source: 'settings' })
    expect(selectNotificationRecipient({
      sourceType: 'admission',
      settings: { admissionEnabled: true, admissionRecipient: 'invalid' },
      environmentRecipient: 'fallback@example.test',
    })).toEqual({ outcome: 'configured', recipient: 'fallback@example.test', source: 'environment' })
    expect(selectNotificationRecipient({
      sourceType: 'admission', settings: { admissionEnabled: false },
      environmentRecipient: 'fallback@example.test',
    })).toEqual({ outcome: 'disabled' })
    expect(selectNotificationRecipient({
      sourceType: 'admission', settings: { admissionEnabled: true },
    })).toEqual({ outcome: 'not_configured' })
  })

  it('uses matching form override before default settings and environment', () => {
    expect(selectNotificationRecipient({
      sourceType: 'form_submission', formId: 'form-001',
      settings: {
        defaultFormEnabled: true,
        defaultFormRecipient: 'default@example.test',
        formOverrides: [{ form: { id: 'form-001' }, enabled: true, recipient: 'override@example.test' }],
      },
      environmentRecipient: 'fallback@example.test',
    })).toEqual({ outcome: 'configured', recipient: 'override@example.test', source: 'settings' })
    expect(selectNotificationRecipient({
      sourceType: 'form_submission', formId: 'form-001',
      settings: {
        defaultFormEnabled: true,
        defaultFormRecipient: 'default@example.test',
        formOverrides: [{ form: 'form-001', enabled: false, recipient: 'override@example.test' }],
      },
    })).toEqual({ outcome: 'disabled' })
  })
})

describe('notification rendering', () => {
  it('allowlists admission fields and excludes Aadhaar, addresses, secrets, and files', () => {
    const rendered = renderNotification({
      sourceType: 'admission',
      source: {
        ...buildAdmission(), password: SENTINEL_SECRETS.payloadSecret,
        uploadedFile: SENTINEL_SECRETS.blobToken,
      },
      adminOrigin: 'https://school.example.test',
    })
    const serialized = JSON.stringify(rendered)

    expect(serialized).toContain('Synthetic Student')
    expect(serialized).toContain('TEST-ADM-001')
    expect(serialized).not.toContain('111122223333')
    expect(serialized).not.toContain('1 Fixture Lane')
    for (const secret of SENTINEL_SECRET_VALUES) expect(serialized).not.toContain(secret)
    expect(serialized).not.toMatch(/aadhaar|address|password|uploadedFile/i)
  })
  it('renders only declared safe form fields and escapes HTML', () => {
    const rendered = renderNotification({
      sourceType: 'form_submission',
      source: buildFormSubmission({
        formTitle: 'Contact',
        values: {
          name: '<Synthetic Visitor>', email: 'visitor@example.test',
          password: SENTINEL_SECRETS.smtpPassword,
          upload: SENTINEL_SECRETS.blobToken,
          undeclared: SENTINEL_SECRETS.payloadSecret,
        },
      }),
      formFields: [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'text' },
        { name: 'upload', label: 'File upload', type: 'file' },
      ],
    })
    const serialized = JSON.stringify(rendered)

    expect(rendered.text).toContain('<Synthetic Visitor>')
    expect(rendered.html).toContain('&lt;Synthetic Visitor&gt;')
    expect(serialized).toContain('visitor@example.test')
    for (const secret of SENTINEL_SECRET_VALUES) expect(serialized).not.toContain(secret)
    expect(serialized).not.toMatch(/Password|File upload|undeclared/i)
  })
})
describe('notification delivery', () => {
  it.each([
    { enabled: false, recipient: SYNTHETIC_RECIPIENTS.admission, status: 'disabled' },
    { enabled: true, recipient: null, status: 'not_configured' },
  ])('records $status without contacting transport', async ({ enabled, recipient, status }) => {
    const { req, updates } = deliveryRequest({
      settings: { admissionEnabled: enabled, admissionRecipient: recipient },
    })
    const smtp = createMockSmtpTransport()

    await deliverNotification('delivery-001', req, {
      transport: { sendEmail: (message) => smtp.sendMail(message) },
      environment: {}, now: () => new Date('2030-01-15T10:05:00.000Z'),
    })

    expect(smtp.deliveries).toHaveLength(0)
    expect(updates).toHaveLength(1)
    expect(updates[0]).toMatchObject({
      collection: 'notification-deliveries', id: 'delivery-001',
      data: { status, attemptedAt: '2030-01-15T10:05:00.000Z' },
    })
  })

  it('records sent with sanitized provider result through synthetic SMTP', async () => {
    const { req, updates } = deliveryRequest()
    const smtp = createMockSmtpTransport()

    await deliverNotification('delivery-001', req, {
      transport: { sendEmail: (message) => smtp.sendMail(message) },
      environment: {}, now: () => new Date('2030-01-15T10:05:00.000Z'),
    })

    expect(smtp.deliveries).toHaveLength(1)
    expect(smtp.deliveries[0].envelope.to).toEqual([SYNTHETIC_RECIPIENTS.admission])
    expect(updates[0]).toMatchObject({
      data: {
        status: 'sent', recipient: SYNTHETIC_RECIPIENTS.admission,
        attemptedAt: '2030-01-15T10:05:00.000Z', providerMessageId: 'mock-smtp-0001',
      },
    })
  })

  it('records a sanitized failed outcome and never mutates or duplicates its source', async () => {
    const { req, updates, source } = deliveryRequest()
    const before = JSON.stringify(source)
    const smtp = createMockSmtpTransport({
      failWith: Object.assign(new Error(`Rejected ${SENTINEL_SECRETS.smtpPassword}`), {
        code: 'EAUTH', details: SENTINEL_SECRETS.authToken,
      }),
    })
    let creates = 0
    req.payload.create = (async () => {
      creates += 1
      return { id: 'unexpected-source-create' }
    }) as unknown as typeof req.payload.create

    await deliverNotification('delivery-001', req, {
      transport: { sendEmail: (message) => smtp.sendMail(message) },
      environment: {}, now: () => new Date('2030-01-15T10:05:00.000Z'),
    })

    expect(creates).toBe(0)
    expect(JSON.stringify(source)).toBe(before)
    expect(updates[0]).toMatchObject({
      data: {
        status: 'failed', recipient: SYNTHETIC_RECIPIENTS.admission,
        errorCode: 'EAUTH', errorMessage: 'Email provider rejected delivery.',
      },
    })
    for (const secret of SENTINEL_SECRET_VALUES) expect(JSON.stringify(updates)).not.toContain(secret)
  })
  it('delivers a persisted form submission with its matching configured recipient', async () => {
    const source = buildFormSubmission({
      id: 'submission-001', form: 'form-001', formTitle: 'Contact',
    })
    const { req, updates } = deliveryRequest({
      delivery: {
        id: 'delivery-form-001', sourceType: 'form_submission', status: 'pending',
        attemptNumber: 1,
        source: { relationTo: 'form-submissions', value: 'submission-001' },
      },
      source,
      settings: {
        defaultFormEnabled: true, defaultFormRecipient: 'default@example.test',
        formOverrides: [{ form: 'form-001', enabled: true, recipient: SYNTHETIC_RECIPIENTS.forms }],
      },
    })
    const smtp = createMockSmtpTransport()

    await deliverNotification('delivery-form-001', req, {
      transport: { sendEmail: (message) => smtp.sendMail(message) },
      environment: {},
      loadFormFields: async () => [
        { name: 'name', label: 'Name', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
      ],
    })

    expect(smtp.deliveries[0].envelope.to).toEqual([SYNTHETIC_RECIPIENTS.forms])
    expect(updates[0]).toMatchObject({ data: { status: 'sent', recipient: SYNTHETIC_RECIPIENTS.forms } })
  })
})

describe('notification retry', () => {
  it('requires an active Principal/Admin and accepts failed attempts only', async () => {
    const failed = {
      id: 'delivery-001', sourceType: 'admission', status: 'failed', attemptNumber: 1,
      source: { relationTo: 'admissions', value: 'admission-001' },
    }
    for (const user of [
      null,
      buildUser({ role: 'teacher', active: true }),
      buildUser({ role: 'admin', active: false }),
    ]) {
      await expect(retryNotificationDelivery('delivery-001', request(user), {
        loadDelivery: async () => failed,
      })).rejects.toThrow()
    }
    await expect(retryNotificationDelivery(
      'delivery-001',
      request(buildUser({ id: 'admin-001', role: 'admin', active: true })),
      { loadDelivery: async () => ({ ...failed, status: 'sent' }) },
    )).rejects.toBeInstanceOf(ValidationError)
  })
  it('creates a linked delivery and audit, then delivers without duplicating the source', async () => {
    const req = request(buildUser({ id: 'admin-001', role: 'admin', active: true }))
    const creates: unknown[] = []
    const audits: unknown[] = []
    const delivered: unknown[] = []
    const result = await retryNotificationDelivery('delivery-001', req, {
      loadDelivery: async () => ({
        id: 'delivery-001', sourceType: 'form_submission', status: 'failed', attemptNumber: 2,
        source: { relationTo: 'form-submissions', value: 'submission-001' },
      }),
      createAttempt: async (input) => {
        creates.push(input)
        return { id: 'delivery-002', ...input }
      },
      writeAudit: async (event) => { audits.push(event) },
      deliver: async (id) => { delivered.push(id); return { id, status: 'sent' } },
      now: () => new Date('2030-01-15T10:10:00.000Z'),
    })

    expect(result).toEqual({ id: 'delivery-002', status: 'sent' })
    expect(creates).toEqual([{
      sourceType: 'form_submission', sourceId: 'submission-001', attemptNumber: 3,
      previousAttempt: 'delivery-001', initiatedBy: 'admin-001',
    }])
    expect(audits).toEqual([expect.objectContaining({
      actor: { id: 'admin-001', role: 'admin' },
      action: 'notification-delivery-retried',
      target: { collection: 'notification-deliveries', id: 'delivery-002' },
      metadata: { sourceType: 'form_submission', attemptNumber: 3, status: 'pending' },
    })])
    expect(delivered).toEqual(['delivery-002'])
    expect(creates).toHaveLength(1)
  })
})
