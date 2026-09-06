import { ValidationError, type CollectionConfig, type PayloadRequest } from 'payload'

import { canEnterPayloadAdmin } from '../access/roles'
import { contentCreateAccess, publishedContentAccess, setCreatedBy } from '../cms/publication/access'
import { publicationFields } from '../cms/publication/fields'
import { preparePublicationChange } from '../cms/publication/model'
import { afterPublishedContentChange, afterPublishedContentDelete } from '../cms/publication/hooks'
import { assertVerifiedMedia, relationValues } from '../cms/media/publish'

export const CONTENT_SECTION_KEYS = [
  'resources.school-calendar',
  'student-life.sports',
  'student-life.clubs',
  'site.contact',
] as const

const SECTION_OPTIONS = [
  { label: 'Resources: School Calendar', value: 'resources.school-calendar' },
  { label: 'Sports Disciplines', value: 'student-life.sports' },
  { label: 'Clubs & Activities', value: 'student-life.clubs' },
  { label: 'Contact Us', value: 'site.contact' },
] as const

const safeLink = /^(?:\/[^/]|https?:\/\/|mailto:|tel:)/i
const httpsLink = /^https:\/\//i

function validationError(req: PayloadRequest, path: string, message: string): never {
  throw new ValidationError({ collection: 'content-sections', errors: [{ path, message }], req })
}

function hasText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0
}

async function validateSection(data: Record<string, unknown>, req: PayloadRequest): Promise<void> {
  if (!CONTENT_SECTION_KEYS.includes(data.key as never)) {
    validationError(req, 'key', 'Choose a supported website section.')
  }
  const contact = data.contact as Record<string, unknown> | undefined
  for (const field of ['mapEmbedUrl', 'ctaHref']) {
    const value = contact?.[field]
    if (typeof value === 'string' && value && !safeLink.test(value)) {
      validationError(req, `contact.${field}`, 'Use a site path, HTTPS URL, email, or telephone link.')
    }
  }
  if (contact?.mapEmbedUrl && !httpsLink.test(String(contact.mapEmbedUrl))) {
    validationError(req, 'contact.mapEmbedUrl', 'Map embeds must use an HTTPS URL.')
  }

  const readyForPublic = data.publicationState === 'published' || data.publicationState === 'scheduled'
  if (readyForPublic) {
    if (!hasText(data.heading)) validationError(req, 'heading', 'Add a heading before publishing or scheduling this section.')

    switch (data.key) {
      case 'resources.school-calendar': {
        const calendar = data.calendar as Record<string, unknown> | undefined
        const requiredGroups = ['termBreaks', 'assessments', 'gradeXMeetings', 'reportMeetings', 'specialDays', 'dailySchedule', 'publicHolidays']
        if (!hasText(calendar?.academicYear)) validationError(req, 'calendar.academicYear', 'Add the academic year before publishing.')
        for (const group of requiredGroups) {
          if (!hasItems(calendar?.[group])) validationError(req, `calendar.${group}`, 'Add at least one row before publishing.')
        }
        break
      }
      case 'student-life.sports': {
        const sports = data.sports as Record<string, unknown> | undefined
        if (!hasText(sports?.philosophy) || !hasText(sports?.coaching)) validationError(req, 'sports.philosophy', 'Add the sports philosophy and coaching copy before publishing.')
        if (!hasItems(sports?.disciplines) || !hasItems(sports?.cards)) validationError(req, 'sports.disciplines', 'Add at least one discipline and one sports card before publishing.')
        break
      }
      case 'student-life.clubs': {
        const clubs = data.clubs as Record<string, unknown> | undefined
        const flagship = clubs?.flagship as Record<string, unknown> | undefined
        if (!hasText(flagship?.name) || !hasText(flagship?.description)) validationError(req, 'clubs.flagship', 'Add the flagship club name and description before publishing.')
        if (!hasItems(clubs?.cards)) validationError(req, 'clubs.cards', 'Add at least one club or activity before publishing.')
        break
      }
      case 'site.contact':
        if (!hasText(contact?.address) || !hasText(contact?.phoneDisplay) || !hasText(contact?.phoneHref) || !hasText(contact?.admissionsEmail) || !hasText(contact?.principalEmail) || !hasText(contact?.mapEmbedUrl)) {
          validationError(req, 'contact.address', 'Add the address, phone, both email addresses, and map before publishing.')
        }
        if (!String(contact?.phoneHref).toLowerCase().startsWith('tel:')) validationError(req, 'contact.phoneHref', 'The phone link must begin with tel:.')
        break
    }

    for (const relationPath of ['sports.cards.image', 'clubs.flagship.image', 'clubs.cards.image']) {
      for (const value of relationValues(data, relationPath.split('.')).filter(Boolean)) {
        await assertVerifiedMedia(req, value, relationPath, 'image')
      }
    }
  }
}

const calendarRowFields = [
  { name: 'label', type: 'text' as const, required: true, maxLength: 160 },
  { name: 'value', type: 'text' as const, required: true, maxLength: 300 },
  { name: 'emphasis', type: 'checkbox' as const, defaultValue: false },
]

