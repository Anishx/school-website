type EnvironmentSource = Readonly<Record<string, string | undefined>>
type RuntimeEnvironment = 'development' | 'test' | 'production'

type SmtpDisabled = Readonly<{
  SMTP_ENABLED: false
  SMTP_HOST: undefined
  SMTP_PORT: undefined
  SMTP_SECURE: false
  SMTP_USER: undefined
  SMTP_PASS: undefined
  SMTP_FROM_EMAIL: undefined
  SMTP_FROM_NAME: undefined
}>

type SmtpEnabled = Readonly<{
  SMTP_ENABLED: true
  SMTP_HOST: string
  SMTP_PORT: number
  SMTP_SECURE: boolean
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM_EMAIL: string
  SMTP_FROM_NAME: string
}>

type CommonServerEnvironment = Readonly<{
  BLOB_STORAGE_ENABLED: boolean
  PUBLIC_SITE_ORIGIN: string | undefined
  SCHEDULER_SECRET: string | undefined
  SCHEDULER_ENABLED: boolean
  ADMISSION_NOTIFICATION_EMAIL: string | undefined
  FORM_NOTIFICATION_EMAIL: string | undefined
}>

type ProductionEnvironment = Readonly<{
  NODE_ENV: 'production'
  DATABASE_URL: string
  PAYLOAD_SECRET: string
  BLOB_READ_WRITE_TOKEN: string
}>

type NonProductionEnvironment = Readonly<{
  NODE_ENV: 'development' | 'test'
  DATABASE_URL: string | undefined
  PAYLOAD_SECRET: string | undefined
  BLOB_READ_WRITE_TOKEN: string | undefined
}>

export type ServerEnvironment = CommonServerEnvironment &
  (ProductionEnvironment | NonProductionEnvironment) &
  (SmtpDisabled | SmtpEnabled)

const SMTP_VARIABLES = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM_EMAIL',
  'SMTP_FROM_NAME',
] as const

function optionalValue(source: EnvironmentSource, name: string): string | undefined {
  const value = source[name]?.trim()
  return value ? value : undefined
}

function runtimeEnvironment(source: EnvironmentSource): RuntimeEnvironment {
  const value = optionalValue(source, 'NODE_ENV') ?? 'development'
  if (value === 'development' || value === 'test' || value === 'production') return value
  throw new Error('Invalid server environment variable: NODE_ENV')
}

function emailValue(source: EnvironmentSource, name: string): string | undefined {
  const value = optionalValue(source, name)
  if (!value) return undefined
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`Invalid server environment variable: ${name}`)
  }
  return value
}

function originValue(source: EnvironmentSource): string | undefined {
  const value = optionalValue(source, 'PUBLIC_SITE_ORIGIN')
  if (!value) return undefined

  try {
    const url = new URL(value)
    const isOrigin =
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.username &&
      !url.password &&
      url.pathname === '/' &&
      !url.search &&
      !url.hash
    if (!isOrigin) throw new Error('not an origin')
    return url.origin
  } catch {
    throw new Error('Invalid server environment variable: PUBLIC_SITE_ORIGIN')
  }
}

function smtpValues(source: EnvironmentSource): SmtpDisabled | SmtpEnabled {
  const supplied = SMTP_VARIABLES.filter((name) => optionalValue(source, name) !== undefined)
  if (supplied.length === 0) {
    return Object.freeze({
      SMTP_ENABLED: false,
      SMTP_HOST: undefined,
      SMTP_PORT: undefined,
      SMTP_SECURE: false,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
      SMTP_FROM_EMAIL: undefined,
      SMTP_FROM_NAME: undefined,
    })
  }

  const missing = SMTP_VARIABLES.filter((name) => optionalValue(source, name) === undefined)
  if (missing.length > 0) {
    throw new Error(`Incomplete SMTP environment configuration; missing: ${missing.join(', ')}`)
  }

  const portText = optionalValue(source, 'SMTP_PORT') as string
  const port = Number(portText)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('Invalid server environment variable: SMTP_PORT')
  }

  const secureText = optionalValue(source, 'SMTP_SECURE')
  if (secureText !== 'true' && secureText !== 'false') {
    throw new Error('Invalid server environment variable: SMTP_SECURE')
  }

  return Object.freeze({
    SMTP_ENABLED: true,
    SMTP_HOST: optionalValue(source, 'SMTP_HOST') as string,
    SMTP_PORT: port,
    SMTP_SECURE: secureText === 'true',
    SMTP_USER: optionalValue(source, 'SMTP_USER') as string,
    SMTP_PASS: optionalValue(source, 'SMTP_PASS') as string,
    SMTP_FROM_EMAIL: emailValue(source, 'SMTP_FROM_EMAIL') as string,
    SMTP_FROM_NAME: optionalValue(source, 'SMTP_FROM_NAME') as string,
  })
}

/**
 * Parses server runtime configuration. Error messages identify variable names only
 * and must never include environment values.
 */
export function parseServerEnvironment(
  source: EnvironmentSource = process.env,
): ServerEnvironment {
  if (typeof window !== 'undefined') {
    throw new Error('Server environment configuration cannot run in a browser')
  }

  const nodeEnvironment = runtimeEnvironment(source)
  const databaseURL = optionalValue(source, 'DATABASE_URL')
  const payloadSecret = optionalValue(source, 'PAYLOAD_SECRET')
  const blobToken = optionalValue(source, 'BLOB_READ_WRITE_TOKEN')

  if (nodeEnvironment === 'production') {
    const missing = [
      !databaseURL && 'DATABASE_URL',
      !payloadSecret && 'PAYLOAD_SECRET',
      !blobToken && 'BLOB_READ_WRITE_TOKEN',
    ].filter((name): name is string => Boolean(name))

    if (missing.length > 0) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`)
    }
  }

  const smtp = smtpValues(source)
  const schedulerSecret = optionalValue(source, 'SCHEDULER_SECRET')

  return Object.freeze({
    NODE_ENV: nodeEnvironment,
    DATABASE_URL: databaseURL,
    PAYLOAD_SECRET: payloadSecret,
    BLOB_READ_WRITE_TOKEN: blobToken,
    BLOB_STORAGE_ENABLED: Boolean(blobToken),
    PUBLIC_SITE_ORIGIN: originValue(source),
    SCHEDULER_SECRET: schedulerSecret,
    SCHEDULER_ENABLED: Boolean(schedulerSecret),
    ADMISSION_NOTIFICATION_EMAIL: emailValue(source, 'ADMISSION_NOTIFICATION_EMAIL'),
    FORM_NOTIFICATION_EMAIL: emailValue(source, 'FORM_NOTIFICATION_EMAIL'),
    ...smtp,
  } as ServerEnvironment)
}

/** Server-only configuration. Do not pass this object to client components or DTOs. */
export const env = parseServerEnvironment()
