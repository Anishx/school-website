"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import Link from "next/link";
import eventsData from "@/data/events.json";

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
const featuredEvents = sortedEvents.filter((e) => e.featured);
const categories = ["All", ...Array.from(new Set(events.map((e) => e.category)))];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""} ago`;
}

export default function NewsEventsPage() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredEvents = activeTab === "All"
    ? sortedEvents
    : sortedEvents.filter((e) => e.category === activeTab);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Stay Updated</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              News & Events
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              The latest happenings at Apollo Vidhyalayam.
            </p>
          </div>
        </section>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <section className="bg-white py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-6">
              <h2 className="mb-8 font-display text-2xl font-bold text-ink-900 md:text-3xl">Featured</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {featuredEvents.map((event) => (
                  <Link key={event.id} href={`/news-events/${event.id}`} className="group relative aspect-[16/9] overflow-hidden block">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="inline-block rounded bg-teal-800 px-2 py-0.5 text-xs font-semibold text-white">
                        {event.category}
                      </span>
                      <h3 className="mt-2 text-lg font-bold text-white md:text-xl">{event.title}</h3>
                      <span className="mt-1 block text-xs text-white/70">{formatDate(event.date)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Tabs + List */}
        <section className="bg-canvas-50 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-6">
            {/* Tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    activeTab === cat
                      ? "bg-teal-800 text-white"
                      : "bg-white border border-line-200 text-ink-600 hover:bg-canvas-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Events list */}
            <div>
              <hr className="border-line-200" />
              {filteredEvents.map((event, index) => (
                <div key={event.id}>
                  <Link href={`/news-events/${event.id}`} className="flex items-center gap-4 py-5 transition-colors hover:bg-white md:gap-6 md:py-6">
                    {/* Number */}
                    <span className="hidden w-12 shrink-0 text-sm font-semibold text-ink-400 md:block">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Image */}
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden md:h-20 md:w-32">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <span className="block text-xs font-semibold text-teal-800">{event.category}</span>
                      <h3 className="mt-0.5 text-base font-semibold text-ink-900 md:text-lg">
                        {event.title}
                      </h3>
                      <span className="mt-1 block text-xs text-ink-500">
                        {formatDate(event.date)} · {timeAgo(event.date)}
                      </span>
                    </div>
                  </Link>
                  <hr className="border-line-200" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
