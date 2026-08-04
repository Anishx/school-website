"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
const sortedEvents = [...events].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export function NewsEventsSection() {
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  function scrollRight() {
    scrollEl?.scrollBy({ left: 320, behavior: "smooth" });
  }
  function scrollLeft() {
    scrollEl?.scrollBy({ left: -320, behavior: "smooth" });
  }

  return (
    <section className="bg-canvas-50 py-16 md:py-20" aria-labelledby="news-events-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">
            What&apos;s Happening
          </p>
          <h2
            id="news-events-heading"
            className="mt-2 font-display text-3xl uppercase text-ink-900 md:text-4xl"
          >
            News &amp; Events
          </h2>
        </div>

        {/* Horizontal scrolling cards */}
        <div className="relative">
          <div
            ref={setScrollEl}
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            {sortedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/news-events/${event.id}`}
                className="group flex-shrink-0 w-[260px] md:w-[300px]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas-100">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="300px"
                  />
                </div>
                <p className="mt-3 text-sm leading-snug font-medium text-ink-900 line-clamp-2 group-hover:text-teal-800 transition-colors">
                  {event.title}
                </p>
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <Link
              href="/news-events"
              className="mr-auto inline-flex items-center gap-1.5 rounded-full border-2 border-teal-800 px-5 py-2 text-xs font-bold uppercase tracking-wider text-teal-800 transition hover:bg-teal-800 hover:text-white"
            >
              More News
            </Link>
            <button
              type="button"
              onClick={scrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
