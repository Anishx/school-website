import { ValidationError, type GlobalConfig, type PayloadRequest } from 'payload'

import { collectionAccessDecision } from '../access/collectionAccess'
import { resolvePrincipal } from '../access/roles'
import { writeAudit as writeTrustedAudit, type AuditWriteEvent } from '../cms/audit/writeAudit'

export type NotificationSettingsDocument = Readonly<{
  admissionEnabled?: boolean
  admissionRecipient?: string | null
  defaultFormEnabled?: boolean
  defaultFormRecipient?: string | null
  formOverrides?: readonly Readonly<{
    form?: unknown
    enabled?: boolean
    recipient?: string | null
  }>[] | null
}>

export type NotificationSettingsAuditWriter = (
  event: AuditWriteEvent,
  req: PayloadRequest,
) => Promise<void> | void

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateNotificationRecipient(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
    ? true
    : 'Enter a valid notification email address.'
}

function relationID(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (!value || typeof value !== 'object' || !('id' in value)) return null
  return relationID((value as { id?: unknown }).id)
}

function trimRecipient(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value
}

function normalizeSettings(data: Record<string, unknown>): Record<string, unknown> {
  const next = { ...data }
  if ('admissionRecipient' in next) next.admissionRecipient = trimRecipient(next.admissionRecipient)
  if ('defaultFormRecipient' in next) next.defaultFormRecipient = trimRecipient(next.defaultFormRecipient)
  if (Array.isArray(next.formOverrides)) {
    next.formOverrides = next.formOverrides.map((entry) => {
      if (!entry || typeof entry !== 'object') return entry
      const row = entry as Record<string, unknown>
      return { ...row, recipient: trimRecipient(row.recipient) }
    })
  }
  return next
}

function assertUniqueFormOverrides(data: NotificationSettingsDocument, req: PayloadRequest): void {
  const seen = new Set<string>()
  for (const [index, row] of (data.formOverrides ?? []).entries()) {
    const id = relationID(row.form)
    if (!id || seen.has(id)) {
      throw new ValidationError({
        global: 'notification-settings',
        errors: [{
          path: `formOverrides.${index}.form`,
          message: id ? 'Each form may have only one notification override.' : 'Select a form.',
        }],
        req,
      })
    }
    seen.add(id)
  }
}

function recipientFingerprint(settings: NotificationSettingsDocument | null | undefined): string {
  const overrides = (settings?.formOverrides ?? []).map((row) => ({
    form: relationID(row.form) ?? '',
    recipient: typeof row.recipient === 'string' ? row.recipient.trim().toLowerCase() : '',
  })).sort((left, right) => left.form.localeCompare(right.form))
  return JSON.stringify({
    admission: settings?.admissionRecipient?.trim().toLowerCase() ?? '',
    defaultForm: settings?.defaultFormRecipient?.trim().toLowerCase() ?? '',
    overrides,
  })
}

export function buildNotificationSettingsAuditEvent(
  current: NotificationSettingsDocument,
  previous: NotificationSettingsDocument | null | undefined,
  actorInput: unknown,
  timestamp = new Date().toISOString(),
): AuditWriteEvent | null {
  if (recipientFingerprint(current) === recipientFingerprint(previous)) return null
  const actor = resolvePrincipal(actorInput as Parameters<typeof resolvePrincipal>[0])
  return Object.freeze({
    actor: actor ? Object.freeze({ id: actor.id, role: actor.role }) : 'system',
    action: 'notification-recipient-changed',
    target: Object.freeze({ collection: 'notification-settings', id: 'notification-settings' }),
    timestamp,
    outcome: 'success',
    metadata: Object.freeze({ recipientChanged: true }),
  })
}

export type CreateNotificationSettingsOptions = Readonly<{
  writeAudit?: NotificationSettingsAuditWriter
}>

export function createNotificationSettingsGlobal(
  options: CreateNotificationSettingsOptions = {},
): GlobalConfig {
  const canManage = (req: PayloadRequest): boolean => collectionAccessDecision({
    user: req.user,
    resource: 'notification-settings',
    operation: 'update',
  }) === true
  const writeAudit = options.writeAudit ?? writeTrustedAudit

  return {
    slug: 'notification-settings',
    label: 'Notification Settings',
    admin: {
      description: 'Configure non-secret email recipients and notification enablement.',
    },
    access: {
      read: ({ req }) => canManage(req),
      update: ({ req }) => canManage(req),
    },
    fields: [
      {
        name: 'admissionEnabled', type: 'checkbox', required: true, defaultValue: true,
        label: 'Enable admission notifications',
      },
      {
        name: 'admissionRecipient', type: 'email', label: 'Admission recipient',
        validate: validateNotificationRecipient,
      },
      {
        name: 'defaultFormEnabled', type: 'checkbox', required: true, defaultValue: true,
        label: 'Enable form notifications by default',
      },
      {
        name: 'defaultFormRecipient', type: 'email', label: 'Default form recipient',
        validate: validateNotificationRecipient,
      },
      {
        name: 'formOverrides',
        type: 'array',
        label: 'Per-form notification overrides',
        fields: [
          { name: 'form', type: 'relationship', relationTo: 'forms', required: true },
          { name: 'enabled', type: 'checkbox', required: true, defaultValue: true },
          {
            name: 'recipient', type: 'email', label: 'Form recipient',
            validate: validateNotificationRecipient,
          },
        ],
      },
    ],
    hooks: {
      beforeValidate: [
        ({ data, req }) => {
          const normalized = normalizeSettings((data ?? {}) as Record<string, unknown>)
          assertUniqueFormOverrides(normalized as NotificationSettingsDocument, req)
          return normalized
        },
      ],
      afterChange: [
        async ({ doc, previousDoc, req }) => {
          const event = buildNotificationSettingsAuditEvent(
            doc as NotificationSettingsDocument,
            previousDoc as NotificationSettingsDocument | undefined,
            req.user,
          )
          if (event) await writeAudit(event, req)
          return doc
        },
      ],
    },
  }
}

export const NotificationSettings: GlobalConfig = createNotificationSettingsGlobal()
export default NotificationSettings