"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pathLabels: Record<string, string> = {
  "about-us": "About Us",
  "why-us": "Why Us",
  "leadership": "Leadership",
  "programs": "Programs",
  "admissions": "Admissions",
  "apply": "Apply Now",
  "student-life": "Student Life",
  "news-events": "News & Downloads",
  "gallery": "Gallery",
  "future-vision": "Future Vision",
  "mandatory-public-disclosure": "Mandatory Public Disclosure",
};

type BreadcrumbProps = {
  /** Use "light" for dark backgrounds (white/yellow text), "dark" for light backgrounds */
  variant?: "light" | "dark";
};

export function Breadcrumb({ variant = "light" }: BreadcrumbProps) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = pathLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  const homeClass = variant === "light" ? "text-white/70 hover:text-white" : "text-ink-500 hover:text-ink-900";
  const separatorClass = variant === "light" ? "text-white/40" : "text-ink-400";
  const activeClass = variant === "light" ? "text-yellow-400 font-semibold" : "text-teal-800 font-semibold";
  const linkClass = variant === "light" ? "text-white/70 hover:text-white" : "text-ink-500 hover:text-ink-900";

  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wider">
        <li>
          <Link href="/" className={homeClass}>Home</Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <span className={separatorClass}>/</span>
            {crumb.isLast ? (
              <span className={activeClass}>{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className={linkClass}>
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
