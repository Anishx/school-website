export const ADMISSION_GRADES = Object.freeze([
  'Nursery', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
] as const)

export const ADMISSION_GENDERS = Object.freeze(['male', 'female', 'other'] as const)
export const ADMISSION_CATEGORIES = Object.freeze(['General', 'OBC', 'SC', 'ST', 'EWS'] as const)
export const ADMISSION_STATUSES = Object.freeze([
  'pending', 'reviewed', 'accepted', 'rejected',
] as const)
export const ADMISSION_DOCUMENTS = Object.freeze([
  'Birth Certificate',
  'Transfer Certificate',
  'Aadhar Card (Student & Parents)',
  'Mark Sheet',
  'Photographs (4)',
  'Mother Bank Passbook',
  'Caste Certificate',
] as const)

export type AdmissionGrade = (typeof ADMISSION_GRADES)[number]
export type AdmissionGender = (typeof ADMISSION_GENDERS)[number]
export type AdmissionCategory = (typeof ADMISSION_CATEGORIES)[number]
export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number]
export type AdmissionDocument = (typeof ADMISSION_DOCUMENTS)[number]

export const ADMISSION_FIELD_NAMES = Object.freeze([
  'studentName', 'grade', 'dateOfBirth', 'gender', 'bloodGroup', 'category',
  'aadharNo', 'motherTongue', 'previousSchool', 'previousSchoolAddress',
  'board', 'classLastStudied', 'transferCertificateNo', 'fatherName',
  'fatherOccupation', 'fatherQualification', 'motherName', 'motherOccupation',
  'motherQualification', 'contactNumber', 'alternatePhone', 'parentEmail',
  'address', 'permanentAddress', 'documentsEnclosed', 'status',
] as const)

export type AdmissionFieldName = (typeof ADMISSION_FIELD_NAMES)[number]

export const REQUIRED_ADMISSION_FIELDS = Object.freeze([
  'studentName', 'grade', 'dateOfBirth', 'gender', 'fatherName', 'motherName',
  'contactNumber', 'address',
] as const satisfies readonly AdmissionFieldName[])

export const NARRATIVE_ADMISSION_FIELDS = Object.freeze([
  'previousSchoolAddress', 'address', 'permanentAddress',
] as const satisfies readonly AdmissionFieldName[])

export const SINGLE_LINE_ADMISSION_LIMIT = 200
export const NARRATIVE_ADMISSION_LIMIT = 2_000

export const ADMISSION_SCHEMA = Object.freeze({
  fields: ADMISSION_FIELD_NAMES,
  required: REQUIRED_ADMISSION_FIELDS,
  narrative: NARRATIVE_ADMISSION_FIELDS,
  grades: ADMISSION_GRADES,
  genders: ADMISSION_GENDERS,
  categories: ADMISSION_CATEGORIES,
  statuses: ADMISSION_STATUSES,
  documents: ADMISSION_DOCUMENTS,
  limits: Object.freeze({
    singleLine: SINGLE_LINE_ADMISSION_LIMIT,
    narrative: NARRATIVE_ADMISSION_LIMIT,
  }),
})