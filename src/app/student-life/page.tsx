'use client';

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AccordionSection = {
  title: string;
  subtitle: string;
  description?: string;
  items: string[];
  note?: string;
};

const sections: AccordionSection[] = [
  {
    title: "Clubs & Leadership Development",
    subtitle: "Designed to develop confidence, communication, leadership, and teamwork.",
    items: [
      "Student Monitor Clubs",
      "School Elections",
      "Storytelling Sessions",
      "Spoken English Activities",
      "Saturday Enrichment Programs",
      "Outdoor Learning",
      "Gardening Clubs",
      "No Bag Day Activities",
    ],
  },
  {
    title: "Digital Learning",
    subtitle: "Technology & Digital Transformation — Smart Learning Environment",
    description: "Features:",
    items: [
      "Smart Classrooms",
      "Digital Learning Tools",
      "Cadence School Management Platform",
      "Technology-Based Assessments",
    ],
    note: "Operational Excellence: Attendance Tracking, Parent Communication Systems, Student Performance Monitoring. Results: Higher student engagement, improved technology readiness, faster parent-school communication, and 95% staff technology adoption.",
  },
  {
    title: "Brighter Minds Program",
    subtitle: "Unlocking Every Child's Potential",
    description: "The Brighter Minds Program focuses on cognitive development through:",
    items: [
      "Memory Enhancement",
      "Concentration Improvement",
      "Faster Learning Ability",
      "Creativity Activation",
      "Improved Classroom Attention",
    ],
    note: "Helping students strengthen their mental capabilities and learning potential.",
  },
  {
    title: "Medical Pathways Program",
    subtitle: "Building Future Healthcare Leaders",
    description: "A unique Apollo Vidhyalayam initiative exposing students to healthcare careers.",
    items: [
      "Medical College Visits",
      "Hospital Exposure",
      "Healthcare Professional Interactions",
      "Career Awareness Sessions",
      "Public Health Education",
      "Medicine",
      "Nursing",
      "Allied Health Sciences",
      "Medical Research",
      "Public Health",
    ],
    note: "100+ students have already benefited through the program.",
  },
  {
    title: "Sports & Physical Education",
    subtitle: "Excellence Beyond Academics",
    description: "Achievements include:",
    items: [
      "Volleyball Winners",
      "Kabaddi Runners-Up",
      "Shuttle Winners",
      "Chess Participation",
      "100m Race Champions",
      "Shot Put Winners",
      "Disc Throw Winners",
    ],
  },
];

export default function StudentLifePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Beyond Academics</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Student Life
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Designed to develop confidence, communication, leadership, and teamwork.
            </p>
          </div>
        </section>

        {/* Accordion Sections */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <hr className="border-line-200" />
            {sections.map((section, index) => (
              <div key={section.title}>
                <button
                  onClick={() => toggle(index)}
                  className="group flex w-full items-center gap-4 py-6 text-left transition-colors hover:bg-canvas-50 md:py-8"
                  aria-expanded={openIndex === index}
                >
                  {/* Number */}
                  <span className="w-16 shrink-0 text-sm font-semibold text-ink-400 md:w-24 md:text-base">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Title */}
                  <span className="flex-1">
                    <span className="block text-xl font-semibold text-ink-900 md:text-2xl lg:text-3xl">
                      {section.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-600 md:text-base">
                      {section.subtitle}
                    </span>
                  </span>

                  {/* Chevron */}
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-900 text-ink-900 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="size-5" />
                  </span>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-4 pb-8">
                        {/* Spacer matching number width */}
                        <div className="w-16 shrink-0 md:w-24" />
                        {/* Content */}
                        <div className="flex-1">
                          {section.description && (
                            <p className="text-base text-ink-600">{section.description}</p>
                          )}
                          <ul className="mt-4 list-disc pl-5 space-y-2 text-base text-ink-600">
                            {section.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          {section.note && (
                            <p className="mt-5 text-sm italic text-ink-600">{section.note}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <hr className="border-line-200" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
