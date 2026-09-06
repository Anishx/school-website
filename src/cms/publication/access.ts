import type { PayloadRequest } from 'payload'

import { collectionAccessDecision, type AccessResource } from '../../access/collectionAccess'
import { resolvePrincipal } from '../../access/roles'
import { publicEligibilityWhere } from './model'

export function publishedContentAccess(resource: AccessResource, operation: 'read' | 'update' | 'delete') {
  return ({ req }: { req: PayloadRequest }) => {
    if (!req.user && operation === 'read') return publicEligibilityWhere()
    return collectionAccessDecision({ user: req.user, resource, operation })
  }
}

export function contentCreateAccess(resource: AccessResource) {
  return ({ req, data }: { req: PayloadRequest; data?: Record<string, unknown> }) => collectionAccessDecision({
    user: req.user,
    resource,
    operation: 'create',
    requestedPublicationState: data?.publicationState ?? 'draft',
  })
}

export function setCreatedBy(data: Record<string, unknown> | undefined, req: PayloadRequest) {
  const principal = resolvePrincipal(req.user)
  return principal ? { ...(data ?? {}), createdBy: principal.id } : data
}
