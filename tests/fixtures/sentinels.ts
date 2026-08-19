export const SYNTHETIC_EMAIL_DOMAIN = 'example.test'

export const SENTINEL_SECRETS = Object.freeze({
  payloadSecret: 'SENTINEL_PAYLOAD_SECRET_DO_NOT_EXPOSE',
  databaseUrl: 'postgresql://fixture:sentinel@test-db.invalid:5432/fixture',
  blobToken: 'vercel_blob_rw_SENTINEL_DO_NOT_EXPOSE',
  smtpPassword: 'SENTINEL_SMTP_PASSWORD_DO_NOT_EXPOSE',
  authToken: 'Bearer SENTINEL_AUTH_TOKEN_DO_NOT_EXPOSE',
})

export const SENTINEL_SECRET_VALUES = Object.freeze(Object.values(SENTINEL_SECRETS))

export const SYNTHETIC_RECIPIENTS = Object.freeze({
  admission: 'admissions@example.test',
  forms: 'forms@example.test',
  sender: 'mailer@example.test',
})

export function isSyntheticRecipient(value: string): boolean {
  const address = value.trim().toLowerCase()
  return address.endsWith(`@${SYNTHETIC_EMAIL_DOMAIN}`) && !address.includes('\n') && !address.includes('\r')
}

export function assertSyntheticRecipient(value: string): void {
  if (!isSyntheticRecipient(value)) {
    throw new Error('Fixture email delivery is restricted to reserved synthetic recipients')
  }
}
