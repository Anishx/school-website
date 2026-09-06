import { ValidationError, type PayloadRequest } from 'payload'

type ExpectedMedia = 'image' | 'pdf'

function relationID(value: unknown): string | number | null {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return relationID((value as { id?: unknown }).id)
}

export async function assertVerifiedMedia(
  req: PayloadRequest,
  value: unknown,
  path: string,
  expected: ExpectedMedia,
): Promise<void> {
  const id = relationID(value)
  if (id === null) {
    throw new ValidationError({ errors: [{ path, message: `Select a verified ${expected}.` }], req })
  }
  // Keep the authenticated request and transaction: anonymous media reads return
  // a public projection without the verification status or MIME type.
  const record = await req.payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true, req })
  const mime = typeof record.mimeType === 'string' ? record.mimeType : ''
  const validType = expected === 'pdf' ? mime === 'application/pdf' : mime.startsWith('image/')
  if (record.verificationStatus !== 'verified' || !validType) {
    throw new ValidationError({ errors: [{ path, message: `Select a verified ${expected}.` }], req })
  }
}

export function relationValues(value: unknown, path: readonly string[]): unknown[] {
  if (path.length === 0) return [value]
  if (Array.isArray(value)) return value.flatMap((entry) => relationValues(entry, path))
  if (!value || typeof value !== 'object') return []
  return relationValues((value as Record<string, unknown>)[path[0]], path.slice(1))
}
