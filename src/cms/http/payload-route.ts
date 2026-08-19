import config from '../../payload.config'
import { createLocalReq, getPayload, type PayloadRequest } from 'payload'

function localRequestOptions(request: Request) {
  return {
    headers: request.headers,
    url: request.url,
  }
}

export async function createPublicPayloadRequest(request: Request): Promise<PayloadRequest> {
  const payload = await getPayload({ config })
  return await createLocalReq({ req: localRequestOptions(request) }, payload)
}

export async function createAuthenticatedPayloadRequest(request: Request): Promise<PayloadRequest> {
  const payload = await getPayload({ config })
  const unauthenticatedRequest = await createLocalReq({
    req: localRequestOptions(request),
  }, payload)
  const { user } = await payload.auth({
    canSetHeaders: false,
    headers: request.headers,
    req: unauthenticatedRequest,
  })
  return await createLocalReq({
    req: unauthenticatedRequest,
    user: user ?? undefined,
  }, payload)
}
