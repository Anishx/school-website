"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/components/nav-config";

function MobileNavItem({ item, onClose }: { item: typeof navItems[0]; onClose: () => void }) {
  const [open, setOpen] = useState(false);
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
        className="flex items-center px-4 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-canvas-100"
      >
        {item.title}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-canvas-100"
        aria-expanded={open}
      >
        {item.title}
        <ChevronDown
          className={cn("size-4 text-ink-600 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul className="border-t border-line-200 bg-canvas-50">
          {allLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href + link.title}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 text-sm text-ink-800 transition-colors hover:bg-canvas-100"
                >
                  {Icon && (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line-200 bg-white">
                      <Icon className="size-3.5 text-teal-800" />
                    </span>
                  )}
                  <div>
                    <p className="font-medium text-ink-900">{link.title}</p>
                    {link.description && (
                      <p className="text-xs text-ink-600 line-clamp-1">{link.description}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — shown only on mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex md:hidden items-center justify-center h-9 w-9 rounded-lg border border-line-200 text-ink-700 transition-colors hover:bg-canvas-100"
      >
        <Menu className="size-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-[320px] max-w-[90vw] flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-line-200 px-4 py-4">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
            <Image src="/apollo-logo.png" alt="Apollo Vidhyalayam" width={40} height={40} className="h-10 w-auto" />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-canvas-100"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto divide-y divide-line-200">
          {navItems.map((item) => (
            <MobileNavItem key={item.title} item={item} onClose={() => setOpen(false)} />
          ))}
        </nav>

        {/* CTA strip */}
        <div className="border-t border-line-200 p-4 flex flex-col gap-2">
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-full bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900"
          >
            Admission Enquiry
          </Link>
          <Link
            href="#"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center rounded-full bg-yellow-600 px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-yellow-500"
          >
            Visit School
          </Link>
        </div>
      </div>
    </>
  );
}
