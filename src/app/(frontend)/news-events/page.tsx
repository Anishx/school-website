import { Suspense } from "react";

import { getCalendar, getDocuments, getEditorial, getWebsiteSettings } from "@/cms/public/loaders";
import type { DocumentDTO, EditorialDTO } from "@/cms/public/dto";
import { Breadcrumb } from "@/components/breadcrumb";
import { ResourcesClient } from "@/components/resources-client";
import { SiteHeader } from "@/components/site-header";
import eventsData from "@/data/events.json";
import { contentForSource } from "@/cms/public/content-source";

const legacyNews: EditorialDTO[] = eventsData.map((event) => ({
  id: event.id,
  kind: "news",
  title: event.title,
  slug: event.id,
  summary: event.body,
  body: event.body,
  date: event.date,
  category: event.category,
  featured: event.featured,
  image: { src: event.image, alt: event.title },
  placements: ["resource-news", "homepage-news"],
}));

const legacyAnnouncements: EditorialDTO[] = [
  ["Admissions Open for 2025-26 Academic Year", "2025-06-01"],
  ["CBSE Transition — Academic Continuity Update", "2025-05-15"],
  ["New Smart Classrooms Inaugurated", "2025-04-20"],
  ["Parent-Teacher Meeting Schedule Released", "2025-04-10"],
].map(([title, date], index) => ({ id: `legacy-announcement-${index}`, kind: "announcement", title, message: title, date, priority: 0, placements: ["resource-announcements"] }));

const legacyDownloads: DocumentDTO[] = [
  ["Admission Form 2026-27", "https://drive.google.com/file/d/1KIwwqlBwgSkowrojed8ah5-ptV6zA3Vj/view?usp=sharing"],
  ["School Handbook", "https://drive.google.com/file/d/1a_4tnoai3UDgONZXB1tiLBYfSqO0oLA2/view?usp=sharing"],
  ["Fee Structure Document", "https://drive.google.com/file/d/1X1ICvaiOGiyELmTJkxbplkervrpFaWIR/view?usp=drive_link"],
  ["Transport Route Map", "https://drive.google.com/file/d/1MVwR2-uWqU9l-ooO9y2hHrSFR4CzZhmf/view?usp=sharing"],
  ["Academic Calendar 2026-27", "https://drive.google.com/file/d/1r_7rhnhTr_CgCREBr6xuzBU9kedOmIPw/view?usp=drive_link"],
].map(([title, href], index) => ({ id: `legacy-download-${index}`, title, href, type: "general_download", displayOrder: index, placements: ["downloads"] }));

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
