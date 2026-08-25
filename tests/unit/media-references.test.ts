import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { createMediaCollection } from '../../src/collections/Media'
import { finalizeMediaUpload } from '../../src/cms/media/finalize'
import {
  MediaReferencedError,
  assertMediaCanBeDeleted,
  checkMediaDeletion,
  enumerateMediaReferences,
  isManagedBlobPathname,
  reportMediaBlobDiscrepancies,
} from '../../src/cms/media/references'
import { ERROR_CODES } from '../../src/cms/errors/codes'
import { buildUser } from '../fixtures'

const MEDIA_ID = 'media-001'

function request(role: 'principal' | 'admin' | 'teacher' = 'principal'): PayloadRequest {
  return {
    context: {},
    user: buildUser({ id: `${role}-001`, role, active: true }),
    payload: {
      collections: {
        'content-sections': {}, editorial: {}, documents: {}, galleries: {}, forms: {},
      },
      find: vi.fn(async ({ collection }: { collection: string }) => ({
        docs: records[collection] ?? [], totalPages: 1,
      })),
    },
  } as unknown as PayloadRequest
}

const records: Readonly<Record<string, readonly Record<string, unknown>[]>> = {
  'content-sections': [{ id: 'content-001', replacementMedia: MEDIA_ID }],
  editorial: [{ id: 'editorial-001', image: { id: MEDIA_ID } }],
  documents: [{ id: 'document-001', media: MEDIA_ID }],
  galleries: [{ id: 'gallery-001', images: [{ media: MEDIA_ID }] }],
  forms: [{ id: 'form-001', fields: [{ media: MEDIA_ID }] }],
}

describe('media relationship-safe deletion', () => {
  it('enumerates every registered relationship source using stable safe summaries', async () => {
    const summaries = await enumerateMediaReferences(MEDIA_ID, request())

    expect(summaries).toEqual([
      { collection: 'content-sections', kind: 'content', recordId: 'content-001', paths: ['replacementMedia'] },
      { collection: 'editorial', kind: 'editorial', recordId: 'editorial-001', paths: ['image'] },
      { collection: 'documents', kind: 'document', recordId: 'document-001', paths: ['media'] },
      { collection: 'galleries', kind: 'gallery', recordId: 'gallery-001', paths: ['images.media'] },
      { collection: 'forms', kind: 'form', recordId: 'form-001', paths: ['fields.media'] },
    ])
    expect(JSON.stringify(summaries)).not.toContain('title')
  })

  it('does not query unregistered future collections and only exposes summaries to Admins and Principals', async () => {
    const partial = request('teacher')
    ;(partial.payload as unknown as { collections: Record<string, unknown> }).collections = { editorial: {} }

    await expect(checkMediaDeletion(MEDIA_ID, partial)).resolves.toEqual({ allowed: false, references: [] })
    expect((partial.payload as unknown as { find: ReturnType<typeof vi.fn> }).find).toHaveBeenCalledTimes(1)
  })

  it('blocks the collection delete hook before metadata or Blob removal can run', async () => {
    const config = createMediaCollection()
    const originalMetadata = Object.freeze({ id: MEDIA_ID, title: 'Assembly image' })
    const deleteBlob = vi.fn()

    await expect(config.hooks?.beforeDelete?.[0]?.({ id: MEDIA_ID, req: request('admin') } as never))
      .rejects.toMatchObject({ code: ERROR_CODES.MEDIA_REFERENCED })
    expect(originalMetadata).toEqual({ id: MEDIA_ID, title: 'Assembly image' })
    expect(deleteBlob).not.toHaveBeenCalled()
  })

  it('returns a structured reference denial with safe authorized summaries', async () => {
    try {
      await assertMediaCanBeDeleted(MEDIA_ID, request('principal'))
      throw new Error('Expected reference denial')
    } catch (error) {
      expect(error).toBeInstanceOf(MediaReferencedError)
      expect(error).toMatchObject({ code: ERROR_CODES.MEDIA_REFERENCED })
      expect((error as MediaReferencedError).references).toHaveLength(5)
    }
  })
})

describe('media Blob discrepancy reporting', () => {
  it('reports managed metadata/object mismatches without mutating storage and excludes legacy protected paths', async () => {
    const listMediaMetadata = vi.fn(async () => [
      { id: 'media-present', url: 'https://store.public.blob.vercel-storage.com/media/present.png' },
      { id: 'media-missing', url: 'https://store.public.blob.vercel-storage.com/media/missing.png' },
      { id: 'legacy-public', url: 'https://store.public.blob.vercel-storage.com/public/hero.jpg' },
      { id: 'protected', url: 'https://store.public.blob.vercel-storage.com/Protected_Imagery/hero.jpg' },
    ])
    const listBlobObjects = vi.fn(async () => [
      { pathname: 'media/present.png' },
      { pathname: 'media/orphan.png' },
      { pathname: 'public/hero.jpg' },
      { pathname: 'Protected_Imagery/hero.jpg' },
    ])

    const report = await reportMediaBlobDiscrepancies({ listMediaMetadata, listBlobObjects })

    expect(report.missingObjects).toEqual([
      expect.objectContaining({ mediaId: 'media-missing', pathnameHash: expect.stringMatching(/^[a-f0-9]{64}$/) }),
    ])
    expect(report.orphanObjects).toEqual([
      expect.objectContaining({ pathnameHash: expect.stringMatching(/^[a-f0-9]{64}$/) }),
    ])
    expect(JSON.stringify(report)).not.toContain('public/')
    expect(JSON.stringify(report)).not.toContain('Protected_Imagery')
    expect(listMediaMetadata).toHaveBeenCalledOnce()
    expect(listBlobObjects).toHaveBeenCalledOnce()
  })

  it('keeps public and Protected_Imagery paths outside all managed Blob lifecycle work', () => {
    expect(isManagedBlobPathname('media/new-image.png')).toBe(true)
    expect(isManagedBlobPathname('public/images/legacy.jpg')).toBe(false)
    expect(isManagedBlobPathname('Protected_Imagery/legacy.jpg')).toBe(false)
    expect(isManagedBlobPathname('media/Protected_Imagery/legacy.jpg')).toBe(false)
  })
})


describe('protected Blob lifecycle exclusion', () => {
  it('rejects protected or public Blob URLs before fetching or deleting bytes', async () => {
    const deleteBlob = vi.fn(async () => undefined)

    await expect(finalizeMediaUpload({
      blobUrl: 'https://store.public.blob.vercel-storage.com/public/hero.jpg',
      originalFilename: 'hero.jpg', mimeType: 'image/jpeg', title: 'Hero', category: 'site', alt: 'School entrance',
    }, request('admin'), { deleteBlob })).rejects.toMatchObject({ code: ERROR_CODES.VALIDATION_ERROR })

    expect(deleteBlob).not.toHaveBeenCalled()
  })
})
