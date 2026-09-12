import { describe, expect, it, vi } from 'vitest';
import { searchEntries, sitePages } from '../../src/lib/site-pages';
import type { EditorialDTO, WebsiteSettingsDTO } from '../../src/cms/public/dto';
import { legacyNews } from '../../src/cms/public/legacy-resources';

vi.mock('server-only', () => ({}));
vi.mock('../../src/cms/public/loaders', () => ({
  getEditorial: vi.fn(), getDocuments: vi.fn().mockResolvedValue([]), getWebsiteSettings: vi.fn(),
}));

import { getEditorial, getWebsiteSettings } from '../../src/cms/public/loaders';
import { getPublicNews, getSiteSearchEntries } from '../../src/cms/public/site-index';

describe('site search', () => {
  it('handles empty queries and literal punctuation safely', () => {
    expect(searchEntries(sitePages, '  ')).toEqual([]);
    expect(searchEntries(sitePages, '[.*')).toEqual([]);
  });

  it('ranks exact titles first and matches words across fields without case sensitivity', () => {
    expect(searchEntries(sitePages, '  ADMISSIONS  ')[0].href).toBe('/admissions');
    expect(searchEntries(sitePages, 'science mathematics')[0].href).toBe('/student-life?tab=stem');
    expect(searchEntries(sitePages, 'sports nonexistingword')).toEqual([]);
  });

  it.each(['legacy', 'managed', 'append'] as const)('respects %s news source and existing detail routes', async (source) => {
    vi.mocked(getWebsiteSettings).mockResolvedValue({ contentSources: {
      resourcesNews: source, resourcesDownloads: source,
    } } as WebsiteSettingsDTO);
    const managed: EditorialDTO[] = [
      { id: 'cms-1', slug: legacyNews[0].slug, kind: 'news', title: 'Updated school story', date: '', placements: [] },
      { id: 'cms-2', slug: 'science-fair', kind: 'event', title: 'Science Fair', body: 'Student robotics exhibition', date: '', placements: [] },
      { id: 'cms-3', kind: 'news', title: 'No detail route', date: '', placements: [] },
      { id: 'cms-4', kind: 'announcement', title: 'Unplaced notice', date: '', placements: [] },
      { id: 'cms-5', kind: 'announcement', title: 'School notice', date: '', placements: ['resource-announcements'] },
    ];
    vi.mocked(getEditorial).mockResolvedValue(managed);
    const news = await getPublicNews();
    const index = await getSiteSearchEntries();
    expect(news.every((item) => Boolean(item.slug))).toBe(true);
    expect(new Set(news.map((item) => item.slug)).size).toBe(news.length);
    expect(index.some((item) => item.title === 'No detail route' || item.title === 'Unplaced notice')).toBe(false);
    expect(index.some((item) => item.title === 'Science Fair')).toBe(source !== 'legacy');
    expect(index.some((item) => item.title === 'School notice')).toBe(false);
    if (source === 'legacy') expect(news).toEqual(legacyNews);
    else {
      expect(news.find((item) => item.slug === legacyNews[0].slug)?.title).toBe('Updated school story');
      expect(searchEntries(index, 'robotics')[0].href).toBe('/news-events/science-fair');
    }
    if (source === 'managed') expect(news).toHaveLength(2);
  });
});
