import 'server-only';

import { getDocuments, getEditorial, getWebsiteSettings } from './loaders';
import { contentForSource } from './content-source';
import { legacyDownloads, legacyNews } from './legacy-resources';
import { sitePages, type SiteEntry } from '../../lib/site-pages';

// Use only the public loaders: they enforce publication dates and anonymous access.
export async function getPublicNews() {
  const [editorial, settings] = await Promise.all([getEditorial(), getWebsiteSettings()]);
  return contentForSource(settings.contentSources.resourcesNews, legacyNews,
    editorial.filter((item) => item.kind !== 'announcement' && item.slug),
    (item) => item.slug ?? item.id);
}

export async function getSiteSearchEntries(): Promise<SiteEntry[]> {
  const [news, documents, settings] = await Promise.all([
    getPublicNews(), getDocuments(), getWebsiteSettings(),
  ]);
  const downloads = contentForSource(settings.contentSources.resourcesDownloads, legacyDownloads,
    documents.filter((item) => item.placements.includes('downloads')), (item) => item.id);
  return [
    ...sitePages,
    ...news.filter((item) => item.slug).map((item) => ({
      title: item.title, href: `/news-events/${encodeURIComponent(item.slug!)}`,
      description: item.summary ?? item.body ?? '', category: 'News & Events',
      keywords: `${item.body ?? ''} ${item.category ?? ''}`,
    })),
    ...downloads.map((item) => ({ title: item.title, href: '/news-events?tab=downloads',
      description: item.description ?? 'View this document in school downloads.', category: 'Downloads',
      keywords: `${item.category ?? ''} ${item.academicYear ?? ''}` })),
  ];
}
