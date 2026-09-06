import { ValidationError, type CollectionConfig, type PayloadRequest } from 'payload'

import { canEnterPayloadAdmin } from '../access/roles'
import { contentCreateAccess, publishedContentAccess, setCreatedBy } from '../cms/publication/access'
import { publicationFields } from '../cms/publication/fields'
import { preparePublicationChange } from '../cms/publication/model'
import { afterPublishedContentChange, afterPublishedContentDelete } from '../cms/publication/hooks'
import { assertVerifiedMedia } from '../cms/media/publish'

export const EDITORIAL_KINDS = ['news', 'event', 'announcement'] as const
export const EDITORIAL_PLACEMENTS = ['resource-news', 'homepage-news', 'resource-announcements', 'header-ticker'] as const

const KIND_OPTIONS = [
  { label: 'News article', value: 'news' },
  { label: 'School event', value: 'event' },
  { label: 'Announcement', value: 'announcement' },
] as const
const PLACEMENT_OPTIONS = [
  { label: 'Latest News', value: 'resource-news' },
  { label: 'Show in homepage News & Events', value: 'homepage-news' },
  { label: 'Resources: Announcements', value: 'resource-announcements' },
  { label: 'Announcement Bar', value: 'header-ticker' },
] as const

function isSafePublicLink(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true
  return typeof value === 'string' && /^(?:\/(?!\/)|#|https:\/\/)/i.test(value.trim())
}

function error(req: PayloadRequest, path: string, message: string): never {
  throw new ValidationError({ collection: 'editorial', errors: [{ path, message }], req })
}

async function validateEditorial(data: Record<string, unknown>, req: PayloadRequest): Promise<void> {
  const kind = data.kind
  if (!EDITORIAL_KINDS.includes(kind as never)) error(req, 'kind', 'Choose news, event, or announcement.')
  const readyForPublic = data.publicationState === 'published' || data.publicationState === 'scheduled'
  if (!readyForPublic) return
  if ((kind === 'news' || kind === 'event') && (!data.slug || !data.summary || !data.body)) {
    error(req, 'summary', 'News and events require a slug, summary, and body.')
  }
  if (kind === 'announcement' && !data.message) error(req, 'message', 'Announcements require a message.')
  const placements = Array.isArray(data.placements) ? data.placements : []
  if (kind === 'news' && placements.includes('homepage-news') && !placements.includes('resource-news')) {
    error(req, 'placements', 'Homepage news must also be included in Latest News.')
  }
  if (!isSafePublicLink(data.link)) error(req, 'link', 'Use an HTTPS URL, site path, or page anchor.')
  if (kind === 'event') {
    if (!data.startsAt || !data.endsAt || !data.location) error(req, 'startsAt', 'Events require start, end, and location.')
    if (Date.parse(String(data.endsAt)) < Date.parse(String(data.startsAt))) error(req, 'endsAt', 'Event end cannot precede its start.')
  }
  if (data.image) {
    await assertVerifiedMedia(req, data.image, 'image', 'image')
  }
}

export const Editorial: CollectionConfig = {
  slug: 'editorial',
  labels: { singular: 'News or Announcement', plural: 'News & Announcements' },
  admin: { useAsTitle: 'title', group: 'Website Content', defaultColumns: ['title', 'kind', 'publicationState', 'displayOrder'] },
  access: {
    admin: ({ req }) => canEnterPayloadAdmin(req.user),
    create: contentCreateAccess('editorial'),
    read: publishedContentAccess('editorial', 'read'),
    update: publishedContentAccess('editorial', 'update'),
    delete: publishedContentAccess('editorial', 'delete'),
  },
  versions: { drafts: false, maxPerDoc: 30 },
  fields: [
    { name: 'kind', type: 'select', required: true, index: true, options: [...KIND_OPTIONS] },
    { name: 'title', type: 'text', required: true, maxLength: 160 },
    { name: 'slug', type: 'text', index: true, maxLength: 160 },
    { name: 'publicPathKey', type: 'text', unique: true, index: true, maxLength: 160, admin: { description: 'Stable /news-events URL segment.' } },
    { name: 'summary', type: 'textarea', maxLength: 500 },
    { name: 'body', type: 'richText' },
    { name: 'message', type: 'textarea', maxLength: 5000 },
    { name: 'link', type: 'text', maxLength: 2000, label: 'Optional link' },
    { name: 'displayOrder', type: 'number', required: true, defaultValue: 0, index: true, label: 'Display order' },
    { name: 'priority', type: 'number', defaultValue: 0, index: true },
    {
      name: 'placements', type: 'select', hasMany: true, required: true,
      options: [...PLACEMENT_OPTIONS],
      admin: { description: 'Latest News is the complete news list. Select “Show in homepage News & Events” to cherry-pick an item for the landing page.' },
    },
    { name: 'category', type: 'text', maxLength: 160 },
    { name: 'featured', type: 'checkbox', defaultValue: false },
    { name: 'displayDate', type: 'date', index: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'image', type: 'relationship', relationTo: 'media' },
    { name: 'legacyImagePath', type: 'text', maxLength: 500 },
    { name: 'startsAt', type: 'date', index: true },
    { name: 'endsAt', type: 'date' },
    { name: 'location', type: 'text', maxLength: 500 },
    ...publicationFields,
  ],
  hooks: {
    beforeValidate: [async ({ data, originalDoc, req }) => { await validateEditorial({ ...(originalDoc as Record<string, unknown> | undefined), ...((data ?? {}) as Record<string, unknown>) }, req); return data }],
    beforeChange: [({ data, operation, originalDoc, req }) => {
      const input = { ...((data ?? {}) as Record<string, unknown>) }
      if (input.kind !== 'announcement' && input.slug && !input.publicPathKey) input.publicPathKey = input.slug
      const owned = operation === 'create' ? setCreatedBy(input, req) : input
      return preparePublicationChange({ data: (owned ?? {}) as Record<string, unknown>, originalDoc, req })
    }],
    afterChange: [({ doc, previousDoc, req }) => afterPublishedContentChange({ collection: 'editorial', doc, previousDoc, req })],
    afterDelete: [({ doc }) => afterPublishedContentDelete({ collection: 'editorial', doc })],
  },
}

export default Editorial
