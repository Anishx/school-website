import 'server-only'

import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'
import { logOperationalError } from '../errors/log'
import type {
  AnnouncementBarDTO,
  CalendarDTO,
  CalendarRowDTO,
  ClubsDTO,
  ContactDTO,
  DocumentDTO,
  EditorialDTO,
  PublicImageDTO,
  SportsDTO,
  StudentLifeCardDTO,
  WebsiteSettingsDTO,
  ContentSource,
} from './dto'
import { CMS_CACHE_SECONDS, CMS_TAGS, sectionTag } from './cache-tags'

type RecordValue = Record<string, unknown>

function object(value: unknown): RecordValue | null {
  return value && typeof value === 'object' ? value as RecordValue : null
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function id(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}

function array(value: unknown): RecordValue[] {
  return Array.isArray(value) ? value.map(object).filter((entry): entry is RecordValue => entry !== null) : []
}

function lexicalText(value: unknown): string | undefined {
  const root = object(value)?.root
  const parts: string[] = []
  const visit = (node: unknown) => {
    const record = object(node)
    if (!record) return
    if (typeof record.text === 'string') parts.push(record.text)
    if (Array.isArray(record.children)) {
      for (const child of record.children) visit(child)
      if (record.type === 'paragraph' || record.type === 'heading') parts.push('\n')
    }
  }
  visit(root)
  const result = parts.join('').replace(/\n{3,}/g, '\n\n').trim()
  return result || undefined
}

function image(value: unknown, legacyPath?: unknown, altOverride?: unknown, objectPosition?: unknown): PublicImageDTO | undefined {
  const media = object(value)
  const src = text(media?.url) ?? text(legacyPath)
  if (!src) return undefined
  return {
    src,
    alt: text(altOverride) ?? text(media?.alt) ?? '',
    ...(text(objectPosition) ? { objectPosition: text(objectPosition) } : {}),
  }
}

function errorCode(scope: string, cause: unknown): void {
  logOperationalError(cause, { event: 'cms_public_read_failed', context: { scope } })
}

const LEGACY_WEBSITE_SETTINGS: WebsiteSettingsDTO = Object.freeze({
  announcementBar: Object.freeze({ enabled: true, speed: 'normal', theme: 'teal' }),
  contentSources: Object.freeze({
    resourcesNews: 'legacy', resourcesAnnouncements: 'legacy', resourcesDownloads: 'legacy',
    schoolCalendar: 'legacy', mandatoryDisclosure: 'legacy', sports: 'legacy', clubs: 'legacy',
    contact: 'legacy', homepageNews: 'legacy',
  }),
})

function source(value: unknown): ContentSource {
  return value === 'managed' || value === 'append' ? value : 'legacy'
}

async function websiteSettingsRecord(): Promise<WebsiteSettingsDTO> {
  try {
    const payload = await getPayload({ config })
    const raw = await payload.findGlobal({ slug: 'website-settings', overrideAccess: true }) as unknown as RecordValue
    const bar = object(raw.announcementBar)
    const sources = object(raw.contentSources)
    const speed = bar?.speed === 'slow' || bar?.speed === 'fast' ? bar.speed : 'normal'
    const theme = bar?.theme === 'navy' || bar?.theme === 'maroon' ? bar.theme : 'teal'
    return {
      announcementBar: { enabled: bar?.enabled !== false, speed, theme },
      contentSources: {
        resourcesNews: source(sources?.resourcesNews), resourcesAnnouncements: source(sources?.resourcesAnnouncements),
        resourcesDownloads: source(sources?.resourcesDownloads), schoolCalendar: source(sources?.schoolCalendar),
        mandatoryDisclosure: source(sources?.mandatoryDisclosure), sports: source(sources?.sports),
        clubs: source(sources?.clubs), contact: source(sources?.contact), homepageNews: source(sources?.homepageNews),
      },
    }
  } catch (cause) {
    errorCode('website-settings', cause)
    return LEGACY_WEBSITE_SETTINGS
  }
}

async function editorialRecords(): Promise<EditorialDTO[]> {
  try {
    const payload = await getPayload({ config })
    const docs: unknown[] = []
    let page = 1
    while (true) {
      const result = await payload.find({
        collection: 'editorial', overrideAccess: false, depth: 1, limit: 100, page, sort: '-publishAt',
      })
      docs.push(...result.docs)
      if (!result.hasNextPage) break
      page += 1
    }
    return docs.map((raw) => {
      const record = raw as unknown as RecordValue
      const kind: EditorialDTO['kind'] = record.kind === 'event' || record.kind === 'announcement' ? record.kind : 'news'
      return {
        id: id(record.id),
        kind,
        title: text(record.title) ?? '',
        ...(text(record.publicPathKey) || text(record.slug) ? { slug: text(record.publicPathKey) ?? text(record.slug) } : {}),
        ...(text(record.summary) ? { summary: text(record.summary) } : {}),
        ...(lexicalText(record.body) ? { body: lexicalText(record.body) } : {}),
        ...(object(record.body) ? { bodyRichText: object(record.body)! } : {}),
        ...(text(record.message) ? { message: text(record.message) } : {}),
        date: text(record.displayDate) ?? text(record.startsAt) ?? text(record.publishAt) ?? '',
        ...(text(record.category) ? { category: text(record.category) } : {}),
        featured: record.featured === true,
        priority: typeof record.priority === 'number' ? record.priority : 0,
        displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : 0,
        ...(text(record.link) ? { link: text(record.link) } : {}),
        ...(image(record.image, record.legacyImagePath) ? { image: image(record.image, record.legacyImagePath) } : {}),
        placements: Array.isArray(record.placements) ? record.placements.filter((value): value is string => typeof value === 'string') : [],
      }
    }).filter((entry) => entry.title)
  } catch (cause) {
    errorCode('editorial', cause)
    return []
  }
}

async function documentRecords(): Promise<DocumentDTO[]> {
  try {
    const payload = await getPayload({ config })
    const docs: unknown[] = []
    let page = 1
    while (true) {
      const result = await payload.find({ collection: 'documents', overrideAccess: false, depth: 1, limit: 100, page, sort: 'displayOrder' })
      docs.push(...result.docs)
      if (!result.hasNextPage) break
      page += 1
    }
    return docs.flatMap((raw) => {
      const record = raw as unknown as RecordValue
      const pdf = object(record.pdf)
      const href = record.sourceType === 'external'
        ? text(record.externalUrl) ?? text(record.legacyExternalUrl)
        : text(pdf?.url)
      if (!href) return []
      return [{
        id: id(record.id),
        title: text(record.title) ?? '',
        type: text(record.type) ?? '',
        ...(text(record.category) ? { category: text(record.category) } : {}),
        ...(text(record.academicYear) ? { academicYear: text(record.academicYear) } : {}),
        ...(text(record.effectiveDate) ? { effectiveDate: text(record.effectiveDate) } : {}),
        ...(text(record.description) ? { description: text(record.description) } : {}),
        href,
        displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : 0,
        placements: Array.isArray(record.placements) ? record.placements.filter((value): value is string => typeof value === 'string') : [],
      }]
    })
  } catch (cause) {
    errorCode('documents', cause)
    return []
  }
}

async function sectionRecord(key: string): Promise<RecordValue | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'content-sections', overrideAccess: false, depth: 1, limit: 1, pagination: false,
      where: { key: { equals: key } },
    })
    return result.docs[0] as unknown as RecordValue | undefined ?? null
  } catch (cause) {
    errorCode(key, cause)
    return null
  }
}

