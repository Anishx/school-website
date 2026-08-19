import Link from "next/link";
import { ArrowRight, MapPin, Download } from "lucide-react";

export function CtaBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-600 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
      style={{ borderLeft: "10px solid var(--color-teal-900)", borderRight: "10px solid var(--color-teal-900)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6 py-3 md:gap-6">
        <Link
          href="/apply"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink-800"
        >
          Apply Now
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="#campus-visit"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-ink-900 hover:text-white"
        >
          <MapPin className="size-4" />
          Campus Visit
        </Link>
        <Link
          href="#brochure"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-900 px-5 py-2.5 text-sm font-bold text-ink-900 transition hover:bg-ink-900 hover:text-white"
        >
          <Download className="size-4" />
          Brochure
        </Link>
      </div>
    </div>
  );
}
