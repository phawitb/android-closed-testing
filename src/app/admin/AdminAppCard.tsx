"use client";

import { useActionState, useState } from "react";
import { Card, ErrorText, StatusPill, cn } from "@/components/ui";
import { ChevronDown } from "@/components/icons";
import {
  STATUS_LABEL,
  buildTimeline,
  currentDay,
  formatDay,
  today,
} from "@/lib/testing";
import type { AppDayLog, AppMessage } from "@/lib/testing";
import { updateApp, sendMessage, type AdminState } from "./actions";
import { DayLogRow } from "./DayLogRow";
import type { AdminApp } from "./types";

const inputClass =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function AdminAppCard({
  app,
  messages,
  dayLogs,
  needsAction,
}: {
  app: AdminApp;
  messages: AppMessage[];
  dayLogs: AppDayLog[];
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
  const [detailTab, setDetailTab] = useState<"days" | "messages">("days");

  const day = currentDay(app);
  const lastMessage = messages.at(-1);
  const timeline = buildTimeline(app);
  const dayLogByDay = new Map(dayLogs.map((log) => [log.day, log]));

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
          <form action={formAction} className="mt-5 border-t border-line pt-5">
            <p className="text-xs font-extrabold tracking-wider text-muted uppercase">
              Cycle controls
            </p>
            <input type="hidden" name="app_id" value={app.id} />
            <input type="hidden" name="start_now" value="1" />

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-muted">
                  Start date
                </span>
                <input
                  type="date"
                  name="started_on"
                  defaultValue={app.started_on ?? today()}
                  className={inputClass}
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
              >
                {pending ? "Starting…" : "Start program"}
              </button>
            </div>

            <ErrorText>{state.error}</ErrorText>
            {state.notice && (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                {state.notice}
              </p>
            )}
          </form>

          {/* ---------------------------------------------------- subtabs */}
          <div className="mt-5 border-t border-line pt-5">
            <div className="flex gap-1 rounded-full bg-surface-dim p-1 text-sm font-bold">
              <TabButton
                active={detailTab === "days"}
                onClick={() => setDetailTab("days")}
              >
                Day list ({app.total_days})
              </TabButton>
              <TabButton
                active={detailTab === "messages"}
                onClick={() => setDetailTab("messages")}
              >
                Messages{messages.length > 0 ? ` (${messages.length})` : ""}
              </TabButton>
            </div>

            {detailTab === "days" && (
              <ol className="mt-4 max-h-96 space-y-1 overflow-y-auto">
                {timeline.map((entry) => (
                  <DayLogRow
                    key={entry.day}
                    appId={app.id}
                    entry={entry}
                    scheduled={Boolean(app.started_on)}
                    log={dayLogByDay.get(entry.day)}
                  />
                ))}
              </ol>
            )}

            {detailTab === "messages" && (
              <div className="mt-4">
                {messages.length > 0 && (
                  <ol className="max-h-64 space-y-2 overflow-y-auto">
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
                        <p className="mt-1 whitespace-pre-wrap">
                          {message.body}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}

                <form
                  action={messageAction}
                  className={cn(
                    "flex flex-col gap-2",
                    messages.length > 0 && "mt-3",
                  )}
                >
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
            )}
          </div>
        </>
      )}
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full px-4 py-1.5 transition",
        active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
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
