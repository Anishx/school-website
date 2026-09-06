import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { canManageAllContent } from '../access/roles'
import { logOperationalError } from '../cms/errors/log'
import { CMS_TAGS } from '../cms/public/cache-tags'

export const CONTENT_SOURCE_FIELDS = [
  ['resourcesNews', 'Resources: News & Events'],
  ['resourcesAnnouncements', 'Resources: Announcements'],
  ['resourcesDownloads', 'Resources: Downloads'],
  ['schoolCalendar', 'Resources: School Calendar'],
  ['mandatoryDisclosure', 'Mandatory Disclosure'],
  ['sports', 'Sports Disciplines'],
  ['clubs', 'Clubs & Activities'],
  ['contact', 'Contact Us'],
  ['homepageNews', 'Homepage: News & Events'],
] as const

const sourceOptions = [
  { label: 'Existing website content', value: 'legacy' },
  { label: 'Existing content + CMS additions', value: 'append' },
  { label: 'CMS managed content', value: 'managed' },
]

export const WebsiteSettings: GlobalConfig = {
  slug: 'website-settings',
  label: 'Website Settings',
  admin: {
    group: 'Website Content',
    description: 'Control the announcement bar and choose which reviewed CMS areas are live on the website.',
  },
  access: {
    read: () => true,
    update: ({ req }) => canManageAllContent(req.user),
  },
  fields: [
    {
      name: 'announcementBar',
      type: 'group',
      label: 'Announcement Bar',
      fields: [
        { name: 'enabled', type: 'checkbox', required: true, defaultValue: true, label: 'Show announcement bar' },
        {
          name: 'speed', type: 'select', required: true, defaultValue: 'normal',
          options: [
            { label: 'Slow', value: 'slow' },
            { label: 'Normal', value: 'normal' },
            { label: 'Fast', value: 'fast' },
          ],
        },
        {
          name: 'theme', type: 'select', required: true, defaultValue: 'teal',
          options: [
            { label: 'School teal', value: 'teal' },
            { label: 'Navy', value: 'navy' },
            { label: 'Maroon', value: 'maroon' },
          ],
        },
      ],
    },
    {
      name: 'contentSources',
      type: 'group',
      label: 'Website Content Sources',
      admin: { description: 'Keep existing content, add CMS content alongside it, or replace it after migrated drafts have been reviewed and published.' },
      fields: CONTENT_SOURCE_FIELDS.map(([name, label]) => ({
        name,
        label,
        type: 'select' as const,
        required: true,
        defaultValue: 'legacy',
        options: sourceOptions,
      })),
    },
  ],
  hooks: {
    afterChange: [({ doc }) => {
      try {
        revalidateTag(CMS_TAGS.settings, { expire: 0 })
      } catch (error) {
        logOperationalError(error, { event: 'cms_cache_invalidation_failed', context: { global: 'website-settings' } })
      }
      return doc
    }],
  },
}

export default WebsiteSettings
