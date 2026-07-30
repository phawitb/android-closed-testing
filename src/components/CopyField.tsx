"use client";

import { useState } from "react";
import { Check, Copy } from "./icons";

export function CopyField({
  value,
  label,
  hint = "Click to copy",
  copiedLabel = "Copied",
}: {
  value: string;
  label?: string;
  hint?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      {label && <p className="mb-2 text-sm font-extrabold text-ink">{label}</p>}
      <button
        type="button"
        onClick={copy}
        className="flex w-full items-center gap-3 rounded-lg bg-surface-dim px-4 py-3 text-left transition hover:bg-brand-faint"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[15px] break-all text-ink">
            {value}
          </span>
          <span className="block text-xs text-muted">
            {copied ? copiedLabel : hint}
          </span>
        </span>
        <span className="shrink-0 text-muted">
          {copied ? (
            <Check className="h-5 w-5 text-emerald-600" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </span>
      </button>
    </div>
  );
}
