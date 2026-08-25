"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: "smart-classrooms",
    title: "Interactive Learning Spaces",
    description:
      "28 classrooms are equipped with smart boards, creating interactive and engaging learning experiences through multimedia content and digital teaching resources.",
    image: "/images/new/smartboard-class.jpg",
  },
  {
    id: "ai-learning",
    title: "AI-Enabled Learning",
    description:
      "Artificial Intelligence (AI)-based learning tools are introduced from Kindergarten onwards as part of the computer education programme, fostering digital literacy and future-ready skills from an early age.",
    image: "/images/new/projector.png",
  },
  {
    id: "tech-integrated",
    title: "Technology-Integrated Education",
    description:
      "Digital resources, interactive lessons, and technology-driven teaching methodologies encourage collaboration, creativity, critical thinking, and experiential learning across subjects.",
    image: "/images/new/teacher-smartboard.jpg",
  },
];

const INTERVAL = 5000;

export function DigitalLearningCarousel() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const next = useCallback(() => {
    setDirection("right");
    setActive((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection("left");
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[active];

  return (
    <div className="relative">
      {/* Layout: image left, overlapping card right */}
      <div className="flex flex-col md:flex-row md:items-center">
        {/* Image with fade transition */}
        <div className="relative aspect-[4/3] w-full overflow-hidden md:w-3/5">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                idx === active
                  ? "opacity-100 scale-100"
                  : idx === (active - 1 + slides.length) % slides.length && direction === "right"
                  ? "opacity-0 -translate-x-8 scale-95"
                  : "opacity-0 translate-x-8 scale-95"
              }`}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                quality={90}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </div>
          ))}
        </div>

        {/* Card with slide-in transition + arrows below */}
        <div className="relative z-10 md:-ml-16 md:w-2/5">
          <div className="md:my-10 relative">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                className={`bg-white p-8 shadow-xl transition-opacity duration-700 ease-in-out ${
                  idx === active
                    ? "relative opacity-100"
                    : "absolute top-0 left-0 right-0 opacity-0 pointer-events-none"
                }`}
              >
                <h3 className="font-display text-xl uppercase text-ink-900 md:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-ink-600">
                  {s.description}
                </p>
                <Link
                  href="/student-life?tab=sports"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-yellow-500 px-5 py-2.5 text-xs font-bold text-ink-900 transition hover:bg-yellow-400"
                >
                  EXPLORE STUDENT LIFE
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Arrow buttons — positioned below the card, aligned right */}
          <div className="mt-4 flex items-center justify-end gap-3 pr-2">
            <button
              type="button"
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-800 bg-white text-teal-800 shadow transition hover:bg-teal-800 hover:text-white"
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
