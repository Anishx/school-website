import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { StructuredError } from '../../src/cms/errors/structured-error'
import { validateMediaUpload, type MediaValidationInput } from '../../src/cms/media/validate'
import {
  buildSyntheticImage,
  buildSyntheticPdf,
  type SyntheticAsset,
} from '../fixtures/assets'

// Feature: payload-cms-expansion, Property 11: Unsafe media and inaccessible images are rejected or normalized
// **Validates: Requirements 6.5, 6.6, 6.7, 6.8, 12.9**

const encoder = new TextEncoder()
const IMAGE_FORMATS = ['jpeg', 'png', 'webp'] as const

type ImageFormat = (typeof IMAGE_FORMATS)[number]

function appendText(bytes: Uint8Array, text: string): Uint8Array {
  return Uint8Array.from([...bytes, ...encoder.encode(text)])
}

function uploadFrom(asset: SyntheticAsset, accessibility: Pick<MediaValidationInput, 'alt' | 'decorative'>): MediaValidationInput {
  return {
    filename: asset.filename,
    mimeType: asset.mimeType,
    bytes: asset.bytes,
    filesize: asset.bytes.length,
    ...accessibility,
  }
}

async function expectStructuredRejection(input: MediaValidationInput): Promise<void> {
  try {
    await validateMediaUpload(input)
    throw new Error('Expected unsafe media to be rejected')
  } catch (error) {
    expect(error).toBeInstanceOf(StructuredError)
    expect((error as StructuredError).code).toBe('VALIDATION_ERROR')
  }
}

const imageFormatArbitrary = fc.constantFrom<ImageFormat>(...IMAGE_FORMATS)
const unsafeHeaderArbitrary = fc.constantFrom('MZ', '\x7fELF', '#!/usr/bin/env node')
const activeContentArbitrary = fc.constantFrom('<script>alert(1)</script>', 'javascript:alert(1)')
const pdfMarkerArbitrary = fc.constantFrom('/JavaScript', '/OpenAction', '/Encrypt', '/EmbeddedFile')
const altTextArbitrary = fc.array(fc.constantFrom('a', 'B', '3', '-', '_'), {
  minLength: 1,
  maxLength: 250,
}).map((characters) => characters.join(''))
const invalidAltArbitrary = fc.constantFrom<unknown>(undefined, ' \t ', 'a'.repeat(251))

describe('media safety property', () => {
  it('rejects unsafe or unsupported media and normalizes accessible image metadata', async () => {
    await fc.assert(fc.asyncProperty(
      imageFormatArbitrary,
      unsafeHeaderArbitrary,
      activeContentArbitrary,
      pdfMarkerArbitrary,
      altTextArbitrary,
      invalidAltArbitrary,
      async (imageFormat, unsafeHeader, activeContent, pdfMarker, altText, invalidAlt) => {
        const image = buildSyntheticImage(imageFormat)
        const pdf = buildSyntheticPdf()

        await expectStructuredRejection(uploadFrom({
          ...image,
          bytes: Uint8Array.from([...encoder.encode(unsafeHeader), ...image.bytes]),
        }, { alt: 'Safe image description' }))

        await expectStructuredRejection(uploadFrom({
          ...image,
          bytes: appendText(image.bytes, activeContent),
        }, { alt: 'Safe image description' }))

        await expectStructuredRejection(uploadFrom({
          ...image,
          bytes: appendText(image.bytes, '%PDF-1.7'),
        }, { alt: 'Safe image description' }))

        await expectStructuredRejection(uploadFrom({
          ...pdf,
          bytes: appendText(pdf.bytes, pdfMarker),
        }, {}))

        await expectStructuredRejection({
          filename: 'unsupported.gif',
          mimeType: 'image/gif',
          bytes: Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
          filesize: 6,
          alt: 'Unsupported image',
        })

        await expectStructuredRejection(uploadFrom(image, {
          alt: invalidAlt,
          decorative: false,
        }))

        const nonDecorative = await validateMediaUpload(uploadFrom(image, {
          alt: `  ${altText}  `,
          decorative: false,
        }))
        expect(nonDecorative.accessibility).toEqual({
          decorative: false,
          alt: altText,
        })
        expect(nonDecorative.accessibility.alt.length).toBeGreaterThanOrEqual(1)
        expect(nonDecorative.accessibility.alt.length).toBeLessThanOrEqual(250)

        const decorative = await validateMediaUpload(uploadFrom(image, {
          alt: ` ignored ${altText} `,
          decorative: true,
        }))
        expect(decorative.accessibility).toEqual({ decorative: true, alt: '' })
      },
    ), { numRuns: 100, seed: 20260401 })
  })
})
