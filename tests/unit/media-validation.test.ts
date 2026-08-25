import { describe, expect, it } from 'vitest'

import { StructuredError } from '../../src/cms/errors/structured-error'
import {
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  validateMediaUpload,
} from '../../src/cms/media/validate'
import {
  buildSyntheticImage,
  buildSyntheticPdf,
  syntheticPngBytes,
} from '../fixtures/assets'

function validImage(overrides: Record<string, unknown> = {}) {
  const image = buildSyntheticImage('png')
  const result: Record<string, unknown> = {
    filename: image.filename,
    mimeType: image.mimeType,
    bytes: image.bytes,
    filesize: image.bytes.length,
    alt: '  Students learning together  ',
    decorative: false,
    ...overrides,
  }
  if (!Object.prototype.hasOwnProperty.call(overrides, 'filesize')
    && result.bytes instanceof Uint8Array) {
    result.filesize = result.bytes.length
  }
  return result as {
    filename: unknown
    mimeType: unknown
    bytes: unknown
    filesize?: unknown
    alt?: unknown
    decorative?: unknown
  }
}

async function validationFailure(input: Parameters<typeof validateMediaUpload>[0]): Promise<StructuredError> {
  try {
    await validateMediaUpload(input)
  } catch (error) {
    expect(error).toBeInstanceOf(StructuredError)
    return error as StructuredError
  }
  throw new Error('Expected media validation to fail')
}

describe('media validation', () => {
  it('accepts matching JPEG, PNG, WebP, and PDF descriptors', async () => {
    const jpeg = buildSyntheticImage('jpeg')
    const webp = buildSyntheticImage('webp')
    const pdf = buildSyntheticPdf()

    await expect(validateMediaUpload(validImage())).resolves.toMatchObject({
      descriptor: { format: 'png', mimeType: 'image/png', extension: 'png', isImage: true },
      accessibility: { decorative: false, alt: 'Students learning together' },
    })
    await expect(validateMediaUpload(validImage({ ...jpeg, filesize: jpeg.bytes.length }))).resolves.toMatchObject({
      descriptor: { format: 'jpeg', extension: 'jpg' },
    })
    await expect(validateMediaUpload(validImage({ ...webp, filesize: webp.bytes.length }))).resolves.toMatchObject({
      descriptor: { format: 'webp', extension: 'webp' },
    })
    await expect(validateMediaUpload({ ...pdf, filesize: pdf.bytes.length })).resolves.toEqual({
      descriptor: {
        format: 'pdf',
        mimeType: 'application/pdf',
        extension: 'pdf',
        filesize: pdf.bytes.length,
        isImage: false,
      },
      accessibility: { decorative: false, alt: '' },
    })
  })

  it('rejects extension, declared MIME, and signature disagreements without echoing input', async () => {
    const secret = 'do-not-echo-this-unsafe-filename'
    const error = await validationFailure(validImage({
      filename: `${secret}.jpg`,
      mimeType: 'image/jpeg',
    }))

    expect(error.fieldErrors.map(({ field, code }) => ({ field, code }))).toEqual([
      { field: 'filename', code: 'FILE_TYPE_MISMATCH' },
      { field: 'mimeType', code: 'FILE_TYPE_MISMATCH' },
    ])
    expect(JSON.stringify(error)).not.toContain(secret)
    expect(JSON.stringify(error)).not.toContain('Students learning together')
  })

  it('enforces image and PDF byte limits using actual byte lengths', async () => {
    const imageBytes = new Uint8Array(MAX_IMAGE_BYTES + 1)
    imageBytes.set(syntheticPngBytes())
    const pdfBytes = new Uint8Array(MAX_PDF_BYTES + 1)
    pdfBytes.set(buildSyntheticPdf().bytes)

    await expect(validationFailure(validImage({ bytes: imageBytes, filesize: imageBytes.length })))
      .resolves.toMatchObject({ fieldErrors: [{ field: 'filesize', code: 'OUT_OF_RANGE' }] })
    await expect(validationFailure({
      filename: 'large.pdf',
      mimeType: 'application/pdf',
      bytes: pdfBytes,
      filesize: pdfBytes.length,
    })).resolves.toMatchObject({
      fieldErrors: [{ field: 'filesize', code: 'OUT_OF_RANGE' }],
    })
  })

  it('rejects executable, script-capable, polyglot, and encrypted or active PDFs', async () => {
    const pdf = buildSyntheticPdf()
    const unsafeInputs = [
      validImage({ bytes: Uint8Array.from([0x4d, 0x5a, ...syntheticPngBytes()]) }),
      validImage({ bytes: Uint8Array.from([...syntheticPngBytes(), ...new TextEncoder().encode('<script>alert(1)</script>')]) }),
      validImage({ bytes: Uint8Array.from([...syntheticPngBytes(), ...new TextEncoder().encode('%PDF-1.7')]) }),
      { ...pdf, bytes: Uint8Array.from([...pdf.bytes, ...new TextEncoder().encode('/Encrypt')]), filesize: pdf.bytes.length + 8 },
      { ...pdf, bytes: Uint8Array.from([...pdf.bytes, ...new TextEncoder().encode('/JavaScript')]), filesize: pdf.bytes.length + 11 },
    ]

    for (const input of unsafeInputs) {
      const error = await validationFailure(input)
      expect(error.fieldErrors).toContainEqual({
        field: 'bytes',
        code: 'FILE_NOT_ALLOWED',
        message: 'This file type is not permitted.',
      })
    }
  })

  it('normalizes decorative images and requires bounded non-decorative alternative text', async () => {
    await expect(validateMediaUpload(validImage({
      decorative: true,
      alt: 'This value is intentionally discarded',
    }))).resolves.toMatchObject({ accessibility: { decorative: true, alt: '' } })

    const error = await validationFailure(validImage({ alt: ' '.repeat(3) }))
    expect(error.fieldErrors).toEqual([
      { field: 'alt', code: 'REQUIRED', message: 'This field is required.' },
    ])

    const tooLong = await validationFailure(validImage({ alt: 'a'.repeat(251) }))
    expect(tooLong.fieldErrors).toEqual([
      { field: 'alt', code: 'TOO_LONG', message: 'This value is too long.' },
    ])
  })
})
