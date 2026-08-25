const REDACTED = '[REDACTED]'
const MAX_DEPTH = 8
const MAX_ITEMS = 100
const MAX_STRING_LENGTH = 2_000

const SENSITIVE_KEYS = new Set([
  'aadhar', 'aadharno', 'aadhaar', 'aadhaarno', 'address', 'authorization',
  'birthdate', 'buffer', 'cause', 'content', 'cookie', 'credentials',
  'databaseurl', 'email', 'filebytes', 'filename', 'guardianname', 'params',
  'password', 'passwd', 'payloadsecret', 'phone', 'query', 'raw', 'requestbody',
  'secret', 'session', 'smtp', 'smtphost', 'smtppass', 'smtpuser', 'sql',
  'stack', 'statement', 'storagetoken', 'studentname', 'token', 'upload',
  'uploadedfile', 'value', 'values',
])

const SENSITIVE_KEY_PARTS = [
  'aadhar', 'aadhaar', 'accesstoken', 'address', 'apikey', 'authorization',
  'authtoken', 'blobtoken', 'clientsecret', 'connectionstring', 'contact',
  'credential', 'database', 'email', 'fathername', 'guardian', 'mothername',
  'password', 'privatekey', 'rawvalue', 'refreshtoken', 'secret', 'sessionid',
  'smtp', 'sqlquery', 'studentname', 'token',
]

const OPERATIONAL_CONTEXT_KEYS = new Set([
  'actorId', 'actorRole', 'attemptNumber', 'category', 'collection',
  'field', 'key', 'kind', 'operation', 'pathPrefix', 'pathnameHash',
  'recordId', 'scope', 'sourceKey', 'status', 'tag', 'target', 'targetId',
])

export type SanitizedValue =
  | null
  | boolean
  | number
  | string
  | SanitizedValue[]
  | { [key: string]: SanitizedValue }

function normalizedKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

export function isSensitiveKey(key: string): boolean {
  const normalized = normalizedKey(key)
  return SENSITIVE_KEYS.has(normalized) || SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part))
}

export function sanitizeText(value: string): string {
  let sanitized = value
    .replace(/\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|smtp):\/\/\S+/gi, REDACTED)
    .replace(/\b(?:bearer|basic)\s+[a-z0-9._~+/=-]+/gi, REDACTED)
    .replace(
      /\b(?:password|passwd|secret|token|authorization|cookie|api[_-]?key|smtp[_-]?(?:host|user|pass))\b\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      REDACTED,
    )
    .replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g, REDACTED)
    .replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g, REDACTED)

  if (/\b(?:select|insert|update|delete|alter|drop)\b[\s\S]*\b(?:from|into|table|set)\b/i.test(sanitized)) {
    sanitized = REDACTED
  }

  return sanitized.length > MAX_STRING_LENGTH
    ? `${sanitized.slice(0, MAX_STRING_LENGTH)}…`
    : sanitized
}

function visit(value: unknown, seen: WeakSet<object>, depth: number): SanitizedValue {
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : String(value)
  if (typeof value === 'string') return sanitizeText(value)
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'undefined' || typeof value === 'function' || typeof value === 'symbol') {
    return REDACTED
  }
  if (depth >= MAX_DEPTH) return REDACTED
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? REDACTED : value.toISOString()
  if (value instanceof Error) return { name: 'Error', message: 'Operational failure' }
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) return REDACTED
  if (seen.has(value)) return '[CIRCULAR]'

  seen.add(value)
  if (Array.isArray(value)) {
    return value.slice(0, MAX_ITEMS).map((item) => visit(item, seen, depth + 1))
  }

  const output: { [key: string]: SanitizedValue } = Object.create(null)
  let entries: [string, unknown][]
  try {
    entries = Object.entries(value as Readonly<Record<string, unknown>>)
  } catch {
    return REDACTED
  }

  for (const [key, nested] of entries.slice(0, MAX_ITEMS)) {
    if (isSensitiveKey(key)) continue
    Object.defineProperty(output, key, {
      value: visit(nested, seen, depth + 1),
      enumerable: true,
      configurable: true,
    })
  }
  return output
}

/** Recursively removes sensitive keys, binary values, stacks, and causes. */
export function sanitizeRecursively(value: unknown): SanitizedValue {
  return visit(value, new WeakSet<object>(), 0)
}

export type OperationalContextValue = null | boolean | number | string | readonly (null | boolean | number | string)[]
export type OperationalContext = Readonly<Record<string, OperationalContextValue>>

function sanitizeContextValue(value: unknown): OperationalContextValue | undefined {
  if (value === null || typeof value === 'boolean') return value
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') return sanitizeText(value)
  if (Array.isArray(value)) {
    const safe: Array<null | boolean | number | string> = []
    for (const item of value.slice(0, MAX_ITEMS)) {
      const sanitized = sanitizeContextValue(item)
      if (sanitized === null
        || typeof sanitized === 'boolean'
        || typeof sanitized === 'number'
        || typeof sanitized === 'string') {
        safe.push(sanitized)
      }
    }
    return Object.freeze(safe)
  }
  return undefined
}

/** Keeps only explicitly approved operational metadata and scalar values. */
export function sanitizeOperationalContext(
  context: Readonly<Record<string, unknown>> | undefined,
): OperationalContext | undefined {
  if (!context) return undefined
  const output: Record<string, OperationalContextValue> = Object.create(null)
  let entries: [string, unknown][]
  try {
    entries = Object.entries(context)
  } catch {
    return undefined
  }

  for (const [key, value] of entries) {
    if (!OPERATIONAL_CONTEXT_KEYS.has(key) || isSensitiveKey(key)) continue
    const sanitized = sanitizeContextValue(value)
    if (sanitized !== undefined) {
      Object.defineProperty(output, key, {
        value: sanitized,
        enumerable: true,
        configurable: true,
      })
    }
  }

  return Object.keys(output).length > 0 ? Object.freeze(output) : undefined
}

export { REDACTED }
