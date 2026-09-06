"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";

import type { CalendarDTO, ContentSource, DocumentDTO, EditorialDTO } from "@/cms/public/dto";
import { SchoolCalendarTab } from "@/components/school-calendar-tab";

const tabs = ["Latest News", "Announcements", "School Calendar", "Downloads"];
const tabMap: Record<string, number> = { latest: 0, announcements: 1, calendar: 2, holidays: 2, downloads: 3 };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ResourcesClient({ news, announcements, documents, calendar, calendarSource }: {
  news: readonly EditorialDTO[];
  announcements: readonly EditorialDTO[];
  documents: readonly DocumentDTO[];
  calendar?: CalendarDTO | null;
  calendarSource: ContentSource;
}) {
  const searchParams = useSearchParams();
  const selected = searchParams.get("tab");
  const [active, setActive] = useState(() => selected && tabMap[selected] !== undefined ? tabMap[selected] : 0);
  useEffect(() => {
    if (!selected || tabMap[selected] === undefined) return;
    const timer = window.setTimeout(() => setActive(tabMap[selected]), 0);
    return () => window.clearTimeout(timer);
  }, [selected]);

  return <>
    <div className="bg-teal-900 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 py-4 md:gap-4" role="tablist" aria-label="Resources">
          {tabs.map((tab, index) => <button key={tab} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 md:px-4 md:text-sm ${active === index ? "bg-yellow-500 text-ink-900" : "text-white/80 hover:text-white"}`}>{tab}</button>)}
        </div>
      </div>
    </div>
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {active === 0 && <NewsList items={news} />}
        {active === 1 && <AnnouncementList items={announcements} />}
        {active === 2 && <SchoolCalendarTab data={calendar} source={calendarSource} />}
        {active === 3 && <DownloadList items={documents} />}
      </div>
    </section>
  </>;
}

function NewsList({ items }: { items: readonly EditorialDTO[] }) {
  return <><h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Latest News</h2><div className="mt-8"><hr className="border-line-200" />{items.map((item, index) => <div key={item.id}><Link href={`/news-events/${item.slug}`} className="flex items-center gap-4 py-5 transition-colors hover:bg-canvas-50 md:gap-6 md:py-6"><span className="hidden w-12 shrink-0 text-sm font-semibold text-ink-400 md:block">{String(index + 1).padStart(2, "0")}</span>{item.image && <div className="relative h-16 w-24 shrink-0 overflow-hidden md:h-20 md:w-32"><Image src={item.image.src} alt={item.image.alt || item.title} fill className="object-cover" sizes="128px" /></div>}<div className="flex-1"><span className="block text-xs font-semibold text-teal-800">{item.category ?? "News"}</span><h3 className="mt-0.5 text-base font-semibold text-ink-900 md:text-lg">{item.title}</h3><span className="mt-1 block text-xs text-ink-500">{formatDate(item.date)}</span></div></Link><hr className="border-line-200" /></div>)}</div></>;
}

function AnnouncementList({ items }: { items: readonly EditorialDTO[] }) {
  return <><h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Announcements</h2><div className="mt-8 space-y-4">{items.map((item) => <div key={item.id} className="border border-line-200 p-5 flex items-center justify-between"><div><h3 className="text-sm font-bold text-ink-900">{item.message ?? item.title}</h3>{item.date && <p className="mt-1 text-xs text-ink-500">{formatDate(item.date)}</p>}</div><span className="text-xs font-semibold text-teal-800">NEW</span></div>)}</div></>;
}

function DownloadList({ items }: { items: readonly DocumentDTO[] }) {
  return <><h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Downloads</h2><p className="mt-3 text-sm text-ink-600">Admission forms, School Handbook, and other resources.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 border border-line-200 p-5 transition hover:shadow-md hover:border-teal-800/30"><Download className="size-5 shrink-0 text-teal-800" /><div><h3 className="text-sm font-bold text-ink-900">{item.title}</h3><p className="mt-0.5 text-xs text-ink-500">PDF</p></div></a>)}</div></>;
}
