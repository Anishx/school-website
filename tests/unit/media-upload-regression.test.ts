import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { validateMediaUpload } from '../../src/cms/media/validate'
import { captureMediaUpload, verifyPersistedMedia } from '../../src/cms/media/verification'
import { prepareMediaData } from '../../src/collections/Media'

describe('real school image upload regressions', () => {
  it('verifies an upload from a native HTTP Request without invalid Request accessors', async () => {
    const bytes = await readFile('public/apollo-logo-white.png')
    const update = vi.fn().mockImplementation(async ({ req: localReq }) => {
      // Payload's Local API reads these while preparing its request.
      expect(localReq.headers.get('x-upload-test')).toBe('native-request')
      expect(localReq.url).toBe('http://localhost:3000/api/media')
      expect(localReq.transactionID).toBe('upload-transaction')
      expect(localReq.file).toBeUndefined()
      return {}
    })
    const req = Object.assign(new Request('http://localhost:3000/api/media', {
      method: 'POST', headers: { 'x-upload-test': 'native-request' },
    }), {
      context: {}, transactionID: 'upload-transaction',
      file: { name: 'logo.png', data: bytes }, payload: { update },
    }) as unknown as PayloadRequest

    await expect(verifyPersistedMedia({
      id: 1, filename: 'logo.png', mimeType: 'image/png', filesize: bytes.length,
      alt: 'School logo', verificationStatus: 'pending',
    }, req)).resolves.toMatchObject({ verificationStatus: 'verified' })
    expect(update).toHaveBeenCalledOnce()
    expect(req.file?.data).toBe(bytes)
    expect(req.context).not.toHaveProperty('skipCloudStorage')
  })

  it('accepts a real compressed image containing an incidental MZ sequence', async () => {
    const bytes = await readFile('public/apollo-logo-white.png')
    expect(bytes.indexOf(Buffer.from('MZ'))).toBeGreaterThan(0)
    await expect(validateMediaUpload({ filename: 'apollo-logo-white.png', mimeType: 'image/png', bytes, filesize: bytes.length, alt: 'School logo' })).resolves.toMatchObject({ descriptor: { format: 'png' } })
  })

  it('retains upload bytes across cloud adapter cleanup and retries failed records', async () => {
    const bytes = await readFile('public/apollo-logo-white.png')
    const update = vi.fn().mockResolvedValue({})
    const req = { context: {}, file: { name: 'logo.png', data: bytes }, payload: { update } } as unknown as PayloadRequest
    await captureMediaUpload(req)
    req.file = undefined
    const record = { id: 1, filename: 'logo.png', mimeType: 'image/png', filesize: bytes.length, alt: 'School logo', verificationStatus: 'failed' }
    await expect(verifyPersistedMedia(record, req)).resolves.toMatchObject({ verificationStatus: 'verified', verificationMessage: null })
    expect(update).toHaveBeenCalledOnce()
    expect(update.mock.calls[0][0].req.context.skipCloudStorage).toBe(true)
    expect(req.context).not.toHaveProperty('skipCloudStorage')
  })

  it('can retry a local stored image after its upload request has finished', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'cms-upload-test-'))
    try {
      const bytes = await readFile('public/apollo-logo-white.png')
      await writeFile(path.join(directory, 'logo.png'), bytes)
      const req = { context: {}, payload: { update: vi.fn().mockResolvedValue({}), collections: { media: { config: { upload: { staticDir: directory } } } } } } as unknown as PayloadRequest
      await expect(verifyPersistedMedia({ id: 1, filename: 'logo.png', mimeType: 'image/png', alt: 'School logo', verificationStatus: 'failed' }, req)).resolves.toMatchObject({ verificationStatus: 'verified' })
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  it('requires replacement files to pass verification again while retaining uploader history', () => {
    const req = { user: { id: 1, role: 'admin', active: true }, context: {}, file: { name: 'replacement.png' } } as unknown as PayloadRequest
    const result = prepareMediaData({ data: {}, originalDoc: { title: 'School', category: 'Campus', alt: 'School', originalFilename: 'old.png', uploadedBy: 2, uploadedAt: '2026-01-01', verificationStatus: 'verified' }, req, operation: 'update', now: new Date() })
    expect(result).toMatchObject({ originalFilename: 'replacement.png', verificationStatus: 'pending', uploadedBy: 2 })
  })
})
