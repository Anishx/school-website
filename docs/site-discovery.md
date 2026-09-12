# Search, sitemap and admin branding

- `/search?q=admissions` searches page titles, descriptions and keywords, plus public news bodies, announcements and download descriptions. Results are ranked by title relevance and paginated in groups of ten. Empty queries and queries with no matches have dedicated messages.
- The header search submits to the results page on desktop and mobile. Escape from the input closes the search and restores focus to its toggle.
- `/sitemap` lists school pages and public news. The footer links to this page. `/sitemap.xml` lists canonical pages and news detail URLs, and `/robots.txt` advertises it. Search results carry a `noindex` directive.
- CMS content uses the existing anonymous-access loaders and follows the legacy, managed or append settings. Legacy resource data is shared with the Resources page in `src/cms/public/legacy-resources.ts`.
- Maintain static page descriptions and search keywords in `src/lib/site-pages.ts` when adding or changing school pages. Search does not crawl rendered page content or PDF contents.
- Set `PUBLIC_SITE_ORIGIN` to the deployment's canonical origin for sitemap and robots URLs. The fallback is `https://www.apollovidhyalayam.com`. The XML sitemap revalidates every 60 seconds.
- The admin login uses `src/components/payload/ApolloLogo.tsx` and the existing `public/apollo-logo.png` asset through Payload's `admin.components.graphics.Logo` setting. Regenerate the import map with `npm run generate:importmap` if the component path changes.

Validation: all 154 unit tests passed, including search ranking and CMS source selection. TypeScript and lint passed. Browser checks verified desktop and mobile header search, focus restoration, result submission, empty results, pagination, footer sitemap navigation, XML and robots responses, and the loaded admin logo with the login fields present.
