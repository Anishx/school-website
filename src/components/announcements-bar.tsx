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
  const repeated = [...bar.messages, ...bar.messages];

  return (
    <aside aria-label="School announcements" className={`group overflow-hidden py-1.5 ${themeClasses[bar.theme]}`}>
      <div
        className="flex animate-marquee whitespace-nowrap motion-reduce:animate-none group-hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
        style={{ animationDuration: durations[bar.speed] }}
      >
        {repeated.map((message, index) => (
          <span key={`${message.id}-${index}`} className="mx-4 inline-flex items-center text-xs font-medium text-white/90">
            <span className="mr-3 inline-block h-1.5 w-1.5 shrink-0 bg-yellow-500" aria-hidden="true" />
            {message.link
              ? <a href={message.link} className="underline-offset-2 hover:underline focus-visible:underline">{message.text}</a>
              : message.text}
          </span>
        ))}
      </div>
    </aside>
  );
}
