import { describe, expect, it } from 'vitest'
import {
  FakeBlobAdapter,
  MockSmtpTransport,
  SENTINEL_SECRET_VALUES,
  SYNTHETIC_RECIPIENTS,
  buildAdmission,
  buildEditorialRecord,
  buildForm,
  buildSyntheticImage,
  buildSyntheticPdf,
  buildUser,
  createFakeClock,
} from '../fixtures'

describe('synthetic shared fixtures', () => {
  it('builds deterministic records with isolated override arrays', () => {
    const sections = ['home.hero']
    const user = buildUser({ role: 'teacher', assignedSections: sections })
    sections.push('home.news')

    expect(user).toMatchObject({ role: 'teacher', email: 'user-001@example.test' })
    expect(user.assignedSections).toEqual(['home.hero'])
    expect(buildAdmission().email).toBe('guardian@example.test')
    expect(buildForm().fields).toHaveLength(3)
    expect(buildEditorialRecord().publicationState).toBe('draft')
  })

  it('returns fresh synthetic image and PDF bytes with expected signatures', () => {
    const firstImage = buildSyntheticImage('png')
    const secondImage = buildSyntheticImage('png')
    firstImage.bytes[0] = 0

    expect(secondImage.bytes.slice(0, 4)).toEqual(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))
    expect(new TextDecoder().decode(buildSyntheticPdf().bytes)).toMatch(/^%PDF-/)
  })

  it('provides deterministic controllable time without changing global timers', () => {
    const clock = createFakeClock('2030-01-01T00:00:00.000Z')
    clock.advance(1_000)
    expect(clock.iso()).toBe('2030-01-01T00:00:01.000Z')
  })
})

describe('isolated delivery and storage helpers', () => {
  it('captures mail locally and rejects non-synthetic recipients', async () => {
    const smtp = new MockSmtpTransport()
    const delivery = await smtp.sendMail({
      to: SYNTHETIC_RECIPIENTS.admission,
      subject: 'Synthetic admission',
      text: 'Fixture-only body',
    })

    expect(delivery.messageId).toBe('mock-smtp-0001')
    expect(smtp.deliveries).toHaveLength(1)
    await expect(smtp.sendMail({
      to: 'recipient@production.example', subject: 'Blocked', text: 'Never sent',
    })).rejects.toThrow(/reserved synthetic recipients/)
  })

  it('stores copies in memory and restricts writes to fixture paths', async () => {
    const blob = new FakeBlobAdapter()
    const original = buildSyntheticPdf().bytes
    await blob.put('test-fixtures/document.pdf', original, { contentType: 'application/pdf' })
    original[0] = 0

    const stored = await blob.get('test-fixtures/document.pdf')
    expect(stored?.[0]).toBe('%'.charCodeAt(0))
    expect((await blob.list())[0]).toMatchObject({
      pathname: 'test-fixtures/document.pdf', contentType: 'application/pdf',
    })
    await expect(blob.put('production/document.pdf', original)).rejects.toThrow(/test-fixtures/)
  })

  it('uses conspicuous non-production sentinel values', () => {
    expect(SENTINEL_SECRET_VALUES).toHaveLength(5)
    expect(SENTINEL_SECRET_VALUES.every((value) => /sentinel/i.test(value))).toBe(true)
    expect(Object.values(SYNTHETIC_RECIPIENTS).every((value) => value.endsWith('@example.test'))).toBe(true)
  })
})
