import type { PayloadRequest } from 'payload'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { MediaDocument } from '../../collections/Media'
import { logOperationalError } from '../errors/log'
import { MAX_PDF_BYTES, validateMediaUpload } from './validate'
import { StructuredError } from '../errors/structured-error'
import { MEDIA_UPLOAD_BYTES, withMediaVerificationContext } from './verification-context'

/** Capture the processed file before the cloud adapter clears req.file. */
export async function captureMediaUpload(req: PayloadRequest): Promise<void> {
  if (!req.file) return
  const bytes = req.file.data?.byteLength ? new Uint8Array(req.file.data)
    : req.file.tempFilePath ? new Uint8Array(await readFile(req.file.tempFilePath)) : undefined
  if (bytes) req.context = { ...req.context, [MEDIA_UPLOAD_BYTES]: bytes }
}

type PersistedMedia = MediaDocument & {
  id?: unknown
  filename?: unknown
  mimeType?: unknown
  filesize?: unknown
}

function mediaID(value: unknown): string | number | null {
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

function requiredText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

async function storedBytes(doc: PersistedMedia, req: PayloadRequest): Promise<Uint8Array> {
  const captured = (req.context as Record<PropertyKey, unknown>)[MEDIA_UPLOAD_BYTES]
  if (captured instanceof Uint8Array) return captured
  if (req.file?.data?.byteLength) return new Uint8Array(req.file.data)

  const upload = req.payload.collections?.media?.config.upload
  if (process.env.NODE_ENV !== 'production' && upload && typeof upload === 'object' && !upload.disableLocalStorage) {
    const filename = requiredText(doc.filename)
    if (!filename || filename !== path.basename(filename) || /[/\\]/.test(filename)) throw new Error('Invalid stored filename.')
    // Local storage is a development fallback. Production requires Vercel Blob;
    // excluding this branch also prevents tracing the configurable directory
    // (and potentially the whole project) into every production CMS function.
    const directory = path.resolve(upload.staticDir ?? 'media')
    return new Uint8Array(await readFile(path.join(directory, filename)))
  }

  const url = requiredText(doc.url)
  if (!url) throw new Error('The uploaded file URL is unavailable.')
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.blob.vercel-storage.com')) {
    throw new Error('The uploaded file is not in the configured Blob store.')
  }

  const response = await fetch(parsed, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`The uploaded file could not be read (${response.status}).`)
  if (!response.body) throw new Error('The uploaded file is empty.')
  const chunks: Uint8Array[] = []
  let size = 0
  for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
    size += chunk.length
    if (size > MAX_PDF_BYTES) throw new Error('The uploaded file exceeds the size limit.')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

/**
 * Verifies the bytes attached to the Media record created by Payload's native
 * upload flow. It updates that same record, avoiding the duplicate-row behavior
 * of the older standalone finalizer.
 */
export async function verifyPersistedMedia(
  input: MediaDocument,
  req: PayloadRequest,
): Promise<MediaDocument> {
  const doc = input as PersistedMedia
  const id = mediaID(doc.id)
  if (id === null || (doc.verificationStatus !== 'pending' && doc.verificationStatus !== 'failed')) return input

  // A metadata-only local update must not re-upload the original request file
  // or carry the trusted verification marker back into the outer request.
  // Native Request accessors use private state that Object.assign cannot copy.
  // Give the Local API a plain request object with the HTTP values it needs.
  const verificationReq = {
    ...req,
    headers: req.headers,
    url: req.url,
    context: withMediaVerificationContext({ ...req.context, skipCloudStorage: true }),
    file: undefined,
    payloadUploadSizes: undefined,
  } as PayloadRequest
  delete (verificationReq.context as Record<PropertyKey, unknown>)[MEDIA_UPLOAD_BYTES]

  try {
    const bytes = await storedBytes(doc, req)
    await validateMediaUpload({
      filename: doc.originalFilename ?? doc.filename,
      mimeType: doc.mimeType,
      filesize: doc.filesize ?? bytes.byteLength,
      bytes,
      alt: doc.alt,
      decorative: doc.decorative,
    })

    await req.payload.update({
      collection: 'media',
      id,
      overrideAccess: true,
      data: { verificationStatus: 'verified', verificationMessage: null },
      req: verificationReq,
    })
    return { ...input, verificationStatus: 'verified', verificationMessage: null }
  } catch (error) {
    logOperationalError(error, {
      event: 'media.verification_failed',
      context: { mediaId: String(id), status: 'failed' },
    })
    const verificationMessage = error instanceof StructuredError
      ? error.fieldErrors.map((field) => `${field.field}: ${field.message}`).join(' ').slice(0, 1000)
      : 'The stored file could not be verified. Save to retry, or upload the file again. Contact an administrator if this continues.'
    await req.payload.update({
      collection: 'media',
      id,
      overrideAccess: true,
      data: { verificationStatus: 'failed', verificationMessage },
      req: verificationReq,
    })
    return { ...input, verificationStatus: 'failed', verificationMessage }
  }
}
