import { afterEach, describe, expect, it, vi } from 'vitest'

import { clientIpFromRequest, verifyTurnstileToken } from '../../src/cms/security/turnstile'
import { StructuredError } from '../../src/cms/errors/structured-error'

const ORIGINAL_SECRET = process.env.TURNSTILE_SECRET_KEY
const ORIGINAL_HOSTNAMES = process.env.TURNSTILE_HOSTNAMES

function restore(key: string, original: string | undefined) {
  if (original === undefined) delete process.env[key]
  else process.env[key] = original
}

afterEach(() => {
  restore('TURNSTILE_SECRET_KEY', ORIGINAL_SECRET)
  restore('TURNSTILE_HOSTNAMES', ORIGINAL_HOSTNAMES)
  vi.restoreAllMocks()
})

function verifyResponse(
  fields: { success: boolean; action?: string; hostname?: string },
): Response {
  return new Response(JSON.stringify(fields), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

const OK = { success: true, action: 'admission', hostname: 'localhost' }

describe('verifyTurnstileToken', () => {
  it('skips verification (no throw, no fetch) when secret key is not configured', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    process.env.TURNSTILE_HOSTNAMES = 'localhost'
    const fetchImpl = vi.fn()
    await expect(verifyTurnstileToken('anything', { fetchImpl: fetchImpl as unknown as typeof fetch }))
      .resolves.toBeUndefined()
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('resolves when success, action and hostname all match', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.TURNSTILE_HOSTNAMES = 'localhost,apollovidhyalayam.com'
    const fetchImpl = vi.fn(async () => verifyResponse(OK))
    await expect(
      verifyTurnstileToken('good-token', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).resolves.toBeUndefined()
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it.each([
    ['missing token', undefined],
    ['empty token', ''],
    ['oversized token', 'x'.repeat(2049)],
  ])('throws a validation error for %s without calling siteverify', async (_scenario, token) => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.TURNSTILE_HOSTNAMES = 'localhost'
    const fetchImpl = vi.fn(async () => verifyResponse(OK))
    await expect(
      verifyTurnstileToken(token, { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(StructuredError)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('throws (without calling siteverify) when the hostname allowlist is empty', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    delete process.env.TURNSTILE_HOSTNAMES
    const fetchImpl = vi.fn(async () => verifyResponse(OK))
    await expect(
      verifyTurnstileToken('token', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(StructuredError)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('throws when siteverify reports failure', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.TURNSTILE_HOSTNAMES = 'localhost'
    const fetchImpl = vi.fn(async () => verifyResponse({ success: false }))
    await expect(
      verifyTurnstileToken('bad-token', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(StructuredError)
  })

  it('throws when the action does not match the expected surface', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.TURNSTILE_HOSTNAMES = 'localhost'
    const fetchImpl = vi.fn(async () =>
      verifyResponse({ success: true, action: 'login', hostname: 'localhost' }),
    )
    await expect(
      verifyTurnstileToken('token', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(StructuredError)
  })

  it('throws when the hostname is not in the allowlist', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.TURNSTILE_HOSTNAMES = 'apollovidhyalayam.com'
    const fetchImpl = vi.fn(async () =>
      verifyResponse({ success: true, action: 'admission', hostname: 'evil.example' }),
    )
    await expect(
      verifyTurnstileToken('token', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toBeInstanceOf(StructuredError)
  })

  it('fails closed (503) when the verification service is unreachable', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.TURNSTILE_HOSTNAMES = 'localhost'
    const fetchImpl = vi.fn(async () => { throw new Error('network down') })
    await expect(
      verifyTurnstileToken('token', { fetchImpl: fetchImpl as unknown as typeof fetch }),
    ).rejects.toMatchObject({ status: 503 })
  })
})

describe('clientIpFromRequest', () => {
  it('reads the first x-forwarded-for entry', () => {
    const req = new Request('http://test', { headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' } })
    expect(clientIpFromRequest(req)).toBe('203.0.113.7')
  })

  it('falls back to x-real-ip and returns null when absent', () => {
    expect(clientIpFromRequest(new Request('http://test', { headers: { 'x-real-ip': '198.51.100.9' } })))
      .toBe('198.51.100.9')
    expect(clientIpFromRequest(new Request('http://test'))).toBeNull()
  })
})
