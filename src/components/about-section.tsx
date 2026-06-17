import Image from "next/image";
import Link from "next/link";
import { Zap, Palette, Puzzle, BookOpen, Box, Brain, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Zap,
    title: "Proven Academic Excellence",
    description: "85% academic achievement with consistent mandal-level top performers.",
  },
  {
    icon: Palette,
    title: "Holistic Development",
    description: "Sports, arts, clubs and leadership programs for well-rounded growth.",
  },
  {
    icon: Puzzle,
    title: "Smart Classrooms",
    description: "Digital learning tools and tech-enabled teaching across all grades.",
  },
  {
    icon: BookOpen,
    title: "Special Programs",
    description: "Brighter Minds, Spoken English and Medical Pathways for every student.",
  },
  {
    icon: Box,
    title: "Safe & Nurturing Campus",
    description: "Modern facilities with a caring environment for every child to thrive.",
  },
  {
    icon: Brain,
    title: "Future-Ready Education",
    description: "CBSE curriculum with life skills, critical thinking and career guidance.",
  },
];

export function AboutSection() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="about-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Features grid */}
        <div className="text-center">
          <h2 id="about-heading" className="text-2xl font-semibold text-ink-900 md:text-3xl">
            About Our School
          </h2>
          <p className="mt-2 text-sm text-ink-600 mx-auto max-w-lg">
            A trusted institution shaping confident, capable children through quality education, innovation and care.
          </p>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-12 px-0 md:grid-cols-2 lg:grid-cols-3 md:gap-16">
          {/* Subtle glow */}
          <div className="absolute -top-60 left-1/2 -translate-x-1/2 h-[400px] w-[400px] bg-yellow-500/5 blur-[200px] -z-10" aria-hidden="true" />

          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                <div className="flex h-10 w-10 items-center justify-center border border-teal-800/20 bg-teal-800/5 p-2">
                  <Icon className="size-5 text-teal-800" />
                </div>
                <div className="mt-4 space-y-1.5">
                  <h3 className="text-sm font-semibold text-ink-800">{feature.title}</h3>
                  <p className="text-sm text-ink-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* What we do — split layout */}
        <div className="mt-20 flex flex-col items-center gap-10 md:flex-row">
          {/* Image */}
          <div className="relative shrink-0 overflow-hidden shadow-xl shadow-teal-900/10">
            <Image
              src="https://picsum.photos/seed/school-kids-play/500/500"
              alt="Students in school"
              width={450}
              height={450}
              className="object-cover"
            />
            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 flex max-w-[280px] items-center gap-2 bg-white p-3 shadow-md">
              <div className="flex -space-x-3 shrink-0">
                <Image
                  src="https://picsum.photos/seed/face1/80/80"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="https://picsum.photos/seed/face2/80/80"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="https://picsum.photos/seed/face3/80/80"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover"
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-teal-800 text-[10px] font-bold text-white">
                  50+
                </div>
              </div>
              <p className="text-xs font-medium text-ink-800">Join our growing school community</p>
            </div>
          </div>

          {/* Text content */}
          <div className="max-w-lg text-sm text-ink-600">
            <h3 className="text-lg font-semibold uppercase text-ink-800">What We Do</h3>
            <div className="mt-1 h-[3px] w-20 bg-gradient-to-r from-teal-800 to-teal-800/20" />
            <p className="mt-6">
              We provide quality CBSE education from Pre-Primary to Grade 10, combining academic rigour
              with holistic development programs that build confidence and character.
            </p>
            <p className="mt-4">
              From Brighter Minds cognitive training to medical pathways, spoken English fluency and
              exposure visits — every child gets the tools to succeed beyond the classroom.
            </p>
            <p className="mt-4">
              Our tech-enabled campus with smart classrooms, dedicated sports facilities and a nurturing
              environment ensures students are future-ready from day one.
            </p>
            <Link
              href="#"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Read more
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
