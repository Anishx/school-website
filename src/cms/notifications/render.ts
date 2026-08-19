import type { NotificationSourceType } from '../../collections/NotificationDeliveries'
import { sanitizeText } from '../errors/sanitize'

export type NotificationMessage = Readonly<{
  subject: string
  text: string
  html: string
}>

export type FormNotificationField = Readonly<{
  name?: unknown
  label?: unknown
  type?: unknown
}>

export type RenderNotificationInput = Readonly<{
  sourceType: NotificationSourceType
  source: Readonly<Record<string, unknown>>
  formFields?: readonly FormNotificationField[]
  adminOrigin?: string | null
}>

const FORBIDDEN_FORM_FIELD = /(?:passw(?:or)?d|secret|token|credential|auth(?:orization)?|file|upload|attachment|binary|buffer)/i
const FORM_FIELD_TYPES = new Set([
  'text', 'textarea', 'email', 'phone', 'select', 'radio', 'checkbox', 'consent', 'date',
])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function scalar(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value) && value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
    return value.map(String).join(', ')
  }
  return null
}

function safeValue(value: unknown, email = false): string | null {
  const text = scalar(value)?.trim()
  if (!text) return null
  if (email) return EMAIL_PATTERN.test(text) ? text.slice(0, 320) : null
  return sanitizeText(text.replace(/[\u0000-\u001f\u007f]/g, ' ')).slice(0, 2_000)
}
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character] as string)
}

function label(value: unknown, fallback: string): string {
  const text = safeValue(value)
  return text ? text.slice(0, 120) : fallback
}

function adminLink(origin: string | null | undefined, collection: string, id: unknown): string | null {
  if (!origin || (typeof id !== 'string' && typeof id !== 'number')) return null
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    return new URL(`/admin/collections/${collection}/${encodeURIComponent(String(id))}`, url.origin).href
  } catch {
    return null
  }
}

function message(title: string, rows: readonly (readonly [string, string])[], link: string | null): NotificationMessage {
  const textRows = rows.map(([name, value]) => `${name}: ${value}`)
  if (link) textRows.push(`Review: ${link}`)
  const htmlRows = rows.map(([name, value]) =>
    `<tr><th align="left">${escapeHTML(name)}</th><td>${escapeHTML(value)}</td></tr>`).join('')
  const htmlLink = link ? `<p><a href="${escapeHTML(link)}">Review in Payload Admin</a></p>` : ''
  return Object.freeze({
    subject: title,
    text: [title, '', ...textRows].join('\n'),
    html: `<h2>${escapeHTML(title)}</h2><table>${htmlRows}</table>${htmlLink}`,
  })
}

function add(rows: Array<readonly [string, string]>, name: string, value: unknown, email = false): void {
  const safe = safeValue(value, email)
  if (safe) rows.push([name, safe])
}

export function renderAdmissionNotification(
  source: Readonly<Record<string, unknown>>,
  adminOrigin?: string | null,
): NotificationMessage {
  const rows: Array<readonly [string, string]> = []
  add(rows, 'Reference', source.referenceCode)
  add(rows, 'Student name', source.studentName)
  add(rows, 'Requested grade', source.requestedGrade ?? source.grade)
  add(rows, 'Date of birth', source.dateOfBirth)
  add(rows, 'Gender', source.gender)
  add(rows, 'Guardian name', source.guardianName ?? source.fatherName)
  add(rows, 'Contact number', source.contactNumber)
  add(rows, 'Email', source.email ?? source.parentEmail, true)
  add(rows, 'Previous school', source.previousSchool)
  add(rows, 'Submitted at', source.submittedAt ?? source.createdAt)
  return message(
    'New admission application', rows,
    adminLink(adminOrigin, 'admissions', source.id),
  )
}
export function renderFormNotification(
  source: Readonly<Record<string, unknown>>,
  fields: readonly FormNotificationField[],
  adminOrigin?: string | null,
): NotificationMessage {
  const rows: Array<readonly [string, string]> = []
  add(rows, 'Reference', source.referenceCode)
  add(rows, 'Form', source.formTitle ?? source.title)
  add(rows, 'Form type', source.formType ?? source.type)
  add(rows, 'Submitted at', source.submittedAt ?? source.createdAt)
  const values = source.values && typeof source.values === 'object' && !Array.isArray(source.values)
    ? source.values as Readonly<Record<string, unknown>>
    : {}

  for (const field of fields) {
    if (typeof field.name !== 'string' || typeof field.type !== 'string') continue
    if (!FORM_FIELD_TYPES.has(field.type) || FORBIDDEN_FORM_FIELD.test(field.name)) continue
    const fieldLabel = label(field.label, field.name)
    if (FORBIDDEN_FORM_FIELD.test(fieldLabel)) continue
    add(rows, fieldLabel, values[field.name], field.type === 'email')
  }

  return message(
    'New form submission', rows,
    adminLink(adminOrigin, 'form-submissions', source.id),
  )
}

export function renderNotification(input: RenderNotificationInput): NotificationMessage {
  return input.sourceType === 'admission'
    ? renderAdmissionNotification(input.source, input.adminOrigin)
    : renderFormNotification(input.source, input.formFields ?? [], input.adminOrigin)
}
