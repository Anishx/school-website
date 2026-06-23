"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import eventsData from "@/data/events.json";

type EventItem = {
  id: string;
  title: string;
  date: string;
  category?: string;
  featured?: boolean;
  image: string;
};

const events: EventItem[] = eventsData;

export function NewsEventsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    return () => { api.off("select", update); };
  }, [api]);

  // Auto-scroll
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="bg-canvas-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-800">What&apos;s Happening</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
              News & Events
            </h2>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className="h-10 w-10"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="h-10 w-10"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel — full width for edge-to-edge scrolling feel */}
      <div className="mx-auto max-w-7xl px-6">
        <Carousel
          setApi={setApi}
          opts={{ dragFree: true, align: "start" }}
        >
          <CarouselContent className="-ml-4">
            {events.map((event) => (
              <CarouselItem
                key={event.id}
                className="basis-[280px] pl-4 md:basis-[320px] lg:basis-[380px]"
              >
                <div className="group relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="380px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block text-xs font-semibold text-white/70">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="mt-1 block text-base font-bold text-white">
                      {event.title}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* View All link */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/news-events"
            className="text-sm font-semibold text-ink-900 underline underline-offset-4 transition-colors hover:text-teal-800"
          >
            View All News & Events
          </Link>
        </div>
      </div>
    </section>
  );
}
