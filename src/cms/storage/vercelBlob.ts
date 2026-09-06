import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { PayloadRequest, UploadCollectionSlug } from 'payload'

import { canEnterPayloadAdmin } from '../../access/roles'
import { collectionAccessDecision } from '../../access/collectionAccess'
import { env, type ServerEnvironment } from '../config/env'

export const MEDIA_BLOB_COLLECTION = 'media' as const

/**
 * Issues direct-upload tokens only for active Payload administrators and teachers.
 * The collection guard prevents this callback from granting a token for any other
 * client-upload-enabled collection that might be added later.
 */
export function canRequestMediaClientUpload(args: Readonly<{
  collectionSlug: UploadCollectionSlug
  req: PayloadRequest
}>): boolean {
  return args.collectionSlug === MEDIA_BLOB_COLLECTION && canEnterPayloadAdmin(args.req.user)
    && collectionAccessDecision({ user: args.req.user, resource: 'media', operation: 'create' }) === true
}

/**
 * The official storage plugin configuration. Payload composition deliberately
 * happens in task 9.1; keeping it here makes the secure media adapter reusable
 * without changing global configuration prematurely.
 */
export function createVercelBlobStoragePlugin(environment: ServerEnvironment = env) {
  return vercelBlobStorage({
    collections: {
      [MEDIA_BLOB_COLLECTION]: {
        disableLocalStorage: true,
      },
    },
    access: 'public',
    addRandomSuffix: true,
    clientUploads: {
      access: canRequestMediaClientUpload,
    },
    enabled: environment.BLOB_STORAGE_ENABLED,
    token: environment.BLOB_READ_WRITE_TOKEN,
  })
}

export const vercelBlobStoragePlugin = createVercelBlobStoragePlugin()
