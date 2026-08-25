import {
  ADMISSION_FIELD_NAMES,
  REQUIRED_ADMISSION_FIELDS,
  type AdmissionFieldName,
} from './schema'

export type AdmissionRecord = Readonly<Record<string, unknown>>
export type NormalizedAdmissionRecord = Readonly<Partial<Record<AdmissionFieldName, unknown>>>

const FIELD_NAMES: ReadonlySet<string> = new Set(ADMISSION_FIELD_NAMES)
const REQUIRED_FIELDS: ReadonlySet<string> = new Set(REQUIRED_ADMISSION_FIELDS)

export function isAdmissionRecord(value: unknown): value is AdmissionRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeString(field: AdmissionFieldName, value: string): string {
  const trimmed = value.trim()
  if (field === 'parentEmail') return trimmed.toLowerCase()
  if (field === 'aadharNo') return trimmed.replace(/[\s-]/g, '')
  return trimmed
}

export function normalizeAdmissionInput(input: AdmissionRecord): NormalizedAdmissionRecord {
  const normalized: Partial<Record<AdmissionFieldName, unknown>> = {}

  for (const [field, value] of Object.entries(input)) {
    if (!FIELD_NAMES.has(field)) continue
    const name = field as AdmissionFieldName

    if (typeof value === 'string') {
      const text = normalizeString(name, value)
      if (text || REQUIRED_FIELDS.has(name)) normalized[name] = text
      continue
    }

    if (name === 'documentsEnclosed' && Array.isArray(value)) {
      normalized[name] = Object.freeze(value.map((item) =>
        typeof item === 'string' ? item.trim() : item))
      continue
    }

    if (value !== undefined) normalized[name] = value
  }

  return Object.freeze(normalized)
}
