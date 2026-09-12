import type { MetadataRoute } from 'next';
import { env } from '@/cms/config/env';
import { getPublicNews } from '@/cms/public/site-index';
import { sitePages } from '@/lib/site-pages';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = env.PUBLIC_SITE_ORIGIN ?? 'https://www.apollovidhyalayam.com';
  const news = await getPublicNews();
  const paths = new Set([
    ...sitePages.filter((entry) => !/[?#]/.test(entry.href)).map((entry) => entry.href),
    '/sitemap',
    ...news.filter((item) => item.slug).map((item) => `/news-events/${encodeURIComponent(item.slug!)}`),
  ]);
  return [...paths].map((path) => ({ url: new URL(path, origin).href }));
}
