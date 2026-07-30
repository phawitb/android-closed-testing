"use client";

import { useActionState } from "react";
import { Card, ErrorText, StatusPill } from "@/components/ui";
import { GoogleMark } from "@/components/icons";
import { addAdmin, removeAdmin, type AdminState } from "../actions";
import type { AdminAccount } from "../types";

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand";

export function TeamManager({
  admins,
  currentEmail,
}: {
  admins: AdminAccount[];
  currentEmail: string;
}) {
  const [addState, addAction, adding] = useActionState<AdminState, FormData>(
    addAdmin,
    {},
  );
  const [removeState, removeAction] = useActionState<AdminState, FormData>(
    removeAdmin,
    {},
  );

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-extrabold text-ink">Add an admin</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Enter the Google account email. They sign in with Google like everyone
          else — the address just needs to be on this list. It works whether or
          not they have signed in before.
        </p>

        <form action={addAction} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-muted">
                Google account email
              </span>
              <input
                name="email"
                type="email"
                placeholder="teammate@gmail.com"
                className={input}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-muted">
                Note (optional)
              </span>
              <input
                name="note"
                placeholder="Support team"
                className={input}
              />
            </label>
          </div>

          <ErrorText>{addState.error}</ErrorText>
          {addState.notice && (
            <p className="text-sm font-semibold text-emerald-600">
              {addState.notice}
            </p>
          )}

          <button
            type="submit"
            disabled={adding}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add admin"}
          </button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-extrabold text-ink">
          Admins ({admins.length})
        </h2>
        <ErrorText>{removeState.error}</ErrorText>

        <ul className="mt-4 space-y-2">
          {admins.map((admin) => {
            const isYou = admin.email === currentEmail.toLowerCase();

            return (
              <li
                key={admin.email}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-dim px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white">
                    <GoogleMark className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">
                      {admin.email}
                      {isYou && (
                        <span className="ml-2 text-xs font-bold text-muted">
                          you
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-muted">
                      {admin.note ?? "No note"}
                      {admin.added_by ? ` · added by ${admin.added_by}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <StatusPill
                    label={admin.has_signed_in ? "active" : "invited"}
                    tone={admin.has_signed_in ? "ok" : "muted"}
                  />
                  {!isYou && admins.length > 1 && (
                    <form action={removeAction}>
                      <input
                        type="hidden"
                        name="email"
                        value={admin.email}
                      />
                      <button
                        type="submit"
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted transition hover:border-brand hover:text-brand"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm text-muted">
          You cannot remove your own access, and at least one admin must always
          remain.
        </p>
      </Card>
    </div>
  );
}
