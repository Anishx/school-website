import type { PayloadRequest } from 'payload'

import { ERROR_CODES } from '../errors/codes'
import { StructuredError } from '../errors/structured-error'
import { submitAdmission, type PublicAdmissionSubmissionResult } from './submit'
import { createPublicPayloadRequest } from '../http/payload-route'
import {
  parseBoundedJsonObject,
  PUBLIC_SUBMISSION_MAX_BYTES,
  publicRouteError,
  requestCorrelationId,
} from '../http/route-input'

type AdmissionRouteDependencies = Readonly<{
  createRequest: (request: Request) => Promise<PayloadRequest>
  submit: (
    input: unknown,
    req: PayloadRequest,
  ) => Promise<PublicAdmissionSubmissionResult>
}>

const defaults: AdmissionRouteDependencies = {
  createRequest: createPublicPayloadRequest,
  submit: submitAdmission,
}

export function createAdmissionPostHandler(
  dependencies: AdmissionRouteDependencies = defaults,
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
      const input = await parseBoundedJsonObject(request, PUBLIC_SUBMISSION_MAX_BYTES)
      const result = await dependencies.submit(input, await dependencies.createRequest(request))
      if (!result.ok) return publicRouteError(new Error('Admission persistence failed.'), correlationId)
      return Response.json({ ok: true, reference: result.reference }, { status: 201 })
    } catch (error) {
      return publicRouteError(error, correlationId)
    }
  }
}
