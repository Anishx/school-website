export function isExternalArticleImage(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}

export function validateArticleImageURL(value: unknown): true | string {
  if (value === undefined || value === null || value === '') return true
  // Existing migrated articles use local image paths in this field.
  if (typeof value === 'string' && /^\/(?![\/\\])[^\\\s]+$/.test(value)) return true
  return isExternalArticleImage(value) || 'Enter a direct HTTPS image URL or a local image path.'
}