function rows(value: unknown): CalendarRowDTO[] {
  return array(value).flatMap((row) => {
    const label = text(row.label)
    const rowValue = text(row.value)
    return label && rowValue ? [{ label, value: rowValue, ...(row.emphasis === true ? { emphasis: true } : {}) }] : []
  })
}

function cards(value: unknown): StudentLifeCardDTO[] {
  return array(value).flatMap((card) => {
    const title = text(card.title)
    const description = text(card.description)
    if (!title || !description) return []
    const cardImage = image(card.image, card.legacyImagePath, card.alt, card.objectPosition)
    return [{ key: text(card.itemKey) ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, description, ...(cardImage ? { image: cardImage } : {}) }]
  })
}

export const getEditorial = unstable_cache(editorialRecords, ['cms-editorial'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.editorial] })
export const getDocuments = unstable_cache(documentRecords, ['cms-documents'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.documents] })
export const getWebsiteSettings = unstable_cache(websiteSettingsRecord, ['cms-website-settings'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.settings] })

export async function getAnnouncementBar(): Promise<AnnouncementBarDTO> {
  const [settings, editorial] = await Promise.all([getWebsiteSettings(), getEditorial()])
  const messages = editorial
    .filter((item) => item.kind === 'announcement' && item.placements.includes('header-ticker') && Boolean(item.message))
    .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0) || left.id.localeCompare(right.id))
    .map((item) => ({ id: item.id, text: item.message!, ...(item.link ? { link: item.link } : {}) }))
  return { ...settings.announcementBar, messages }
}

