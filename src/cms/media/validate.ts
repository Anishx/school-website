import { fileTypeFromBuffer } from 'file-type'

import { FIELD_ERROR_CODES, type FieldErrorCode } from '../errors/codes'
import {
  validationError,
  type FieldErrorInput,
} from '../errors/structured-error'

export const MAX_IMAGE_BYTES = 10 * 1_024 * 1_024
export const MAX_PDF_BYTES = 20 * 1_024 * 1_024

const MAX_FILENAME_LENGTH = 255
const MAX_ALT_LENGTH = 250
const ABSOLUTE_MAX_BYTES = MAX_PDF_BYTES

const FORMAT_BY_EXTENSION = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  pdf: 'pdf',
} as const

const FORMAT_BY_MIME = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
} as const

const FORMAT_BY_SIGNATURE = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  pdf: 'pdf',
} as const

const FORMAT_MIME = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
} as const

const FORMAT_EXTENSION = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  pdf: 'pdf',
} as const

const SCRIPT_MARKERS = [
  '<script',
  '<?php',
  'javascript:',
] as const

const PDF_UNSAFE_MARKERS = [
  '/javascript',
  '/js',
  '/openaction',
  '/aa',
  '/launch',
  '/richmedia',
  '/embeddedfile',
  '/encrypt',
] as const

const POLYGLOT_MARKERS = [
  '%pdf-',
  'pk\x03\x04',
] as const

const EXECUTABLE_SIGNATURES = [
  [0x4d, 0x5a], // MZ
  [0x7f, 0x45, 0x4c, 0x46], // ELF
  [0xca, 0xfe, 0xba, 0xbe], // Mach-O universal
  [0xfe, 0xed, 0xfa, 0xce], // Mach-O 32-bit
  [0xce, 0xfa, 0xed, 0xfe], // Mach-O 32-bit (little endian)
  [0xfe, 0xed, 0xfa, 0xcf], // Mach-O 64-bit
  [0xcf, 0xfa, 0xed, 0xfe], // Mach-O 64-bit (little endian)
] as const

export type MediaFormat = 'jpeg' | 'png' | 'webp' | 'pdf'

export type MediaValidationInput = Readonly<{
  filename: unknown
  mimeType: unknown
  bytes: unknown
  filesize?: unknown
  alt?: unknown
  decorative?: unknown
}>

export type ValidatedMediaDescriptor = Readonly<{
  format: MediaFormat
  mimeType: (typeof FORMAT_MIME)[MediaFormat]
  extension: (typeof FORMAT_EXTENSION)[MediaFormat]
  filesize: number
  isImage: boolean
}>

export type NormalizedMediaAccessibility = Readonly<{
  decorative: boolean
  alt: string
}>

export type ValidatedMediaUpload = Readonly<{
  descriptor: ValidatedMediaDescriptor
  accessibility: NormalizedMediaAccessibility
}>

function addError(
  errors: FieldErrorInput[],
  field: string,
  code: FieldErrorCode,
): void {
  errors.push({ field, code })
}

function extensionFor(filename: string): MediaFormat | null {
  const normalized = filename.trim().toLowerCase()
  const extension = normalized.slice(normalized.lastIndexOf('.') + 1)
  return Object.prototype.hasOwnProperty.call(FORMAT_BY_EXTENSION, extension)
    ? FORMAT_BY_EXTENSION[extension as keyof typeof FORMAT_BY_EXTENSION]
    : null
}

function mimeFormatFor(mimeType: string): MediaFormat | null {
  const normalized = mimeType.trim().toLowerCase()
  return Object.prototype.hasOwnProperty.call(FORMAT_BY_MIME, normalized)
    ? FORMAT_BY_MIME[normalized as keyof typeof FORMAT_BY_MIME]
    : null
}

function indexOf(bytes: Uint8Array, marker: readonly number[], from = 0): number {
  if (marker.length === 0 || bytes.length < marker.length) return -1

  for (let index = from; index <= bytes.length - marker.length; index += 1) {
    let matched = true
    for (let offset = 0; offset < marker.length; offset += 1) {
      if (bytes[index + offset] !== marker[offset]) {
        matched = false
        break
      }
    }
    if (matched) return index
  }

  return -1
}

function hasAsciiMarker(bytes: Uint8Array, marker: string): boolean {
  const markerBytes = new TextEncoder().encode(marker.toLowerCase())
  if (markerBytes.length === 0 || bytes.length < markerBytes.length) return false

  for (let index = 0; index <= bytes.length - markerBytes.length; index += 1) {
    let matched = true
    for (let offset = 0; offset < markerBytes.length; offset += 1) {
      const byte = bytes[index + offset]
      const lowerCaseByte = byte >= 0x41 && byte <= 0x5a ? byte + 0x20 : byte
      if (lowerCaseByte !== markerBytes[offset]) {
        matched = false
        break
      }
    }
    if (matched) return true
  }

  return false
}

function hasUnsafeContent(bytes: Uint8Array, format: MediaFormat): boolean {
  if (bytes[0] === 0x23 && bytes[1] === 0x21) return true // shebang

  if (EXECUTABLE_SIGNATURES.some((signature) => indexOf(bytes, signature) >= 0)) {
    return true
  }

  if (SCRIPT_MARKERS.some((marker) => hasAsciiMarker(bytes, marker))) return true

  if (format !== 'pdf' && POLYGLOT_MARKERS.some((marker) => hasAsciiMarker(bytes, marker))) {
    return true
  }

  return format === 'pdf'
    && PDF_UNSAFE_MARKERS.some((marker) => hasAsciiMarker(bytes, marker))
}

