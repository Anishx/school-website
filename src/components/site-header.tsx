import Link from "next/link";
import { PrimaryNavBar } from "@/components/primary-nav-bar";
import { MobileNav } from "@/components/mobile-nav";
import { AnnouncementsBar } from "@/components/announcements-bar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_8px_rgba(47,49,58,0.06)]">
      {/* Announcements bar */}
      <AnnouncementsBar />

      {/* Logo bar */}
      <div className="border-b border-line-200 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-teal-800">
                <span className="text-base font-bold text-white">S</span>
              </div>
              <div>
                <p className="font-display text-base font-bold leading-tight text-ink-900">School Name</p>
                <p className="text-[11px] text-ink-600">Rural • Quality • Aspiration</p>
              </div>
            </Link>
          </div>

          {/* Right: CTA buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="#"
              className="hidden sm:inline-flex rounded-full border-2 border-teal-800 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-800 hover:text-white"
            >
              Contact Us
            </Link>
            <Link
              href="#"
              className="inline-flex rounded-full bg-yellow-600 px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-yellow-500"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop nav bar — hidden on mobile */}
      <div className="hidden md:block">
        <PrimaryNavBar />
      </div>
    </header>
  );
}
