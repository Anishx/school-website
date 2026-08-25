import Link from "next/link";
import { ArrowRight, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-600 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]"
      style={{ borderLeft: "10px solid var(--color-teal-900)", borderRight: "10px solid var(--color-teal-900)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6 py-3 md:gap-6">
        <Button asChild variant="dark" size="md" className="font-bold">
          <Link href="/apply">
            Apply Now
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="md" className="font-bold">
          <Link href="#campus-visit">
            <MapPin className="size-4" />
            Campus Visit
          </Link>
        </Button>
        <Button asChild variant="outline" size="md" className="font-bold">
          <Link href="#brochure">
            <Download className="size-4" />
            Brochure
          </Link>
        </Button>
      </div>
    </div>
  );
}
