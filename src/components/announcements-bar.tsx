"use client";

import { useCallback, useEffect, useState } from "react";

import type { AnnouncementBarDTO } from "@/cms/public/dto";

const themeClasses = { teal: "bg-teal-900", navy: "bg-slate-900", maroon: "bg-red-950" } as const;
const durations = { slow: "45s", normal: "30s", fast: "18s" } as const;

export function AnnouncementsBar({ initial }: { initial: AnnouncementBarDTO }) {
  const [bar, setBar] = useState(initial);
  const refresh = useCallback(() => {
    fetch("/api/content/announcements", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Announcement refresh failed")))
      .then((next: AnnouncementBarDTO) => setBar(next))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [refresh]);

  if (!bar.enabled || bar.messages.length === 0) return null;

  return (
    <aside aria-label="School announcements" className={`group overflow-hidden py-1.5 ${themeClasses[bar.theme]}`}>
      <div className="flex w-full">
        {/* Each copy spans at least the viewport, keeping short lists from repeating side by side. */}
        {[false, true].map((isCopy) => (
          <div
            key={String(isCopy)}
            aria-hidden={isCopy ? true : undefined}
            className={`flex w-max min-w-full shrink-0 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none ${isCopy ? "motion-reduce:hidden" : "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:whitespace-normal"}`}
            style={{ animationDuration: durations[bar.speed] }}
          >
            {bar.messages.map((message) => (
              <span key={message.id} className="mx-4 inline-flex shrink-0 items-center text-xs font-medium text-white/90 motion-reduce:shrink motion-reduce:max-w-[calc(100%-2rem)]">
                <span className="mr-3 inline-block h-1.5 w-1.5 shrink-0 bg-yellow-500" aria-hidden="true" />
                {message.link
                  ? <a href={message.link} tabIndex={isCopy ? -1 : undefined} className="underline-offset-2 hover:underline focus-visible:underline">{message.text}</a>
                  : message.text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
