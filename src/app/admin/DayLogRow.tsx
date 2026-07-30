"use client";

import { useState, useTransition } from "react";
import { cn } from "@/components/ui";
import { Bolt, Check, Lock } from "@/components/icons";
import { dayCopy, formatDay } from "@/lib/testing";
import type { AppDayLog, DayState, TimelineDay } from "@/lib/testing";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { setDayLog } from "./actions";

// The admin console is deliberately English-only, regardless of the admin's
// own locale — this is what lets it show the customer's exact copy.
const EN = getDictionary("en");

const STATE_OPTIONS: { value: DayState; label: string }[] = [
  { value: "locked", label: "Locked" },
  { value: "current", label: "In progress (today)" },
  { value: "completed", label: "Completed" },
];

export function DayLogRow({
  appId,
  entry,
  scheduled,
  log,
}: {
  appId: string;
  entry: TimelineDay;
  /** Whether the cycle has a start date — feeds the customer-facing copy. */
  scheduled: boolean;
  log?: AppDayLog;
}) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<DayState>(log?.state ?? entry.state);
  const [message, setMessage] = useState(log?.message ?? "");
  const [error, setError] = useState<string | null>(null);

  function save(nextState: DayState, nextMessage: string) {
    setError(null);
    startTransition(async () => {
      const result = await setDayLog(appId, entry.day, nextState, nextMessage);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li
      className={cn(
        "rounded-lg px-3 py-2",
        state === "current" && "bg-brand-faint",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2",
            state === "completed" && "border-brand/40 text-brand",
            state === "current" && "border-brand bg-brand text-white",
            state === "locked" && "border-line text-muted",
          )}
        >
          {state === "completed" ? (
            <Check className="h-3.5 w-3.5" />
          ) : state === "current" ? (
            <Bolt className="h-3.5 w-3.5" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
        </span>
        <span className="min-w-0 flex-1 text-sm font-bold text-ink">
          Day {entry.day}
          {entry.date && (
            <span className="ml-1.5 font-medium text-muted">
              {formatDay(entry.date)}
            </span>
          )}
        </span>
        <select
          value={state}
          onChange={(event) => {
            const next = event.target.value as DayState;
            setState(next);
            save(next, message);
          }}
          className="shrink-0 rounded-lg border border-line bg-white px-2 py-1 text-xs font-bold text-ink outline-none focus:border-brand"
        >
          {STATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-1.5 ml-10 text-xs text-muted italic">
        Shown to customer: “{dayCopy(entry, state, scheduled, EN)}”
      </p>

      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onBlur={() => save(state, message)}
        placeholder="Update for the customer…"
        className="mt-1.5 ml-10 w-[calc(100%-2.5rem)] rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand"
      />
      {pending && <p className="mt-1 ml-10 text-xs text-muted">Saving…</p>}
      {error && (
        <p className="mt-1 ml-10 text-xs font-semibold text-red-600">{error}</p>
      )}
    </li>
  );
}
