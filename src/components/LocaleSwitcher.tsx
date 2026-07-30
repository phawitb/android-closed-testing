"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/lib/i18n/actions";
import { ChevronDown } from "./icons";
import { cn } from "./ui";

/**
 * Shows only the current language. Clicking opens a small list of the
 * other locale(s) to switch to. The choice lives in a cookie, so every
 * server component re-renders in the new language after `router.refresh()`.
 */
export function LocaleSwitcher({
  locale,
  className,
  size = "sm",
}: {
  locale: Locale;
  className?: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const others = LOCALES.filter((option) => option !== locale);

  return (
    <div ref={ref} className={cn("relative inline-block shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-line bg-white font-bold text-ink transition hover:bg-surface-dim",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
          pending && "opacity-60",
        )}
      >
        {LOCALE_LABEL[locale]}
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[7rem] rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          {others.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(option)}
                className="w-full rounded-md px-3 py-2 text-left text-sm font-bold text-ink transition hover:bg-surface-dim"
              >
                {LOCALE_LABEL[option]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
