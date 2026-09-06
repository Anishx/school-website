import { createHash } from 'node:crypto'

import type { PayloadRequest } from 'payload'

import { canManageAllContent, type PrincipalID } from '../../access/roles'
import { ERROR_CODES } from '../errors/codes'
import { StructuredError } from '../errors/structured-error'

export const MEDIA_REFERENCE_SOURCES = [
  {
    collection: 'content-sections',
    kind: 'content',
    paths: [
      'media', 'replacementMedia', 'blocks.media', 'blocks.image',
      'sports.cards.image', 'clubs.flagship.image', 'clubs.cards.image',
    ],
  },
  { collection: 'editorial', kind: 'editorial', paths: ['image', 'media'] },
  { collection: 'documents', kind: 'document', paths: ['media', 'pdf', 'document'] },
  { collection: 'galleries', kind: 'gallery', paths: ['cover', 'coverMedia', 'images.media'] },
  { collection: 'forms', kind: 'form', paths: ['media', 'fields.media', 'fields.image'] },
] as const

export type MediaReferenceKind = (typeof MEDIA_REFERENCE_SOURCES)[number]['kind']
export type MediaReferenceSummary = Readonly<{
  collection: string
  kind: MediaReferenceKind
  recordId: PrincipalID
  paths: readonly string[]
}>

export type MediaDeletionCheck = Readonly<{
  allowed: boolean
  references: readonly MediaReferenceSummary[]
}>

type ReferenceRecord = Readonly<Record<string, unknown>>
type ReferenceFindResult = Readonly<{ docs?: readonly ReferenceRecord[]; page?: number; totalPages?: number }>
type ReferencePayload = Readonly<{
  collections?: Readonly<Record<string, unknown>>
  find: (args: Readonly<Record<string, unknown>>) => Promise<ReferenceFindResult>
}>

function relationID(value: unknown): PrincipalID | null {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return relationID((value as { id?: unknown }).id)
}

function sameID(left: unknown, right: PrincipalID): boolean {
  const resolved = relationID(left)
  return resolved !== null && typeof resolved === typeof right && resolved === right
}

function valuesAtPath(value: unknown, path: readonly string[]): unknown[] {
  if (path.length === 0) return [value]
  if (Array.isArray(value)) return value.flatMap((entry) => valuesAtPath(entry, path))
  if (!value || typeof value !== 'object') return []
  return valuesAtPath((value as Record<string, unknown>)[path[0]], path.slice(1))
}

function matchingPaths(record: ReferenceRecord, mediaID: PrincipalID, paths: readonly string[]): string[] {
  return paths.filter((path) => valuesAtPath(record, path.split('.')).some((value) => sameID(value, mediaID)))
}

async function findAllRegisteredRecords(
  payload: ReferencePayload,
  collection: string,
  req: PayloadRequest,
): Promise<readonly ReferenceRecord[]> {
  if (!payload.collections || !Object.hasOwn(payload.collections, collection)) return []

  const records: ReferenceRecord[] = []
  let page = 1
  let totalPages = 1
  do {
    let result: ReferenceFindResult
    try {
      result = await payload.find({
        collection,
        depth: 0,
        limit: 100,
        page,
        pagination: true,
        overrideAccess: true,
        req,
      })
    } catch (cause) {
      throw new StructuredError({
        code: ERROR_CODES.SERVICE_UNAVAILABLE,
        context: { collection, operation: 'media-reference-check', status: 'unavailable' },
        cause,
      })
    }
    records.push(...(result.docs ?? []))
    totalPages = typeof result.totalPages === 'number' && result.totalPages > 0
      ? Math.floor(result.totalPages)
      : 1
    page += 1
  } while (page <= totalPages)

  return records
}

export async function enumerateMediaReferences(
  mediaID: PrincipalID,
  req: PayloadRequest,
): Promise<readonly MediaReferenceSummary[]> {
  const payload = req.payload as unknown as ReferencePayload
  const references: MediaReferenceSummary[] = []

  for (const source of MEDIA_REFERENCE_SOURCES) {
    const records = await findAllRegisteredRecords(payload, source.collection, req)
    for (const record of records) {
      const recordID = relationID(record.id)
      if (recordID === null) continue
      const paths = matchingPaths(record, mediaID, source.paths)
      if (paths.length > 0) {
        references.push(Object.freeze({
          collection: source.collection,
          kind: source.kind,
          recordId: recordID,
          paths: Object.freeze(paths),
        }))
      }
    }
  }

  return Object.freeze(references)
}

