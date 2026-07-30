"use client";

import { useActionState, useState } from "react";
import { Card, ErrorText, StatusPill, cn } from "@/components/ui";
import { ChevronDown } from "@/components/icons";
import { STATUS_LABEL, currentDay, formatDay } from "@/lib/testing";
import type { AppMessage } from "@/lib/testing";
import { updateApp, sendMessage, type AdminState } from "./actions";
import type { AdminApp } from "./types";

const STATUSES = [
  "draft",
  "awaiting_setup",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function AdminAppCard({
  app,
  messages,
  needsAction,
}: {
  app: AdminApp;
  messages: AppMessage[];
  needsAction: boolean;
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    updateApp,
    {},
  );
  const [messageState, messageAction, messagePending] = useActionState<
    AdminState,
    FormData
  >(sendMessage, {});
  const [expanded, setExpanded] = useState(false);

  const day = currentDay(app);
  const lastMessage = messages.at(-1);

  return (
    <Card
      className={cn(needsAction && "border-2 border-red-300 shadow-red-100")}
    >
      {needsAction && (
        <span className="mb-3 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-[11px] font-extrabold tracking-wider text-red-700 uppercase">
          Needs attention
        </span>
      )}

      {/* --------------------------------------------------- identity */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold text-ink">{app.name}</h3>
          <p className="text-sm text-muted">
            {app.owner_email ?? "unknown owner"} ·{" "}
            {app.app_type === "free" ? "Free" : "Paid"} ·{" "}
            {app.token_code ? (
              <span className="font-mono">{app.token_code}</span>
            ) : (
              <span className="text-brand">no token</span>
            )}
          </p>
          <a
            href={app.store_url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-block max-w-full truncate text-sm text-brand underline underline-offset-4"
          >
            {app.store_url}
          </a>
          <p className="mt-1 text-sm text-muted">{app.contact_email}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusPill
            label={STATUS_LABEL[app.status]}
            tone={
              app.status === "in_progress"
                ? "brand"
                : app.status === "completed"
                  ? "ok"
                  : "muted"
            }
          />
          <span className="text-sm font-bold text-ink">
            Day {day} / {app.total_days}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        <Flag
          on={Boolean(app.setup_confirmed_at)}
          label={app.setup_confirmed_at ? "Setup confirmed" : "Setup pending"}
        />
        {app.app_type === "paid" && (
          <Flag
            on={Boolean(app.promo_codes_submitted_at)}
            label={
              app.promo_codes_submitted_at
                ? "Promo codes received"
                : "Promo codes pending"
            }
          />
        )}
        {messages.length > 0 && (
          <span className="rounded-full bg-surface-dim px-2.5 py-1 text-muted">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {lastMessage && !expanded && (
        <p className="mt-3 truncate text-sm text-muted">
          <span className="font-bold text-ink">
            {lastMessage.sender === "owner" ? "Customer" : "Admin"}:
          </span>{" "}
          {lastMessage.body}
        </p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand"
      >
        {expanded ? "Hide details" : "Show details & edit"}
        <ChevronDown
          className={cn("h-4 w-4 transition", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <>
          {app.promo_codes && (
            <div className="mt-3 rounded-xl bg-surface-dim px-3 py-2">
              <p className="text-xs font-bold text-muted uppercase">
                Promo codes
              </p>
              <p className="mt-1 font-mono text-sm whitespace-pre-wrap text-ink">
                {app.promo_codes}
              </p>
            </div>
          )}

          {/* ------------------------------------------------ cycle controls */}
          <form
            action={formAction}
            className="mt-5 space-y-4 border-t border-line pt-5"
          >
            <p className="text-xs font-extrabold tracking-wider text-muted uppercase">
              Cycle controls
            </p>
            <input type="hidden" name="app_id" value={app.id} />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={app.status}
                  className={inputClass}
                >
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">
                  Day 1 date
                </span>
                <input
                  type="date"
                  name="started_on"
                  defaultValue={app.started_on ?? ""}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">
                  Total days
                </span>
                <input
                  type="number"
                  name="total_days"
                  min={1}
                  max={60}
                  defaultValue={app.total_days}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">
                  Pin current day
                </span>
                <input
                  type="number"
                  name="day_override"
                  min={0}
                  max={60}
                  defaultValue={app.day_override ?? ""}
                  placeholder="auto"
                  className={inputClass}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted">
              <Checkbox name="clear_started_on" label="Clear start date" />
              <Checkbox name="clear_day_override" label="Unpin day" />
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-muted">
                Internal note
              </span>
              <input
                name="admin_note"
                defaultValue={app.admin_note ?? ""}
                className={inputClass}
              />
            </label>

            <ErrorText>{state.error}</ErrorText>
            {state.notice && (
              <p className="text-sm font-semibold text-emerald-600">
                {state.notice}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-125 disabled:opacity-60"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="submit"
                name="start_now"
                value="1"
                disabled={pending || app.status === "in_progress"}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40"
              >
                Start cycle today
              </button>
            </div>
          </form>

          {/* --------------------------------------------------- messages */}
          <div className="mt-5 border-t border-line pt-5">
            <p className="text-xs font-extrabold tracking-wider text-muted uppercase">
              Messages
            </p>

            {messages.length > 0 && (
              <ol className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {messages.map((message) => (
                  <li
                    key={message.id}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm leading-relaxed",
                      message.sender === "owner"
                        ? "bg-red-50 text-ink"
                        : "bg-surface-dim text-ink",
                    )}
                  >
                    <p className="text-xs font-extrabold tracking-wider text-muted uppercase">
                      {message.sender === "owner" ? "Customer" : "Admin"} ·{" "}
                      {formatDay(message.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                  </li>
                ))}
              </ol>
            )}

            <form action={messageAction} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="app_id" value={app.id} />
              <textarea
                name="body"
                rows={2}
                placeholder="Reply to the customer…"
                className={cn(inputClass, "resize-y")}
              />
              <ErrorText>{messageState.error}</ErrorText>
              <button
                type="submit"
                disabled={messagePending}
                className="self-start rounded-full border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-surface-dim disabled:opacity-60"
              >
                {messagePending ? "Sending…" : "Reply"}
              </button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
}

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1",
        on ? "bg-emerald-50 text-emerald-700" : "bg-surface-dim text-muted",
      )}
    >
      {label}
    </span>
  );
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        value="1"
        className="accent-[var(--brand)]"
      />
      {label}
    </label>
  );
}
