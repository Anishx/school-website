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
  /**
   * Optional captcha verifier run before persistence. Should throw a
   * StructuredError when verification fails; a no-op resolves the promise.
   */
  verifyCaptcha?: (input: unknown, request: Request) => Promise<void>
}>

const defaults: AdmissionRouteDependencies = {
  createRequest: createPublicPayloadRequest,
  submit: submitAdmission,
}

export function createAdmissionPostHandler(
  dependencies: Partial<AdmissionRouteDependencies> = defaults,
): (request: Request) => Promise<Response> {
  const { createRequest, submit, verifyCaptcha } = { ...defaults, ...dependencies }
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
      if (verifyCaptcha) await verifyCaptcha(input, request)
      const result = await submit(input, await createRequest(request))
      if (!result.ok) return publicRouteError(new Error('Admission persistence failed.'), correlationId)
      return Response.json({ ok: true, reference: result.reference }, { status: 201 })
    } catch (error) {
      return publicRouteError(error, correlationId)
    }
  }
}