export async function checkMediaDeletion(
  mediaID: PrincipalID,
  req: PayloadRequest,
): Promise<MediaDeletionCheck> {
  const references = await enumerateMediaReferences(mediaID, req)
  const summaries = canManageAllContent(req.user) ? references : []
  return Object.freeze({ allowed: references.length === 0, references: Object.freeze(summaries) })
}

export class MediaReferencedError extends StructuredError {
  readonly references: readonly MediaReferenceSummary[]

  constructor(references: readonly MediaReferenceSummary[]) {
    super({
      code: ERROR_CODES.MEDIA_REFERENCED,
      context: { collection: 'media', operation: 'delete', status: 'referenced' },
    })
    this.references = Object.freeze([...references])
  }
}

/** Throws before Payload's upload adapter can remove metadata or Blob bytes. */
export async function assertMediaCanBeDeleted(mediaID: PrincipalID, req: PayloadRequest): Promise<void> {
  const result = await checkMediaDeletion(mediaID, req)
  if (!result.allowed) throw new MediaReferencedError(result.references)
}

function normalizedPathname(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const raw = value.replace(/^\/+/, '').replace(/\\/g, '/')
  try {
    const pathname = decodeURIComponent(raw)
    const segments = pathname.split('/').filter(Boolean)
    return segments.length > 0 && !segments.some((segment) => segment === '.' || segment === '..')
      ? segments.join('/')
      : null
  } catch {
    return null
  }
}

/** Public fallbacks and protected source imagery are never Blob lifecycle targets. */
export function isManagedBlobPathname(value: unknown): boolean {
  const pathname = normalizedPathname(value)
  if (!pathname) return false
  const segments = pathname.toLowerCase().split('/')
  return segments[0] !== 'public' && !segments.includes('protected_imagery')
}

export function blobPathnameFromURL(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    return normalizedPathname(new URL(value).pathname)
  } catch {
    return null
  }
}

function pathnameHash(pathname: string): string {
  return createHash('sha256').update(pathname).digest('hex')
}

export type MediaMetadataForReconciliation = Readonly<{ id: PrincipalID; url?: unknown }>
export type BlobObjectForReconciliation = Readonly<{ pathname: unknown }>
export type MediaReconciliationReport = Readonly<{
  missingObjects: readonly Readonly<{ mediaId: PrincipalID; pathnameHash: string }>[]
  orphanObjects: readonly Readonly<{ pathnameHash: string }>[]
}>

/** Compares metadata to supplied Blob listings and intentionally performs no mutations. */
export async function reportMediaBlobDiscrepancies(options: Readonly<{
  listMediaMetadata: () => Promise<readonly MediaMetadataForReconciliation[]>
  listBlobObjects: () => Promise<readonly BlobObjectForReconciliation[]>
}>): Promise<MediaReconciliationReport> {
  const [metadata, objects] = await Promise.all([options.listMediaMetadata(), options.listBlobObjects()])
  const managedMetadata = metadata.flatMap((record) => {
    const pathname = blobPathnameFromURL(record.url)
    return pathname && isManagedBlobPathname(pathname) ? [{ id: record.id, pathname }] : []
  })
  const objectPaths = new Set(objects.flatMap(({ pathname }) => {
    const normalized = normalizedPathname(pathname)
    return normalized && isManagedBlobPathname(normalized) ? [normalized] : []
  }))
  const metadataPaths = new Set(managedMetadata.map(({ pathname }) => pathname))

  return Object.freeze({
    missingObjects: Object.freeze(managedMetadata
      .filter(({ pathname }) => !objectPaths.has(pathname))
      .map(({ id, pathname }) => Object.freeze({ mediaId: id, pathnameHash: pathnameHash(pathname) }))),
    orphanObjects: Object.freeze([...objectPaths]
      .filter((pathname) => !metadataPaths.has(pathname))
      .sort()
      .map((pathname) => Object.freeze({ pathnameHash: pathnameHash(pathname) }))),
  })
}
