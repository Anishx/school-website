import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import {
  Admissions,
  AuditRecords,
  ContentSections,
  Documents,
  Editorial,
  Forms,
  FormSubmissions,
  Media,
  NotificationDeliveries,
  Users,
} from './collections'
import { env } from './cms/config/env'
import { vercelBlobStoragePlugin } from './cms/storage/vercelBlob'
import { NotificationSettings, WebsiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseConnectionString = env.DATABASE_URL?.replace(
  /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/i,
  '$1sslmode=verify-full',
)
const databaseUrlDefinesSsl = /[?&]sslmode=/i.test(databaseConnectionString ?? '')

export default buildConfig({
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
    Users,
    Admissions,
    Media,
    ContentSections,
    Editorial,
    Documents,
    Forms,
    FormSubmissions,
    NotificationDeliveries,
    AuditRecords,
  ],
  globals: [WebsiteSettings, NotificationSettings],
  editor: lexicalEditor(),
  sharp,
  secret: env.PAYLOAD_SECRET ?? 'development-only-payload-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: {
      connectionString: databaseConnectionString ?? '',
      ssl: databaseConnectionString && !databaseUrlDefinesSsl ? { rejectUnauthorized: false } : undefined,
    },
  }),
  plugins: [vercelBlobStoragePlugin],
  ...(env.SMTP_ENABLED
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: env.SMTP_FROM_EMAIL,
          defaultFromName: env.SMTP_FROM_NAME,
          transportOptions: {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_SECURE,
            requireTLS: env.SMTP_PORT === 587,
            auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
          },
        }),
      }
    : {}),
})
