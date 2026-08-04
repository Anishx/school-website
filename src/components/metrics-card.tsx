import Image from "next/image";
import { Award, Globe, Beaker, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  value: string;
  label: string;
};

const stats: Stat[] = [
  { icon: Award, value: "85%", label: "Academic Achievement" },
  { icon: Globe, value: "100+", label: "New Admissions" },
  { icon: Beaker, value: "25+", label: "School Events" },
  { icon: Users, value: "95%", label: "Technology Adoption" },
];

export function MetricsCard() {
  return (
    <section className="bg-canvas-50 py-12 md:py-16" aria-labelledby="metrics-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden border border-line-200 bg-white shadow-[0_8px_30px_rgba(47,49,58,0.12)]">
          <div className="flex flex-col md:flex-row">
          {/* Left — Image (50% width) */}
          <div className="relative h-52 md:h-auto md:w-1/2 shrink-0">
            <Image
              src="/images/campus/playground.jpg"
              alt="School campus"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 340px"
            />
          </div>

          {/* Right — Content */}
          <div className="flex-1 p-6 md:p-8 lg:p-10">
            <h3 id="metrics-heading" className="font-display text-xl font-bold uppercase tracking-wide text-teal-800 md:text-2xl">
              Why Choose Us?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              As a trusted school committed to nurturing intellect, character, and future leaders — our results speak for themselves.
            </p>

            {/* 2x2 stats grid */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-start gap-3">
                    <Icon className="size-5 shrink-0 text-teal-800 mt-0.5" />
                    <div>
                      <span className="block text-xl font-bold text-teal-900">{stat.value}</span>
                      <span className="block text-xs font-semibold text-ink-600">{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
