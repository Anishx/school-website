import type { MetadataRoute } from 'next';
import { env } from '@/cms/config/env';

export default function robots(): MetadataRoute.Robots {
  const origin = env.PUBLIC_SITE_ORIGIN ?? 'https://www.apollovidhyalayam.com';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: new URL('/sitemap.xml', origin).href,
  };
}
