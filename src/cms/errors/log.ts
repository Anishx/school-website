import { ERROR_CODES, type ErrorCode } from './codes'
import {
  publicMessageForCode,
  StructuredError,
  toPublicError,
  type PublicError,
} from './structured-error'
import { sanitizeOperationalContext, type OperationalContext } from './sanitize'

export type OperationalLogLevel = 'error' | 'warn'

export type OperationalLogRecord = Readonly<{
  timestamp: string
  level: OperationalLogLevel
  event: string
  code: ErrorCode
  message: string
  correlationId: string
  context?: OperationalContext
}>

export type OperationalLogSink = (record: OperationalLogRecord) => void

export type OperationalLogOptions = Readonly<{
  event: string
  level?: OperationalLogLevel
  correlationId?: string
  context?: Readonly<Record<string, unknown>>
  now?: Date
  sink?: OperationalLogSink
}>

function safeEventName(event: string): string {
  return /^[a-z][a-z0-9_.-]{0,79}$/i.test(event) ? event : 'operational_failure'
}

function defaultSink(record: OperationalLogRecord): void {
  console.error(JSON.stringify(record))
}

function mergeContext(
  error: unknown,
  supplied: Readonly<Record<string, unknown>> | undefined,
): OperationalContext | undefined {
  const inherited = error instanceof StructuredError ? error.context : undefined
  return sanitizeOperationalContext({ ...inherited, ...supplied })
}

export function createOperationalLogRecord(
  error: unknown,
  options: Omit<OperationalLogOptions, 'sink'>,
): OperationalLogRecord {
  const projected: PublicError = toPublicError(error, options.correlationId)
  const context = mergeContext(error, options.context)
  const timestamp = options.now && !Number.isNaN(options.now.valueOf())
    ? options.now.toISOString()
    : new Date().toISOString()

  return Object.freeze({
    timestamp,
    level: options.level ?? 'error',
    event: safeEventName(options.event),
    code: projected.code,
    message: publicMessageForCode(projected.code),
    correlationId: projected.correlationId,
    ...(context ? { context } : {}),
  })
}

/**
 * Emits a JSON-only, sanitized operational record. The raw error is used only
 * for classification and is never handed to the sink.
 */
export function logOperationalError(
  error: unknown,
  options: OperationalLogOptions,
): OperationalLogRecord {
  const record = createOperationalLogRecord(error, options)
  try {
    ;(options.sink ?? defaultSink)(record)
  } catch {
    // Logging must not change the outcome of the protected operation.
  }
  return record
}

export function logServiceUnavailable(
  options: OperationalLogOptions,
): OperationalLogRecord {
  return logOperationalError(
    new StructuredError({
      code: ERROR_CODES.SERVICE_UNAVAILABLE,
      correlationId: options.correlationId,
      context: options.context,
    }),
    options,
  )
}
