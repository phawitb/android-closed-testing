"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CopyField } from "./CopyField";
import { ButtonLink, Card, IconBadge } from "./ui";
import { ArrowRight, Gauge, Ticket, X } from "./icons";
import type { Dict } from "@/lib/i18n/dictionaries";
import type { MyToken, TestingApp } from "@/lib/testing";

export function RedeemModal({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: Dict;
}) {
  const [loading, setLoading] = useState(true);
  const [myTokens, setMyTokens] = useState<MyToken[]>([]);
  const [apps, setApps] = useState<TestingApp[]>([]);

  // Re-fetch fresh on every open — this is a one-shot sync per open, not a loop.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const supabase = createClient();
    Promise.all([
      supabase.rpc("ct_my_tokens"),
      supabase
        .from("ct_apps")
        .select("*")
        .is("token_id", null)
        .order("created_at", { ascending: false }),
    ]).then(([tokensResult, appsResult]) => {
      if (cancelled) return;
      const rows = ((tokensResult.data ?? []) as MyToken[]).filter(
        (row) => row.status === "unused",
      );
      setMyTokens(rows);
      setApps((appsResult.data ?? []) as TestingApp[]);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
      aria-labelledby="redeem-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-4 py-8 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ct-pop max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-6 py-5 backdrop-blur-sm">
          <div>
            <h2 id="redeem-title" className="text-xl font-extrabold text-ink">
              {t.redeem.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted">{t.redeem.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.cancel}
            className="shrink-0 rounded-full p-2 text-muted transition hover:bg-surface-dim hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted">…</p>
          ) : (
            <>
              <Card className="flex flex-col gap-5 border-brand-tint bg-brand-faint sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-ink">
                    {t.redeem.newTitle}
                  </h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">
                    {t.redeem.newBody}
                  </p>
                </div>
                <ButtonLink
                  href="/dashboard/apps/new"
                  variant="primary"
                  size="md"
                  className="shrink-0"
                >
                  {t.redeem.newCta}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </Card>

              {myTokens.length > 0 && (
                <section>
                  <div className="flex items-center gap-3">
                    <IconBadge size="sm">
                      <Ticket className="h-5 w-5" />
                    </IconBadge>
                    <h3 className="text-lg font-extrabold text-ink">
                      {t.checkout.tokensTitle}
                    </h3>
                  </div>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {myTokens.map((row) => (
                      <li key={row.code}>
                        <Card className="flex h-full flex-col gap-3">
                          <CopyField
                            value={row.code}
                            label={row.package_name ?? undefined}
                            hint={t.copy.clickToCopy}
                            copiedLabel={t.copy.copied}
                          />
                          <ButtonLink
                            href={`/dashboard/apps/new?code=${encodeURIComponent(row.code)}`}
                            variant="secondary"
                            size="sm"
                            className="mt-auto"
                          >
                            {t.checkout.useNow}
                          </ButtonLink>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {apps.length > 0 && (
                <section>
                  <h3 className="text-lg font-extrabold text-ink">
                    {t.redeem.existingTitle}
                  </h3>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {apps.map((app) => (
                      <li key={app.id}>
                        <Link
                          href={`/dashboard/apps/${app.id}/activate`}
                          className="lift flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-brand-tint"
                        >
                          <IconBadge>
                            <Gauge className="h-6 w-6" />
                          </IconBadge>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-lg font-extrabold text-ink">
                              {app.name}
                            </span>
                            <span className="block truncate text-[15px] text-muted">
                              {app.app_type === "free"
                                ? t.appDetails.freeApp
                                : t.appDetails.paidApp}{" "}
                              · {t.redeem.notActivated}
                            </span>
                          </span>
                          <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
