'use client';

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ProgramItem = {
  title: string;
  description: string;
  details: string;
};

const stages: ProgramItem[] = [
  {
    title: "Pre-Primary",
    description: "Foundation years focused on play-based learning, motor skills, and early literacy.",
    details: "Our Pre-Primary program nurtures young minds through structured play, storytelling, art, and sensory activities. Children develop social skills, early numeracy, phonics awareness, and fine motor coordination in a safe, stimulating environment guided by trained early childhood educators.",
  },
  {
    title: "Std. I–V",
    description: "Building strong fundamentals in language, mathematics, science, and social awareness.",
    details: "The primary years curriculum focuses on developing reading fluency, logical thinking, and scientific curiosity. Students engage in project-based learning, environmental studies, and value education alongside core academics. Regular assessments and parent-teacher collaboration ensure every child progresses confidently.",
  },
  {
    title: "Std. VI–X",
    description: "CBSE-aligned curriculum preparing students for board exams and future academic pathways.",
    details: "Secondary education at Apollo Vidhyalayam combines rigorous CBSE academics with practical application. Students benefit from dedicated subject teachers, laboratory work, career counselling, and intensive board exam preparation. Our structured approach has consistently delivered 85%+ pass rates with top mandal rankings.",
  },
];

const academicSupport: ProgramItem[] = [
  {
    title: "Bridge Courses",
    description: "Filling learning gaps for students transitioning between levels.",
    details: "Bridge courses are short-term intensive programs designed to help students who join mid-year or have gaps in foundational concepts. Focused on core subjects, these courses bring students up to speed with their peers through small-group instruction and personalised attention.",
  },
  {
    title: "Remedial Classes (Std. I–IX)",
    description: "Extra support for students who need additional help in core subjects.",
    details: "Remedial classes run after school hours for students identified through regular assessments as needing additional support. Teachers provide one-on-one guidance in mathematics, science, and language, ensuring no student is left behind in their learning journey.",
  },
  {
    title: "After-School Learning Support",
    description: "Extended learning hours for homework help and concept reinforcement.",
    details: "Our after-school program provides a structured environment for completing homework, revising lessons, and engaging in enrichment activities. Supervised by teachers, this program is especially valuable for students whose parents work late or lack resources for home tutoring.",
  },
  {
    title: "Std. X Intensive Coaching",
    description: "Board exam preparation with focused practice and mock tests.",
    details: "Starting from the first term, Std. X students receive intensive coaching that includes topic-wise revision, previous year paper analysis, timed mock exams, and individual performance tracking. This systematic preparation has contributed to our consistently high board results.",
  },
  {
    title: "Spoken English Development",
    description: "Building confidence and fluency in English communication.",
    details: "Our Spoken English program goes beyond textbook grammar. Students participate in daily conversation practice, debates, storytelling, and presentation sessions. The program builds vocabulary, pronunciation, and the confidence to communicate effectively in academic and professional settings.",
  },
  {
    title: "Handwriting Improvement Programs",
    description: "Developing neat, legible handwriting through structured practice.",
    details: "Good handwriting reflects discipline and clarity of thought. Our dedicated handwriting sessions use guided worksheets, posture correction, and regular practice to help students develop clean, consistent writing that serves them well in exams and beyond.",
  },
];

function AccordionList({ items, sectionId }: { items: ProgramItem[]; sectionId: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <hr className="border-line-200" />
      {items.map((item, index) => (
        <div key={`${sectionId}-${item.title}`}>
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
                {item.description}
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
                      {item.details}
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
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">Academics</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Programs
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              CBSE-aligned curriculum from Pre-Primary to Std. X with targeted academic support at every level.
            </p>
          </div>
        </section>

        {/* Curriculum */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="md:w-2/3">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Curriculum</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Learning at every stage
              </h2>
            </div>

            <div className="mt-12 md:mt-16">
              <AccordionList items={stages} sectionId="curriculum" />
            </div>
          </div>
        </section>

        {/* Academic Support */}
        <section className="bg-canvas-50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="md:w-2/3">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Academic Support</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Our programs address the most significant challenges students face.
              </h2>
            </div>

            <div className="mt-12 md:mt-16">
              <AccordionList items={academicSupport} sectionId="support" />
            </div>

            {/* Notes */}
            <div className="mt-10 space-y-3 text-sm leading-relaxed text-ink-600">
              <p className="italic">Academic performance improved significantly from 65–70% to 85%.</p>
              <p><span className="font-semibold text-ink-900">Academic Leadership:</span> Featuring curriculum support from education specialists including academic consultants focused on improving learning outcomes.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
