"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronsDown } from "lucide-react";

type HeroSlide = {
  src: string;
  alt: string;
  className: string;
  objectPosition?: string;
};

// The current hero image is retained as the first slide.
const slides: HeroSlide[] = [
  {
    src: "/hero-v2.jpg",
    alt: "Apollo Vidhyalayam campus",
    className: "object-cover scale-[1.44] md:scale-[1.2]",
    objectPosition: "calc(50% - 70px) calc(50% + 100px)",
  },
  {
    src: "/hero-2.JPG",
    alt: "Students at Apollo Vidhyalayam",
    className: "object-cover scale-[1.2]",
    objectPosition: "left bottom",
  },
  {
    src: "/hero-3.jpg",
    alt: "Apollo Vidhyalayam school life",
    className: "object-cover",
    objectPosition: "center",
  },
   {
    src: "/hero-4.jpg",
    alt: "Students at Apollo Vidhyalayam",
    className: "object-cover",
    objectPosition: "center",
  },
  {
    src: "/hero-5.png",
    alt: "Apollo Vidhyalayam school life",
    className: "object-cover",
    objectPosition: "center",
  },
];

const SLIDE_INTERVAL_MS = 5000;
const FADE_DURATION_MS = 1000;

export function HeroSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="relative flex flex-col overflow-hidden"
      style={{ height: "calc(100svh - var(--header-height, 110px))" }}
      aria-label="Hero"
    >
      {/* Background image carousel — fade only, no other animation */}
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          quality={95}
          className={`${slide.className} transition-opacity ease-in-out ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          style={{
            objectPosition: slide.objectPosition,
            transitionDuration: `${FADE_DURATION_MS}ms`,
          }}
          sizes="100vw"
          aria-hidden={index !== active}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      {/* Content — fills remaining space, text above the sticky bar */}
      <div className="relative z-10 flex flex-1 items-end justify-end pb-24 md:pb-28">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center md:ml-auto md:mr-0 md:text-right">
            <p className="text-lg font-semibold italic text-yellow-500 md:text-2xl">
              Learning. Leading. Excelling.
            </p>
            <h1 className="font-display mt-2 text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-6xl">
              Rooted in <span className="text-yellow-500">Aragonda</span>
            </h1>
            <h1 className="font-display text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-6xl">
              Raised with <span className="text-yellow-500">Discipline</span>
            </h1>
            <h1 className="font-display text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-6xl">
              Excelling with <span className="text-yellow-500">Strength</span>
            </h1>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Scroll down to explore"
        onClick={(event) => {
          const nextSection = event.currentTarget.closest("section")?.nextElementSibling;
          if (!nextSection) return;
          const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
          window.scrollBy({
            top: nextSection.getBoundingClientRect().top - headerHeight,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          });
        }}
        className="absolute bottom-5 left-1/2 z-20 flex min-h-11 min-w-11 -translate-x-1/2 flex-col items-center justify-center gap-1 rounded-lg text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:hidden"
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Scroll</span>
        <ChevronsDown aria-hidden="true" className="size-6 motion-safe:animate-bounce" />
      </button>
    </section>
  );
}
