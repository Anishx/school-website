import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PrimaryNavBar } from "@/components/primary-nav-bar";
import { MobileNav } from "@/components/mobile-nav";
import { AnnouncementsBar } from "@/components/announcements-bar";
import { SearchToggle } from "@/components/search-toggle";
import { LoginDropdown } from "@/components/login-dropdown";
import { Breadcrumb } from "@/components/breadcrumb";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[0_1px_8px_rgba(47,49,58,0.06)]">
      {/* Announcements bar */}
      <AnnouncementsBar />

      {/* Logo bar */}
      <div className="border-b border-line-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link href="/" className="flex items-center">
              <Image
                src="/apollo-logo.png"
                alt="Apollo Vidhyalayam"
                width={112}
                height={112}
                className="h-14 w-auto"
              />
            </Link>
          </div>

          {/* Right: Login + Apply Now + Search */}
          <div className="flex items-center gap-2">
            <LoginDropdown />
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 rounded-full bg-yellow-600 px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-yellow-500"
            >
              Apply Now
              <ArrowRight className="size-3.5" />
            </Link>
            <SearchToggle />
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
