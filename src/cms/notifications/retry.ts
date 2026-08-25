import { Forbidden, ValidationError, type PayloadRequest } from 'payload'

import { resolvePrincipal, type PrincipalID } from '../../access/roles'
import {
  createNotificationDeliveryAttempt,
  type NotificationSourceType,
} from '../../collections/NotificationDeliveries'
import { writeAudit, type AuditWriteEvent } from '../audit/writeAudit'
import { deliverNotification, type DeliveryServiceOptions } from './deliver'

export type RetryServiceOptions = Readonly<{
  loadDelivery?: (
    id: PrincipalID,
    req: PayloadRequest,
  ) => Promise<Readonly<Record<string, unknown>>>
  createAttempt?: typeof createNotificationDeliveryAttempt
  writeAudit?: (event: AuditWriteEvent, req: PayloadRequest) => Promise<void>
  deliver?: (
    id: PrincipalID,
    req: PayloadRequest,
    options?: DeliveryServiceOptions,
  ) => Promise<unknown>
  delivery?: DeliveryServiceOptions
  now?: () => Date
}>

function fail(req: PayloadRequest, path: string, message: string): never {
  throw new ValidationError({
    collection: 'notification-deliveries',
    errors: [{ path, message }],
    req,
  })
}

function identifier(value: unknown): PrincipalID | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value || typeof value !== 'object') return null
  if ('id' in value) return identifier((value as { id?: unknown }).id)
  if ('value' in value) return identifier((value as { value?: unknown }).value)
  return null
}
function sourceIdentity(delivery: Readonly<Record<string, unknown>>): {
  sourceType: NotificationSourceType
  sourceId: PrincipalID
} {
  const sourceType = delivery.sourceType
  const sourceId = identifier(delivery.source)
  if ((sourceType !== 'admission' && sourceType !== 'form_submission') || sourceId === null) {
    throw new Error('Invalid notification delivery source.')
  }
  return { sourceType, sourceId }
}

async function defaultLoadDelivery(id: PrincipalID, req: PayloadRequest) {
  return await req.payload.findByID({
    collection: 'notification-deliveries', id, overrideAccess: false, req,
  }) as unknown as Readonly<Record<string, unknown>>
}

export async function retryNotificationDelivery(
  deliveryId: PrincipalID,
  req: PayloadRequest,
  options: RetryServiceOptions = {},
): Promise<unknown> {
  const actor = resolvePrincipal(req.user)
  if (!actor || (actor.role !== 'principal' && actor.role !== 'admin')) {
    throw new Forbidden(req.t)
  }

  const loadDelivery = options.loadDelivery ?? defaultLoadDelivery
  const previous = await loadDelivery(deliveryId, req)
  if (previous.status !== 'failed') {
    return fail(req, 'status', 'Only failed notification attempts can be retried.')
  }
  const previousId = identifier(previous.id) ?? deliveryId
  const previousAttempt = previous.attemptNumber
  if (!Number.isSafeInteger(previousAttempt) || (previousAttempt as number) < 1) {
    return fail(req, 'attemptNumber', 'The failed attempt has an invalid attempt number.')
  }
  const { sourceType, sourceId } = sourceIdentity(previous)
  const createAttempt = options.createAttempt ?? createNotificationDeliveryAttempt
  const created = await createAttempt({
    sourceType,
    sourceId,
    attemptNumber: (previousAttempt as number) + 1,
    previousAttempt: previousId,
    initiatedBy: actor.id,
  }, req) as Readonly<Record<string, unknown>>
  const createdId = identifier(created?.id)
  if (createdId === null) throw new Error('Notification retry did not return an attempt identifier.')

  const audit = options.writeAudit ?? writeAudit
  await audit({
    actor: { id: actor.id, role: actor.role },
    action: 'notification-delivery-retried',
    target: { collection: 'notification-deliveries', id: createdId },
    timestamp: (options.now ?? (() => new Date()))().toISOString(),
    outcome: 'success',
    metadata: {
      sourceType,
      attemptNumber: (previousAttempt as number) + 1,
      status: 'pending',
    },
  }, req)

  const deliver = options.deliver ?? deliverNotification
  return deliver(createdId, req, options.delivery)
}
