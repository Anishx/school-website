import type { PayloadRequest, RequestContext } from 'payload'

/** Internal marker used only by the byte-verification update. */
export const MEDIA_VERIFICATION_CONTEXT = Symbol('media-verification-context')
export const MEDIA_UPLOAD_BYTES = Symbol('media-upload-bytes')

export function withMediaVerificationContext(context?: RequestContext): RequestContext {
  return { ...context, [MEDIA_VERIFICATION_CONTEXT]: true }
}

export function isMediaVerificationContext(req: Pick<PayloadRequest, 'context'>): boolean {
  const context = req.context as Record<PropertyKey, unknown> | undefined
  return context?.[MEDIA_VERIFICATION_CONTEXT] === true
}
