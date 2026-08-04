import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, Lightbulb, GraduationCap, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stage = {
  icon: LucideIcon;
  tag: string;
  title: string;
  subtitle: string;
  grades: string;
  features: string[];
  color: string;
  iconBg: string;
  tagColor: string;
  img: string;
};

const stages: Stage[] = [
  {
    icon: Sparkles,
    tag: "Foundation",
    title: "Pre-Primary",
    subtitle: "Nursery · LKG · UKG",
    grades: "Ages 3 – 5",
    features: ["Play-based learning", "Motor skill development", "Phonics & early numeracy", "Bilingual storytelling"],
    color: "border-yellow-500/30 hover:border-yellow-500/60",
    iconBg: "bg-yellow-500/10 text-yellow-700",
    tagColor: "bg-yellow-500/10 text-yellow-700",
    img: "/images/classroom/reading.jpg",
  },
  {
    icon: BookOpen,
    tag: "Primary",
    title: "Grade 1 – 5",
    subtitle: "Primary School",
    grades: "Ages 6 – 10",
    features: ["CBSE curriculum", "Activity-based classrooms", "Spoken English program", "Sports & arts"],
    color: "border-teal-600/30 hover:border-teal-600/60",
    iconBg: "bg-teal-800/10 text-teal-800",
    tagColor: "bg-teal-800/10 text-teal-800",
    img: "/images/classroom/classroom.jpg",
  },
  {
    icon: Lightbulb,
    tag: "Middle School",
    title: "Grade 6 – 8",
    subtitle: "Middle School",
    grades: "Ages 11 – 13",
    features: ["Subject specialisation", "Brighter Minds program", "Club & leadership roles", "Exposure visits"],
    color: "border-teal-700/30 hover:border-teal-700/60",
    iconBg: "bg-teal-700/10 text-teal-700",
    tagColor: "bg-teal-700/10 text-teal-700",
    img: "/images/classroom/hands-up.jpg",
  },
  {
    icon: GraduationCap,
    tag: "High School",
    title: "Grade 9 – 10",
    subtitle: "Board Exams",
    grades: "Ages 14 – 16",
    features: ["98% board pass rate", "Medical pathways track", "Mandal & state toppers", "Career counselling"],
    color: "border-teal-800/30 hover:border-teal-800/60",
    iconBg: "bg-teal-800/10 text-teal-800",
    tagColor: "bg-teal-800/10 text-teal-800",
    img: "/images/classroom/studying.jpg",
  },
];

export function AcademicStages() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="academic-stages-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-800">
            Academics
          </p>
          <h2
            id="academic-stages-heading"
            className="font-display text-3xl font-bold text-ink-900 md:text-4xl"
          >
            Learning at Every Stage
          </h2>
          <p className="mt-3 text-base text-ink-600">
            From playful beginnings to board-level excellence — a clear academic path for every child.
          </p>
        </div>

        {/* Stage cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.title}
                className={cn(
                  "group relative flex flex-col overflow-hidden  border bg-canvas-50 transition-all duration-200 hover:shadow-[0_6px_20px_rgba(47,49,58,0.10)]",
                  stage.color
                )}
              >
                {/* Stage image */}
                <div className="relative h-36 w-full overflow-hidden">
                  <Image
                    src={stage.img}
                    alt={stage.title}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-6">
                {/* Icon + tag row */}
                <div className="mb-4 flex items-center justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center ", stage.iconBg)}>
                    <Icon className="size-5" />
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", stage.tagColor)}>
                    {stage.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-lg font-bold text-ink-900">{stage.title}</h3>
                <p className="mt-0.5 text-xs text-ink-600">{stage.subtitle}</p>
                <p className="mt-1 text-xs font-semibold text-ink-600">{stage.grades}</p>

                {/* Divider */}
                <div className="my-4 border-t border-line-200" />

                {/* Features */}
                <ul className="flex-1 space-y-2">
                  {stage.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="#"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 transition-colors hover:text-teal-900"
                >
                  Learn more
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
