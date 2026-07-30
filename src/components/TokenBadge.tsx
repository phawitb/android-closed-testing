"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RedeemModal } from "./RedeemModal";
import { Ticket } from "./icons";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { MyToken } from "@/lib/testing";

/**
 * Small pill in the header showing how many bought-but-unredeemed tokens the
 * signed-in user has — otherwise a purchased token is invisible until you
 * happen to land on the redeem screen. Hidden entirely when there are none.
 * Clicking it opens the redeem flow as a floating overlay.
 */
export function TokenBadge({ t }: { t: Dict }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .rpc("ct_my_tokens")
      .then(({ data }) => {
        if (cancelled) return;
        const rows = (data ?? []) as MyToken[];
        setCount(rows.filter((row) => row.status === "unused").length);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count < 1) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t.checkout.tokensTitle}
        aria-label={t.checkout.tokensTitle}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-ink transition hover:border-brand-tint hover:bg-surface-dim"
      >
        <Ticket className="h-3.5 w-3.5 text-brand" />
        {count}
      </button>

      <RedeemModal open={open} onClose={() => setOpen(false)} t={t} />
    </>
  );
}
