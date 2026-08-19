import { randomUUID } from 'node:crypto'

import {
  ERROR_CODES,
  type ErrorCode,
  type FieldErrorCode,
  isErrorCode,
  isFieldErrorCode,
} from './codes'
import { sanitizeOperationalContext, type OperationalContext } from './sanitize'

const PUBLIC_MESSAGES: Readonly<Record<ErrorCode, string>> = Object.freeze({
  VALIDATION_ERROR: 'Please correct the highlighted fields.',
  FORM_UNAVAILABLE: 'This form is not currently available.',
  CAPACITY_REACHED: 'No more registrations are available.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  NOT_AUTHENTICATED: 'Authentication is required.',
  NOT_AUTHORIZED: 'You are not authorized to perform this operation.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'The operation conflicts with the current state.',
  MEDIA_INVALID: 'The uploaded file is not permitted.',
  MEDIA_REFERENCED: 'This media item is currently in use.',
  CMS_READ_FAILURE: 'Content is temporarily unavailable.',
  STORAGE_FAILURE: 'The file operation could not be completed.',
  NOTIFICATION_FAILURE: 'The notification could not be delivered.',
  MIGRATION_FAILURE: 'The migration item could not be processed.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable.',
})

const DEFAULT_STATUS: Readonly<Record<ErrorCode, number>> = Object.freeze({
  VALIDATION_ERROR: 422, FORM_UNAVAILABLE: 404, CAPACITY_REACHED: 409,
  RATE_LIMITED: 429, NOT_AUTHENTICATED: 401, NOT_AUTHORIZED: 403,
  NOT_FOUND: 404, CONFLICT: 409, MEDIA_INVALID: 422, MEDIA_REFERENCED: 409,
  CMS_READ_FAILURE: 503, STORAGE_FAILURE: 503, NOTIFICATION_FAILURE: 503,
  MIGRATION_FAILURE: 500, SERVICE_UNAVAILABLE: 503,
})

const FIELD_MESSAGES: Readonly<Record<FieldErrorCode, string>> = Object.freeze({
  REQUIRED: 'This field is required.',
  INVALID: 'This field is invalid.',
  INVALID_FORMAT: 'Use a valid format.',
  UNSUPPORTED_VALUE: 'Select a supported value.',
  TOO_LONG: 'This value is too long.',
  OUT_OF_RANGE: 'This value is outside the permitted range.',
  FILE_TYPE_MISMATCH: 'The file type does not match its contents.',
  FILE_NOT_ALLOWED: 'This file type is not permitted.',
})

export type FieldErrorInput = Readonly<{
  field: string
  code: FieldErrorCode
}>

export type FieldValidationError = Readonly<{
  field: string
  code: FieldErrorCode
  message: string
}>

export type StructuredErrorOptions = Readonly<{
  code: ErrorCode
  status?: number
  fieldErrors?: readonly FieldErrorInput[]
  correlationId?: string
  context?: Readonly<Record<string, unknown>>
  cause?: unknown
}>

export type PublicError = Readonly<{
  code: ErrorCode
  message: string
  correlationId: string
  fields?: readonly FieldValidationError[]
}>

export type PublicErrorResponse = Readonly<{
  status: number
  body: Readonly<{ ok: false; error: PublicError }>
}>

const FIELD_PATH_PATTERN = /^[a-z][a-z0-9_.[\]-]{0,127}$/i
const CORRELATION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function correlationId(value?: string): string {
  return value && CORRELATION_ID_PATTERN.test(value) ? value.toLowerCase() : randomUUID()
}

export function publicMessageForCode(code: ErrorCode): string {
  return PUBLIC_MESSAGES[code]
}

function normalizeFieldErrors(inputs: readonly FieldErrorInput[] = []): readonly FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const seen = new Set<string>()

  for (const input of inputs) {
    if (!FIELD_PATH_PATTERN.test(input.field) || !isFieldErrorCode(input.code)) continue
    const identity = `${input.field}:${input.code}`
    if (seen.has(identity)) continue
    seen.add(identity)
    errors.push(Object.freeze({
      field: input.field,
      code: input.code,
      message: FIELD_MESSAGES[input.code],
    }))
  }

  return Object.freeze(errors)
}

export class StructuredError extends Error {
  readonly code: ErrorCode
  readonly status: number
  readonly correlationId: string
  readonly fieldErrors: readonly FieldValidationError[]
  readonly context?: OperationalContext
  declare readonly cause?: unknown

  constructor(options: StructuredErrorOptions) {
    super(PUBLIC_MESSAGES[options.code])
    this.name = 'StructuredError'
    this.code = options.code
    this.status = options.status && options.status >= 400 && options.status <= 599
      ? options.status
      : DEFAULT_STATUS[options.code]
    this.correlationId = correlationId(options.correlationId)
    this.fieldErrors = normalizeFieldErrors(options.fieldErrors)
    this.context = sanitizeOperationalContext(options.context)
    if (options.cause !== undefined) {
      Object.defineProperty(this, 'cause', { value: options.cause, enumerable: false })
    }
    Object.freeze(this.fieldErrors)
  }

  toJSON(): PublicError {
    return toPublicError(this)
  }
}

export function toPublicError(error: unknown, requestedCorrelationId?: string): PublicError {
  if (error instanceof StructuredError) {
    return Object.freeze({
      code: error.code,
      message: PUBLIC_MESSAGES[error.code],
      correlationId: error.correlationId,
      ...(error.fieldErrors.length > 0 ? { fields: error.fieldErrors } : {}),
    })
  }

  return Object.freeze({
    code: ERROR_CODES.SERVICE_UNAVAILABLE,
    message: PUBLIC_MESSAGES.SERVICE_UNAVAILABLE,
    correlationId: correlationId(requestedCorrelationId),
  })
}

export function toPublicErrorResponse(
  error: unknown,
  requestedCorrelationId?: string,
): PublicErrorResponse {
  const projected = toPublicError(error, requestedCorrelationId)
  const status = error instanceof StructuredError
    ? error.status
    : DEFAULT_STATUS.SERVICE_UNAVAILABLE

  return Object.freeze({
    status,
    body: Object.freeze({ ok: false, error: projected }),
  })
}

export function validationError(
  fieldErrors: readonly FieldErrorInput[],
  options: Omit<StructuredErrorOptions, 'code' | 'fieldErrors'> = {},
): StructuredError {
  return new StructuredError({
    ...options,
    code: ERROR_CODES.VALIDATION_ERROR,
    fieldErrors,
  })
}

export function errorCodeFrom(error: unknown): ErrorCode {
  return error instanceof StructuredError && isErrorCode(error.code)
    ? error.code
    : ERROR_CODES.SERVICE_UNAVAILABLE
}
