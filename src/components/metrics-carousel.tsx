'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type MetricSlide = {
  title: string;
  image: string;
  stat: string;
  description: string;
};

const slides: MetricSlide[] = [
  {
    title: "Isha-Affiliated Value Education",
    image: "https://picsum.photos/seed/rural-kids-studying/800/600",
    stat: "12+",
    description: "Years of Isha-affiliated value education integrating yoga, discipline, and character building into everyday learning.",
  },
  {
    title: "Daily Yoga Sessions",
    image: "https://picsum.photos/seed/village-children-school-gate/800/600",
    stat: "Daily",
    description: "Yoga sessions guided by the Apollo Foundation Total Health Yoga Trainer, promoting physical and emotional well-being.",
  },
  {
    title: "CBSE Transition",
    image: "https://picsum.photos/seed/rural-school-cultural-fest/800/600",
    stat: "CBSE",
    description: "Transitioning to CBSE, building on a strong academic foundation with nationally benchmarked standards.",
  },
  {
    title: "State-Level Sports Achievers",
    image: "https://picsum.photos/seed/kids-smartboard-learning/800/600",
    stat: "State",
    description: "Our students are state-level sports achievers — sporty, brave, and disciplined both on and off the field.",
  },
];

const INTERVAL = 5000;

export function MetricsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="bg-canvas-50 py-16 md:py-20" aria-labelledby="metrics-carousel-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Our Impact</p>
          <h2 id="metrics-carousel-heading" className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
            Numbers That Speak for Themselves
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            From academic excellence to technology adoption, our milestones reflect a school committed to continuous growth and student success.
          </p>
        </div>

        <div className="flex flex-col gap-10 md:flex-row md:items-stretch">
          {/* Left side — titles + stat */}
          <div className="flex flex-col justify-between md:w-5/12">
            {/* Title list */}
            <nav aria-label="Metrics categories">
              <ul className="space-y-2">
                {slides.map((slide, index) => (
                  <li key={slide.title}>
                    <button
                      onClick={() => setActiveIndex(index)}
                      className={`flex items-center gap-2 text-left text-base font-semibold transition-colors md:text-lg ${
                        index === activeIndex
                          ? 'text-teal-800'
                          : 'text-ink-400 hover:text-ink-600'
                      }`}
                      aria-current={index === activeIndex ? 'true' : undefined}
                    >
                      {index === activeIndex && (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-800">
                          <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      )}
                      {index !== activeIndex && <span className="w-5" />}
                      {slide.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Stat */}
            <div className="mt-10 border-t border-line-200 pt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="block font-display text-5xl font-bold text-teal-800 md:text-6xl">
                    {activeSlide.stat}
                  </span>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-600">
                    {activeSlide.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right side — image */}
          <div className="relative min-h-[300px] overflow-hidden md:w-7/12 md:min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 58vw"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 flex gap-2">
          {slides.map((_, index) => (
            <div key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-line-200">
              {index === activeIndex && (
                <motion.div
                  className="h-full bg-teal-800 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
                  key={`progress-${activeIndex}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
