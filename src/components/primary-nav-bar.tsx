"use client";

import Link from "next/link";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { navItems, type NavItem, type NavLink } from "@/components/nav-config";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";

// Large featured card — image background + title + description
function FeaturedCard({ link }: { link: NavLink }) {
  const Icon = link.icon;
  return (
    <NavigationMenuLink asChild>
      <Link
        href={link.href}
        className={cn(
          "group relative flex flex-col justify-end overflow-hidden  border border-line-200",
          "transition-all duration-200 hover:border-teal-800/30 hover:shadow-[0_4px_16px_rgba(14,90,120,0.10)]",
          "min-h-[160px]"
        )}
      >
        {/* Image background */}
        {link.image ? (
          <>
            <Image
              src={link.image}
              alt={link.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="300px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5" />
          </>
        ) : (
          <div
            className="pointer-events-none absolute inset-0 bg-canvas-50 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #0E5A78 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden="true"
          />
        )}
        {Icon && (
          <div className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center  bg-white/90 shadow-sm backdrop-blur-sm">
            <Icon className="size-3.5 text-teal-800" />
          </div>
        )}
        <div className="relative p-4">
          <p className={cn("text-sm font-semibold", link.image ? "text-white" : "text-ink-900")}>{link.title}</p>
          {link.description && (
            <p className={cn("mt-0.5 text-xs leading-snug", link.image ? "text-white/80" : "text-ink-600")}>{link.description}</p>
          )}
        </div>
      </Link>
    </NavigationMenuLink>
  );
}

// Compact horizontal card — title + description + icon on right
function CompactCard({ link }: { link: NavLink }) {
  const Icon = link.icon;
  return (
    <NavigationMenuLink asChild>
      <Link
        href={link.href}
        className={cn(
          "group flex items-center justify-between  border border-line-200 bg-white px-4 py-3",
          "transition-all duration-200 hover:border-teal-800/20 hover:bg-canvas-50 hover:shadow-sm"
        )}
      >
        <div>
          <p className="text-sm font-semibold text-ink-900">{link.title}</p>
          {link.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-600">{link.description}</p>
          )}
        </div>
        {Icon && <Icon className="ml-3 size-4 shrink-0 text-ink-600 group-hover:text-teal-800" />}
      </Link>
    </NavigationMenuLink>
  );
}

// Sidebar list item — title + description + icon
function SidebarItem({ link }: { link: NavLink }) {
  const Icon = link.icon;
  return (
    <NavigationMenuLink asChild>
      <Link
        href={link.href}
        className="group flex items-center justify-between  px-3 py-3 transition-colors hover:bg-canvas-100"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-900">{link.title}</p>
          {link.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-600">{link.description}</p>
          )}
        </div>
        {Icon && (
          <div className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center  border border-line-200 bg-white">
            <Icon className="size-3.5 text-ink-600 group-hover:text-teal-800" />
          </div>
        )}
      </Link>
    </NavigationMenuLink>
  );
}

function NavDropdownContent({ item }: { item: NavItem }) {
  const hasSidebar = item.sidebar && item.sidebar.length > 0;

  return (
    <div className="flex">
      {/* Main area */}
      <div className="flex-1 p-5">
        {/* Featured cards — 2 columns */}
        {item.featured && item.featured.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {item.featured.map((link) => (
              <FeaturedCard key={link.href + link.title} link={link} />
            ))}
          </div>
        )}
        {/* Compact cards — up to 3 columns */}
        {item.compact && item.compact.length > 0 && (
          <div className={cn(
            "grid gap-2",
            item.compact.length === 3 ? "grid-cols-3" : "grid-cols-2"
          )}>
            {item.compact.map((link) => (
              <CompactCard key={link.href + link.title} link={link} />
            ))}
          </div>
        )}
      </div>

      {/* Sidebar */}
      {hasSidebar && (
        <div className="w-[210px] shrink-0 border-l border-line-200 p-3">
          <ul>
            {item.sidebar!.map((link) => (
              <li key={link.href + link.title}>
                <SidebarItem link={link} />
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-line-200 pt-3 px-3">
            <Link
              href="#"
              className="group flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-900"
            >
              View all
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export function PrimaryNavBar() {
  const [openValue, setOpenValue] = useState<string>("");

  return (
    <nav className="relative z-40 border-t border-white/10 bg-teal-900" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl">
        <NavigationMenu
          value={openValue}
          onValueChange={setOpenValue}
          onMouseLeave={() => setOpenValue("")}
          className="w-full"
        >
          <NavigationMenuList className="w-full">
            {navItems.map((item) => (
              <NavigationMenuItem
                key={item.title}
                value={item.title}
                className="flex flex-1 items-stretch justify-center"
                onMouseEnter={() =>
                  setOpenValue(item.featured || item.compact ? item.title : "")
                }
              >
                {item.featured || item.compact ? (
                  <>
                    <NavigationMenuTrigger className="text-[14px]">
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent onMouseEnter={() => setOpenValue(item.title)}>
                      <NavDropdownContent item={item} />
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href || "/"}
                      className="flex h-full w-full items-center justify-center px-4 py-3 text-[14px] font-semibold text-white/90 transition hover:bg-white/8 hover:text-white"
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
