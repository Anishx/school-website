import { Forbidden, ValidationError } from 'payload'

import { ERROR_CODES } from '../errors/codes'
import {
  StructuredError,
  toPublicErrorResponse,
  validationError,
} from '../errors/structured-error'

export const PUBLIC_SUBMISSION_MAX_BYTES = 32 * 1024
export const NOTIFICATION_RETRY_MAX_BYTES = 2 * 1024

function invalidRequest(status = 400): StructuredError {
  return validationError([{ field: 'request', code: 'INVALID' }], { status })
}

export async function parseBoundedJsonObject(
  request: Request,
  maxBytes: number,
): Promise<Readonly<Record<string, unknown>>> {
  const mediaType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()
  if (mediaType !== 'application/json') throw invalidRequest(415)

  const contentLength = request.headers.get('content-length')
  if (contentLength !== null && (!/^\d+$/.test(contentLength) || Number(contentLength) > maxBytes)) {
    throw invalidRequest(413)
  }

  const reader = request.body?.getReader()
  if (!reader) throw invalidRequest()
  const chunks: Uint8Array[] = []
  let size = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw invalidRequest(413)
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)))
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw invalidRequest()
    return parsed as Readonly<Record<string, unknown>>
  } catch (error) {
    if (error instanceof StructuredError) throw error
    throw invalidRequest()
  }
}

export function publicRouteError(error: unknown, correlationId?: string): Response {
  const safeError = error instanceof StructuredError
    ? error
    : error instanceof ValidationError
      ? validationError([], { correlationId })
      : error instanceof Forbidden
        ? new StructuredError({ code: ERROR_CODES.NOT_AUTHORIZED, correlationId })
        : error
  const { body, status } = toPublicErrorResponse(safeError, correlationId)
  return Response.json(body, { status })
}

export function requestCorrelationId(request: Request): string | undefined {
  return request.headers.get('x-correlation-id') ?? undefined
}
