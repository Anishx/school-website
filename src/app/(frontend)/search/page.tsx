import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { getSiteSearchEntries } from '@/cms/public/site-index';
import { searchEntries, searchExcerpt } from '@/lib/site-pages';

export const metadata: Metadata = {
  title: 'Search | Apollo Vidhyalayam',
  robots: { index: false, follow: true },
};

const PAGE_SIZE = 10;

export default async function SearchPage({ searchParams }: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = (typeof params.q === 'string' ? params.q : '').trim().slice(0, 200);
  const results = query ? searchEntries(await getSiteSearchEntries(), query) : [];
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const requestedPage = typeof params.page === 'string' ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requestedPage) ? Math.min(pageCount, Math.max(1, requestedPage)) : 1;
  const pageHref = (value: number) => `/search?${new URLSearchParams({ q: query, page: String(value) })}`;

  return <>
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-teal-900 py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="font-display text-4xl uppercase text-white md:text-5xl">Search</h1>
          <p className="mt-4 text-white/80">Find school information, news and downloads.</p>
          <form role="search" aria-label="Search results" action="/search" method="get" className="mt-6">
            <label htmlFor="search-query" className="mb-2 block text-sm font-semibold text-white">Search the website</label>
            <div className="flex gap-2">
              <input key={query} id="search-query" type="search" name="q" defaultValue={query} required maxLength={200}
                placeholder="Try admissions, sports or calendar" className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 text-ink-900" />
              <button type="submit" className="rounded-lg bg-white px-5 py-3 font-semibold text-teal-900 hover:bg-canvas-100">Search</button>
            </div>
          </form>
        </div>
      </section>
      <section aria-label="Search results" className="mx-auto max-w-4xl px-6 py-12">
        {!query ? <p className="text-ink-600">Enter a word or phrase to search the website.</p> : <>
          <h2 className="break-words text-xl font-semibold text-ink-900">{results.length} {results.length === 1 ? 'result' : 'results'} for “{query}”</h2>
          {results.length === 0 ? <p className="mt-4 text-ink-600">Try a different keyword or browse the <Link className="font-semibold text-teal-800 underline" href="/sitemap">sitemap</Link>.</p> : <>
            <ul className="mt-6 divide-y divide-line-200">
              {results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((entry) => <li key={`${entry.href}-${entry.title}`} className="py-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">{entry.category}</p>
                <h3 className="mt-1 text-xl font-semibold"><Link href={entry.href} className="text-ink-900 hover:text-teal-800 hover:underline">{entry.title}</Link></h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{searchExcerpt(entry, query)}</p>
              </li>)}
            </ul>
            {pageCount > 1 && <nav aria-label="Search pagination" className="mt-8 flex items-center justify-between gap-4 text-sm text-teal-800">
              {page > 1 ? <Link href={pageHref(page - 1)} className="font-semibold underline">Previous</Link> : <span />}
              <span>Page {page} of {pageCount}</span>
              {page < pageCount ? <Link href={pageHref(page + 1)} className="font-semibold underline">Next</Link> : <span />}
            </nav>}
          </>}
        </>}
      </section>
    </main>
  </>;
}
