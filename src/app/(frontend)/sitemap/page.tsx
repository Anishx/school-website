import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { sitePages } from '@/lib/site-pages';
import { getPublicNews } from '@/cms/public/site-index';

export const metadata: Metadata = { title: 'Sitemap | Apollo Vidhyalayam', description: 'Explore all pages and news from Apollo Vidhyalayam.' };

export default async function SitemapPage() {
  const news = await getPublicNews();
  const groups = ['School', 'Admissions', 'Student Life', 'Resources'];
  return <>
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-teal-900 py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="font-display text-4xl uppercase text-white md:text-5xl">Sitemap</h1>
          <p className="mt-4 text-white/80">Explore our school, admissions, student life and resources.</p>
        </div>
      </section>
      <nav aria-label="Website sitemap" className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => <div key={group} className="min-w-0 rounded-xl border border-line-200 border-t-4 border-t-teal-800 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-ink-900">{group}</h2>
            <ul className="mt-4 space-y-3">{sitePages.filter((entry) => entry.category === group).map((entry) => <li key={entry.href}>
              <Link href={entry.href} className="text-teal-800 hover:underline">{entry.title}</Link>
            </li>)}</ul>
          </div>)}
        </div>
        {news.length > 0 && <div className="mt-8 rounded-xl border border-line-200 border-t-4 border-t-teal-800 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl text-ink-900">News &amp; Events</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{news.filter((item) => item.slug).map((item) => <li key={item.slug}>
            <Link href={`/news-events/${encodeURIComponent(item.slug!)}`} className="text-teal-800 hover:underline">{item.title}</Link>
          </li>)}</ul>
        </div>}
        <div className="mt-10 flex gap-6 border-t border-line-200 pt-6 text-sm text-teal-800">
          <Link href="/search" className="hover:underline">Search the website</Link>
          <a href="/sitemap.xml" className="hover:underline">XML sitemap</a>
        </div>
      </nav>
    </main>
  </>;
}
