"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";

const categories = [
  { title: "Academics", image: "/images/classroom/hands-up.jpg", description: "Strong CBSE foundation through engaging classroom experiences and structured learning.", href: "/programs" },
  { title: "Sports", image: "/images/sports/sports-1.jpg", description: "Building confidence, resilience, and teamwork through athletics, football, throwball, and more.", href: "/student-life?tab=sports" },
  { title: "Yoga & Wellness", image: "/images/yoga/group-yoga.jpg", description: "Daily yoga sessions promoting physical, emotional, and mental well-being.", href: "/student-life?tab=clubs" },
  { title: "Student Life", image: "/images/cultural/cultural-1.jpg", description: "Clubs, cultural events, and leadership opportunities that build well-rounded individuals.", href: "/student-life" },
  { title: "Values & Discipline", image: "/images/campus/walking.jpg", description: "Character education woven into everyday school life through Isha-affiliated values.", href: "/about-us" },
  { title: "Campus", image: "/images/campus/entrance.jpg", description: "Modern infrastructure with smart classrooms, labs, sports grounds, and safe hostels.", href: "/about-us" },
];

// Triple for infinite scroll
const infiniteCategories = [...categories, ...categories, ...categories];
const CARD_WIDTH = 320;
const GAP = 16;
const SCROLL_AMOUNT = CARD_WIDTH + GAP;

export function WelcomeSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    // Reset for infinite loop
    setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const totalSingleSet = categories.length * SCROLL_AMOUNT;
      if (el.scrollLeft >= totalSingleSet * 2) {
        el.scrollLeft -= totalSingleSet;
      }
    }, 400);
  }

  function scrollLeft() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const totalSingleSet = categories.length * SCROLL_AMOUNT;
      if (el.scrollLeft < totalSingleSet - SCROLL_AMOUNT) {
        el.scrollLeft += totalSingleSet;
      }
    }, 400);
  }

  // Start at middle set on mount
  const initScroll = (el: HTMLDivElement | null) => {
    if (el) {
      el.scrollLeft = categories.length * SCROLL_AMOUNT;
      (scrollRef as React.MutableRefObject<HTMLDivElement>).current = el;
    }
  };

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
          Apollo Vidhyalayam is committed to transforming education by combining strong academics, technology-enabled learning, leadership development, healthcare exposure, and experiential learning. The school is evolving into a future-ready institution focused on preparing students for success in academics, careers, and life.
        </p>

        {/* Learn More button */}
        <Link
          href="/about-us"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-600 px-6 py-3 text-sm font-bold text-ink-900 transition hover:bg-yellow-500"
        >
          LEARN MORE ABOUT US
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      {/* Horizontal scroll carousel */}
      <div className="relative z-10 mt-12">
        {/* Scroll buttons */}
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex flex-col gap-2 md:left-8">
          <button
            type="button"
            onClick={scrollLeft}
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronRight className="size-5 rotate-180" />
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

        {/* Cards */}
        <div
          ref={initScroll}
          className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
            paddingRight: "3rem",
          }}
        >
          {infiniteCategories.map((cat, idx) => {
            const isOdd = idx % 2 !== 0;
            return (
              <Link
                key={`${cat.title}-${idx}`}
                href={cat.href}
                className={`group relative flex-shrink-0 w-[280px] md:w-[320px] overflow-hidden ${isOdd ? "translate-y-2" : "-translate-y-2"}`}
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="320px"
                  />
                  {/* Default: gradient at bottom with title */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
                  
                  {/* Hover: full teal overlay with description */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-900/85 p-6 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="font-display text-2xl uppercase text-white">
                      {cat.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/85">
                      {cat.description}
                    </p>
                    <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60">
                      <ArrowUpRight className="size-5 text-white" />
                    </div>
                  </div>
                </div>
                {/* Default title at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transition-opacity duration-300 group-hover:opacity-0">
                  <h3 className="font-display flex items-center gap-1.5 text-xl uppercase text-white">
                    {cat.title}
                    <ArrowUpRight className="size-4 text-white/80" />
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
