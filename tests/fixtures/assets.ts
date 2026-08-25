const JPEG_BYTES = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0xff, 0xd9]
const PNG_BYTES = [
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
]
const WEBP_BYTES = [
  0x52, 0x49, 0x46, 0x46, 0x0c, 0x00, 0x00, 0x00,
  0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20,
  0x00, 0x00, 0x00, 0x00,
]
const PDF_TEXT = '%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n'

export type SyntheticAsset = Readonly<{
  filename: string
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf'
  bytes: Uint8Array
}>

export const syntheticJpegBytes = () => Uint8Array.from(JPEG_BYTES)
export const syntheticPngBytes = () => Uint8Array.from(PNG_BYTES)
export const syntheticWebpBytes = () => Uint8Array.from(WEBP_BYTES)
export const syntheticPdfBytes = () => new TextEncoder().encode(PDF_TEXT)

export function buildSyntheticImage(
  format: 'jpeg' | 'png' | 'webp' = 'png',
): SyntheticAsset {
  const variants = {
    jpeg: { filename: 'synthetic-image.jpg', mimeType: 'image/jpeg' as const, bytes: syntheticJpegBytes() },
    png: { filename: 'synthetic-image.png', mimeType: 'image/png' as const, bytes: syntheticPngBytes() },
    webp: { filename: 'synthetic-image.webp', mimeType: 'image/webp' as const, bytes: syntheticWebpBytes() },
  }
  return variants[format]
}

export function buildSyntheticPdf(): SyntheticAsset {
  return { filename: 'synthetic-document.pdf', mimeType: 'application/pdf', bytes: syntheticPdfBytes() }
}
