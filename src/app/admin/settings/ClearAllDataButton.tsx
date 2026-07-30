"use client";

import { useActionState, useState } from "react";
import { ErrorText } from "@/components/ui";
import { clearAllData, type AdminState } from "../actions";

const CONFIRM_PHRASE = "DELETE ALL DATA";

export function ClearAllDataButton() {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    clearAllData,
    {},
  );
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const confirmed = confirmText.trim() === CONFIRM_PHRASE;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border-2 border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100"
      >
        Clear all data
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border-2 border-red-200 bg-red-50 p-4"
    >
      <p className="text-sm leading-relaxed font-bold text-red-800">
        This permanently deletes every app submission, message thread, token,
        and Stripe order record. Packages, admin accounts, and site settings are
        kept. This cannot be undone.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-bold text-red-700">
          Type {CONFIRM_PHRASE} to confirm
        </span>
        <input
          name="confirm"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder={CONFIRM_PHRASE}
          autoComplete="off"
          className="w-full rounded-xl border border-red-300 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-red-500"
        />
      </label>

      <ErrorText>{state.error}</ErrorText>
      {state.notice && (
        <p className="text-sm font-semibold text-emerald-700">{state.notice}</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!confirmed || pending}
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-40"
        >
          {pending ? "Clearing…" : "Permanently clear all data"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setConfirmText("");
          }}
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-surface-dim"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
