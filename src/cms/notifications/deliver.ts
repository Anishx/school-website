import type { PayloadRequest } from 'payload'

import {
  updateNotificationDeliveryResult,
  type NotificationSourceType,
  type TerminalDeliveryStatus,
} from '../../collections/NotificationDeliveries'
import type { NotificationSettingsDocument } from '../../globals/NotificationSettings'
import type { PrincipalID } from '../../access/roles'
import { sanitizeText } from '../errors/sanitize'
import { selectNotificationRecipient } from './recipient'
import { renderNotification, type FormNotificationField, type NotificationMessage } from './render'

export type NotificationEmail = NotificationMessage & Readonly<{ to: string }>
export type NotificationTransport = Readonly<{
  sendEmail(message: NotificationEmail): Promise<unknown>
}>

export type NotificationEnvironment = Readonly<{
  admissionRecipient?: string | null
  formRecipient?: string | null
  adminOrigin?: string | null
}>

export type DeliveryServiceOptions = Readonly<{
  transport?: NotificationTransport
  environment?: NotificationEnvironment
  now?: () => Date
  loadSettings?: (req: PayloadRequest) => Promise<NotificationSettingsDocument | null>
  loadDelivery?: (id: PrincipalID, req: PayloadRequest) => Promise<Readonly<Record<string, unknown>>>
  loadSource?: (
    sourceType: NotificationSourceType,
    id: PrincipalID,
    req: PayloadRequest,
  ) => Promise<Readonly<Record<string, unknown>>>
  loadFormFields?: (
    source: Readonly<Record<string, unknown>>,
    req: PayloadRequest,
  ) => Promise<readonly FormNotificationField[]>
  updateResult?: typeof updateNotificationDeliveryResult
}>

type DeliveryIdentity = Readonly<{
  sourceType: NotificationSourceType
  sourceId: PrincipalID
}>
function identifier(value: unknown): PrincipalID | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value || typeof value !== 'object') return null
  if ('id' in value) return identifier((value as { id?: unknown }).id)
  if ('value' in value) return identifier((value as { value?: unknown }).value)
  return null
}

function deliveryIdentity(delivery: Readonly<Record<string, unknown>>): DeliveryIdentity {
  const sourceType = delivery.sourceType
  const sourceId = identifier(delivery.source)
  if ((sourceType !== 'admission' && sourceType !== 'form_submission') || sourceId === null) {
    throw new Error('Invalid notification delivery source.')
  }
  if (delivery.status !== 'pending') throw new Error('Only pending notification deliveries can be sent.')
  return { sourceType, sourceId }
}

async function defaultLoadDelivery(id: PrincipalID, req: PayloadRequest) {
  return await req.payload.findByID({
    collection: 'notification-deliveries', id, overrideAccess: true, req,
  }) as unknown as Readonly<Record<string, unknown>>
}

async function defaultLoadSettings(req: PayloadRequest) {
  return await req.payload.findGlobal({
    slug: 'notification-settings', overrideAccess: true, req,
  }) as NotificationSettingsDocument
}

async function defaultLoadSource(
  sourceType: NotificationSourceType,
  id: PrincipalID,
  req: PayloadRequest,
) {
  const collection = sourceType === 'admission' ? 'admissions' : 'form-submissions'
  return await req.payload.findByID({
    collection, id, overrideAccess: true, req,
  }) as unknown as Readonly<Record<string, unknown>>
}

function relatedID(value: unknown): PrincipalID | null {
  return identifier(value)
}

async function defaultLoadFormFields(
  source: Readonly<Record<string, unknown>>,
  req: PayloadRequest,
): Promise<readonly FormNotificationField[]> {
  const embedded = source.formFields ?? source.definitionFields
  if (Array.isArray(embedded)) return embedded as FormNotificationField[]
  const formId = relatedID(source.form)
  if (formId === null) return []
  const form = await req.payload.findByID({
    collection: 'forms', id: formId, overrideAccess: true, req,
  }) as unknown as Readonly<Record<string, unknown>>
  return Array.isArray(form.fields) ? form.fields as FormNotificationField[] : []
}
function defaultEnvironment(): NotificationEnvironment {
  return {
    admissionRecipient: process.env.ADMISSION_NOTIFICATION_EMAIL,
    formRecipient: process.env.FORM_NOTIFICATION_EMAIL,
    adminOrigin: process.env.PUBLIC_SITE_ORIGIN,
  }
}

