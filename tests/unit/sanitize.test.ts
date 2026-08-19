import { describe, expect, it } from 'vitest'

import { FIELD_ERROR_CODES } from '../../src/cms/errors/codes'
import { REDACTED, sanitizeRecursively } from '../../src/cms/errors/sanitize'
import {
  toPublicErrorResponse,
  validationError,
} from '../../src/cms/errors/structured-error'
import { SENTINEL_SECRET_VALUES, SENTINEL_SECRETS } from '../fixtures/sentinels'

const CORRELATION_ID = '11111111-1111-4111-8111-111111111111'

describe('structured error projection', () => {
  it('returns stable field-addressable validation errors without internal details', () => {
    const error = validationError([
      { field: 'guardian.email', code: FIELD_ERROR_CODES.INVALID_FORMAT },
      { field: 'studentName', code: FIELD_ERROR_CODES.REQUIRED },
      { field: 'guardian.email', code: FIELD_ERROR_CODES.INVALID_FORMAT },
    ], {
      correlationId: CORRELATION_ID,
      context: { operation: 'validate', password: SENTINEL_SECRETS.payloadSecret },
      cause: new Error(SENTINEL_SECRETS.databaseUrl),
    })

    expect(toPublicErrorResponse(error)).toEqual({
      status: 422,
      body: {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please correct the highlighted fields.',
          correlationId: CORRELATION_ID,
          fields: [
            { field: 'guardian.email', code: 'INVALID_FORMAT', message: 'Use a valid format.' },
            { field: 'studentName', code: 'REQUIRED', message: 'This field is required.' },
          ],
        },
      },
    })
    expect(error.context).toEqual({ operation: 'validate' })
    expect(JSON.stringify(error)).not.toContain('SENTINEL')
  })
})

describe('recursive sanitization', () => {
  it('redacts nested credentials, sensitive data, binary values, and cycles', () => {
    const input: Record<string, unknown> = {
      operation: 'fixture-check',
      credentials: { password: SENTINEL_SECRETS.smtpPassword },
      nested: {
        safe: 'retained',
        authorization: SENTINEL_SECRETS.authToken,
        details: { email: 'guardian@example.test', aadhaar: '1234 5678 9012' },
      },
      message: `Connection failed: ${SENTINEL_SECRETS.databaseUrl}`,
      bytes: Uint8Array.from([1, 2, 3]),
    }
    input.self = input

    const sanitized = sanitizeRecursively(input)
    const serialized = JSON.stringify(sanitized)

    expect(sanitized).toMatchObject({
      operation: 'fixture-check',
      nested: { safe: 'retained', details: {} },
      message: `Connection failed: ${REDACTED}`,
      bytes: REDACTED,
      self: '[CIRCULAR]',
    })
    expect(serialized).not.toContain('credentials')
    expect(serialized).not.toContain('authorization')
    expect(serialized).not.toContain('guardian@example.test')
    for (const sentinel of SENTINEL_SECRET_VALUES) expect(serialized).not.toContain(sentinel)
  })

  it('projects unknown failures to one generic public response', () => {
    const failure = Object.assign(
      new Error(`Storage failed for ${SENTINEL_SECRETS.blobToken}`),
      { sql: 'SELECT secret FROM credentials', cause: SENTINEL_SECRETS.smtpPassword },
    )

    const response = toPublicErrorResponse(failure, CORRELATION_ID)

    expect(response).toEqual({
      status: 503,
      body: {
        ok: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'The service is temporarily unavailable.',
          correlationId: CORRELATION_ID,
        },
      },
    })
    expect(JSON.stringify(response)).not.toContain('SENTINEL')
    expect(response.body.error).not.toHaveProperty('stack')
    expect(response.body.error).not.toHaveProperty('cause')
  })
})