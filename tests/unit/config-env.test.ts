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
  BLOB_READ_WRITE_TOKEN: SENTINEL_SECRETS.blobToken,
}

beforeAll(async () => {
  for (const name of ENVIRONMENT_NAMES) vi.stubEnv(name, '')
  vi.stubEnv('NODE_ENV', 'test')
  ;({ parseServerEnvironment } = await import('../../src/cms/config/env'))
})

afterAll(() => vi.unstubAllEnvs())

describe('server environment parsing', () => {
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
})