"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

const categories = [
  { title: "Academics", image: "/images/classroom/hands-up.jpg" },
  { title: "Sports", image: "/images/sports/sports-1.jpg" },
  { title: "Yoga & Wellness", image: "/images/yoga/group-yoga.jpg" },
  { title: "Student Life", image: "/images/cultural/cultural-1.jpg" },
  { title: "Values & Discipline", image: "/images/campus/walking.jpg" },
  { title: "Campus", image: "/images/campus/entrance.jpg" },
];

// Triple the items for infinite scroll illusion
const infiniteCategories = [...categories, ...categories, ...categories];
const CARD_WIDTH = 260;
const GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;

export function WelcomeSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // After scroll ends, if we've gone past the bounds, silently reset position
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const totalSingleSet = categories.length * SCROLL_AMOUNT;
    // If scrolled past the 2nd set (going right), jump back
    if (el.scrollLeft >= totalSingleSet * 2) {
      el.scrollLeft -= totalSingleSet;
    }
    // If scrolled before the 1st set (going left), jump forward
    if (el.scrollLeft < totalSingleSet - SCROLL_AMOUNT) {
      el.scrollLeft += totalSingleSet;
    }
  }, []);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
    // Check bounds after animation
    setTimeout(handleScroll, 350);
  }

  // On mount, start at the middle set
  const initScroll = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      el.scrollLeft = categories.length * SCROLL_AMOUNT;
      (scrollRef as React.MutableRefObject<HTMLDivElement>).current = el;
    }
  }, []);

  return (
    <section className="relative bg-white py-16 md:py-24 overflow-hidden">
      {/* Tiled logo background */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: "url('/images/logo-tile.png')",
          backgroundSize: "50px auto",
          backgroundRepeat: "repeat",
          backgroundPosition: "0 0",
          filter: "grayscale(1) contrast(1.2)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Heading */}
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">
          Welcome to
        </p>
        <h2 className="font-display mt-1 text-4xl uppercase text-ink-900 md:text-6xl lg:text-7xl">
          Apollo Vidhyalayam
        </h2>

        {/* Description */}
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ink-700 md:text-base">
          Founded in Aragonda in 2012, Apollo Vidhyalayam integrates yoga,
          discipline, and value-based education into the everyday learning
          experience. With 12+ years of Isha-affiliated holistic education,
          daily yoga sessions guided by the Apollo Foundation Total Health Yoga Trainer,
          and a strong transition to CBSE, we nurture confident, compassionate, and
          future-ready learners. Our students are state-level sports achievers — sporty, brave, and disciplined.
        </p>

        {/* Learn More button — same rounded pill style as site buttons */}
        <Link
          href="/about-us"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full border-2 border-teal-800 px-5 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-800 hover:text-white"
        >
          LEARN MORE
        </Link>
      </div>

      {/* Horizontal scroll carousel — aligned with max-w-7xl */}
      <div className="relative z-10 mt-12">
        {/* Scroll buttons */}
        <div className="absolute left-4 bottom-6 z-10 flex flex-col gap-2 md:left-6">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* Cards — start aligned with max-w-7xl content, extend to right edge */}
        <div
          ref={initScroll}
          className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
            paddingRight: "0px",
          }}
        >
          {infiniteCategories.map((cat, idx) => (
            <div
              key={`${cat.title}-${idx}`}
              className="group relative flex-shrink-0 w-[220px] md:w-[260px] overflow-hidden"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="260px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display flex items-center gap-1 text-lg uppercase text-white md:text-xl">
                  {cat.title}
                  <ArrowUpRight className="size-4 text-white/80" />
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
