export type LoginMenuDTO = Readonly<{
  enabled: boolean
  label: string
  entries: readonly Readonly<{ id: string; label: string; href?: string; newTab: boolean }>[]
}>

export const DEFAULT_LOGIN_ENTRIES = ['Student', 'Parent', 'Staff'].map((label) => ({
  label, href: '#', enabled: true, newTab: false,
}))

export function validateLoginLink(value: unknown): true | string {
  if (value == null || value === '') return true
  if (typeof value !== 'string') return 'Enter an HTTPS URL, site path or page anchor.'
  const link = value.trim()
  if (/[\\\s\u0000-\u001f\u007f]/.test(link)) return 'Links must not contain spaces or backslashes.'
  if (/^\/(?!\/)/.test(link) || link.startsWith('#')) return true
  try {
    const url = new URL(link)
    if (url.protocol === 'https:' && url.hostname && !url.username && !url.password) return true
  } catch { /* Return the field validation message below. */ }
  return 'Enter an HTTPS URL, site path or page anchor.'
}

export function loginMenuFromRecord(value: unknown): LoginMenuDTO {
  const record = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  // Empty arrays can be returned as null by Payload. Never restore deleted rows.
  const rows = record.customized === true
    ? (Array.isArray(record.entries) ? record.entries : [])
    : DEFAULT_LOGIN_ENTRIES
  return {
    enabled: record.enabled !== false,
    label: typeof record.label === 'string' && record.label.trim() ? record.label.trim() : 'Login',
    entries: rows.flatMap((row: unknown, index: number) => {
      if (!row || typeof row !== 'object') return []
      const item = row as Record<string, unknown>
      if (item.enabled === false || typeof item.label !== 'string' || !item.label.trim()) return []
      const href = typeof item.href === 'string' ? item.href.trim() : ''
      return [{
        id: typeof item.id === 'string' ? item.id : `login-${index}`,
        label: item.label.trim(),
        ...(href && validateLoginLink(href) === true ? { href } : {}),
        newTab: item.newTab === true,
      }]
    }),
  }
}