const cardFields = [
  { name: 'itemKey', type: 'text' as const, required: true, maxLength: 80 },
  { name: 'title', type: 'text' as const, required: true, maxLength: 160 },
  { name: 'description', type: 'textarea' as const, required: true, maxLength: 5000 },
  { name: 'image', type: 'relationship' as const, relationTo: 'media' as const },
  { name: 'legacyImagePath', type: 'text' as const, maxLength: 500 },
  { name: 'alt', type: 'text' as const, maxLength: 500 },
  {
    name: 'objectPosition', type: 'select' as const, defaultValue: 'center',
    options: ['center', 'top', 'bottom', 'left', 'right'].map((value) => ({ label: value, value })),
  },
]

export const ContentSections: CollectionConfig = {
  slug: 'content-sections',
  labels: { singular: 'Website Section', plural: 'Website Sections' },
  admin: {
    useAsTitle: 'key',
    group: 'Website Content',
    defaultColumns: ['key', 'publicationState', 'publishAt', 'updatedAt'],
  },
  access: {
    admin: ({ req }) => canEnterPayloadAdmin(req.user),
    create: contentCreateAccess('content-sections'),
    read: publishedContentAccess('content-sections', 'read'),
    update: publishedContentAccess('content-sections', 'update'),
    delete: publishedContentAccess('content-sections', 'delete'),
  },
  versions: { drafts: false, maxPerDoc: 30 },
  fields: [
    {
      name: 'key', type: 'select', required: true, unique: true, index: true,
      options: [...SECTION_OPTIONS],
      admin: { description: 'Stable website placement. Create only one record for each key.' },
    },
    { name: 'heading', type: 'text', maxLength: 160 },
    { name: 'introduction', type: 'textarea', maxLength: 5000 },
    {
      name: 'calendar', type: 'group', label: 'School Calendar',
      admin: { condition: (_, siblingData) => siblingData?.key === 'resources.school-calendar' },
      fields: [
        { name: 'academicYear', type: 'text', maxLength: 20 },
        ...['termBreaks', 'assessments', 'gradeXMeetings', 'reportMeetings', 'specialDays', 'dailySchedule', 'publicHolidays'].map((name) => ({
          name, type: 'array' as const, fields: calendarRowFields,
        })),
        { name: 'calendarDocument', type: 'relationship', relationTo: 'documents' },
      ],
    },
    {
      name: 'sports', type: 'group', label: 'Sports',
      admin: { condition: (_, siblingData) => siblingData?.key === 'student-life.sports' },
      fields: [
        { name: 'philosophy', type: 'textarea', maxLength: 5000 },
        { name: 'coaching', type: 'textarea', maxLength: 5000 },
        { name: 'achievements', type: 'textarea', maxLength: 5000 },
        { name: 'disciplines', type: 'array', fields: [{ name: 'name', type: 'text', required: true, maxLength: 160 }] },
        { name: 'cards', type: 'array', fields: cardFields },
      ],
    },
    {
      name: 'clubs', type: 'group', label: 'Clubs & Activities',
      admin: { condition: (_, siblingData) => siblingData?.key === 'student-life.clubs' },
      fields: [
        {
          name: 'flagship', type: 'group', fields: [
            { name: 'name', type: 'text', maxLength: 160 },
            { name: 'tagline', type: 'text', maxLength: 160 },
            { name: 'description', type: 'textarea', maxLength: 5000 },
            { name: 'image', type: 'relationship', relationTo: 'media' },
            { name: 'legacyImagePath', type: 'text', maxLength: 500 },
            { name: 'alt', type: 'text', maxLength: 500 },
          ],
        },
        { name: 'cards', type: 'array', fields: cardFields },
      ],
    },
    {
      name: 'contact', type: 'group', label: 'Contact Us',
      admin: { condition: (_, siblingData) => siblingData?.key === 'site.contact' },
      fields: [
        { name: 'eyebrow', type: 'text', maxLength: 80 },
        { name: 'description', type: 'textarea', maxLength: 5000 },
        { name: 'address', type: 'textarea', maxLength: 1000 },
        { name: 'phoneDisplay', type: 'text', maxLength: 80 },
        { name: 'phoneHref', type: 'text', maxLength: 100 },
        { name: 'admissionsEmail', type: 'email' },
        { name: 'principalEmail', type: 'email' },
        { name: 'mapEmbedUrl', type: 'text', maxLength: 2000 },
        { name: 'mapTitle', type: 'text', maxLength: 160 },
        { name: 'visitTitle', type: 'text', maxLength: 160 },
        { name: 'visitDescription', type: 'textarea', maxLength: 500 },
        { name: 'ctaLabel', type: 'text', maxLength: 80 },
        { name: 'ctaHref', type: 'text', maxLength: 500 },
      ],
    },
    ...publicationFields,
  ],
  hooks: {
    beforeValidate: [async ({ data, originalDoc, req }) => { await validateSection({ ...(originalDoc as Record<string, unknown> | undefined), ...((data ?? {}) as Record<string, unknown>) }, req); return data }],
    beforeChange: [({ data, operation, originalDoc, req }) => {
      const owned = operation === 'create' ? setCreatedBy(data as Record<string, unknown>, req) : data
      return preparePublicationChange({ data: (owned ?? {}) as Record<string, unknown>, originalDoc, req })
    }],
    afterChange: [({ doc, previousDoc, req }) => afterPublishedContentChange({ collection: 'content-sections', doc, previousDoc, req })],
    afterDelete: [({ doc }) => afterPublishedContentDelete({ collection: 'content-sections', doc })],
  },
}

export default ContentSections
