import 'server-only';

import { getCalendar, getClubs, getContact, getDocuments, getEditorial, getSports, getWebsiteSettings } from './loaders';
import { contentForSource } from './content-source';
import { legacyDownloads, legacyNews } from './legacy-resources';
import { sitePages, type SiteEntry } from '../../lib/site-pages';
import pageContent from '../../data/page-search-content.json';
import { studentLifeContent } from './student-life-content';
import { STUDENT_LIFE_TABS, studentLifeVisibilityFromRecord } from './student-life';
import { calendarContent } from './calendar-content';
import { legacyDisclosureDocuments } from './disclosure-content';

// Index display text only, never media URLs, class names or internal identifiers.
function displayText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(displayText).filter(Boolean).join('\n');
  if (!value || typeof value !== 'object') return '';
  return Object.entries(value).filter(([key]) => !['image', 'color', 'objectPosition', 'key', 'id', 'href'].includes(key))
    .map(([, item]) => displayText(item)).filter(Boolean).join('\n');
}

// Use only the public loaders: they enforce publication dates and anonymous access.
export async function getPublicNews() {
  const [editorial, settings] = await Promise.all([getEditorial(), getWebsiteSettings()]);
  return contentForSource(settings.contentSources.resourcesNews, legacyNews,
    editorial.filter((item) => item.kind !== 'announcement' && item.slug),
    (item) => item.slug ?? item.id);
}

export async function getSiteSearchEntries(): Promise<SiteEntry[]> {
  const [news, documents, settings, sports, clubs, calendar, contact] = await Promise.all([
    getPublicNews(), getDocuments(), getWebsiteSettings(), getSports(), getClubs(), getCalendar(), getContact(),
  ]);
  const downloads = contentForSource(settings.contentSources.resourcesDownloads, legacyDownloads,
    documents.filter((item) => item.placements.includes('downloads')), (item) => item.id);
  const visibility = studentLifeVisibilityFromRecord(settings.studentLife);
  const tabs = studentLifeContent(sports, clubs, settings.contentSources.sports ?? 'legacy', settings.contentSources.clubs ?? 'legacy');
  const staticContent: Record<string, string> = pageContent;
  const pages = sitePages.flatMap((entry): SiteEntry[] => {
    const tabIndex = STUDENT_LIFE_TABS.findIndex(({ key }) => entry.href === `/student-life?tab=${key}`);
    if (tabIndex >= 0) {
      if (!visibility[STUDENT_LIFE_TABS[tabIndex].key]) return [];
      const tab = tabs[tabIndex];
      return [{ ...entry, title: tab.label, description: tab.intro || entry.description, keywords: '', content: displayText(tab) }];
    }
    if (entry.href === '/news-events?tab=calendar') {
      const source = settings.contentSources.schoolCalendar ?? 'legacy';
      return [{ ...entry, content: displayText([
        source === 'managed' ? calendar?.heading : entry.title,
        source === 'managed' ? calendar?.introduction : entry.description,
        calendarContent(calendar, source),
      ]) }];
    }
    if (entry.href === '/mandatory-public-disclosure') {
      const visible = contentForSource(settings.contentSources.mandatoryDisclosure ?? 'legacy', legacyDisclosureDocuments,
        documents.filter((item) => item.placements.includes('mandatory-disclosure')), (item) => item.title);
      return [{ ...entry, content: visible.map((item) => item.title).join('\n') }];
    }
    if (entry.href === '/#contact') {
      // ContactSection uses published CMS contact when present, otherwise legacy.
      if (!contact && settings.contentSources.contact === 'managed') return [];
      return [{ ...entry, content: contact ? [contact.eyebrow, contact.heading, contact.description,
        contact.address, contact.phoneDisplay, contact.admissionsEmail, contact.visitTitle,
        contact.visitDescription, contact.ctaLabel].join('\n') : staticContent['legacy-contact'] }];
    }
    return [{ ...entry, content: staticContent[entry.href] ?? '' }];
  });
  return [
    ...pages,
    ...news.filter((item) => item.slug).map((item) => ({
      title: item.title, href: `/news-events/${encodeURIComponent(item.slug!)}`,
      description: item.summary ?? item.body ?? '', category: 'News & Events',
      keywords: `${item.body ?? ''} ${item.category ?? ''}`,
      content: item.body ?? item.summary ?? '',
    })),
    ...downloads.map((item) => ({ title: item.title, href: '/news-events?tab=downloads',
      description: item.description ?? 'View this document in school downloads.', category: 'Downloads',
      keywords: `${item.category ?? ''} ${item.academicYear ?? ''}` })),
  ];
}
