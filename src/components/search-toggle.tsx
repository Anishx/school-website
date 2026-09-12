"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Search, X } from "lucide-react";

interface SearchToggleProps {
  className?: string;
}

export function SearchToggle({ className }: SearchToggleProps) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape") {
      setExpanded(false);
      buttonRef.current?.focus();
    }
  }

  return (
    <div data-search-expanded={expanded} className={`relative flex shrink-0 items-center ${className ?? ""}`}>
      <form role="search" aria-label="Site search" action="/search" method="get"
        onKeyDown={handleKeyDown}
        className={`flex h-10 items-center overflow-hidden rounded-full border transition-[width,background-color,border-color] duration-300 ease-in-out motion-reduce:transition-none ${
          expanded ? "w-[min(14rem,calc(100vw-10rem))] border-line-200 bg-white sm:w-56" : "w-10 border-transparent"
        }`}>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          aria-label={expanded ? "Close search" : "Open search"}
          onClick={() => setExpanded(!expanded)}
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition ${
            expanded
              ? "text-ink-600 hover:text-ink-900"
              : "bg-canvas-100 text-teal-800 shadow-sm hover:bg-canvas-50"
          }`}
        >
          {expanded ? <X className="size-4" /> : <Search className="size-5 stroke-[2.5]" />}
        </button>

        <div id={id} inert={!expanded} aria-hidden={!expanded}
          className={`flex min-w-0 flex-1 items-center transition-opacity duration-300 motion-reduce:transition-none ${expanded ? "opacity-100" : "opacity-0"}`}>
          <label htmlFor={`${id}-query`} className="sr-only">Search the website</label>
          <input
          ref={inputRef}
          id={`${id}-query`}
          name="q"
          type="search"
          required
          maxLength={200}
          placeholder="Search..."
          disabled={!expanded}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink-900 placeholder:text-ink-400 outline-none"
        />
          <button type="submit" disabled={!expanded} aria-label="Submit search" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-teal-800 hover:bg-canvas-100"><Search className="size-4" /></button>
        </div>
      </form>
    </div>
  );
}
