"use client";

import Link from "next/link";
import { navItems, type NavItem } from "@/components/nav-config";

function SimpleDropdown({ item }: { item: NavItem }) {
  const links = item.compact || item.featured || [];
  if (links.length === 0) return null;

  return (
    <div className="invisible absolute left-1/2 top-full z-50 min-w-[180px] -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
      <div className="border border-gray-200 bg-white shadow-lg">
        {links.map((link, idx) => (
          <div key={link.href + link.title}>
            <Link
              href={link.href}
              className="block px-5 py-3 text-sm font-semibold text-gray-800 transition-colors hover:text-teal-700"
            >
              {link.title}
            </Link>
            {idx < links.length - 1 && (
              <div className="mx-4 h-px bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PrimaryNavBar() {
  return (
    <nav className="relative z-40 border-t border-white/10 bg-teal-900" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-6">
        <ul className="flex w-full items-stretch">
          {navItems.map((item) => {
            const hasDropdown = !!(item.compact || item.featured);

            return (
              <li
                key={item.title}
                className="group relative flex flex-1 items-stretch justify-center"
              >
                {hasDropdown ? (
                  <>
                    <button
                      type="button"
                      className="flex h-full w-full items-center justify-center gap-1 px-4 py-3 text-[14px] font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                    >
                      {item.title}
                      <svg
                        className="ml-1 h-3 w-3 transition-transform group-hover:rotate-180"
                        fill="none"
                        viewBox="0 0 12 12"
                      >
                        <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <SimpleDropdown item={item} />
                  </>
                ) : (
                  <Link
                    href={item.href || "/"}
                    className="flex h-full w-full items-center justify-center px-4 py-3 text-[14px] font-semibold text-white/90 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
