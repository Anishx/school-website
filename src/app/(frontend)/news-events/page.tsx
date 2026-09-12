import { Suspense } from "react";

import { getCalendar, getDocuments, getEditorial, getWebsiteSettings } from "@/cms/public/loaders";
import { legacyNews, legacyAnnouncements, legacyDownloads } from "@/cms/public/legacy-resources";
import { Breadcrumb } from "@/components/breadcrumb";
import { ResourcesClient } from "@/components/resources-client";
import { SiteHeader } from "@/components/site-header";
import { contentForSource } from "@/cms/public/content-source";


export default async function NewsEventsPage() {
  const [editorial, documents, calendar, settings] = await Promise.all([getEditorial(), getDocuments(), getCalendar(), getWebsiteSettings()]);
  const news = editorial.filter((item) => item.kind === "news" && item.placements.includes("resource-news"));
  const announcements = editorial.filter((item) => item.kind === "announcement" && item.placements.includes("resource-announcements"));
  const downloads = documents.filter((item) => item.placements.includes("downloads"));

  return <>
    <SiteHeader />
    <main className="flex-1">
      <section className="bg-teal-900 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <Breadcrumb />
          <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">Resources</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">The latest happenings, announcements, calendar, and resources from Apollo Vidhyalayam.</p>
        </div>
      </section>
      <Suspense fallback={null}>
        <ResourcesClient
          news={contentForSource(settings.contentSources.resourcesNews, legacyNews, news, (item) => item.slug ?? item.id)}
          announcements={contentForSource(settings.contentSources.resourcesAnnouncements, legacyAnnouncements, announcements, (item) => item.id)}
          documents={contentForSource(settings.contentSources.resourcesDownloads, legacyDownloads, downloads, (item) => item.id)}
          calendar={settings.contentSources.schoolCalendar !== "legacy" ? (calendar ?? { heading: "School Calendar", introduction: "", termBreaks: [], assessments: [], gradeXMeetings: [], reportMeetings: [], specialDays: [], dailySchedule: [], publicHolidays: [] }) : null}
          calendarSource={settings.contentSources.schoolCalendar}
        />
      </Suspense>
    </main>
  </>;
}
