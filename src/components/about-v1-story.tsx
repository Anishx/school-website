import Image from "next/image";
import Link from "next/link";
import { Calendar, Heart, GraduationCap, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Pillar = { icon: LucideIcon; title: string; text: string };

const pillars: Pillar[] = [
  { icon: Calendar, title: "Founded in 1999", text: "Over 25 years of serving rural families with quality education." },
  { icon: Heart, title: "Rural Community Focus", text: "Built by a foundation to uplift children in underserved villages." },
  { icon: GraduationCap, title: "CBSE Aligned", text: "Structured curriculum from Pre-Primary to Grade 10 with proven results." },
];

export function AboutV1Story() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="about-v1-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Split: Image + Story */}
        <div className="flex flex-col gap-10 md:flex-row md:items-center">
          {/* Image */}
          <div className="relative h-[360px] w-full shrink-0 overflow-hidden md:w-1/2">
            <Image
              src="https://picsum.photos/seed/rural-school-campus/800/600"
              alt="School campus"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Story text */}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Our Foundation</p>
            <h2 id="about-v1-heading" className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
              A School Born from Purpose
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              In 1999, a group of educators and philanthropists came together with a single mission — to bring
              quality education to rural children who had no access to it. What began as a small classroom
              with 30 students has grown into a thriving campus serving over 1,200 families.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Our foundation believes every child deserves the same opportunities as those in cities.
              Through smart classrooms, trained teachers and innovative programs like Brighter Minds,
              we bridge the gap between ambition and access.
            </p>
            <Link
              href="#"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Learn Our Full Story
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-4 border border-line-200 bg-canvas-50 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-teal-800/5 border border-teal-800/15">
                  <Icon className="size-5 text-teal-800" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">{p.title}</h3>
                  <p className="mt-1 text-xs text-ink-600">{p.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
