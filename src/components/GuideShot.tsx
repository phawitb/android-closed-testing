"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, X } from "./icons";

/** Play Console screenshot with a magnifier that opens a floating preview. */
export function GuideShot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full overflow-hidden rounded-lg border border-line bg-white ${className ?? ""}`}
      >
        <Image
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          className="h-auto w-full"
        />
        <span className="absolute right-2 bottom-2 grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-white transition group-hover:bg-brand">
          <Search className="h-4 w-4" />
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 sm:p-8"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="ct-pop relative max-h-full max-w-4xl overflow-auto rounded-lg bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-white transition hover:bg-brand"
            >
              <X className="h-5 w-5" />
            </button>
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1080}
              className="h-auto w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
