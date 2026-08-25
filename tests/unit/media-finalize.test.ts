import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { canRequestMediaClientUpload } from '../../src/cms/storage/vercelBlob'
import { finalizeMediaUpload } from '../../src/cms/media/finalize'
import { StructuredError } from '../../src/cms/errors/structured-error'
import { buildSyntheticImage, buildUser } from '../fixtures'

const BLOB_URL = 'https://store-id.public.blob.vercel-storage.com/media/assembly-9a7f.png'

function request(user: Record<string, unknown> | null): PayloadRequest {
  return { context: {}, user } as unknown as PayloadRequest
}

function blobResponse(bytes: Uint8Array) {
  return {
    ok: true,
    status: 200,
    headers: { get: (name: string) => name === 'content-length' ? String(bytes.byteLength) : null },
    arrayBuffer: async () => bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer,
  }
}

function input(overrides: Record<string, unknown> = {}) {
  const image = buildSyntheticImage('png')
  return {
    blobUrl: BLOB_URL,
    originalFilename: image.filename,
    mimeType: image.mimeType,
    filesize: image.bytes.byteLength,
    title: 'Assembly photograph',
    category: 'campus-life',
    alt: 'Students at assembly',
    decorative: false,
    ...overrides,
  }
}

function payloadHarness(overrides: Record<string, unknown> = {}) {
  const create = vi.fn(async () => ({ id: 'media-001' }))
  const update = vi.fn(async () => ({ id: 'media-001' }))
  const beginTransaction = vi.fn(async () => 'transaction-001')
  const commitTransaction = vi.fn(async () => undefined)
  const rollbackTransaction = vi.fn(async () => undefined)

  return {
    create,
    update,
    db: { beginTransaction, commitTransaction, rollbackTransaction },
    ...overrides,
  }
}

describe('Vercel Blob client-upload authorization', () => {
  it('issues media upload tokens only to active Principal, Admin, and Teacher users', () => {
    for (const role of ['principal', 'admin', 'teacher'] as const) {
      expect(canRequestMediaClientUpload({
        collectionSlug: 'media' as never,
        req: request(buildUser({ role, active: true })),
      })).toBe(true)
    }

    expect(canRequestMediaClientUpload({
      collectionSlug: 'media' as never,
      req: request(buildUser({ role: 'parent', active: true })),
    })).toBe(false)
    expect(canRequestMediaClientUpload({
      collectionSlug: 'media' as never,
      req: request(buildUser({ role: 'teacher', active: false })),
    })).toBe(false)
    expect(canRequestMediaClientUpload({
      collectionSlug: 'other-upload' as never,
      req: request(buildUser({ role: 'admin', active: true })),
    })).toBe(false)
  })
})

describe('media Blob finalization', () => {
  it('validates fetched bytes before transactionally persisting verified metadata', async () => {
    const image = buildSyntheticImage('png')
    const payload = payloadHarness()
    const req = request(buildUser({ id: 'teacher-001', role: 'teacher', active: true }))
    req.payload = payload as never

    await expect(finalizeMediaUpload(input(), req, {
      fetchBlob: async () => blobResponse(image.bytes),
      deleteBlob: async () => undefined,
    })).resolves.toMatchObject({
      id: 'media-001', verificationStatus: 'verified',
      descriptor: { mimeType: 'image/png', filesize: image.bytes.byteLength },
    })

    expect(payload.create).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'media', overrideAccess: false,
      data: expect.objectContaining({
        filename: 'assembly-9a7f.png', mimeType: 'image/png',
        filesize: image.bytes.byteLength, alt: 'Students at assembly',
      }),
    }))
    expect(payload.update).toHaveBeenCalledWith(expect.objectContaining({
      collection: 'media', id: 'media-001', data: { verificationStatus: 'verified' },
      overrideAccess: false,
    }))
    expect(payload.db.commitTransaction).toHaveBeenCalledWith('transaction-001')
  })

  it('deletes a Blob and creates no metadata when fetched bytes do not match the declared format', async () => {
    const image = buildSyntheticImage('png')
    const payload = payloadHarness()
    const req = request(buildUser({ role: 'admin', active: true }))
    req.payload = payload as never
    const deleteBlob = vi.fn(async () => undefined)

    await expect(finalizeMediaUpload(input({ mimeType: 'application/pdf' }), req, {
      fetchBlob: async () => blobResponse(image.bytes), deleteBlob,
    })).rejects.toBeInstanceOf(StructuredError)

    expect(deleteBlob).toHaveBeenCalledWith(BLOB_URL)
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.db.beginTransaction).not.toHaveBeenCalled()
  })

  it('records a hashed orphan candidate without deleting a Blob when metadata persistence fails', async () => {
    const image = buildSyntheticImage('png')
    const payload = payloadHarness({
      create: vi.fn(async () => { throw new Error('database unavailable') }),
    })
    const req = request(buildUser({ role: 'principal', active: true }))
    req.payload = payload as never
    const deleteBlob = vi.fn(async () => undefined)
    const recordOrphanCandidate = vi.fn()

    await expect(finalizeMediaUpload(input(), req, {
      fetchBlob: async () => blobResponse(image.bytes), deleteBlob, recordOrphanCandidate,
    })).rejects.toMatchObject({ code: 'STORAGE_FAILURE' })

    expect(payload.db.rollbackTransaction).toHaveBeenCalledWith('transaction-001')
    expect(deleteBlob).not.toHaveBeenCalled()
    expect(recordOrphanCandidate).toHaveBeenCalledWith(expect.objectContaining({
      reason: 'metadata_persistence_failed', pathnameHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    }))
    expect(JSON.stringify(recordOrphanCandidate.mock.calls)).not.toContain(BLOB_URL)
  })
})
