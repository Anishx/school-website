import { upload } from '@vercel/blob/client'

export const MEDIA_UPLOAD_TIMEOUT_MS = 120_000
export const MEDIA_UPLOAD_IDLE_TIMEOUT_MS = 30_000

/** Bound the entire token exchange and upload, including SDK retry delays. */
export async function uploadWithTimeout(
  pathname: string,
  file: File,
  options: Parameters<typeof upload>[2],
) {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let uploadedBytes = 0
  let timedOut = false
  let resetIdleTimer: () => void = () => {}
  try {
    const deadline = new Promise<never>((_, reject) => {
      const timeout = (message: string) => {
        timedOut = true
        // Reject first so Payload displays the timeout rather than AbortError.
        reject(new Error(message))
        controller.abort()
      }
      resetIdleTimer = () => {
        clearTimeout(idleTimer)
        idleTimer = setTimeout(() => timeout('The upload stopped responding for 30 seconds. Check your connection and try again.'), MEDIA_UPLOAD_IDLE_TIMEOUT_MS)
      }
      resetIdleTimer()
      timer = setTimeout(() => timeout('The upload timed out after 2 minutes. Check your connection and try again.'), MEDIA_UPLOAD_TIMEOUT_MS)
    })
    return await Promise.race([
      upload(pathname, file, {
        ...options,
        abortSignal: controller.signal,
        onUploadProgress: (progress) => {
          if (timedOut) return
          // SDK retries can emit zero or repeated progress; only new bytes
          // extend the idle deadline. The overall deadline never moves.
          if (progress.loaded > uploadedBytes) {
            uploadedBytes = progress.loaded
            resetIdleTimer()
          }
          options.onUploadProgress?.(progress)
        },
      }),
      deadline,
    ])
  } finally {
    clearTimeout(timer)
    clearTimeout(idleTimer)
  }
}
