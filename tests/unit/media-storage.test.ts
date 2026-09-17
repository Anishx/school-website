import type { Config } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseServerEnvironment } from '../../src/cms/config/env'
import { createVercelBlobStoragePlugin } from '../../src/cms/storage/vercelBlob'
import { MEDIA_UPLOAD_TIMEOUT_MS, uploadWithTimeout } from '../../src/cms/storage/uploadWithTimeout'
import { upload } from '@vercel/blob/client'

vi.mock('@vercel/blob/client', () => ({ upload: vi.fn() }))

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

describe('media upload transport', () => {
  it.each(['development', 'production'] as const)('uses the correct upload transport in %s', async (mode) => {
    const environment = parseServerEnvironment({
      NODE_ENV: mode,
      DATABASE_URL: 'postgresql://localhost/test',
      PAYLOAD_SECRET: 'test-secret-with-more-than-thirty-two-characters',
      BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_teststore_testtoken',
    })
    const config = await createVercelBlobStoragePlugin(environment)({
      collections: [{ slug: 'media', fields: [], upload: true }],
    } as unknown as Config)
    expect(config.admin?.components?.providers).toContainEqual(expect.objectContaining({
      path: '/components/payload/MediaClientUploadHandler#MediaClientUploadHandler',
      clientProps: expect.objectContaining({ enabled: mode === 'production' }),
    }))
    expect(config.endpoints?.some((endpoint) => endpoint.path === '/vercel-blob-client-upload-route') ?? false).toBe(mode === 'production')
    expect(config.collections?.[0].upload).toMatchObject({ disableLocalStorage: true })
  })

  it('aborts a stalled upload and rejects so Payload can unlock submission', async () => {
    vi.useFakeTimers()
    vi.mocked(upload).mockImplementation(() => new Promise(() => {}))
    const result = uploadWithTimeout('certificate.pdf', new File(['%PDF-'], 'certificate.pdf'), {
      access: 'public', handleUploadUrl: '/api/vercel-blob-client-upload-route',
    })
    const assertion = expect(result).rejects.toThrow('The upload timed out')
    await vi.advanceTimersByTimeAsync(MEDIA_UPLOAD_TIMEOUT_MS)
    await assertion
    expect(vi.mocked(upload).mock.calls[0][2].abortSignal?.aborted).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('returns successful uploads and clears the timeout', async () => {
    vi.useFakeTimers()
    const blob = { pathname: 'certificate-unique.pdf', url: 'https://test.public.blob.vercel-storage.com/certificate-unique.pdf', downloadUrl: '', contentType: 'application/pdf', contentDisposition: '', etag: 'test-etag' }
    vi.mocked(upload).mockResolvedValue(blob)
    await expect(uploadWithTimeout('certificate.pdf', new File(['%PDF-'], 'certificate.pdf'), {
      access: 'public', handleUploadUrl: '/api/vercel-blob-client-upload-route',
    })).resolves.toEqual(blob)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('propagates upload errors immediately and clears the timeout', async () => {
    vi.useFakeTimers()
    vi.mocked(upload).mockRejectedValue(new Error('Failed to fetch'))
    await expect(uploadWithTimeout('certificate.pdf', new File(['%PDF-'], 'certificate.pdf'), {
      access: 'public', handleUploadUrl: '/api/vercel-blob-client-upload-route',
    })).rejects.toThrow('Failed to fetch')
    expect(vi.getTimerCount()).toBe(0)
  })
})
