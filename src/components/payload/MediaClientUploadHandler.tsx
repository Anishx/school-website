'use client'

import { createClientUploadHandler, getFileKey } from '@payloadcms/plugin-cloud-storage/client'
import { formatAdminURL } from 'payload/shared'

import { uploadWithTimeout } from '../../cms/storage/uploadWithTimeout'

export const MediaClientUploadHandler = createClientUploadHandler<{
  addRandomSuffix: boolean
  useCompositePrefixes?: boolean
}>({
  handler: async ({ apiRoute, collectionSlug, docPrefix, extra, file, prefix, serverHandlerPath, serverURL, updateFilename }) => {
    const { fileKey, sanitizedDocPrefix } = getFileKey({
      collectionPrefix: prefix,
      docPrefix,
      filename: file.name,
      useCompositePrefixes: extra.useCompositePrefixes ?? false,
    })
    const result = await uploadWithTimeout(fileKey, file, {
      access: 'public',
      clientPayload: collectionSlug,
      contentType: file.type,
      handleUploadUrl: formatAdminURL({ apiRoute, path: serverHandlerPath, serverURL }),
    })
    if (extra.addRandomSuffix) {
      updateFilename(decodeURIComponent(result.pathname.slice(result.pathname.lastIndexOf('/') + 1)))
    }
    return { prefix: sanitizedDocPrefix }
  },
})