function normalizeAccessibility(
  format: MediaFormat,
  alt: unknown,
  decorative: unknown,
  errors: FieldErrorInput[],
): NormalizedMediaAccessibility | null {
  if (format === 'pdf') {
    return Object.freeze({ decorative: false, alt: '' })
  }

  if (decorative !== undefined && typeof decorative !== 'boolean') {
    addError(errors, 'decorative', FIELD_ERROR_CODES.INVALID)
    return null
  }

  if (decorative === true) return Object.freeze({ decorative: true, alt: '' })

  if (typeof alt !== 'string') {
    addError(errors, 'alt', FIELD_ERROR_CODES.REQUIRED)
    return null
  }

  const normalizedAlt = alt.trim().replace(/\s+/g, ' ')
  if (normalizedAlt.length === 0) {
    addError(errors, 'alt', FIELD_ERROR_CODES.REQUIRED)
    return null
  }
  if (normalizedAlt.length > MAX_ALT_LENGTH) {
    addError(errors, 'alt', FIELD_ERROR_CODES.TOO_LONG)
    return null
  }

  return Object.freeze({ decorative: false, alt: normalizedAlt })
}

/**
 * Verifies a server-read upload before it becomes media metadata.
 *
 * The returned value deliberately omits the source filename and file bytes. Callers
 * may persist their own approved filename separately, but validation errors never
 * include attacker-controlled metadata or content.
 */
export async function validateMediaUpload(
  input: MediaValidationInput,
): Promise<ValidatedMediaUpload> {
  const errors: FieldErrorInput[] = []
  const filename = typeof input.filename === 'string' ? input.filename.trim() : null
  const mimeType = typeof input.mimeType === 'string' ? input.mimeType.trim().toLowerCase() : null
  const bytes = input.bytes instanceof Uint8Array ? input.bytes : null

  if (!filename || filename.length > MAX_FILENAME_LENGTH) {
    addError(errors, 'filename', FIELD_ERROR_CODES.INVALID)
  }
  if (!mimeType) addError(errors, 'mimeType', FIELD_ERROR_CODES.INVALID)
  if (!bytes || bytes.length === 0) addError(errors, 'bytes', FIELD_ERROR_CODES.INVALID)

  const declaredFilesize = input.filesize
  if (declaredFilesize !== undefined
    && (typeof declaredFilesize !== 'number'
      || !Number.isSafeInteger(declaredFilesize)
      || declaredFilesize < 0)) {
    addError(errors, 'filesize', FIELD_ERROR_CODES.INVALID)
  }
  if (bytes && declaredFilesize !== undefined && declaredFilesize !== bytes.length) {
    addError(errors, 'filesize', FIELD_ERROR_CODES.INVALID)
  }
  if (bytes && bytes.length > ABSOLUTE_MAX_BYTES) {
    addError(errors, 'filesize', FIELD_ERROR_CODES.OUT_OF_RANGE)
  }

  if (errors.length > 0) throw validationError(errors)

  const extensionFormat = extensionFor(filename as string)
  const declaredFormat = mimeFormatFor(mimeType as string)
  const detected = await fileTypeFromBuffer(bytes as Uint8Array)
  const detectedFormat = detected
    && Object.prototype.hasOwnProperty.call(FORMAT_BY_SIGNATURE, detected.ext)
    ? FORMAT_BY_SIGNATURE[detected.ext as keyof typeof FORMAT_BY_SIGNATURE]
    : null

  if (!extensionFormat) addError(errors, 'filename', FIELD_ERROR_CODES.FILE_NOT_ALLOWED)
  if (!declaredFormat) addError(errors, 'mimeType', FIELD_ERROR_CODES.FILE_NOT_ALLOWED)
  if (!detectedFormat) addError(errors, 'bytes', FIELD_ERROR_CODES.FILE_NOT_ALLOWED)

  if (extensionFormat && detectedFormat && extensionFormat !== detectedFormat) {
    addError(errors, 'filename', FIELD_ERROR_CODES.FILE_TYPE_MISMATCH)
  }
  if (declaredFormat && detectedFormat && declaredFormat !== detectedFormat) {
    addError(errors, 'mimeType', FIELD_ERROR_CODES.FILE_TYPE_MISMATCH)
  }
  if (extensionFormat && declaredFormat && extensionFormat !== declaredFormat) {
    addError(errors, 'mimeType', FIELD_ERROR_CODES.FILE_TYPE_MISMATCH)
  }

  const format = detectedFormat
  if (format && bytes && hasUnsafeContent(bytes, format)) {
    addError(errors, 'bytes', FIELD_ERROR_CODES.FILE_NOT_ALLOWED)
  }

  if (format && bytes) {
    const maxBytes = format === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES
    if (bytes.length > maxBytes) addError(errors, 'filesize', FIELD_ERROR_CODES.OUT_OF_RANGE)
  }

  if (errors.length > 0 || !format || !bytes) throw validationError(errors)

  const accessibility = normalizeAccessibility(format, input.alt, input.decorative, errors)
  if (errors.length > 0 || !accessibility) throw validationError(errors)

  return Object.freeze({
    descriptor: Object.freeze({
      format,
      mimeType: FORMAT_MIME[format],
      extension: FORMAT_EXTENSION[format],
      filesize: bytes.length,
      isImage: format !== 'pdf',
    }),
    accessibility,
  })
}
