import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import eventsData from "@/data/events.json";

type EventItem = {
  id: string;
  title: string;
  date: string;
  category: string;
  featured: boolean;
  image: string;
  body: string;
};

const events: EventItem[] = eventsData as EventItem[];

export function generateStaticParams() {
  return events.map((event) => ({ id: event.id }));
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = events.find((e) => e.id === id);

  if (!event) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
          <Image
            src={event.image}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* Content */}
        <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
          {/* Back link */}
          <Link
            href="/news-events"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-900"
          >
            <ArrowLeft className="size-4" />
            Back to News & Events
          </Link>

          {/* Category & Date */}
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-block rounded bg-teal-800 px-2.5 py-1 text-xs font-semibold text-white">
              {event.category}
            </span>
            <span className="text-sm text-ink-500">{formatDate(event.date)}</span>
          </div>

          {/* Title */}
          <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 md:text-4xl lg:text-5xl">
            {event.title}
          </h1>

          {/* Body */}
          <div className="mt-8 text-base leading-relaxed text-ink-600 md:text-lg md:leading-relaxed">
            <p>{event.body}</p>
          </div>
        </article>
      </main>
    </>
  );
}
