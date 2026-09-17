import type { Config } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { parseServerEnvironment } from '../../src/cms/config/env'
import { createVercelBlobStoragePlugin } from '../../src/cms/storage/vercelBlob'
import { MEDIA_UPLOAD_IDLE_TIMEOUT_MS, MEDIA_UPLOAD_TIMEOUT_MS, uploadWithTimeout } from '../../src/cms/storage/uploadWithTimeout'
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
    const assertion = expect(result).rejects.toThrow('The upload stopped responding for 30 seconds')
    await vi.advanceTimersByTimeAsync(MEDIA_UPLOAD_IDLE_TIMEOUT_MS)
    await assertion
    expect(vi.mocked(upload).mock.calls[0][2].abortSignal?.aborted).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('extends the idle deadline only when new bytes are uploaded', async () => {
    vi.useFakeTimers()
    vi.mocked(upload).mockImplementation(() => new Promise(() => {}))
    const progress = vi.fn()
    const result = uploadWithTimeout('certificate.pdf', new File(['%PDF-'], 'certificate.pdf'), {
      access: 'public', handleUploadUrl: '/api/vercel-blob-client-upload-route', onUploadProgress: progress,
    })
    const assertion = expect(result).rejects.toThrow('stopped responding')
    const options = vi.mocked(upload).mock.calls[0][2]
    await vi.advanceTimersByTimeAsync(20_000)
    options.onUploadProgress?.({ loaded: 1, total: 5, percentage: 20 })
    await vi.advanceTimersByTimeAsync(20_000)
    expect(options.abortSignal?.aborted).toBe(false)
    options.onUploadProgress?.({ loaded: 1, total: 5, percentage: 20 })
    await vi.advanceTimersByTimeAsync(10_000)
    await assertion
    expect(options.abortSignal?.aborted).toBe(true)
    expect(progress).toHaveBeenCalledTimes(2)
    // Late SDK progress after cancellation must not start new timers.
    options.onUploadProgress?.({ loaded: 5, total: 5, percentage: 100 })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('enforces the total deadline even when upload progress continues', async () => {
    vi.useFakeTimers()
    vi.mocked(upload).mockImplementation(() => new Promise(() => {}))
    const result = uploadWithTimeout('certificate.pdf', new File(['%PDF-'], 'certificate.pdf'), {
      access: 'public', handleUploadUrl: '/api/vercel-blob-client-upload-route',
    })
    const assertion = expect(result).rejects.toThrow('timed out after 2 minutes')
    const options = vi.mocked(upload).mock.calls[0][2]
    for (let elapsed = 20_000; elapsed < MEDIA_UPLOAD_TIMEOUT_MS; elapsed += 20_000) {
      await vi.advanceTimersByTimeAsync(20_000)
      options.onUploadProgress?.({ loaded: elapsed, total: MEDIA_UPLOAD_TIMEOUT_MS, percentage: elapsed / MEDIA_UPLOAD_TIMEOUT_MS * 100 })
    }
    await vi.advanceTimersByTimeAsync(20_000)
    await assertion
    expect(options.abortSignal?.aborted).toBe(true)
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
