import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { canManageAllContent } from '../access/roles'
import { logOperationalError } from '../cms/errors/log'
import { CMS_TAGS } from '../cms/public/cache-tags'
import { DEFAULT_LOGIN_ENTRIES, validateLoginLink } from '../cms/public/login-menu'

export const CONTENT_SOURCE_FIELDS = [
  ['resourcesNews', 'Resources: News & Events'],
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
      name: 'loginMenu', type: 'group', label: 'Login Button & Dropdown',
      admin: { description: 'Customize the website header login menu. Add, reorder, hide or delete entries. The button is hidden when no visible entries remain.' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Show login button' },
        { name: 'label', type: 'text', defaultValue: 'Login', required: true, maxLength: 40, label: 'Button label' },
        { name: 'customized', type: 'checkbox', defaultValue: false, admin: { hidden: true } },
        {
          name: 'entries', type: 'array', label: 'Dropdown entries', defaultValue: DEFAULT_LOGIN_ENTRIES,
          labels: { singular: 'Entry', plural: 'Entries' },
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Show this entry' },
            { name: 'label', type: 'text', required: true, maxLength: 60, label: 'Entry label' },
            { name: 'href', type: 'text', maxLength: 2000, label: 'Link', validate: validateLoginLink,
              hooks: { beforeValidate: [({ value }) => typeof value === 'string' ? value.trim() : value] },
              admin: { description: 'HTTPS URL, site path (such as /admin), or page anchor. Leave blank to show the label without a link.' } },
            { name: 'newTab', type: 'checkbox', defaultValue: false, label: 'Open link in a new tab' },
          ],
        },
      ],
    },
    {
      name: 'announcementBar',
      type: 'group',
      label: 'Announcement Bar',
      admin: { description: 'To display the bar, publish an Announcement in News & Announcements with a message and the Announcement Bar placement. Enabling this switch shows those published messages; the bar stays hidden when there are none.' },
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
      fields: [...CONTENT_SOURCE_FIELDS.map(([name, label]) => ({
        name,
        label,
        type: 'select' as const,
        required: true,
        defaultValue: 'legacy',
        options: sourceOptions,
      })), {
        // Preserve the stored column without exposing the retired Resources control.
        name: 'resourcesAnnouncements', type: 'select', required: true,
        defaultValue: 'legacy', options: sourceOptions,
        admin: { hidden: true },
      }],
    },
  ],
  hooks: {
    afterRead: [({ doc }) => {
      // Present the existing menu in the editor until it has first been saved.
      if (doc.loginMenu && doc.loginMenu.customized !== true) {
        doc.loginMenu.entries = DEFAULT_LOGIN_ENTRIES.map((entry) => ({ ...entry }))
      }
      return doc
    }],
    beforeChange: [({ data }) => {
      if (data?.loginMenu && Object.prototype.hasOwnProperty.call(data.loginMenu, 'entries')) {
        data.loginMenu.customized = true
      }
      return data
    }],
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
