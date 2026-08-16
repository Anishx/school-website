import Link from "next/link";
import Image from "next/image";
import { Lightbulb, Globe, Microscope, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Program = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  featured?: boolean;
  img: string;
};

const programs: Program[] = [
  {
    icon: Lightbulb,
    title: "Brighter Minds",
    subtitle: "Brain Development",
    description:
      "A structured programme to enhance memory, concentration and problem-solving through proven cognitive exercises.",
    highlights: ["Abacus & mental math", "Memory techniques", "Critical thinking games"],
    featured: true,
    img: "/images/new/students-posters.jpg",
  },
  {
    icon: Globe,
    title: "Spoken English",
    subtitle: "Language & Confidence",
    description:
      "Daily practice sessions that build fluency, pronunciation and confidence for rural students entering a wider world.",
    highlights: ["Daily conversation practice", "Debate & elocution", "English story sessions"],
    featured: true,
    img: "/images/new/girls-reading.jpg",
  },
  {
    icon: Microscope,
    title: "Medical Pathways",
    subtitle: "Science Track",
    description:
      "Dedicated coaching for Grade 9–10 students aiming for medical and science careers — early and structured.",
    highlights: ["NEET foundation concepts", "Lab practicals", "Career guidance sessions"],
    img: "/images/new/titration-lab.jpg",
  },
  {
    icon: MapPin,
    title: "Exposure Visits",
    subtitle: "Real-World Learning",
    description:
      "Curated visits to science centres, industries and historical sites that bring curriculum to life.",
    highlights: ["Science & tech centres", "Agricultural farms", "Cultural heritage sites"],
    img: "/images/new/boy-map.jpg",
  },
];

export function ProgramsSpotlight() {
  return (
    <section className="bg-canvas-100 py-16 md:py-20" aria-labelledby="programs-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-800">
              Special Programs
            </p>
            <h2
              id="programs-heading"
              className="font-display text-3xl font-bold text-ink-900 md:text-4xl"
            >
              Beyond the Classroom
            </h2>
            <p className="mt-3 text-base text-ink-600">
              Carefully designed programmes that sharpen minds, build confidence and open new horizons.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-teal-800 hover:text-teal-900"
          >
            View all programs
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Cards grid — featured 2 cols on top, regular 2 cols below */}
        <div className="grid gap-5 sm:grid-cols-2">
          {programs.map((prog) => {
            const Icon = prog.icon;
            return (
              <div
                key={prog.title}
                className={cn(
                  "group relative flex flex-col overflow-hidden  border bg-white transition-all duration-200",
                  "hover:shadow-[0_8px_24px_rgba(47,49,58,0.10)]",
                  prog.featured
                    ? "border-teal-800/20 hover:border-teal-800/40"
                    : "border-line-200 hover:border-line-300"
                )}
              >
                {/* Image banner */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={prog.img}
                    alt={prog.title}
                    fill
                    quality={90}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {/* Icon floated over the image bottom-left */}
                  <div className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center  border border-white/30 bg-white/20 text-white backdrop-blur-sm">
                    <Icon className="size-5" />
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-7">

                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-teal-700">
                  {prog.subtitle}
                </p>
                <h3 className="font-display text-xl font-bold text-ink-900">{prog.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{prog.description}</p>

                <ul className="mt-5 space-y-2">
                  {prog.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-ink-700">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>

                <Link
                  href="#"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 transition-colors hover:text-teal-900"
                >
                  Find out more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                </div>{/* end card body */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
