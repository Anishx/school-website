import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Canonical site button. Every interactive call-to-action should use this so the
 * shape (rounded-full), hover, focus and click/active animations stay consistent
 * across the entire site.
 *
 * Use `asChild` to render the styles onto a `next/link` <Link> or an <a>.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-800 focus-visible:ring-offset-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0",
  {
    variants: {
      variant: {
        // Yellow — primary CTA (matches navbar "Apply Now")
        primary: "bg-yellow-600 text-ink-900 hover:bg-yellow-500",
        // Dark solid (matches sticky CTA bar "Apply Now")
        dark: "bg-ink-900 text-white hover:bg-ink-800",
        // Teal solid
        teal: "bg-teal-800 text-white hover:bg-teal-700",
        // Outline on light backgrounds
        outline:
          "border-2 border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white",
        // Outline on dark/teal backgrounds
        outlineLight:
          "border-2 border-white/60 text-white hover:border-white hover:bg-white/10",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-sm",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
