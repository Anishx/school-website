import * as React from "react";
import { cn } from "@/lib/utils";

function GridCard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex cursor-pointer flex-col gap-3 overflow-hidden  border border-line-200",
        "bg-white p-4 transition-all duration-200",
        "hover:border-teal-800/30 hover:bg-canvas-50 hover:shadow-[0_4px_12px_rgba(14,90,120,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { GridCard };
