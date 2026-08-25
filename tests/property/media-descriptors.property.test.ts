import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import {
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  type MediaFormat,
  validateMediaUpload,
} from '../../src/cms/media/validate'
import { StructuredError } from '../../src/cms/errors/structured-error'
import {
  syntheticJpegBytes,
  syntheticPdfBytes,
  syntheticPngBytes,
  syntheticWebpBytes,
} from '../fixtures/assets'

// Feature: payload-cms-expansion, Property 10: Media format descriptors agree
// **Validates: Requirements 6.2, 6.3, 6.4, 12.9**

type Boundary = 'minimal' | 'at-limit' | 'over-limit'
type DescriptorCase = Readonly<{
  detectedFormat: MediaFormat
  extensionFormat: MediaFormat
  declaredFormat: MediaFormat
  filename: string
  mimeType: string
  bytes: Uint8Array
}>

const FORMATS = ['jpeg', 'png', 'webp', 'pdf'] as const
const bytesByFormat: Readonly<Record<MediaFormat, () => Uint8Array>> = {
  jpeg: syntheticJpegBytes,
  png: syntheticPngBytes,
  webp: syntheticWebpBytes,
  pdf: syntheticPdfBytes,
}
const mimeByFormat: Readonly<Record<MediaFormat, string>> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
}
const boundaryBytes = new Map<string, Uint8Array>()

function extensionFor(format: MediaFormat, useLongJpegExtension: boolean): string {
  if (format === 'jpeg') return useLongJpegExtension ? 'jpeg' : 'jpg'
  return format
}

function byteLimitFor(format: MediaFormat): number {
  return format === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
}

function sizeFor(format: MediaFormat, boundary: Boundary): number {
  if (boundary === 'minimal') return bytesByFormat[format]().length
  return byteLimitFor(format) + (boundary === 'over-limit' ? 1 : 0)
}

function syntheticBytesFor(format: MediaFormat, boundary: Boundary): Uint8Array {
  const cacheKey = `${format}:${boundary}`
  const cached = boundaryBytes.get(cacheKey)
  if (cached) return cached

  const source = bytesByFormat[format]()
  const bytes = new Uint8Array(sizeFor(format, boundary))
  bytes.set(source)
  boundaryBytes.set(cacheKey, bytes)
  return bytes
}

const descriptorArbitrary: fc.Arbitrary<DescriptorCase> = fc.tuple(
  fc.constantFrom<MediaFormat>(...FORMATS),
  fc.constantFrom<MediaFormat>(...FORMATS),
  fc.constantFrom<MediaFormat>(...FORMATS),
  fc.constantFrom<Boundary>('minimal', 'at-limit', 'over-limit'),
  fc.boolean(),
).map(([detectedFormat, extensionFormat, declaredFormat, boundary, useLongJpegExtension]) => ({
  detectedFormat,
  extensionFormat,
  declaredFormat,
  filename: `synthetic-upload.${extensionFor(extensionFormat, useLongJpegExtension)}`,
  mimeType: mimeByFormat[declaredFormat],
  bytes: syntheticBytesFor(detectedFormat, boundary),
}))

function shouldAccept(input: DescriptorCase): boolean {
  return input.detectedFormat === input.extensionFormat
    && input.detectedFormat === input.declaredFormat
    && input.bytes.length <= byteLimitFor(input.detectedFormat)
}

describe('media descriptor property', () => {
  it('accepts only matching permitted descriptors within their type-specific byte limit', async () => {
    await fc.assert(
      fc.asyncProperty(descriptorArbitrary, async (input) => {
        const upload = {
          filename: input.filename,
          mimeType: input.mimeType,
          bytes: input.bytes,
          filesize: input.bytes.length,
          ...(input.detectedFormat === 'pdf' ? {} : { alt: 'Synthetic accessible image' }),
        }

        if (!shouldAccept(input)) {
          await expect(validateMediaUpload(upload)).rejects.toBeInstanceOf(StructuredError)
          return
        }

        const result = await validateMediaUpload(upload)
        expect(result.descriptor).toMatchObject({
          format: input.detectedFormat,
          mimeType: mimeByFormat[input.detectedFormat],
          extension: extensionFor(input.detectedFormat, false),
          filesize: input.bytes.length,
          isImage: input.detectedFormat !== 'pdf',
        })
      }),
      { numRuns: 100, seed: 20260421 },
    )
  }, 30_000)
})
