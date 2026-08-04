"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchToggleProps {
  className?: string;
}

export function SearchToggle({ className }: SearchToggleProps) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setExpanded(false);
    }
  }

  return (
    <div className={`relative flex items-center ${className ?? ""}`}>
      <div
        className={`flex items-center overflow-hidden rounded-full border border-line-200 transition-all duration-300 ease-in-out ${
          expanded ? "w-56 bg-white px-3 py-1.5" : "w-10 border-transparent"
        }`}
      >
        <button
          type="button"
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

        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          onBlur={() => setExpanded(false)}
          onKeyDown={handleKeyDown}
          className={`ml-1 w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none transition-opacity duration-300 ${
            expanded ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          tabIndex={expanded ? 0 : -1}
          aria-hidden={!expanded}
        />
      </div>
    </div>
  );
}
