"use client";

import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn("group/navigation-menu relative z-50 flex w-full flex-col", className)}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex w-full list-none items-stretch", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative flex-1", className)}
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(
        "group inline-flex h-full w-full items-center justify-center gap-1 px-4 py-2 text-sm font-semibold text-white/90 transition-[color,background-color,box-shadow] outline-none",
        "hover:bg-white/8 hover:text-white",
        "focus:bg-white/8 focus:text-white",
        "data-[state=open]:bg-white/12 data-[state=open]:text-white",
        "focus-visible:ring-2 focus-visible:ring-white/30",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className="relative top-px h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "absolute left-0 top-0 w-full",
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",
        "data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
        "data-[motion=from-end]:slide-in-from-right-6 data-[motion=from-start]:slide-in-from-left-6",
        "data-[motion=to-end]:slide-out-to-right-6 data-[motion=to-start]:slide-out-to-left-6",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute left-0 top-full z-[70] flex w-full justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden  border border-line-200/80 bg-white/95 text-ink-800",
          "shadow-[0_14px_34px_rgba(47,49,58,0.16)] backdrop-blur-xl",
          "origin-top-center",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "block px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-canvas-100 hover:text-teal-900 focus:bg-canvas-100",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
        "data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 bg-white shadow-sm" />
    </NavigationMenuPrimitive.Indicator>
  );
}

// --- Rich nav item components ---

import { ArrowRightIcon } from "lucide-react";
import { GridCard } from "@/components/ui/grid-card";

type NavItemType = {
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function NavGridCard({
  link,
  ...props
}: React.ComponentProps<"div"> & { link: NavItemType }) {
  return (
    <NavigationMenuPrimitive.Link asChild>
      <GridCard {...props}>
        {link.icon && <link.icon className="relative size-5 text-teal-800" />}
        <div className="relative">
          <span className="text-sm font-medium text-ink-900">{link.title}</span>
          {link.description && (
            <p className="mt-1 text-xs text-ink-600">{link.description}</p>
          )}
        </div>
      </GridCard>
    </NavigationMenuPrimitive.Link>
  );
}

function NavSmallItem({
  item,
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & {
  item: Omit<NavItemType, "description">;
}) {
  return (
    <NavigationMenuLink
      className={cn(
        "group relative flex h-max flex-row items-center gap-x-3 rounded-lg px-3 py-2.5",
        "text-ink-800 transition-colors hover:bg-canvas-100 hover:text-teal-900",
        className,
      )}
      {...props}
    >
      {item.icon && <item.icon className="size-4 text-ink-600 group-hover:text-teal-800" />}
      <p className="text-sm font-medium">{item.title}</p>
      <div className="relative ml-auto flex h-full w-4 items-center">
        <ArrowRightIcon className="size-3.5 -translate-x-2 text-teal-800 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </NavigationMenuLink>
  );
}

function NavLargeItem({
  link,
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuLink> & { link: NavItemType }) {
  return (
    <NavigationMenuLink
      className={cn(
        "group relative flex flex-col justify-center rounded-lg border border-line-200 bg-white p-0 transition-all hover:border-teal-800/30 hover:shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <div className="space-y-1">
          <span className="text-sm font-semibold leading-none text-ink-900">{link.title}</span>
          {link.description && (
            <p className="line-clamp-1 text-xs text-ink-600">{link.description}</p>
          )}
        </div>
        {link.icon && <link.icon className="size-5 text-ink-600" />}
      </div>
    </NavigationMenuLink>
  );
}

function NavItemMobile({
  item,
  className,
  ...props
}: React.ComponentProps<"a"> & { item: NavItemType }) {
  return (
    <a
      className={cn(
        "group relative flex gap-x-3 rounded-lg p-2.5 text-sm transition-all",
        "hover:bg-canvas-100 hover:text-teal-900",
        className,
      )}
      {...props}
    >
      <div className="flex size-10 items-center justify-center rounded-lg border border-line-200 bg-canvas-50">
        {item.icon && <item.icon className="size-4 text-ink-600" />}
      </div>
      <div className="flex h-10 flex-col justify-center">
        <p className="text-sm font-medium text-ink-900">{item.title}</p>
        {item.description && (
          <span className="line-clamp-1 text-xs leading-snug text-ink-600">
            {item.description}
          </span>
        )}
      </div>
    </a>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavGridCard,
  NavSmallItem,
  NavLargeItem,
  NavItemMobile,
  type NavItemType,
};

