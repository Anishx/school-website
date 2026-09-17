import { upload } from '@vercel/blob/client'

export const MEDIA_UPLOAD_TIMEOUT_MS = 120_000

/** Bound the entire token exchange and upload, including SDK retry delays. */
export async function uploadWithTimeout(
  pathname: string,
  file: File,
  options: Parameters<typeof upload>[2],
) {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      upload(pathname, file, { ...options, abortSignal: controller.signal }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error('The upload timed out. Check your connection and try again.'))
          controller.abort()
        }, MEDIA_UPLOAD_TIMEOUT_MS)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}
