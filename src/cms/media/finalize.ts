import { createHash } from 'node:crypto'

import { del } from '@vercel/blob'
import type { PayloadRequest, RequestContext } from 'payload'

import { canEnterPayloadAdmin, isPrincipalID, type PrincipalID } from '../../access/roles'
import { withMediaVerificationContext } from '../../collections/Media'
import { env } from '../config/env'
import { ERROR_CODES } from '../errors/codes'
import { logOperationalError } from '../errors/log'
import { StructuredError, validationError } from '../errors/structured-error'
import { isManagedBlobPathname } from './references'
import { MAX_PDF_BYTES, validateMediaUpload, type ValidatedMediaUpload } from './validate'

export type MediaFinalizationInput = Readonly<{
  blobUrl: unknown
  originalFilename: unknown
  mimeType: unknown
  filesize?: unknown
  title: unknown
  category: unknown
  alt?: unknown
  decorative?: unknown
  caption?: unknown
}>

export type MediaFinalizationResult = Readonly<{
  id: PrincipalID
  verificationStatus: 'verified'
  descriptor: ValidatedMediaUpload['descriptor']
}>

export type OrphanCandidate = Readonly<{
  pathnameHash: string
  reason: 'metadata_persistence_failed'
}>

type BlobFetchResponse = Readonly<{
  ok: boolean
  status: number
  headers: Pick<Headers, 'get'>
  arrayBuffer: () => Promise<ArrayBuffer>
}>

type MediaPayload = Readonly<{
  create: (args: Readonly<Record<string, unknown>>) => Promise<unknown>
  update: (args: Readonly<Record<string, unknown>>) => Promise<unknown>
  db: Readonly<{
    beginTransaction: () => Promise<string | number | null>
    commitTransaction: (transactionID: string | number) => Promise<void>
    rollbackTransaction: (transactionID: string | number) => Promise<void>
  }>
}>

export type MediaFinalizationOptions = Readonly<{
  fetchBlob?: (url: string) => Promise<BlobFetchResponse>
  deleteBlob?: (url: string) => Promise<void>
  recordOrphanCandidate?: (candidate: OrphanCandidate) => void
}>

function storageFailure(cause?: unknown): StructuredError {
  return new StructuredError({ code: ERROR_CODES.STORAGE_FAILURE, cause })
}

