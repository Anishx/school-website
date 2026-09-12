import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { Editorial, EDITORIAL_PLACEMENTS } from '../../src/collections/Editorial'
import { assertVerifiedMedia } from '../../src/cms/media/publish'
import { CONTENT_SOURCE_FIELDS, WebsiteSettings } from '../../src/globals/WebsiteSettings'

vi.mock('../../src/cms/media/publish', () => ({ assertVerifiedMedia: vi.fn() }))

const validate = Editorial.hooks!.beforeValidate![0]
const req = { user: { id: 1, role: 'admin', active: true }, payload: {} } as unknown as PayloadRequest
const article = { kind: 'news', publicationState: 'published', slug: 'school-news', summary: 'Summary', body: { root: {} }, placements: ['resource-news'] }

function check(data: Record<string, unknown>) {
  return validate({ data: { ...article, ...data }, req } as unknown as Parameters<typeof validate>[0])
}

describe('editorial images and placements', () => {
  beforeEach(() => vi.clearAllMocks())

  it('publishes with a linked image without needing an upload', async () => {
    await expect(check({ legacyImagePath: 'https://images.example.com/school.jpg' })).resolves.toBeDefined()
    expect(assertVerifiedMedia).not.toHaveBeenCalled()
  })

  it('uses the HTTPS link when an old upload is also selected', async () => {
    await check({ legacyImagePath: 'https://images.example.com/school.jpg', image: 42 })
    expect(assertVerifiedMedia).not.toHaveBeenCalled()
  })

  it('still verifies an uploaded image when no external image is selected', async () => {
    await check({ image: 42, legacyImagePath: '/images/old.jpg' })
    expect(assertVerifiedMedia).toHaveBeenCalledWith(req, 42, 'image', 'image')
  })

  it('rejects invalid image links even in drafts', async () => {
    await expect(check({ publicationState: 'draft', legacyImagePath: 'javascript:alert(1)' })).rejects.toThrow()
  })

  it('keeps the header ticker but removes Resources announcement controls', () => {
    expect(EDITORIAL_PLACEMENTS).toContain('header-ticker')
    expect(EDITORIAL_PLACEMENTS).not.toContain('resource-announcements')
    expect(CONTENT_SOURCE_FIELDS.map(([name]) => name)).not.toContain('resourcesAnnouncements')
    const sources = WebsiteSettings.fields.find((field) => 'name' in field && field.name === 'contentSources')
    if (!sources || !('fields' in sources)) throw new Error('Missing content sources group')
    const retired = sources.fields.find((field) => 'name' in field && field.name === 'resourcesAnnouncements')
    expect(retired?.admin && 'hidden' in retired.admin && retired.admin.hidden).toBe(true)
  })

  it('allows existing header announcements to shed the retired placement when edited', async () => {
    const result = await check({ kind: 'announcement', message: 'School update', placements: ['header-ticker', 'resource-announcements'] })
    expect(result.placements).toEqual(['header-ticker'])
  })
})
