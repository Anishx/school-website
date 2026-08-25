import { describe, expect, it } from 'vitest'

import { StructuredError } from '../../src/cms/errors/structured-error'
import {
  validateAdmission,
} from '../../src/cms/admissions/validate'

const NOW = new Date('2030-01-15T10:00:00.000Z')

function validAdmission(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    studentName: '  Synthetic Student  ',
    grade: 'Grade 5',
    dateOfBirth: '2015-06-15',
    gender: 'other',
    fatherName: ' Parent One ',
    motherName: 'Parent Two',
    contactNumber: ' +91 (90000) 12345 ',
    address: ' 1 Fixture Lane ',
    ...overrides,
  }
}

function validationFailure(input: unknown): StructuredError {
  try {
    validateAdmission(input, { now: NOW })
  } catch (error) {
    expect(error).toBeInstanceOf(StructuredError)
    return error as StructuredError
  }
  throw new Error('Expected admission validation to fail')
}

describe('admission validation', () => {
  it('normalizes current form-to-collection fields without renaming contactNumber', () => {
    const result = validateAdmission(validAdmission({
      parentEmail: ' GUARDIAN@Example.Test ',
      aadharNo: '1111 2222-3333',
      documentsEnclosed: [' Birth Certificate ', 'Mark Sheet'],
    }), { now: NOW })

    expect(result).toMatchObject({
      studentName: 'Synthetic Student',
      contactNumber: '+91 (90000) 12345',
      parentEmail: 'guardian@example.test',
      aadharNo: '111122223333',
      documentsEnclosed: ['Birth Certificate', 'Mark Sheet'],
    })
    expect(result).not.toHaveProperty('parentPhone')
  })


  it('returns deterministic required and unknown-field errors without echoing values', () => {
    const secretValue = 'SENSITIVE-UNKNOWN-VALUE'
    const error = validationFailure({
      ...validAdmission({ studentName: '   ', address: undefined }),
      parentPhone: secretValue,
      zUnexpected: secretValue,
    })

    expect(error.fieldErrors).toEqual([
      { field: 'studentName', code: 'REQUIRED', message: 'This field is required.' },
      { field: 'address', code: 'REQUIRED', message: 'This field is required.' },
      { field: 'parentPhone', code: 'INVALID', message: 'This field is invalid.' },
      { field: 'zUnexpected', code: 'INVALID', message: 'This field is invalid.' },
    ])
    expect(JSON.stringify(error)).not.toContain(secretValue)
  })

  it('rejects invalid dates, email, phone digit counts, and Aadhaar', () => {
    const error = validationFailure(validAdmission({
      dateOfBirth: '2030-01-16',
      parentEmail: 'not-an-email',
      contactNumber: '+1 23',
      alternatePhone: '1234567890123456',
      aadharNo: '1111-2222-333X',
    }))

    expect(error.fieldErrors.map(({ field, code }) => ({ field, code }))).toEqual([
      { field: 'dateOfBirth', code: 'OUT_OF_RANGE' },
      { field: 'aadharNo', code: 'INVALID_FORMAT' },
      { field: 'contactNumber', code: 'INVALID_FORMAT' },
      { field: 'alternatePhone', code: 'INVALID_FORMAT' },
      { field: 'parentEmail', code: 'INVALID_FORMAT' },
    ])
  })

  it('enforces enum, checklist, and field-specific length limits', () => {
    const error = validationFailure(validAdmission({
      grade: 'College',
      gender: 'undisclosed',
      category: 'Unknown',
      status: 'deleted',
      documentsEnclosed: ['Birth Certificate', 'Passport'],
      bloodGroup: 'x'.repeat(201),
      address: 'x'.repeat(2_001),
    }))

    expect(error.fieldErrors.map(({ field, code }) => ({ field, code }))).toEqual([
      { field: 'grade', code: 'UNSUPPORTED_VALUE' },
      { field: 'gender', code: 'UNSUPPORTED_VALUE' },
      { field: 'bloodGroup', code: 'TOO_LONG' },
      { field: 'category', code: 'UNSUPPORTED_VALUE' },
      { field: 'address', code: 'TOO_LONG' },
      { field: 'documentsEnclosed[1]', code: 'UNSUPPORTED_VALUE' },
      { field: 'status', code: 'UNSUPPORTED_VALUE' },
    ])
  })
})