"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { ChevronDown, GraduationCap, UserRound, BriefcaseBusiness } from "lucide-react";
import type { LoginMenuDTO } from "@/cms/public/login-menu";

export function LoginDropdown({ menu }: { menu: LoginMenuDTO }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!menu.enabled || menu.entries.length === 0) return null;

  return (
    <div ref={ref} className="relative hidden sm:block"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}>
      <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex max-w-48 items-center rounded-full border-2 border-teal-800 px-4 py-2 text-sm font-bold text-teal-800 transition hover:bg-teal-800 hover:text-white">
        <span className="break-words">{menu.label}</span>
        <ChevronDown aria-hidden="true" className={`ml-1.5 size-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <ul id={id} aria-label={`${menu.label} links`}
        className="absolute right-0 top-full z-50 mt-3 w-60 divide-y divide-gray-200 border border-gray-200 bg-white shadow-lg">
        {menu.entries.map((entry) => {
          const Icon = entry.label === "Student" ? GraduationCap : entry.label === "Staff" ? BriefcaseBusiness : UserRound;
          const content = <><Icon aria-hidden="true" className="size-4 shrink-0" /><span className="min-w-0 break-words">{entry.label}</span></>;
          const className = "flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-800";
          return <li key={entry.id}>
            {entry.href ? <Link href={entry.href} onClick={() => setOpen(false)}
              target={entry.newTab ? "_blank" : undefined} rel={entry.newTab ? "noopener noreferrer" : undefined}
              className={`${className} transition-colors hover:bg-canvas-50 hover:text-teal-800`}>{content}</Link>
              : <span className={className}>{content}</span>}
          </li>;
        })}
      </ul>}
    </div>
  );
}
