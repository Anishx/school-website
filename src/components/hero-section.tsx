import Link from "next/link";
import Image from "next/image";
import { BarChart2, UserPlus, Zap } from "lucide-react";

const stats = [
  { icon: BarChart2, value: "85%",  label: "Academic Performance" },
  { icon: UserPlus,  value: "100+", label: "New Admissions" },
  { icon: Zap,       value: "25+",  label: "Activities & Events" },
];

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col"
      style={{ height: "calc(100svh - var(--header-height, 110px))" }}
      aria-label="Hero"
    >
      {/* Background image */}
      <Image
        src="https://picsum.photos/seed/graduation/1600/900"
        alt="Students at school"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

      {/* Content — fills remaining space, text at bottom */}
      <div className="relative z-10 flex flex-1 items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-8 md:px-10 md:pb-12">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Building{" "}
              <span className="text-yellow-400">Future-Ready</span>{" "}
              Leaders
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/80 md:mt-4 md:text-lg">
              Where academic excellence, innovation, leadership, and holistic development come together.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
              <Link
                href="#"
                className="inline-flex items-center rounded-full bg-yellow-500 px-5 py-2.5 text-sm font-bold text-ink-900 transition-colors hover:bg-yellow-400 md:px-6 md:py-3"
              >
                Admissions Open
              </Link>
              <Link
                href="#"
                className="inline-flex items-center rounded-full border-2 border-white/50 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 md:px-6 md:py-3"
              >
                Schedule a Campus Visit
              </Link>
              <Link
                href="#"
                className="inline-flex items-center rounded-full border-2 border-white/30 px-5 py-2.5 text-sm font-bold text-white/80 transition-colors hover:border-white/60 hover:text-white md:px-6 md:py-3"
              >
                Explore Student Life
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics strip — pinned to bottom of hero */}
      <div className="relative z-10 bg-teal-800/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <ul className="grid grid-cols-3 divide-x divide-white/10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <li
                  key={stat.label}
                  className="flex flex-col items-center gap-0.5 px-3 py-4 text-center md:py-5"
                >
                  <Icon className="h-4 w-4 text-yellow-500 mb-0.5 md:h-5 md:w-5" aria-hidden="true" />
                  <span className="text-lg font-bold text-white md:text-2xl">{stat.value}</span>
                  <span className="text-[11px] font-semibold text-white/80 md:text-sm">{stat.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
