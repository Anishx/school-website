import type { NotificationSourceType } from '../../collections/NotificationDeliveries'
import type { NotificationSettingsDocument } from '../../globals/NotificationSettings'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type RecipientSelection =
  | Readonly<{ outcome: 'disabled' }>
  | Readonly<{ outcome: 'not_configured' }>
  | Readonly<{
      outcome: 'configured'
      recipient: string
      source: 'settings' | 'environment'
    }>

export type RecipientSelectionInput = Readonly<{
  sourceType: NotificationSourceType
  settings?: NotificationSettingsDocument | null
  environmentRecipient?: string | null
  formId?: string | number | null
}>

export function normalizeRecipient(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return EMAIL_PATTERN.test(normalized) ? normalized : null
}

function relationID(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return relationID((value as { id?: unknown }).id)
}

function configured(recipient: unknown): RecipientSelection | null {
  const normalized = normalizeRecipient(recipient)
  return normalized
    ? Object.freeze({ outcome: 'configured', recipient: normalized, source: 'settings' })
    : null
}
export function selectNotificationRecipient(
  input: RecipientSelectionInput,
): RecipientSelection {
  const settings = input.settings
  let enabled: boolean
  let settingsRecipients: readonly unknown[]

  if (input.sourceType === 'admission') {
    enabled = settings?.admissionEnabled ?? true
    settingsRecipients = [settings?.admissionRecipient]
  } else {
    const targetForm = input.formId == null ? null : String(input.formId)
    const override = targetForm
      ? (settings?.formOverrides ?? []).find((row) => relationID(row.form) === targetForm)
      : undefined
    enabled = override?.enabled ?? settings?.defaultFormEnabled ?? true
    settingsRecipients = [override?.recipient, settings?.defaultFormRecipient]
  }

  if (!enabled) return Object.freeze({ outcome: 'disabled' })

  for (const candidate of settingsRecipients) {
    const selection = configured(candidate)
    if (selection) return selection
  }

  const fallback = normalizeRecipient(input.environmentRecipient)
  if (fallback) {
    return Object.freeze({
      outcome: 'configured',
      recipient: fallback,
      source: 'environment',
    })
  }
  return Object.freeze({ outcome: 'not_configured' })
}
