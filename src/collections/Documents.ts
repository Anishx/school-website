import { ValidationError, type CollectionConfig, type PayloadRequest } from 'payload'

import { canEnterPayloadAdmin } from '../access/roles'
import { contentCreateAccess, publishedContentAccess, setCreatedBy } from '../cms/publication/access'
import { publicationFields } from '../cms/publication/fields'
import { preparePublicationChange } from '../cms/publication/model'
import { afterPublishedContentChange, afterPublishedContentDelete } from '../cms/publication/hooks'
import { assertVerifiedMedia } from '../cms/media/publish'

export const DOCUMENT_TYPES = ['circular', 'holiday_list', 'newsletter', 'general_download', 'mandatory_disclosure'] as const
export const DOCUMENT_PLACEMENTS = ['downloads', 'mandatory-disclosure', 'school-calendar'] as const

const TYPE_OPTIONS = [
  { label: 'Circular', value: 'circular' }, { label: 'Holiday list', value: 'holiday_list' },
  { label: 'Newsletter', value: 'newsletter' }, { label: 'General download', value: 'general_download' },
  { label: 'Mandatory disclosure', value: 'mandatory_disclosure' },
] as const
const PLACEMENT_OPTIONS = [
  { label: 'Resources: Downloads', value: 'downloads' },
  { label: 'Mandatory Disclosure', value: 'mandatory-disclosure' },
  { label: 'Resources: School Calendar', value: 'school-calendar' },
] as const

function validExternalURL(value: unknown): boolean {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && ['drive.google.com', 'docs.google.com'].includes(url.hostname.toLowerCase())
  } catch { return false }
}

async function requirePublishableDocument(data: Record<string, unknown>, req: PayloadRequest): Promise<void> {
  if (data.publicationState !== 'published' && data.publicationState !== 'scheduled') return
  for (const field of ['title', 'type']) {
    if (!data[field]) throw new ValidationError({ collection: 'documents', errors: [{ path: field, message: 'Required before publication.' }], req })
  }
  if (data.type === 'mandatory_disclosure') {
    for (const field of ['academicYear', 'effectiveDate']) {
      if (!data[field]) throw new ValidationError({ collection: 'documents', errors: [{ path: field, message: 'Required for a published mandatory disclosure.' }], req })
    }
  }
  if (data.sourceType === 'external') {
    if (!validExternalURL(data.externalUrl)) throw new ValidationError({ collection: 'documents', errors: [{ path: 'externalUrl', message: 'Use an HTTPS Google Drive or Google Docs URL.' }], req })
  } else {
    if (!data.pdf) throw new ValidationError({ collection: 'documents', errors: [{ path: 'pdf', message: 'Select a verified PDF before publication.' }], req })
    await assertVerifiedMedia(req, data.pdf, 'pdf', 'pdf')
  }
}

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Download or Disclosure', plural: 'Downloads & Disclosures' },
  admin: { useAsTitle: 'title', group: 'Website Content', defaultColumns: ['title', 'type', 'academicYear', 'publicationState', 'displayOrder'] },
  access: {
    admin: ({ req }) => canEnterPayloadAdmin(req.user),
    create: contentCreateAccess('documents'),
    read: publishedContentAccess('documents', 'read'),
    update: publishedContentAccess('documents', 'update'),
    delete: publishedContentAccess('documents', 'delete'),
  },
  versions: { drafts: false, maxPerDoc: 30 },
  fields: [
    { name: 'title', type: 'text', required: true, maxLength: 160 },
    { name: 'type', type: 'select', required: true, index: true, options: [...TYPE_OPTIONS] },
    { name: 'category', type: 'text', maxLength: 160, index: true },
    { name: 'academicYear', type: 'text', maxLength: 20, index: true },
    { name: 'effectiveDate', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'description', type: 'textarea', maxLength: 5000 },
    { name: 'issueNumber', type: 'text', maxLength: 80 },
    { name: 'audience', type: 'text', maxLength: 160 },
    { name: 'displayOrder', type: 'number', required: true, defaultValue: 0, index: true },
    { name: 'placements', type: 'select', hasMany: true, required: true, options: [...PLACEMENT_OPTIONS] },
    {
      name: 'sourceType', type: 'select', required: true, defaultValue: 'upload', label: 'Document source',
      options: [{ label: 'Uploaded PDF', value: 'upload' }, { label: 'External Google document', value: 'external' }],
    },
    { name: 'pdf', type: 'relationship', relationTo: 'media', admin: { condition: (_, siblingData) => siblingData?.sourceType !== 'external' } },
    { name: 'externalUrl', type: 'text', maxLength: 2000, label: 'External document URL', admin: { condition: (_, siblingData) => siblingData?.sourceType === 'external' } },
    { name: 'legacyExternalUrl', type: 'text', maxLength: 2000, admin: { readOnly: true } },
    ...publicationFields,
  ],
  hooks: {
    beforeValidate: [async ({ data, originalDoc, req }) => { await requirePublishableDocument({ ...(originalDoc as Record<string, unknown> | undefined), ...((data ?? {}) as Record<string, unknown>) }, req); return data }],
    beforeChange: [({ data, operation, originalDoc, req }) => {
      const owned = operation === 'create' ? setCreatedBy(data as Record<string, unknown>, req) : data
      return preparePublicationChange({ data: (owned ?? {}) as Record<string, unknown>, originalDoc, req })
    }],
    afterChange: [({ doc, previousDoc, req }) => afterPublishedContentChange({ collection: 'documents', doc, previousDoc, req })],
    afterDelete: [({ doc }) => afterPublishedContentDelete({ collection: 'documents', doc })],
  },
}

export default Documents
