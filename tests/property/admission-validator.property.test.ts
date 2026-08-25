import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { StructuredError } from '../../src/cms/errors/structured-error'
import { validateAdmission } from '../../src/cms/admissions/validate'

// Feature: payload-cms-expansion, Property 2: Admission validator enforces the complete input contract
// **Validates: Requirements 2.5, 2.6, 2.7, 2.8, 2.9, 2.11, 2.12**

const NOW = new Date('2030-01-15T10:00:00.000Z')
const FIELD_NAMES = new Set(['studentName', 'grade', 'dateOfBirth', 'gender', 'bloodGroup', 'category', 'aadharNo', 'motherTongue', 'previousSchool', 'previousSchoolAddress', 'board', 'classLastStudied', 'transferCertificateNo', 'fatherName', 'fatherOccupation', 'fatherQualification', 'motherName', 'motherOccupation', 'motherQualification', 'contactNumber', 'alternatePhone', 'parentEmail', 'address', 'permanentAddress', 'documentsEnclosed', 'status'])
const REQUIRED_FIELDS = new Set(['studentName', 'grade', 'dateOfBirth', 'gender', 'fatherName', 'motherName', 'contactNumber', 'address'])
const NARRATIVE_FIELDS = new Set(['previousSchoolAddress', 'address', 'permanentAddress'])
const ENUM_VALUES = new Map<string, ReadonlySet<string>>([
  ['grade', new Set(['Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'])],
  ['gender', new Set(['male', 'female', 'other'])], ['category', new Set(['General', 'OBC', 'SC', 'ST', 'EWS'])],
  ['status', new Set(['pending', 'reviewed', 'accepted', 'rejected'])],
])
const DOCUMENTS = new Set(['Birth Certificate', 'Transfer Certificate', 'Aadhar Card (Student & Parents)', 'Mark Sheet', 'Photographs (4)', 'Mother Bank Passbook', 'Caste Certificate'])

type AdmissionPayload = Record<string, unknown>
type InvalidCase = 'required' | 'grade' | 'gender' | 'category' | 'status' | 'date' | 'email' | 'phone' | 'aadhaar' | 'unknown' | 'document' | 'documentShape' | 'singleLine' | 'narrative' | 'type'

const validPayloadArbitrary: fc.Arbitrary<AdmissionPayload> = fc.record({
  id: fc.integer({ min: 0, max: 999_999_999 }), grade: fc.constantFrom('Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 5', 'Grade 10'), gender: fc.constantFrom('male', 'female', 'other'), category: fc.constantFrom('General', 'OBC', 'SC', 'ST', 'EWS'), status: fc.constantFrom('pending', 'reviewed', 'accepted', 'rejected'), documents: fc.uniqueArray(fc.constantFrom(...DOCUMENTS), { maxLength: 7 }), year: fc.integer({ min: 1900, max: 2029 }), month: fc.integer({ min: 1, max: 12 }), day: fc.integer({ min: 1, max: 15 }),
}).map(({ id, grade, gender, category, status, documents, year, month, day }) => ({
  studentName: ` Synthetic Student ${id} `, grade, dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, gender, bloodGroup: 'O+', category, aadharNo: String(id).padStart(12, '0'), motherTongue: 'Synthetic', previousSchool: 'Synthetic School', previousSchoolAddress: `Synthetic Road ${id}`, board: 'Synthetic Board', classLastStudied: 'Grade 4', transferCertificateNo: `TC-${id}`, fatherName: `Synthetic Parent ${id}`, fatherOccupation: 'Engineer', fatherQualification: 'Graduate', motherName: `Synthetic Guardian ${id}`, motherOccupation: 'Teacher', motherQualification: 'Graduate', contactNumber: `+91 90000 ${String(id % 100_000).padStart(5, '0')}`, alternatePhone: `90000${String(id % 100_000).padStart(5, '0')}`, parentEmail: `guardian-${id}@example.test`, address: `Synthetic Address ${id}`, permanentAddress: `Synthetic Permanent Address ${id}`, documentsEnclosed: documents, status,
}))

