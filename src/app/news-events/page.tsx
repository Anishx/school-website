"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import Image from "next/image";
import Link from "next/link";
import eventsData from "@/data/events.json";
import { Download } from "lucide-react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  category: string;
  featured: boolean;
  image: string;
};

const events: EventItem[] = eventsData as EventItem[];
const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const tabList = ["Latest News", "Announcements", "Circulars", "Holiday List", "Downloads", "Newsletter"];

export default function NewsEventsPage() {
  return (
    <Suspense fallback={null}>
      <NewsEventsContent />
    </Suspense>
  );
}

function NewsEventsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const tabMap: Record<string, number> = {
    latest: 0,
    announcements: 1,
    circulars: 2,
    holidays: 3,
    downloads: 4,
    newsletter: 5,
  };

  const [activeTab, setActiveTab] = useState(() => {
    return tabParam && tabMap[tabParam] !== undefined ? tabMap[tabParam] : 0;
  });

  useEffect(() => {
    if (tabParam && tabMap[tabParam] !== undefined) {
      setActiveTab(tabMap[tabParam]);
    }
  }, [tabParam]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Resources
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              The latest happenings, circulars, and resources from Apollo Vidhyalayam.
            </p>
          </div>
        </section>

        {/* Tabs bar */}
        <div className="bg-teal-900 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-center justify-center gap-2 py-4 md:gap-4">
              {tabList.map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 md:px-4 md:text-sm ${
                    activeTab === idx
                      ? "bg-yellow-500 text-ink-900"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {activeTab === 0 && <LatestNewsTab />}
            {activeTab === 1 && <AnnouncementsTab />}
            {activeTab === 2 && <CircularsTab />}
            {activeTab === 3 && <HolidayListTab />}
            {activeTab === 4 && <DownloadsTab />}
            {activeTab === 5 && <NewsletterTab />}
          </div>
        </section>
      </main>
    </>
  );
}

function LatestNewsTab() {
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Latest News</h2>
      <div className="mt-8">
        <hr className="border-line-200" />
        {sortedEvents.map((event, index) => (
          <div key={event.id}>
            <Link href={`/news-events/${event.id}`} className="flex items-center gap-4 py-5 transition-colors hover:bg-canvas-50 md:gap-6 md:py-6">
              <span className="hidden w-12 shrink-0 text-sm font-semibold text-ink-400 md:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative h-16 w-24 shrink-0 overflow-hidden md:h-20 md:w-32">
                <Image src={event.image} alt={event.title} fill className="object-cover" sizes="128px" />
              </div>
              <div className="flex-1">
                <span className="block text-xs font-semibold text-teal-800">{event.category}</span>
                <h3 className="mt-0.5 text-base font-semibold text-ink-900 md:text-lg">{event.title}</h3>
                <span className="mt-1 block text-xs text-ink-500">{formatDate(event.date)}</span>
              </div>
            </Link>
            <hr className="border-line-200" />
          </div>
        ))}
      </div>
    </>
  );
}

function AnnouncementsTab() {
  const announcements = [
    { title: "Admissions Open for 2025-26 Academic Year", date: "2025-06-01" },
    { title: "CBSE Transition — Academic Continuity Update", date: "2025-05-15" },
    { title: "New Smart Classrooms Inaugurated", date: "2025-04-20" },
    { title: "Parent-Teacher Meeting Schedule Released", date: "2025-04-10" },
  ];
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Announcements</h2>
      <div className="mt-8 space-y-4">
        {announcements.map((a) => (
          <div key={a.title} className="border border-line-200 p-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-900">{a.title}</h3>
              <p className="mt-1 text-xs text-ink-500">{formatDate(a.date)}</p>
            </div>
            <span className="text-xs font-semibold text-teal-800">NEW</span>
          </div>
        ))}
      </div>
    </>
  );
}

function CircularsTab() {
  const circulars = [
    { title: "Circular: Uniform Guidelines 2025-26", date: "2025-06-05" },
    { title: "Circular: Examination Schedule - Term 1", date: "2025-05-20" },
    { title: "Circular: Sports Day Preparations", date: "2025-05-10" },
    { title: "Circular: Summer Camp Registration", date: "2025-04-15" },
  ];
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Circulars</h2>
      <div className="mt-8 space-y-3">
        {circulars.map((c) => (
          <div key={c.title} className="flex items-center justify-between border-b border-line-200 py-4">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">{c.title}</h3>
              <p className="mt-1 text-xs text-ink-500">{formatDate(c.date)}</p>
            </div>
            <a href="#" className="text-xs font-semibold text-teal-800 hover:underline">View PDF</a>
          </div>
        ))}
      </div>
    </>
  );
}

function HolidayListTab() {
  const holidays = [
    { date: "2025-01-26", name: "Republic Day" },
    { date: "2025-03-14", name: "Holi" },
    { date: "2025-04-14", name: "Ambedkar Jayanti" },
    { date: "2025-05-01", name: "May Day" },
    { date: "2025-08-15", name: "Independence Day" },
    { date: "2025-09-05", name: "Teacher's Day" },
    { date: "2025-10-02", name: "Gandhi Jayanti" },
    { date: "2025-10-20", name: "Dussehra" },
    { date: "2025-11-01", name: "Diwali" },
    { date: "2025-11-14", name: "Children's Day" },
    { date: "2025-12-25", name: "Christmas" },
  ];
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Holiday List 2025-26</h2>
      <div className="mt-8 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {holidays.map((h) => (
          <div key={h.name} className="flex items-center justify-between bg-canvas-50 border border-line-200 px-4 py-3">
            <span className="text-sm font-medium text-ink-900">{h.name}</span>
            <span className="text-xs font-semibold text-teal-800">{formatDate(h.date)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function DownloadsTab() {
  const downloads = [
    { title: "Admission Form 2025-26", type: "PDF" },
    { title: "School Handbook", type: "PDF" },
    { title: "Fee Structure Document", type: "PDF" },
    { title: "Transport Route Map", type: "PDF" },
    { title: "Academic Calendar 2025-26", type: "PDF" },
    { title: "School Brochure", type: "PDF" },
  ];
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Downloads</h2>
      <p className="mt-3 text-sm text-ink-600">Admission forms, School Handbook, and other resources.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {downloads.map((d) => (
          <a key={d.title} href="#" className="flex items-center gap-3 border border-line-200 p-5 transition hover:shadow-md hover:border-teal-800/30">
            <Download className="size-5 shrink-0 text-teal-800" />
            <div>
              <h3 className="text-sm font-bold text-ink-900">{d.title}</h3>
              <p className="mt-0.5 text-xs text-ink-500">{d.type}</p>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

function NewsletterTab() {
  return (
    <>
      <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Newsletter</h2>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-600 md:text-base">
        Stay connected with Apollo Vidhyalayam through our quarterly newsletter featuring student achievements, upcoming events, and school updates.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Q1 2025 Newsletter", "Q4 2024 Newsletter", "Q3 2024 Newsletter"].map((title) => (
          <a key={title} href="#" className="flex items-center gap-3 border border-line-200 p-5 transition hover:shadow-md hover:border-teal-800/30">
            <Download className="size-5 shrink-0 text-teal-800" />
            <div>
              <h3 className="text-sm font-bold text-ink-900">{title}</h3>
              <p className="mt-0.5 text-xs text-ink-500">PDF</p>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
