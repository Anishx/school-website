import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { Media } from '../../src/collections/Media'
import { assertVerifiedMedia } from '../../src/cms/media/publish'

function setup(verificationStatus = 'verified', mimeType = 'image/png') {
  const doc = {
    id: 42, verificationStatus, mimeType,
    url: '/api/media/file/school.png', alt: 'School',
  }
  const afterRead = Media.hooks!.afterRead![0]
  const findByID = vi.fn(async (args) => afterRead({
    doc, req: args.req ?? { user: null },
  } as Parameters<typeof afterRead>[0]))
  const req = {
    user: { id: 1, role: 'admin', active: true },
    context: {}, transactionID: 'article-transaction', payload: { findByID },
  } as unknown as PayloadRequest
  return { req, findByID }
}

describe('publication media validation', () => {
  it.each([42, { id: 42 }])('accepts a verified image selected as %j', async (value) => {
    const { req, findByID } = setup()
    await expect(assertVerifiedMedia(req, value, 'image', 'image')).resolves.toBeUndefined()
    expect(findByID).toHaveBeenCalledWith({
      collection: 'media', id: 42, depth: 0, overrideAccess: true, req,
    })
  })

  it.each(['pending', 'failed'])('rejects an image with %s verification', async (status) => {
    const { req } = setup(status)
    await expect(assertVerifiedMedia(req, 42, 'image', 'image')).rejects.toMatchObject({
      data: { errors: [{ path: 'image', message: 'Select a verified image.' }] },
    })
  })

  it('rejects a verified PDF selected as an image', async () => {
    const { req } = setup('verified', 'application/pdf')
    await expect(assertVerifiedMedia(req, 42, 'image', 'image')).rejects.toThrow()
  })

  it('accepts a verified PDF for a document', async () => {
    const { req } = setup('verified', 'application/pdf')
    await expect(assertVerifiedMedia(req, 42, 'pdf', 'pdf')).resolves.toBeUndefined()
  })
})