function invalidPayload(payload: AdmissionPayload, kind: InvalidCase): AdmissionPayload {
  const mutations: Record<InvalidCase, AdmissionPayload> = {
    required: { studentName: ' \t ' }, grade: { grade: 'College' }, gender: { gender: 'undisclosed' }, category: { category: 'Unknown' }, status: { status: 'deleted' }, date: { dateOfBirth: '2030-01-16' }, email: { parentEmail: 'synthetic-email' }, phone: { contactNumber: '+1 23' }, aadhaar: { aadharNo: '1111-2222-333X' }, unknown: { unsupportedSyntheticField: 'synthetic' }, document: { documentsEnclosed: ['Passport'] }, documentShape: { documentsEnclosed: 'Birth Certificate' }, singleLine: { bloodGroup: 'x'.repeat(201) }, narrative: { address: 'x'.repeat(2_001) }, type: { motherName: 42 },
  }
  return { ...payload, ...mutations[kind] }
}

const invalidPayloadArbitrary = fc.tuple(validPayloadArbitrary, fc.constantFrom<InvalidCase>('required', 'grade', 'gender', 'category', 'status', 'date', 'email', 'phone', 'aadhaar', 'unknown', 'document', 'documentShape', 'singleLine', 'narrative', 'type')).map(([payload, kind]) => invalidPayload(payload, kind))

function validDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const timestamp = Date.UTC(year, month - 1, day)
  const parsed = new Date(timestamp)
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day && timestamp <= NOW.getTime()
}

function satisfiesAdmissionContract(input: unknown): boolean {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return false
  const payload = input as AdmissionPayload
  if (Object.keys(payload).some((field) => !FIELD_NAMES.has(field))) return false
  for (const field of REQUIRED_FIELDS) if (typeof payload[field] !== 'string' || !payload[field].trim()) return false
  for (const [field, raw] of Object.entries(payload)) {
    if (field === 'documentsEnclosed') { if (!Array.isArray(raw) || raw.some((value) => typeof value !== 'string' || !DOCUMENTS.has(value.trim()))) return false; continue }
    if (typeof raw !== 'string') return false
    const value = field === 'aadharNo' ? raw.trim().replace(/[\s-]/g, '') : raw.trim()
    if (!value && !REQUIRED_FIELDS.has(field)) continue
    if (value.length > (NARRATIVE_FIELDS.has(field) ? 2_000 : 200)) return false
    if (ENUM_VALUES.get(field)?.has(value) === false) return false
    if (field === 'dateOfBirth' && !validDate(value)) return false
    if (field === 'parentEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false
    if ((field === 'contactNumber' || field === 'alternatePhone') && (!/^\+?\d[\d\s().-]*$/.test(value) || value.replace(/\D/g, '').length < 7 || value.replace(/\D/g, '').length > 15)) return false
    if (field === 'aadharNo' && !/^\d{12}$/.test(value)) return false
  }
  return true
}

function validatorAccepts(payload: AdmissionPayload): boolean {
  try { validateAdmission(payload, { now: NOW }); return true } catch (error) { if (error instanceof StructuredError) return false; throw error }
}

describe('admission validator property', () => {
  it('accepts exactly the generated payloads that satisfy the independent admission contract', () => {
    fc.assert(fc.property(validPayloadArbitrary, invalidPayloadArbitrary, (validPayload, invalidPayload) => {
      expect(satisfiesAdmissionContract(validPayload)).toBe(true)
      expect(satisfiesAdmissionContract(invalidPayload)).toBe(false)
      expect(validatorAccepts(validPayload)).toBe(true)
      expect(validatorAccepts(invalidPayload)).toBe(false)
    }), { numRuns: 100, seed: 20260320 })
  })
})
