import { beforeEach, describe, expect, it, vi } from 'vitest';
import { searchEntries, searchExcerpt, sitePages } from '../../src/lib/site-pages';
import type { EditorialDTO, WebsiteSettingsDTO } from '../../src/cms/public/dto';
import { legacyNews } from '../../src/cms/public/legacy-resources';
import { studentLifeVisibilityFromRecord } from '../../src/cms/public/student-life';

vi.mock('server-only', () => ({}));
vi.mock('../../src/cms/public/loaders', () => ({
  getEditorial: vi.fn(), getDocuments: vi.fn().mockResolvedValue([]), getWebsiteSettings: vi.fn(),
  getSports: vi.fn(), getClubs: vi.fn(), getCalendar: vi.fn(), getContact: vi.fn(),
}));

import { getCalendar, getClubs, getContact, getDocuments, getEditorial, getSports, getWebsiteSettings } from '../../src/cms/public/loaders';
import { getPublicNews, getSiteSearchEntries } from '../../src/cms/public/site-index';

describe('site search', () => {
  beforeEach(() => {
    vi.mocked(getEditorial).mockResolvedValue([]);
    vi.mocked(getDocuments).mockResolvedValue([]);
    vi.mocked(getSports).mockResolvedValue(null);
    vi.mocked(getClubs).mockResolvedValue(null);
    vi.mocked(getCalendar).mockResolvedValue(null);
    vi.mocked(getContact).mockResolvedValue(null);
    vi.mocked(getWebsiteSettings).mockResolvedValue({
      studentLife: studentLifeVisibilityFromRecord(undefined),
      contentSources: { resourcesNews: 'legacy', resourcesDownloads: 'legacy', sports: 'legacy', clubs: 'legacy', schoolCalendar: 'legacy', mandatoryDisclosure: 'legacy', contact: 'legacy', homepageNews: 'legacy' },
    } as WebsiteSettingsDTO);
  });

  it.each([
    ['Emergency Oxygen Producer', '/student-life?tab=stem'],
    ['self-defence', '/student-life?tab=clubs'],
    ['Chetana', '/student-life?tab=leadership'],
    ['Sireesha', '/about-us'],
    ['Hindi Sanskrit', '/about-us?tab=teachers'],
    ['Composite Science Lab', '/about-us?tab=infrastructure'],
    ['Pongal', '/news-events?tab=calendar'],
    ['Water Test Report', '/mandatory-public-disclosure'],
    ['PremAnand', '/our-management'],
    ['Municipal panchayat', '/admissions'],
  ])('finds page content for %s and links to its page or tab', async (query, href) => {
    const results = searchEntries(await getSiteSearchEntries(), query);
    expect(results.some((entry) => entry.href === href)).toBe(true);
  });

  it('does not index hidden Student Life tabs', async () => {
    const settings = await getWebsiteSettings();
    vi.mocked(getWebsiteSettings).mockResolvedValue({ ...settings, studentLife: studentLifeVisibilityFromRecord({ achievements: false, stem: false }) });
    const entries = await getSiteSearchEntries();
    expect(entries.some((entry) => /tab=(achievements|stem)$/.test(entry.href))).toBe(false);
    const results = searchEntries(entries, 'Emergency Oxygen Producer');
    expect(results.some((entry) => entry.href.startsWith('/student-life'))).toBe(false);
    // The same words in a separately published news article remain searchable.
    expect(results.some((entry) => entry.href === '/news-events/space-day-winner-2025')).toBe(true);
  });

  it.each(['legacy', 'managed', 'append'] as const)('matches the %s sports content shown on the page', async (source) => {
    const settings = await getWebsiteSettings();
    vi.mocked(getWebsiteSettings).mockResolvedValue({ ...settings, contentSources: { ...settings.contentSources, sports: source } });
    vi.mocked(getSports).mockResolvedValue({ heading: 'Sports', introduction: 'New coaching programme', disciplines: [], cards: [
      { key: 'athletics', title: 'Athletics', description: 'Javelin practice with our coaches' },
    ] });
    const entries = await getSiteSearchEntries();
    const sports = entries.filter((entry) => entry.href === '/student-life?tab=sports');
    expect(searchEntries(sports, 'Javelin')).toHaveLength(source === 'legacy' ? 0 : 1);
    expect(searchEntries(sports, 'shot put')).toHaveLength(source === 'legacy' ? 1 : 0);
    expect(searchEntries(sports, 'Tennikoit')).toHaveLength(source === 'managed' ? 0 : 1);
  });

  it('does not restore legacy content when managed sections are empty', async () => {
    const settings = await getWebsiteSettings();
    vi.mocked(getWebsiteSettings).mockResolvedValue({ ...settings, contentSources: { ...settings.contentSources, sports: 'managed', clubs: 'managed', schoolCalendar: 'managed', mandatoryDisclosure: 'managed', contact: 'managed' } });
    const entries = await getSiteSearchEntries();
    expect(entries.find((entry) => entry.href === '/student-life?tab=sports')?.content).not.toContain('shot put');
    expect(entries.find((entry) => entry.href === '/student-life?tab=clubs')?.content).not.toContain('self-defence');
    expect(searchEntries(entries, 'Pongal')).toEqual([]);
    expect(searchEntries(entries, 'Water Test Report')).toEqual([]);
    expect(entries.some((entry) => entry.href === '/#contact')).toBe(false);
  });

  it('shows the matching passage even when it is deep within a page', () => {
    const entry = { ...sitePages[0], content: `${'Opening information. '.repeat(40)}Unique searchable passage at the end.` };
    const excerpt = searchExcerpt(entry, 'unique');
    expect(excerpt).toContain('Unique searchable passage');
    expect(excerpt.startsWith('…')).toBe(true);
    expect(excerpt.length).toBeLessThanOrEqual(222);
  });
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
