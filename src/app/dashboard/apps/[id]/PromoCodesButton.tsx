"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, ErrorText } from "@/components/ui";
import { RichText } from "@/components/RichText";
import { Dollar } from "@/components/icons";
import type { Dict } from "@/lib/i18n/dictionaries";
import { submitPromoCodes } from "./actions";

/**
 * Inline "Send promo codes…" trigger shown on the day-1 timeline row for
 * unstarted paid apps. Opens a modal with a textarea, matching the wizard's
 * paid-app policy dialog in style.
 */
export function PromoCodesButton({ appId, t }: { appId: string; t: Dict }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [codes, setCodes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitPromoCodes(appId, codes);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-bold text-brand underline underline-offset-4 transition hover:text-brand-strong"
      >
        {t.appDetails.promo.cta}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="promo-codes-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-5 py-8"
        >
          <div className="ct-pop w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-tint text-brand">
              <Dollar className="h-7 w-7" />
            </span>

            <h2
              id="promo-codes-title"
              className="mt-5 text-2xl font-extrabold text-ink"
            >
              {t.appDetails.promo.modalTitle}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              <RichText
                text={t.appDetails.promo.modalBody}
                strongClassName="text-brand"
              />
            </p>

            <textarea
              value={codes}
              onChange={(event) => setCodes(event.target.value)}
              placeholder={t.appDetails.promo.placeholder}
              rows={6}
              autoFocus
              className="mt-4 w-full resize-y rounded-lg border-2 border-brand-tint bg-surface-dim px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
            />

            <ErrorText>{error}</ErrorText>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <Button
                onClick={submit}
                disabled={pending || !codes.trim()}
                variant="primary"
                size="lg"
                full
              >
                {pending ? t.appDetails.promo.submitting : t.appDetails.promo.submit}
              </Button>
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                size="lg"
                full
                disabled={pending}
              >
                {t.common.cancel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
