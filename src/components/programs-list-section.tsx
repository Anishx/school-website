import { ArrowRight } from "lucide-react";
import Link from "next/link";

const programs = [
  { title: "Bridge Courses" },
  { title: "Remedial Classes (Std. I–IX)" },
  { title: "After-School Learning Support" },
  { title: "Std. X Intensive Coaching" },
  { title: "Spoken English Development" },
  { title: "Handwriting Improvement Programs" },
];

export function ProgramsListSection() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="programs-list-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {/* Headline */}
          <div className="md:w-2/3">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Academic Support</p>
            <h2
              id="programs-list-heading"
              className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl lg:text-[2.75rem] lg:leading-tight"
            >
              Our programs address the most significant challenges students face.
            </h2>
          </div>
        </div>

        {/* Programs list */}
        <div className="mt-12 md:mt-16">
          <hr className="border-line-200" />
          {programs.map((program, index) => (
            <div key={program.title}>
              <Link
                href="#"
                className="group flex items-center gap-4 py-5 transition-colors hover:bg-canvas-50 md:py-6"
              >
                {/* Number */}
                <span className="w-16 shrink-0 text-sm font-semibold text-ink-400 md:w-24 md:text-base">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Title */}
                <span className="flex-1 text-lg font-semibold text-ink-900 md:text-xl lg:text-2xl">
                  {program.title}
                </span>

                {/* Arrow */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-900 text-ink-900 transition-colors group-hover:bg-teal-800 group-hover:border-teal-800 group-hover:text-white">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
              <hr className="border-line-200" />
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="mt-6 flex justify-end">
            <Link
              href="#"
              className="text-sm font-semibold text-ink-900 underline underline-offset-4 transition-colors hover:text-teal-800"
            >
              Explore all programs
            </Link>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-10 space-y-3 text-sm leading-relaxed text-ink-600">
          <p className="italic">Academic performance improved significantly from 65–70% to 85%.</p>
          <p><span className="font-semibold text-ink-900">Academic Leadership:</span> Featuring curriculum support from education specialists including academic consultants focused on improving learning outcomes.</p>
        </div>
      </div>
    </section>
  );
}
