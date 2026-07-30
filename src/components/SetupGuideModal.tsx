"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SetupIntro, SetupSteps } from "./SetupGuide";
import { Button, Card, ErrorText, StatusPill } from "./ui";
import { X } from "./icons";
import type { Dict } from "@/lib/i18n/dictionaries";
import { confirmSetup } from "@/app/dashboard/apps/[id]/actions";

export function SetupGuideModal({
  open,
  onClose,
  appId,
  done,
  t,
}: {
  open: boolean;
  onClose: () => void;
  appId: string;
  done: boolean;
  t: Dict;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-guide-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-4 py-8 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ct-pop max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-6 py-5 backdrop-blur-sm">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
              {t.setupPage.eyebrow}
            </p>
            <h2 id="setup-guide-title" className="text-xl font-extrabold text-ink">
              {t.setupPage.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {done && <StatusPill label={t.setupPage.confirmed} tone="ok" />}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.cancel}
              className="rounded-full p-2 text-muted transition hover:bg-surface-dim hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <p className="text-[15px] text-muted">{t.setupPage.subtitle}</p>

          <SetupIntro t={t.setupGuide} />
          <SetupSteps t={t.setupGuide} copy={t.copy} />

          <Card className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold text-ink">
                {done ? t.setupPage.doneTitle : t.setupPage.askTitle}
              </h3>
              <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted">
                {done ? t.setupPage.doneBody : t.setupPage.askBody}
              </p>
              <ErrorText>{error}</ErrorText>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[16rem]">
              <Button
                variant="primary"
                size="lg"
                full
                disabled={pending || done}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await confirmSetup(appId);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    router.refresh();
                    onClose();
                  });
                }}
              >
                {done
                  ? t.setupPage.buttonDone
                  : pending
                    ? t.setupPage.buttonSaving
                    : t.setupPage.button}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
