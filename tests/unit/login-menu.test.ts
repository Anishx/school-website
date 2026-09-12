import { describe, expect, it } from 'vitest'
import { loginMenuFromRecord, validateLoginLink } from '../../src/cms/public/login-menu'

describe('CMS login menu', () => {
  it('preserves the original menu before the first CMS save', () => {
    expect(loginMenuFromRecord(undefined).entries.map((entry) => entry.label)).toEqual(['Student', 'Parent', 'Staff'])
    expect(loginMenuFromRecord({ customized: false, entries: null }).entries).toHaveLength(3)
  })

  it('supports a hidden button and a custom button label', () => {
    expect(loginMenuFromRecord({ enabled: false, label: 'Portals' })).toMatchObject({ enabled: false, label: 'Portals' })
  })

  it('keeps order, filters hidden rows and preserves a label without a link', () => {
    const result = loginMenuFromRecord({ customized: true, entries: [
      { id: 'staff', label: 'Staff', href: 'https://portal.example.com', newTab: true },
      { id: 'hidden', label: 'Student', enabled: false, href: '/student' },
      { id: 'parent', label: 'Parent', href: '' },
    ] })
    expect(result.entries).toEqual([
      { id: 'staff', label: 'Staff', href: 'https://portal.example.com', newTab: true },
      { id: 'parent', label: 'Parent', newTab: false },
    ])
  })

  it.each([[], null, undefined])('does not restore deleted entries when stored as %j', (entries) => {
    expect(loginMenuFromRecord({ customized: true, entries }).entries).toEqual([])
  })

  it('does not expose an unsafe stored link', () => {
    expect(loginMenuFromRecord({ customized: true, entries: [{ label: 'Bad link', href: 'javascript:alert(1)' }] }).entries[0].href).toBeUndefined()
  })

  it.each(['https://portal.example.com/login?school=apollo', '/admin', '#portal', '', undefined])('accepts supported links: %s', (href) => {
    expect(validateLoginLink(href)).toBe(true)
  })

  it.each(['javascript:alert(1)', 'data:text/html,test', '//evil.test', '/\\evil.test', 'https://user:password@example.com', 'http://example.com', '/bad\npath'])('rejects unsafe links: %s', (href) => {
    expect(validateLoginLink(href)).not.toBe(true)
  })
})