function blobURL(value: unknown): URL | null {
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const parsed = new URL(value)
    const hostname = parsed.hostname.toLowerCase()
    const suffix = '.public.blob.vercel-storage.com'
    if (parsed.protocol !== 'https:'
      || parsed.username
      || parsed.password
      || parsed.port
      || !hostname.endsWith(suffix)
      || hostname.length === suffix.length
      || !parsed.pathname
      || !isManagedBlobPathname(parsed.pathname)
      || parsed.search
      || parsed.hash) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function filenameFromURL(url: URL): string | null {
  const segment = url.pathname.split('/').filter(Boolean).at(-1)
  if (!segment) return null
  try {
    const filename = decodeURIComponent(segment)
    return filename && !filename.includes('/') && !filename.includes('\\') ? filename : null
  } catch {
    return null
  }
}

function pathnameHash(url: URL): string {
  return createHash('sha256').update(url.pathname).digest('hex')
}

function contentLength(response: BlobFetchResponse): number | null {
  const header = response.headers.get('content-length')
  if (header === null || !/^\d+$/.test(header)) return null
  const length = Number(header)
  return Number.isSafeInteger(length) ? length : null
}

async function readBlobBytes(response: BlobFetchResponse): Promise<Uint8Array> {
  const declaredLength = contentLength(response)
  if (declaredLength !== null && declaredLength > MAX_PDF_BYTES) {
    throw validationError([{ field: 'filesize', code: 'OUT_OF_RANGE' }])
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > MAX_PDF_BYTES) {
    throw validationError([{ field: 'filesize', code: 'OUT_OF_RANGE' }])
  }
  return bytes
}

function transactionRequest(req: PayloadRequest, transactionID: string | number): PayloadRequest {
  return { ...req, transactionID }
}

function verificationRequest(req: PayloadRequest): PayloadRequest {
  return {
    ...req,
    context: withMediaVerificationContext(req.context as RequestContext | undefined),
  }
}

function mediaIdentifier(value: unknown): PrincipalID | null {
  if (isPrincipalID(value)) return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return mediaIdentifier((value as { id?: unknown }).id)
}

function recordOrphanCandidate(url: URL, options: MediaFinalizationOptions): void {
  const candidate: OrphanCandidate = Object.freeze({
    pathnameHash: pathnameHash(url),
    reason: 'metadata_persistence_failed',
  })

  if (options.recordOrphanCandidate) {
    options.recordOrphanCandidate(candidate)
    return
  }

  logOperationalError(storageFailure(), {
    event: 'media.blob_orphan_candidate',
    level: 'warn',
    context: { pathnameHash: candidate.pathnameHash, status: 'orphan_candidate' },
  })
}

async function deleteRejectedBlob(
  url: URL,
  options: MediaFinalizationOptions,
): Promise<void> {
  try {
    await (options.deleteBlob ?? ((blobURLValue: string) => del(blobURLValue, {
      token: env.BLOB_READ_WRITE_TOKEN,
    })))(url.toString())
  } catch (error) {
    logOperationalError(storageFailure(error), {
      event: 'media.rejected_blob_delete_failed',
      context: { pathnameHash: pathnameHash(url), status: 'delete_failed' },
    })
    throw storageFailure(error)
  }
}

/**
 * Completes a direct-to-Blob media upload. The server re-fetches the exact Blob
 * bytes and validates them before a verified media record can be committed.
 * Invalid content is removed from Blob storage; persistence failures are logged
 * as non-destructive orphan candidates for later reconciliation.
 */
export async function finalizeMediaUpload(
  input: MediaFinalizationInput,
  req: PayloadRequest,
  options: MediaFinalizationOptions = {},
): Promise<MediaFinalizationResult> {
  if (!canEnterPayloadAdmin(req.user)) {
    throw new StructuredError({ code: ERROR_CODES.NOT_AUTHORIZED })
  }

  const url = blobURL(input.blobUrl)
  const filename = url ? filenameFromURL(url) : null
  if (!url || !filename) {
    throw validationError([{ field: 'blobUrl', code: 'INVALID' }])
  }

  let bytes: Uint8Array
  try {
    const response = await (options.fetchBlob ?? (async (blobURLValue: string) => {
      return fetch(blobURLValue, { cache: 'no-store' })
    }))(url.toString())
    if (!response.ok) throw storageFailure()
    bytes = await readBlobBytes(response)
  } catch (error) {
    if (error instanceof StructuredError) {
      await deleteRejectedBlob(url, options)
      throw error
    }
    throw storageFailure(error)
  }

  let validated: ValidatedMediaUpload
  try {
    validated = await validateMediaUpload({
      filename: input.originalFilename,
      mimeType: input.mimeType,
      filesize: input.filesize ?? bytes.byteLength,
      bytes,
      alt: input.alt,
      decorative: input.decorative,
    })
  } catch (error) {
    await deleteRejectedBlob(url, options)
    throw error
  }

  const payload = req.payload as unknown as MediaPayload
  const transactionID = await payload.db.beginTransaction()
  if (transactionID === null) {
    recordOrphanCandidate(url, options)
    throw storageFailure()
  }

  let committed = false
  try {
    const transactionReq = transactionRequest(req, transactionID)
    const created = await payload.create({
      collection: 'media',
      data: {
        title: input.title,
        originalFilename: input.originalFilename,
        category: input.category,
        alt: validated.accessibility.alt,
        decorative: validated.accessibility.decorative,
        caption: input.caption,
        filename,
        mimeType: validated.descriptor.mimeType,
        filesize: validated.descriptor.filesize,
      },
      overrideAccess: false,
      req: transactionReq,
    })
    const id = mediaIdentifier(created)
    if (id === null) throw storageFailure()

    await payload.update({
      collection: 'media',
      id,
      data: { verificationStatus: 'verified' },
      overrideAccess: false,
      req: verificationRequest(transactionReq),
    })
    await payload.db.commitTransaction(transactionID)
    committed = true

    return Object.freeze({
      id,
      verificationStatus: 'verified',
      descriptor: validated.descriptor,
    })
  } catch (error) {
    if (!committed) {
      try {
        await payload.db.rollbackTransaction(transactionID)
      } catch {
        // The pending Blob stays an orphan candidate regardless of rollback state.
      }
    }
    recordOrphanCandidate(url, options)
    throw error instanceof StructuredError ? error : storageFailure(error)
  }
}
