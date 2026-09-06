import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { SENTINEL_SECRETS, SYNTHETIC_RECIPIENTS } from '../fixtures/sentinels'

const ENVIRONMENT_NAMES = [
  'NODE_ENV', 'DATABASE_URL', 'PAYLOAD_SECRET', 'BLOB_READ_WRITE_TOKEN',
  'PUBLIC_SITE_ORIGIN', 'SCHEDULER_SECRET', 'ADMISSION_NOTIFICATION_EMAIL',
  'FORM_NOTIFICATION_EMAIL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE',
  'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL', 'SMTP_FROM_NAME',
] as const

type Parser = typeof import('../../src/cms/config/env').parseServerEnvironment
let parseServerEnvironment: Parser

const productionSource: Record<string, string | undefined> = {
  NODE_ENV: 'production',
  DATABASE_URL: SENTINEL_SECRETS.databaseUrl,
  PAYLOAD_SECRET: SENTINEL_SECRETS.payloadSecret,
  BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_fixture_SyntheticToken123',
}

beforeAll(async () => {
  for (const name of ENVIRONMENT_NAMES) vi.stubEnv(name, '')
  vi.stubEnv('NODE_ENV', 'test')
  ;({ parseServerEnvironment } = await import('../../src/cms/config/env'))
})

afterAll(() => vi.unstubAllEnvs())

describe('server environment parsing', () => {
  it.each(['development', 'test', 'production'])(
    'rejects malformed Blob credentials without exposing them in %s',
    (NODE_ENV) => {
      const invalidToken = SENTINEL_SECRETS.blobToken
      const parse = () => parseServerEnvironment({
        ...productionSource, NODE_ENV, BLOB_READ_WRITE_TOKEN: invalidToken,
      })
      expect(parse).toThrow('Invalid server environment variable: BLOB_READ_WRITE_TOKEN')
      expect(parse).not.toThrow(invalidToken)
    },
  )

  it('disables Blob locally when its token is empty', () => {
    expect(parseServerEnvironment({ NODE_ENV: 'development', BLOB_READ_WRITE_TOKEN: ' ' }))
      .toMatchObject({ BLOB_STORAGE_ENABLED: false, BLOB_READ_WRITE_TOKEN: undefined })
  })

  it('accepts and trims a Blob token matching the installed adapter format', () => {
    expect(parseServerEnvironment({
      ...productionSource, BLOB_READ_WRITE_TOKEN: ` ${productionSource.BLOB_READ_WRITE_TOKEN}\n`,
    })).toMatchObject({
      BLOB_STORAGE_ENABLED: true, BLOB_READ_WRITE_TOKEN: productionSource.BLOB_READ_WRITE_TOKEN,
    })
  })

  it.each(['DATABASE_URL', 'PAYLOAD_SECRET', 'BLOB_READ_WRITE_TOKEN'])(
    'fails closed in production when %s is absent',
    (missingName) => {
      const source = { ...productionSource }
      delete source[missingName]

      expect(() => parseServerEnvironment(source)).toThrow(missingName)
    },
  )

  it('keeps SMTP explicitly disabled when no SMTP values are supplied', () => {
    const parsed = parseServerEnvironment(productionSource)

    expect(parsed).toMatchObject({ SMTP_ENABLED: false, SMTP_SECURE: false })
    expect(parsed.SMTP_HOST).toBeUndefined()
    expect(parsed.SMTP_USER).toBeUndefined()
    expect(parsed.SMTP_PASS).toBeUndefined()
  })

  it('accepts a complete synthetic SMTP configuration from the environment source', () => {
    const parsed = parseServerEnvironment({
      ...productionSource,
      SMTP_HOST: 'smtp.fixture.invalid', SMTP_PORT: '2525', SMTP_SECURE: 'false',
      SMTP_USER: 'sentinel-smtp-user', SMTP_PASS: SENTINEL_SECRETS.smtpPassword,
      SMTP_FROM_EMAIL: SYNTHETIC_RECIPIENTS.sender, SMTP_FROM_NAME: 'Fixture Mailer',
    })

    expect(parsed).toMatchObject({
      SMTP_ENABLED: true, SMTP_HOST: 'smtp.fixture.invalid', SMTP_PORT: 2525,
      SMTP_SECURE: false, SMTP_FROM_EMAIL: SYNTHETIC_RECIPIENTS.sender,
    })
  })

  it.each([
    { port: '587', secure: 'true', expected: 'SMTP_SECURE must be false' },
    { port: '465', secure: 'false', expected: 'SMTP_SECURE must be true' },
  ])('rejects an incompatible SMTP security mode for port $port', ({ port, secure, expected }) => {
    expect(() => parseServerEnvironment({
      ...productionSource,
      SMTP_HOST: 'smtp.fixture.invalid', SMTP_PORT: port, SMTP_SECURE: secure,
      SMTP_USER: 'sentinel-smtp-user', SMTP_PASS: SENTINEL_SECRETS.smtpPassword,
      SMTP_FROM_EMAIL: SYNTHETIC_RECIPIENTS.sender, SMTP_FROM_NAME: 'Fixture Mailer',
    })).toThrow(expected)
  })
})
