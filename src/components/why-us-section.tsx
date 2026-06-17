import Image from "next/image";
import {
  BarChart2,
  Monitor,
  Microscope,
  Lightbulb,
  Users,
  Trophy,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Reason = {
  icon: LucideIcon;
  text: string;
};

const reasons: Reason[] = [
  { icon: BarChart2, text: "Academic Results Improved to 85%" },
  { icon: Monitor, text: "Smart Classrooms & Digital Learning" },
  { icon: Microscope, text: "Medical Pathways Program" },
  { icon: Lightbulb, text: "Brighter Minds Cognitive Development" },
  { icon: Users, text: "Leadership & Life Skills Programs" },
  { icon: Trophy, text: "Sports Excellence & Championships" },
  { icon: MapPin, text: "Exposure Visits & Educational Tours" },
];

type Stat = {
  value: string;
  label: string;
};

const stats: Stat[] = [
  { value: "85%", label: "Academic Achievement" },
  { value: "100+", label: "New Admissions" },
  { value: "25+", label: "School Events" },
  { value: "100+", label: "Students Benefited Through Medical Exposure" },
  { value: "95%", label: "Technology Adoption Among Staff" },
];

export function WhyUsSection() {
  return (
    <section className="relative overflow-hidden bg-teal-900 py-16 md:py-24" aria-labelledby="why-us-heading">
      {/* Background image with overlay */}
      <Image
        src="https://picsum.photos/seed/school-wide/1600/800"
        alt=""
        fill
        className="object-cover object-center opacity-20"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 to-teal-900/95" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Why Us */}
        <div className="mb-16">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-yellow-400">
            Why Choose Us
          </p>
          <h2
            id="why-us-heading"
            className="font-display text-3xl font-bold text-white md:text-4xl"
          >
            Why Us?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.text}
                  className="flex items-center gap-3  border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center  bg-yellow-500/15">
                    <Icon className="size-4 text-yellow-400" />
                  </div>
                  <p className="text-sm font-medium text-white/90">{reason.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Numbers */}
        <div>
          <p className="mb-6 text-xs font-bold uppercase tracking-widest text-yellow-400">
            Impact Numbers
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center  border border-white/10 bg-white/5 px-4 py-6 text-center backdrop-blur-sm"
              >
                <span className="text-3xl font-bold text-yellow-400 md:text-4xl">{stat.value}</span>
                <span className="mt-2 text-xs font-semibold leading-tight text-white/70">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
