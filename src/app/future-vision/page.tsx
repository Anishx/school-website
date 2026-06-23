import { SiteHeader } from "@/components/site-header";
import { ArrowRight } from "lucide-react";

const initiatives = [
  "Transition to Apollo Vidhyalayam Brand",
  "CBSE Academic Excellence Roadmap",
  "School Infrastructure Upgrades",
  "Additional School Buses",
  "Teacher Capacity Building Programs",
  "Education Specialists & Domain Experts",
];

export default function FutureVisionPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-teal-900 py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">What&apos;s Next</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">
              Building a Future-Ready Institution
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              Our goal is to become one of the region's leading schools for innovation, academic excellence, and holistic student development.
            </p>
          </div>
        </section>

        {/* Initiatives */}
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mt-12 md:mt-16">
              <hr className="border-line-200" />
              {initiatives.map((item, index) => (
                <div key={item}>
                  <div className="flex items-center gap-4 py-5 md:py-6">
                    <span className="w-16 shrink-0 text-sm font-semibold text-ink-400 md:w-24 md:text-base">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-lg font-semibold text-ink-900 md:text-xl lg:text-2xl">
                      {item}
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-900 text-ink-900">
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                  <hr className="border-line-200" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
