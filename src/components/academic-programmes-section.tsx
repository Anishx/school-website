import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const programmes = [
  {
    title: "Pre-Primary",
    subtitle: "KINDERGARTEN",
    description:
      "A joyful environment where young learners develop foundational skills through play-based learning, storytelling, and creative activities.",
    image: "/images/new/kids-playground.jpg",
  },
  {
    title: "Primary School",
    subtitle: "GRADES I – V",
    description:
      "Strong academic foundation in languages, mathematics, science, and environmental studies through activity-based learning.",
    image: "/images/classroom/hands-up.jpg",
  },
  {
    title: "Middle School",
    subtitle: "GRADES VI – VIII",
    description:
      "Deeper conceptual understanding with balanced curriculum strengthening analytical thinking, leadership, and collaboration.",
    image: "/images/new/HighSchool.jpg",
  },
  {
    title: "Secondary School",
    subtitle: "GRADES IX – X",
    description:
      "Rigorous curriculum, focused mentoring, and continuous assessment preparing students for board examinations.",
    image: "/images/classroom/studying.jpg",
  },
];

export function AcademicProgrammesSection() {
  return (
    <section id="academics" className="bg-teal-900 py-16 md:py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-yellow-500">
            From Pre-Primary to Grade X
          </p>
          <h2 className="font-display mt-3 text-3xl uppercase text-white md:text-5xl lg:text-6xl">
            Our Learning Journey
          </h2>
        </div>

        {/* Cards grid */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programmes.map((prog) => (
            <Link
              key={prog.title}
              href="/admissions"
              className="group relative overflow-hidden block"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={prog.image}
                  alt={prog.title}
                  fill
                  quality={90}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display flex items-center gap-2 text-xl uppercase text-white md:text-2xl">
                  {prog.title}
                  <ArrowUpRight className="size-5 text-white/80" />
                </h3>
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-white/70">
                  {prog.subtitle}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA button */}
        <div className="mt-10 flex justify-center">
          <Button asChild variant="primary" size="lg" className="gap-2 font-bold">
            <Link href="/admissions">
              LEARNING AT AV
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
