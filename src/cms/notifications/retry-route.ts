import type { PayloadRequest } from 'payload'

import { resolvePrincipal, type PrincipalID } from '../../access/roles'
import { ERROR_CODES } from '../errors/codes'
import { StructuredError, validationError } from '../errors/structured-error'
import { createAuthenticatedPayloadRequest } from '../http/payload-route'
import {
  NOTIFICATION_RETRY_MAX_BYTES,
  parseBoundedJsonObject,
  publicRouteError,
  requestCorrelationId,
} from '../http/route-input'
import { retryNotificationDelivery } from './retry'

type RetryRouteDependencies = Readonly<{
  authenticate: (request: Request) => Promise<PayloadRequest>
  retry: (deliveryId: PrincipalID, req: PayloadRequest) => Promise<unknown>
}>

const defaults: RetryRouteDependencies = {
  authenticate: createAuthenticatedPayloadRequest,
  retry: retryNotificationDelivery,
}

function deliveryId(input: Readonly<Record<string, unknown>>): PrincipalID {
  if (Object.keys(input).length !== 1 || !Object.hasOwn(input, 'deliveryId')) {
    throw validationError([{ field: 'request', code: 'INVALID' }])
  }
  const value = input.deliveryId
  if ((typeof value === 'string' && value.trim()) || (typeof value === 'number' && Number.isFinite(value))) {
    return typeof value === 'string' ? value.trim() : value
  }
  throw validationError([{ field: 'deliveryId', code: 'INVALID' }])
}

export function createNotificationRetryPostHandler(
  dependencies: RetryRouteDependencies = defaults,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const correlationId = requestCorrelationId(request)
    try {
      if (request.method !== 'POST') {
        return publicRouteError(new StructuredError({
          code: ERROR_CODES.VALIDATION_ERROR,
          status: 405,
          correlationId,
        }), correlationId)
      }

      const req = await dependencies.authenticate(request)
      const actor = resolvePrincipal(req.user)
      if (!actor) {
        throw new StructuredError({
          code: req.user ? ERROR_CODES.NOT_AUTHORIZED : ERROR_CODES.NOT_AUTHENTICATED,
          correlationId,
        })
      }
      if (actor.role !== 'principal' && actor.role !== 'admin') {
        throw new StructuredError({ code: ERROR_CODES.NOT_AUTHORIZED, correlationId })
      }

      const input = await parseBoundedJsonObject(request, NOTIFICATION_RETRY_MAX_BYTES)
      await dependencies.retry(deliveryId(input), req)
      return Response.json({ ok: true })
    } catch (error) {
      return publicRouteError(error, correlationId)
    }
  }
}
