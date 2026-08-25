export function maskAadhaar(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '—'
  const digits = String(value).replace(/\D/g, '')
  if (digits.length === 0) return '—'
  if (digits.length <= 4) return '•'.repeat(digits.length)
  return `${'•'.repeat(digits.length - 4)}${digits.slice(-4)}`
}

export type PublicAdmissionCreateResult = Readonly<{
  ok: true
  reference: string
}>

export function projectAnonymousAdmissionCreate(
  doc: Readonly<Record<string, unknown>>,
): PublicAdmissionCreateResult {
  const reference = typeof doc.referenceCode === 'string' ? doc.referenceCode : ''
  return Object.freeze({ ok: true, reference })
}
