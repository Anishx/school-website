"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/nav-config";

function MobileNavItem({ item, onClose }: { item: typeof navItems[0]; onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const submenuId = useId();
  const hasChildren = !!(item.featured?.length || item.compact?.length || item.sidebar?.length);
  const allLinks = [
    ...(item.featured ?? []),
    ...(item.compact ?? []),
    ...(item.sidebar ?? []),
  ];

  if (!hasChildren) {
    return (
      <Link
        href={item.href ?? "/"}
        onClick={onClose}
        className="flex items-center justify-start px-4 py-3.5 text-left font-display text-3xl uppercase text-ink-900 transition-colors hover:bg-canvas-100"
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex w-full items-center justify-start pl-4 pr-10 py-3.5 text-left font-display text-3xl uppercase text-ink-900 transition-colors hover:bg-canvas-100"
        aria-expanded={open}
        aria-controls={submenuId}
      >
        {item.title}
        <ChevronDown
          className={cn("absolute right-4 size-4 text-ink-600 transition-transform duration-300 motion-reduce:transition-none", open && "rotate-180")}
        />
      </button>

      <div
        id={submenuId}
        inert={!open}
        aria-hidden={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <ul className="min-h-0 overflow-hidden bg-[#F2C230]">
          {allLinks.map((link) => {
            const Icon = item.title === "About Us" ? undefined : link.icon;
            return (
              <li key={link.href + link.title}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-start gap-3 pl-10 pr-4 py-3 text-left font-display text-3xl uppercase text-ink-900 transition-colors hover:bg-black/5"
                >
                  {Icon && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/20 bg-black/5">
                      <Icon className="size-3.5 text-ink-900" />
                    </span>
                  )}
                  <div>
                    <p className="text-ink-900">{link.title}</p>
                    {link.description && (
                      <p className="text-xs text-ink-900 line-clamp-1">{link.description}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — shown only on mobile */}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="flex md:hidden items-center justify-center h-9 w-9 rounded-lg border-0 text-ink-700 transition-colors hover:bg-canvas-100 focus-visible:outline-2 focus-visible:outline-teal-800"
      >
        <span aria-hidden="true" className="relative size-5">
          <span className={cn("absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none", open && "translate-y-[6px] rotate-45")} />
          <span className={cn("absolute left-0 top-[9px] h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-300 motion-reduce:transition-none", open && "scale-x-0 opacity-0")} />
          <span className={cn("absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-transform duration-300 motion-reduce:transition-none", open && "-translate-y-[6px] -rotate-45")} />
        </span>
      </button>

      {/* Overlay */}
        <div
          className={cn("fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none md:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

      {/* Drawer */}
      <div
        id="mobile-navigation"
        inert={!open}
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-[320px] max-w-[90vw] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out motion-reduce:transition-none md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div className="flex shrink-0 items-center justify-end px-4 py-4">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-canvas-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="my-auto w-full shrink-0 py-4">
            {navItems.map((item) => (
              <MobileNavItem key={item.title} item={item} onClose={() => setOpen(false)} />
            ))}
          </div>
        </nav>

        {/* CTA strip */}
        <div className="shrink-0 p-4 flex flex-col gap-2">
          <Link
            href="/apply"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-full bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-yellow-500"
          >
            Apply Now
          </Link>
          <Link
            href="/news-events?tab=downloads"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-full bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
          >
            Download Brochure
          </Link>
        </div>
      </div>
    </>
  );
}
