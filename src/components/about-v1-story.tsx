'use client';

import Link from "next/link";
import {
  GraduationCap,
  Lightbulb,
  Dumbbell,
  Briefcase,
  ArrowRight,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ImageReveal from "@/components/ui/image-tiles";

type MissionItem = { icon: LucideIcon; text: string };

const missionItems: MissionItem[] = [
  { icon: GraduationCap, text: "Deliver a balanced education that fosters academic excellence, critical thinking, and lifelong learning." },
  { icon: Target, text: "Cultivate character through discipline, integrity, empathy, and respect." },
  { icon: Dumbbell, text: "Promote physical, emotional, and intellectual well-being through sports, yoga, and co-curricular learning." },
  { icon: Lightbulb, text: "Inspire leadership, innovation, and social responsibility in every student." },
  { icon: Briefcase, text: "Provide a safe, inclusive, and nurturing environment where every child can learn, grow, and thrive." },
];

export function AboutV1Story() {
  return (
    <section className="bg-white py-16 md:py-20" aria-labelledby="about-v1-heading">
      <div className="mx-auto max-w-7xl px-6">
        {/* Split: Image Tiles + Story */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start">
          {/* Image Tiles */}
          <div className="flex w-full items-center justify-center md:w-1/2">
            <ImageReveal
              leftImage="/images/about/microscope.jpg"
              middleImage="/images/about/bus.jpg"
              rightImage="/images/campus/kids-camera.jpg"
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-800">Apollo Vidhyalayam</p>
            <h2 id="about-v1-heading" className="mt-2 font-display text-3xl font-bold text-ink-900 md:text-4xl">
              About Us
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-600">
              Apollo Vidhyalayam is committed to transforming education by combining strong academics,
              technology-enabled learning, leadership development, healthcare exposure, and experiential learning.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              The school is evolving into a future-ready institution focused on preparing students
              for success in academics, careers, and life.
            </p>

            {/* Vision & Mission in boxes */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {/* Vision */}
              <div className="border border-line-200 bg-canvas-50 p-5">
                <h3 className="text-sm font-bold text-ink-900">Our Vision</h3>
                <div className="mt-2 mb-3 h-px w-full bg-teal-800" />
                <p className="text-sm leading-relaxed text-ink-600">
                  To inspire young minds to learn with purpose, live with compassion, and grow into responsible individuals who make a meaningful difference.
                </p>
              </div>

              {/* Mission */}
              <div className="border border-line-200 bg-canvas-50 p-5">
                <h3 className="text-sm font-bold text-ink-900">Our Mission</h3>
                <div className="mt-2 mb-3 h-px w-full bg-teal-800" />
                <ul className="mt-2 space-y-2">
                  {missionItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.text} className="flex items-center gap-2">
                        <Icon className="size-3.5 shrink-0 text-teal-800" />
                        <span className="text-sm text-ink-600">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <Link
              href="#"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              Learn More About Us
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
