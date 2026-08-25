export type SyntheticAdmission = Readonly<{
  id: string
  referenceCode: string
  studentName: string
  grade: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  fatherName: string
  motherName: string
  guardianName: string
  email: string
  contactNumber: string
  address: string
  previousSchool: string
  aadhaarNumber: string
  documentChecklist: readonly string[]
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  submittedAt: string
}>

const defaultAdmission: SyntheticAdmission = {
  id: 'admission-synthetic-001', referenceCode: 'TEST-ADM-001',
  studentName: 'Synthetic Student', grade: 'Grade 5', dateOfBirth: '2015-06-15',
  gender: 'other', fatherName: 'Synthetic Parent One', motherName: 'Synthetic Parent Two',
  guardianName: 'Synthetic Guardian', email: 'guardian@example.test',
  contactNumber: '+1 555 010 0001', address: '1 Fixture Lane, Test City',
  previousSchool: 'Synthetic School', aadhaarNumber: '111122223333',
  documentChecklist: ['birth_certificate'], status: 'pending',
  submittedAt: '2030-01-15T10:00:00.000Z',
}

export function buildAdmission(
  overrides: Partial<SyntheticAdmission> = {},
): SyntheticAdmission {
  return {
    ...defaultAdmission,
    ...overrides,
    documentChecklist: [...(overrides.documentChecklist ?? defaultAdmission.documentChecklist)],
  }
}
