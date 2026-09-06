import type { PayloadRequest, RequestContext } from 'payload'

import {
  createNotificationDeliveryAttempt,
  type DeliveryAttemptInput,
} from '../../collections/NotificationDeliveries'
import { type PrincipalID, isPrincipalID } from '../../access/roles'
import { deliverNotification, type DeliveryServiceOptions } from '../notifications/deliver'
import { validateAdmission } from './validate'

const SUBMISSION_CONTEXT = Symbol('admission-submission-service')

export type PublicAdmissionSubmissionResult = Readonly<
  | { ok: true; reference: string }
  | { ok: false }
>

export type AdmissionSubmissionOptions = Readonly<{
  createDelivery?: (
    input: DeliveryAttemptInput,
    req: PayloadRequest,
  ) => Promise<unknown>
  deliver?: (
    deliveryId: PrincipalID,
    req: PayloadRequest,
    options?: DeliveryServiceOptions,
  ) => Promise<unknown>
  delivery?: DeliveryServiceOptions
}>

function identifier(value: unknown): PrincipalID | null {
  if (isPrincipalID(value)) return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return identifier((value as { id?: unknown }).id)
}

function referenceCode(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('referenceCode' in value)) return null
  const reference = (value as { referenceCode?: unknown }).referenceCode
  return typeof reference === 'string' && reference.trim() ? reference.trim() : null
}

function submissionRequest(req: PayloadRequest, transactionID: string | number): PayloadRequest {
  return {
    ...req,
    transactionID,
    context: {
      ...req.context,
      [SUBMISSION_CONTEXT]: true,
    } as RequestContext,
  }
}

export function isAdmissionSubmissionRequest(
  req: Pick<PayloadRequest, 'context'>,
): boolean {
  return Boolean((req.context as Record<PropertyKey, unknown> | undefined)?.[SUBMISSION_CONTEXT])
}

/**
 * Persists an admission and its initial pending notification attempt atomically.
 * SMTP is deliberately attempted only after the database commit and cannot change
 * the narrow public persistence result.
 */
export async function submitAdmission(
  input: unknown,
  req: PayloadRequest,
  options: AdmissionSubmissionOptions = {},
): Promise<PublicAdmissionSubmissionResult> {
  const admission = validateAdmission(input)
  let transactionID: string | number | null

  try {
    transactionID = await req.payload.db.beginTransaction()
  } catch {
    return Object.freeze({ ok: false })
  }

  if (transactionID === null) return Object.freeze({ ok: false })

  const transactionReq = submissionRequest(req, transactionID)
  let committed = false
  let deliveryId: PrincipalID
  let reference: string

  try {
    const createdAdmission = await req.payload.create({
      collection: 'admissions', data: admission as never, overrideAccess: false, req: transactionReq,
    })
    const sourceId = identifier(createdAdmission)
    reference = referenceCode(createdAdmission) ?? ''
    if (sourceId === null || !reference) throw new Error('Admission persistence did not return identifiers.')

    const createdDelivery = await (options.createDelivery ?? createNotificationDeliveryAttempt)({
      sourceType: 'admission', sourceId, attemptNumber: 1,
    }, transactionReq)
    const persistedDeliveryId = identifier(createdDelivery)
    if (persistedDeliveryId === null) throw new Error('Delivery persistence did not return an identifier.')
    deliveryId = persistedDeliveryId

    await req.payload.db.commitTransaction(transactionID)
    committed = true
  } catch {
    if (!committed) {
      try {
        await req.payload.db.rollbackTransaction(transactionID)
      } catch {
        // The original persistence failure remains the public outcome.
      }
    }
    return Object.freeze({ ok: false })
  }

  try {
    await (options.deliver ?? deliverNotification)(deliveryId, req, options.delivery)
  } catch {
    // Delivery already has durable terminal outcomes; SMTP/runtime failures never negate persistence.
  }

  return Object.freeze({ ok: true, reference })
}
