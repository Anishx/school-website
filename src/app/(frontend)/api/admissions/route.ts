import { createAdmissionPostHandler } from '@/cms/admissions/public-route'
import { verifyTurnstileToken, clientIpFromRequest } from '@/cms/security/turnstile'

export const runtime = 'nodejs'

export const POST = createAdmissionPostHandler({
  verifyCaptcha: async (input, request) => {
    const token = (input as Record<string, unknown> | null)?.captchaToken
    await verifyTurnstileToken(token, { remoteIp: clientIpFromRequest(request) })
  },
})
