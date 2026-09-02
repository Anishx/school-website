"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
    className: "object-cover scale-[1.2]",
    objectPosition: "calc(50% - 120px) calc(50% + 175px)",
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
          <div className="ml-auto max-w-3xl text-right">
            <p className="text-lg font-semibold italic text-yellow-500 md:text-2xl">
              Learning. Leading. Excelling.
            </p>
            <h1 className="font-display mt-2 text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Rooted in <span className="text-yellow-500">Aragonda</span>
            </h1>
            <h1 className="font-display text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Raised with <span className="text-yellow-500">Discipline</span>
            </h1>
            <h1 className="font-display text-4xl uppercase leading-[1.1] text-white md:text-6xl lg:text-7xl">
              Excelling with <span className="text-yellow-500">Strength</span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}