export async function getCalendar(): Promise<CalendarDTO | null> {
  const record = await unstable_cache(() => sectionRecord('resources.school-calendar'), ['cms-calendar'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.sections, sectionTag('resources.school-calendar')] })()
  const calendar = object(record?.calendar)
  if (!record || !calendar) return null
  return {
    heading: text(record.heading) ?? 'School Calendar',
    introduction: text(record.introduction) ?? '',
    academicYear: text(calendar.academicYear),
    termBreaks: rows(calendar.termBreaks), assessments: rows(calendar.assessments),
    gradeXMeetings: rows(calendar.gradeXMeetings), reportMeetings: rows(calendar.reportMeetings),
    specialDays: rows(calendar.specialDays), dailySchedule: rows(calendar.dailySchedule),
    publicHolidays: rows(calendar.publicHolidays),
  }
}

export async function getSports(): Promise<SportsDTO | null> {
  const record = await unstable_cache(() => sectionRecord('student-life.sports'), ['cms-sports'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.sections, sectionTag('student-life.sports')] })()
  const sports = object(record?.sports)
  if (!record || !sports) return null
  return {
    heading: text(record.heading) ?? 'Sports', introduction: text(record.introduction) ?? '',
    philosophy: text(sports.philosophy), coaching: text(sports.coaching), achievements: text(sports.achievements),
    disciplines: array(sports.disciplines).map((entry) => text(entry.name)).filter((value): value is string => Boolean(value)),
    cards: cards(sports.cards),
  }
}

export async function getClubs(): Promise<ClubsDTO | null> {
  const record = await unstable_cache(() => sectionRecord('student-life.clubs'), ['cms-clubs'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.sections, sectionTag('student-life.clubs')] })()
  const clubs = object(record?.clubs)
  if (!record || !clubs) return null
  const flagship = object(clubs.flagship)
  const flagshipImage = image(flagship?.image, flagship?.legacyImagePath, flagship?.alt)
  return {
    heading: text(record.heading) ?? 'Clubs & Activities', introduction: text(record.introduction) ?? '',
    ...(flagship && text(flagship.name) && text(flagship.description) ? { flagship: {
      name: text(flagship.name)!, tagline: text(flagship.tagline), description: text(flagship.description)!,
      ...(flagshipImage ? { image: flagshipImage } : {}),
    } } : {}),
    cards: cards(clubs.cards),
  }
}

export async function getContact(): Promise<ContactDTO | null> {
  const record = await unstable_cache(() => sectionRecord('site.contact'), ['cms-contact'], { revalidate: CMS_CACHE_SECONDS, tags: [CMS_TAGS.sections, sectionTag('site.contact')] })()
  const contact = object(record?.contact)
  if (!record || !contact) return null
  const required = ['address', 'phoneDisplay', 'phoneHref', 'admissionsEmail', 'principalEmail', 'mapEmbedUrl']
  if (required.some((field) => !text(contact[field]))) return null
  return {
    eyebrow: text(contact.eyebrow) ?? 'Get In Touch', heading: text(record.heading) ?? 'Visit Apollo Vidhyalayam',
    description: text(contact.description) ?? "We'd love to hear from you. Reach out or visit us on campus.",
    address: text(contact.address)!, phoneDisplay: text(contact.phoneDisplay)!, phoneHref: text(contact.phoneHref)!,
    admissionsEmail: text(contact.admissionsEmail)!, principalEmail: text(contact.principalEmail)!,
    mapEmbedUrl: text(contact.mapEmbedUrl)!, mapTitle: text(contact.mapTitle) ?? 'Apollo Vidhyalayam Location',
    visitTitle: text(contact.visitTitle) ?? 'Schedule a Campus Tour', visitDescription: text(contact.visitDescription) ?? '',
    ctaLabel: text(contact.ctaLabel) ?? 'Call to arrange a visit', ctaHref: text(contact.ctaHref) ?? text(contact.phoneHref)!,
  }
}