function defaultTransport(req: PayloadRequest): NotificationTransport {
  return {
    sendEmail: async (message) => req.payload.sendEmail(message),
  }
}

function providerMessageId(result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined
  const candidate = 'messageId' in result ? (result as { messageId?: unknown }).messageId : undefined
  if (typeof candidate !== 'string') return undefined
  const sanitized = sanitizeText(candidate.trim()).slice(0, 200)
  return sanitized && sanitized !== '[REDACTED]' ? sanitized : undefined
}

function providerError(error: unknown): Readonly<{ errorCode: string; errorMessage: string }> {
  let code = 'EMAIL_DELIVERY_FAILED'
  if (error && typeof error === 'object' && 'code' in error) {
    const candidate = String((error as { code?: unknown }).code).toUpperCase()
      .replace(/[^A-Z0-9_-]/g, '').slice(0, 80)
    if (candidate && !/(?:SECRET|TOKEN|PASS|CREDENTIAL)/.test(candidate)) code = candidate
  }
  return Object.freeze({ errorCode: code, errorMessage: 'Email provider rejected delivery.' })
}

function formId(source: Readonly<Record<string, unknown>>): PrincipalID | null {
  return relatedID(source.form)
}

async function terminal(
  id: PrincipalID,
  status: TerminalDeliveryStatus,
  req: PayloadRequest,
  options: DeliveryServiceOptions,
  data: Readonly<Record<string, unknown>> = {},
): Promise<unknown> {
  const update = options.updateResult ?? updateNotificationDeliveryResult
  return update(id, {
    status,
    attemptedAt: (options.now ?? (() => new Date()))().toISOString(),
    ...data,
  }, req)
}
/**
 * Delivers an already-persisted attempt. This service never creates or mutates
 * admissions/form submissions; callers invoke it only after their source transaction commits.
 */
export async function deliverNotification(
  deliveryId: PrincipalID,
  req: PayloadRequest,
  options: DeliveryServiceOptions = {},
): Promise<unknown> {
  const loadDelivery = options.loadDelivery ?? defaultLoadDelivery
  const loadSettings = options.loadSettings ?? defaultLoadSettings
  const loadSource = options.loadSource ?? defaultLoadSource
  const environment = options.environment ?? defaultEnvironment()
  const delivery = await loadDelivery(deliveryId, req)
  const identity = deliveryIdentity(delivery)
  const [settings, source] = await Promise.all([
    loadSettings(req),
    loadSource(identity.sourceType, identity.sourceId, req),
  ])
  const selection = selectNotificationRecipient({
    sourceType: identity.sourceType,
    settings,
    environmentRecipient: identity.sourceType === 'admission'
      ? environment.admissionRecipient
      : environment.formRecipient,
    formId: identity.sourceType === 'form_submission' ? formId(source) : undefined,
  })

  if (selection.outcome === 'disabled') {
    return terminal(deliveryId, 'disabled', req, options)
  }
  if (selection.outcome === 'not_configured') {
    return terminal(deliveryId, 'not_configured', req, options)
  }

  const fields = identity.sourceType === 'form_submission'
    ? await (options.loadFormFields ?? defaultLoadFormFields)(source, req)
    : undefined
  const rendered = renderNotification({
    sourceType: identity.sourceType,
    source,
    formFields: fields,
    adminOrigin: environment.adminOrigin,
  })
  const transport = options.transport ?? defaultTransport(req)
  let providerResult: unknown
  try {
    providerResult = await transport.sendEmail({ to: selection.recipient, ...rendered })
  } catch (error) {
    return terminal(deliveryId, 'failed', req, options, {
      recipient: selection.recipient,
      ...providerError(error),
    })
  }

  return terminal(deliveryId, 'sent', req, options, {
    recipient: selection.recipient,
    providerMessageId: providerMessageId(providerResult),
  })
}
