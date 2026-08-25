import { ERROR_CODES } from '../errors/codes'
import { StructuredError } from '../errors/structured-error'

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** Max length of a Turnstile token we will accept before rejecting outright. */
const MAX_TOKEN_LENGTH = 2048

/** Stable Turnstile action for the admissions application form surface. */
export const ADMISSION_TURNSTILE_ACTION = 'admission'

type TurnstileVerifyResponse = {
  success: boolean
  action?: string
  hostname?: string
  'error-codes'?: string[]
}

function captchaError(status = 422): StructuredError {
  return new StructuredError({
    code: ERROR_CODES.VALIDATION_ERROR,
    status,
    fieldErrors: [{ field: 'captchaToken', code: 'INVALID' }],
  })
}

/** Parses the comma-separated TURNSTILE_HOSTNAMES allowlist into a Set. */
function expectedHostnames(): Set<string> {
  return new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? '')
      .split(',')
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  )
}

/**
 * Verifies a Cloudflare Turnstile token against the canonical siteverify API.
 *
 * Follows the Turnstile Spin contract: requires `success === true`, the expected
 * `action`, and a `hostname` present in the TURNSTILE_HOSTNAMES allowlist.
 *
 * Behaviour:
 * - If `TURNSTILE_SECRET_KEY` is not configured, verification is skipped (returns
 *   without throwing) so local/dev and preview environments work without keys.
 * - Otherwise a missing/oversized/invalid token, a failed check, a wrong action,
 *   or an unapproved hostname throws a StructuredError.
 */
export async function verifyTurnstileToken(
  token: unknown,
  options: {
    remoteIp?: string | null
    expectedAction?: string
    fetchImpl?: typeof fetch
  } = {},
): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // Not configured — skip verification so the form still works without keys.
  if (!secret) return

  const hostnames = expectedHostnames()
  const expectedAction = options.expectedAction ?? ADMISSION_TURNSTILE_ACTION

  if (
    typeof token !== 'string' ||
    token.length === 0 ||
    token.length > MAX_TOKEN_LENGTH ||
    hostnames.size === 0
  ) {
    throw captchaError()
  }

  const fetchImpl = options.fetchImpl ?? fetch
  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (options.remoteIp) body.set('remoteip', options.remoteIp)

  let data: TurnstileVerifyResponse
  try {
    const res = await fetchImpl(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body,
    })
    if (!res.ok) throw new Error(`siteverify ${res.status}`)
    data = (await res.json()) as TurnstileVerifyResponse
  } catch {
    // Verification service unreachable — fail closed with a retriable error.
    throw captchaError(503)
  }

  if (
    !data.success ||
    data.action !== expectedAction ||
    typeof data.hostname !== 'string' ||
    !hostnames.has(data.hostname)
  ) {
    throw captchaError()
  }
}

/** Extracts the best-effort client IP from a request for Turnstile remoteip. */
export function clientIpFromRequest(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',', 1)[0]?.trim() ?? null
  return request.headers.get('x-real-ip')
}
