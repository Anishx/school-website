'use client';

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb } from "@/components/breadcrumb";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ProgramItem = {
  title: string;
  grades: string;
  description: string;
};

const programmes: ProgramItem[] = [
  {
    title: "Pre-Primary (Kindergarten)",
    grades: "Kindergarten",
    description:
      "Our Pre-Primary programme provides a joyful and nurturing environment where young learners develop foundational skills through play-based learning, storytelling, music, art, and interactive activities. At Apollo Vidhyalayam, we focus on building confidence, communication, creativity, and social-emotional development while fostering a love for learning from an early age.",
  },
  {
    title: "Primary (Grades I – V)",
    grades: "Grades I – V",
    description:
      "The Primary School programme lays a strong academic foundation in languages, mathematics, science, and environmental studies. Through activity-based learning, hands-on experiences, and individual attention, Apollo Vidhyalayam encourages students to develop critical thinking, curiosity, and essential life skills in a supportive and engaging environment.",
  },
  {
    title: "Middle School (Grades VI – VIII)",
    grades: "Grades VI – VIII",
    description:
      "During the middle school years, students build deeper conceptual understanding while becoming more independent learners. Apollo Vidhyalayam offers a balanced curriculum that strengthens analytical thinking, communication, leadership, and collaboration, complemented by opportunities in sports, arts, and co-curricular activities.",
  },
  {
    title: "Secondary School (Grades IX – X)",
    grades: "Grades IX – X",
    description:
      "The Secondary School programme prepares students for academic excellence and future success through a rigorous curriculum, focused mentoring, and continuous assessment. At Apollo Vidhyalayam, students develop the knowledge, discipline, and confidence required to excel in board examinations while cultivating the skills needed for higher education and lifelong learning.",
  },
];

function AccordionList({ items }: { items: ProgramItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <hr className="border-line-200" />
      {items.map((item, index) => (
        <div key={item.title}>
          <button
            onClick={() => toggle(index)}
            className="group flex w-full items-center gap-4 py-5 text-left transition-colors hover:bg-canvas-50/50 md:py-6"
            aria-expanded={openIndex === index}
          >
            <span className="w-16 shrink-0 text-sm font-semibold text-ink-400 md:w-24 md:text-base">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1">
              <span className="block text-lg font-semibold text-ink-900 md:text-xl lg:text-2xl">
                {item.title}
              </span>
              <span className="mt-1 block text-sm text-ink-600">
                {item.grades}
              </span>
            </span>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-900 text-ink-900 transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
            >
              <ChevronDown className="size-5" />
            </span>
          </button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 pb-6">
                  <div className="w-16 shrink-0 md:w-24" />
                  <div className="flex-1">
                    <p className="text-base leading-relaxed text-ink-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <hr className="border-line-200" />
        </div>
      ))}
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Breadcrumb />
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">From Pre-Primary to Grade X</p>
            <h1 className="mt-3 font-display text-4xl uppercase text-white md:text-5xl lg:text-6xl">
              Academic Programmes
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              CBSE-aligned curriculum nurturing confident, compassionate, and future-ready learners at every stage.
            </p>
          </div>
        </section>

        {/* Programmes */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="md:w-2/3">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Our Learning Journey</p>
              <h2 className="mt-2 font-display text-3xl uppercase text-ink-900 md:text-4xl lg:text-5xl">
                Learning at every stage
              </h2>
            </div>

            <div className="mt-12 md:mt-16">
              <AccordionList items={programmes} />
            </div>
          </div>
        </section>

        {/* Educational Philosophy, Teaching Methodology, Assessment — colorful cards */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Our Approach</h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* Educational Philosophy */}
              <div className="relative overflow-hidden bg-teal-800 p-8 min-h-[320px] flex flex-col justify-end">
                <svg className="absolute top-4 right-4 size-16 text-yellow-400 opacity-30" viewBox="0 0 48 48" fill="currentColor"><circle cx="24" cy="24" r="18"/></svg>
                <p className="font-display text-2xl uppercase text-white md:text-3xl">Educational Philosophy</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  At Apollo Vidyalayam, we believe that education is about shaping character as much as building knowledge. Our approach nurtures intellectual curiosity, discipline, creativity, and compassion, enabling students to become confident learners and responsible citizens. By integrating academics with values, sports, yoga, and experiential learning, we prepare children not only for examinations but for life.
                </p>
              </div>

              {/* Teaching Methodology */}
              <div className="relative overflow-hidden bg-purple-700 p-8 min-h-[320px] flex flex-col justify-end">
                <svg className="absolute top-4 right-4 size-16 text-emerald-400 opacity-30" viewBox="0 0 48 48" fill="currentColor"><polygon points="24,4 30,18 44,20 34,30 36,44 24,38 12,44 14,30 4,20 18,18"/></svg>
                <p className="font-display text-2xl uppercase text-white md:text-3xl">Teaching Methodology</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  Our teaching methodology is designed to make learning engaging, interactive, and meaningful. We combine classroom instruction with hands-on activities, collaborative learning, digital resources, projects, and real-world experiences to strengthen conceptual understanding and critical thinking. Teachers provide individual attention, encourage inquiry, and create an inclusive environment where every student is inspired to participate, explore, and excel.
                </p>
              </div>

              {/* Assessment */}
              <div className="relative overflow-hidden bg-yellow-500 p-8 min-h-[320px] flex flex-col justify-end">
                <svg className="absolute top-4 right-4 size-16 text-teal-800 opacity-25" viewBox="0 0 48 48" fill="currentColor"><rect x="8" y="6" width="32" height="36" rx="3"/><path d="M16 16h16M16 24h16M16 32h10" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                <p className="font-display text-2xl uppercase text-ink-900 md:text-3xl">Assessment</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-900/85">
                  At Apollo Vidyalayam, assessment is viewed as an integral part of the learning process. Students are evaluated through a balanced combination of class participation, assignments, projects, practical activities, periodic tests, and examinations to monitor both academic progress and skill development. During the school&apos;s transition to the CBSE curriculum, assessments continue to follow the Andhra Pradesh State Board pattern, ensuring academic continuity while preparing students for the future.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
