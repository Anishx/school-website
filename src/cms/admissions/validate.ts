import { FIELD_ERROR_CODES, type FieldErrorCode } from '../errors/codes'
import {
  validationError,
  type FieldErrorInput,
} from '../errors/structured-error'
import { isAdmissionRecord, normalizeAdmissionInput } from './normalize'
import {
  ADMISSION_CATEGORIES,
  ADMISSION_DOCUMENTS,
  ADMISSION_FIELD_NAMES,
  ADMISSION_GENDERS,
  ADMISSION_GRADES,
  ADMISSION_STATUSES,
  NARRATIVE_ADMISSION_FIELDS,
  REQUIRED_ADMISSION_FIELDS,
  type AdmissionCategory,
  type AdmissionDocument,
  type AdmissionGender,
  type AdmissionGrade,
  type AdmissionStatus,
} from './schema'

export type ValidAdmission = Readonly<{
  studentName: string
  grade: AdmissionGrade
  dateOfBirth: string
  gender: AdmissionGender
  fatherName: string
  motherName: string
  contactNumber: string
  address: string
  bloodGroup?: string
  category?: AdmissionCategory
  aadharNo?: string
  motherTongue?: string
  previousSchool?: string
  previousSchoolAddress?: string
  board?: string
  classLastStudied?: string
  transferCertificateNo?: string
  fatherOccupation?: string
  fatherQualification?: string
  motherOccupation?: string
  motherQualification?: string
  alternatePhone?: string
  parentEmail?: string
  permanentAddress?: string
  documentsEnclosed?: readonly AdmissionDocument[]
  status?: AdmissionStatus
}>

export type AdmissionValidationOptions = Readonly<{ now?: Date }>

const FIELD_NAMES: ReadonlySet<string> = new Set(ADMISSION_FIELD_NAMES)
const REQUIRED_FIELDS: ReadonlySet<string> = new Set(REQUIRED_ADMISSION_FIELDS)
const NARRATIVE_FIELDS: ReadonlySet<string> = new Set(NARRATIVE_ADMISSION_FIELDS)
const GRADES: ReadonlySet<string> = new Set(ADMISSION_GRADES)
const GENDERS: ReadonlySet<string> = new Set(ADMISSION_GENDERS)
const CATEGORIES: ReadonlySet<string> = new Set(ADMISSION_CATEGORIES)
const STATUSES: ReadonlySet<string> = new Set(ADMISSION_STATUSES)
const DOCUMENTS: ReadonlySet<string> = new Set(ADMISSION_DOCUMENTS)
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?\d[\d\s().-]*$/
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function addError(
  errors: FieldErrorInput[],
  field: string,
  code: FieldErrorCode,
): void {
  errors.push({ field, code })
}

function dateValue(value: string): number | null {
  const match = DATE_PATTERN.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const timestamp = Date.UTC(year, month - 1, day)
  const date = new Date(timestamp)
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    ? timestamp
    : null
}

function stringLimit(field: string): number {
  return NARRATIVE_FIELDS.has(field) ? 2_000 : 200
}

function enumValues(field: string): ReadonlySet<string> | null {
  if (field === 'grade') return GRADES
  if (field === 'gender') return GENDERS
  if (field === 'category') return CATEGORIES
  if (field === 'status') return STATUSES
  return null
}


function validateDocuments(value: unknown, errors: FieldErrorInput[]): void {
  if (!Array.isArray(value)) {
    addError(errors, 'documentsEnclosed', FIELD_ERROR_CODES.INVALID)
    return
  }

  value.forEach((document, index) => {
    if (typeof document !== 'string' || !DOCUMENTS.has(document)) {
      addError(
        errors,
        `documentsEnclosed[${index}]`,
        FIELD_ERROR_CODES.UNSUPPORTED_VALUE,
      )
    }
  })
}

function validateStringField(
  field: string,
  value: string,
  now: Date,
  errors: FieldErrorInput[],
): void {
  if (value.length > stringLimit(field)) {
    addError(errors, field, FIELD_ERROR_CODES.TOO_LONG)
    return
  }

  const supportedValues = enumValues(field)
  if (supportedValues && !supportedValues.has(value)) {
    addError(errors, field, FIELD_ERROR_CODES.UNSUPPORTED_VALUE)
    return
  }

  if (field === 'dateOfBirth') {
    const birthDate = dateValue(value)
    if (birthDate === null) addError(errors, field, FIELD_ERROR_CODES.INVALID_FORMAT)
    else if (birthDate > now.getTime()) addError(errors, field, FIELD_ERROR_CODES.OUT_OF_RANGE)
    return
  }

  if (field === 'parentEmail' && !EMAIL_PATTERN.test(value)) {
    addError(errors, field, FIELD_ERROR_CODES.INVALID_FORMAT)
    return
  }

  if (field === 'contactNumber' || field === 'alternatePhone') {
    const digits = value.replace(/\D/g, '').length
    if (!PHONE_PATTERN.test(value) || digits < 7 || digits > 15) {
      addError(errors, field, FIELD_ERROR_CODES.INVALID_FORMAT)
    }
    return
  }

  if (field === 'aadharNo' && !/^\d{12}$/.test(value)) {
    addError(errors, field, FIELD_ERROR_CODES.INVALID_FORMAT)
  }
}


export function validateAdmission(
  input: unknown,
  options: AdmissionValidationOptions = {},
): ValidAdmission {
  if (!isAdmissionRecord(input)) {
    throw validationError([{ field: 'request', code: FIELD_ERROR_CODES.INVALID }])
  }

  const normalized = normalizeAdmissionInput(input)
  const errors: FieldErrorInput[] = []
  const now = options.now ?? new Date()

  for (const field of ADMISSION_FIELD_NAMES) {
    const supplied = Object.prototype.hasOwnProperty.call(input, field)
    const rawValue = input[field]
    const value = normalized[field]

    if (REQUIRED_FIELDS.has(field)) {
      if (!supplied || rawValue === null || rawValue === undefined
        || (typeof rawValue === 'string' && rawValue.trim() === '')) {
        addError(errors, field, FIELD_ERROR_CODES.REQUIRED)
        continue
      }
    }

    if (!supplied || (typeof rawValue === 'string' && rawValue.trim() === '')) continue

    if (field === 'documentsEnclosed') {
      validateDocuments(value, errors)
      continue
    }

    if (typeof value !== 'string') {
      addError(errors, field, FIELD_ERROR_CODES.INVALID)
      continue
    }

    validateStringField(field, value, now, errors)
  }

  for (const field of Object.keys(input).filter((name) => !FIELD_NAMES.has(name)).sort()) {
    addError(errors, field, FIELD_ERROR_CODES.INVALID)
  }

  if (errors.length > 0) throw validationError(errors)
  return normalized as unknown as ValidAdmission
}