import type { PayloadRequest } from 'payload'
import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import { createAdmissionsCollection } from '../../src/collections/Admissions'
import { projectAnonymousAdmissionCreate } from '../../src/cms/admissions/present'
import { createAdmissionPostHandler } from '../../src/cms/admissions/public-route'
import { submitAdmission } from '../../src/cms/admissions/submit'
import { ADMISSION_FIELD_NAMES } from '../../src/cms/admissions/schema'
import { SENTINEL_SECRET_VALUES, SENTINEL_SECRETS } from '../fixtures/sentinels'

// Feature: payload-cms-expansion, Property 3: Admission public projection is minimal
// **Validates: Requirements 2.15, 2.16, 2.17, 11.2**

type PersistedAdmission = Readonly<Record<string, unknown> & { id: string; referenceCode: string }>
type OutputEntry = Readonly<{ key: string; value: unknown }>

const PRIVATE_KEYS = new Set([...ADMISSION_FIELD_NAMES, 'id', 'referencecode', 'submittedat', 'statuschangedat', 'statuschangedby', 'createdat', 'updatedat', 'adminnotes', 'audit', 'delivery', 'password', 'secret', 'token', 'credential', 'authorization', 'databaseurl', 'storagecredentials'].map((key) => key.toLowerCase()))
const validInput = Object.freeze({ studentName: 'Synthetic Student', grade: 'Grade 5', dateOfBirth: '2015-06-15', gender: 'other', fatherName: 'Synthetic Parent One', motherName: 'Synthetic Parent Two', contactNumber: '+91 90000 12345', address: '1 Fixture Lane' })

const persistedAdmissionArbitrary: fc.Arbitrary<PersistedAdmission> = fc.integer({ min: 0, max: 1_000_000 }).map((number) => ({
  id: `admission-${number}`, referenceCode: `ADM-PUBLIC-${number}`, studentName: `Synthetic Student ${number}`, grade: 'Grade 5', dateOfBirth: '2015-06-15', gender: 'other', bloodGroup: 'O+', category: 'General', aadharNo: `11112222${String(number).padStart(4, '0')}`, motherTongue: 'Synthetic', previousSchool: `Synthetic School ${number}`, previousSchoolAddress: `Synthetic Previous Address ${number}`, board: 'Synthetic Board', classLastStudied: 'Grade 4', transferCertificateNo: `TC-${number}`, fatherName: `Synthetic Parent One ${number}`, fatherOccupation: 'Synthetic Occupation', fatherQualification: 'Synthetic Qualification', motherName: `Synthetic Parent Two ${number}`, motherOccupation: 'Synthetic Occupation', motherQualification: 'Synthetic Qualification', contactNumber: `+91 90000 ${String(number).padStart(5, '0')}`, alternatePhone: `+91 80000 ${String(number).padStart(5, '0')}`, parentEmail: `guardian-${number}@example.test`, address: `Synthetic Address ${number}`, permanentAddress: `Synthetic Permanent Address ${number}`, documentsEnclosed: ['Birth Certificate'], status: 'pending', submittedAt: '2030-01-15T10:00:00.000Z', statusChangedAt: '2030-01-15T10:00:00.000Z', statusChangedBy: { id: `admin-${number}`, role: 'admin' }, adminNotes: `Synthetic admin note ${number}`, audit: { actor: `admin-${number}`, action: 'admission-status-changed' }, delivery: { recipient: `admissions-${number}@example.test`, password: SENTINEL_SECRETS.smtpPassword }, credential: { token: SENTINEL_SECRETS.authToken }, databaseUrl: SENTINEL_SECRETS.databaseUrl, storageCredentials: SENTINEL_SECRETS.blobToken,
}))

type FailureKind = 'begin' | 'create' | 'commit'

function outputEntries(value: unknown): OutputEntry[] { if (!value || typeof value !== 'object') return []; return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => [{ key, value: child }, ...outputEntries(child)]) }
function privateStrings(value: unknown): string[] { if (typeof value === 'string') return [value]; if (!value || typeof value !== 'object') return []; return Object.values(value as Record<string, unknown>).flatMap(privateStrings) }
function assertNoLeak(output: unknown, persisted: PersistedAdmission): void { const secrets = new Set([...SENTINEL_SECRET_VALUES, ...privateStrings(persisted).filter((value) => value !== persisted.referenceCode)]); for (const { key, value } of outputEntries(output)) { expect(PRIVATE_KEYS.has(key.toLowerCase())).toBe(false); if (typeof value === 'string') expect([...secrets].some((secret) => value.includes(secret))).toBe(false) } }
function afterReadResult(doc: PersistedAdmission): unknown { const hook = createAdmissionsCollection().hooks?.afterRead?.[0] as unknown as ((args: unknown) => unknown); return hook({ doc, req: { user: null } }) }
function serviceRequest(doc: PersistedAdmission, failure?: FailureKind): PayloadRequest { return { context: {}, payload: { db: { beginTransaction: async () => { if (failure === 'begin') throw new Error(SENTINEL_SECRETS.databaseUrl); return 'transaction-synthetic' }, commitTransaction: async () => { if (failure === 'commit') throw new Error(SENTINEL_SECRETS.databaseUrl) }, rollbackTransaction: async () => {} }, create: async () => { if (failure === 'create') throw new Error(SENTINEL_SECRETS.databaseUrl); return doc } } } as unknown as PayloadRequest }

describe('admission public projection property', () => {
  it('exposes only a public reference/outcome for anonymous success and never a reference on failure', async () => {
    await fc.assert(fc.asyncProperty(persistedAdmissionArbitrary, fc.constantFrom<FailureKind>('begin', 'create', 'commit'), async (persisted, failureKind) => {
      const direct = projectAnonymousAdmissionCreate(persisted)
      const afterRead = afterReadResult(persisted)
      const persistedResult = await submitAdmission(validInput, serviceRequest(persisted), { createDelivery: async () => ({ id: 'delivery-synthetic', recipient: 'admissions@example.test', password: SENTINEL_SECRETS.smtpPassword }), deliver: async () => ({ status: 'sent', credential: SENTINEL_SECRETS.authToken }) })
      const failedResult = await submitAdmission(validInput, serviceRequest(persisted, failureKind))
      const successHandler = createAdmissionPostHandler({ createRequest: async () => serviceRequest(persisted), submit: async () => persistedResult })
      const failureHandler = createAdmissionPostHandler({ createRequest: async () => serviceRequest(persisted), submit: async () => failedResult })
      const request = () => new Request('http://school.example.test/api/admissions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(validInput) })
      const successResponse = await successHandler(request()); const failureResponse = await failureHandler(request())
      const successBody = await successResponse.json(); const failureBody = await failureResponse.json()
      for (const output of [direct, afterRead, persistedResult, successBody]) { expect(output).toEqual({ ok: true, reference: persisted.referenceCode }); assertNoLeak(output, persisted) }
      expect(failedResult).toEqual({ ok: false }); expect(failedResult).not.toHaveProperty('reference'); expect(failureResponse.status).toBe(503); expect(failureBody).not.toHaveProperty('reference'); assertNoLeak(failedResult, persisted); assertNoLeak(failureBody, persisted)
    }), { numRuns: 100, seed: 20260321 })
  })
})
