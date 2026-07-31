"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { IconBadge, cn } from "./ui";
import { Gauge, ShieldCheck, X } from "./icons";
import { SignOutButton } from "@/app/dashboard/settings/SignOutButton";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

export function SettingsModal({
  open,
  onClose,
  email,
  isAdmin,
  locale,
  t,
}: {
  open: boolean;
  onClose: () => void;
  email?: string | null;
  isAdmin: boolean;
  locale: Locale;
  t: Dict;
}) {
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
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 px-4 py-8 sm:items-center"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ct-pop max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-white/95 px-6 py-5 backdrop-blur-sm">
          <div>
            <h2 id="settings-title" className="text-xl font-extrabold text-ink">
              {t.settings.title}
            </h2>
            <p className="mt-0.5 text-sm text-muted">{t.settings.subtitle}</p>
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

        <div className="divide-y divide-line px-6">
          <Section>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-extrabold tracking-[0.12em] text-brand uppercase">
                  {t.settings.signedInAs}
                </p>
                <p className="mt-1 truncate text-lg font-extrabold text-ink">
                  {email}
                </p>
              </div>
              <SignOutButton label={t.common.signOut} />
            </div>
          </Section>

          <Section>
            <SectionHeader
              icon={<Gauge className="h-5 w-5" />}
              title={t.settings.languageTitle}
              body={t.settings.languageBody}
            />
            <div className="mt-4">
              <LocaleSwitcher locale={locale} size="md" />
            </div>
          </Section>

          {isAdmin && (
            <Section className="bg-brand-faint/40">
              <SectionHeader
                icon={<ShieldCheck className="h-5 w-5" />}
                title={t.settings.adminTitle}
                body={t.settings.adminBody}
              />
              <Link
                href="/admin"
                className="mt-3 inline-block text-sm font-bold text-brand underline underline-offset-4"
              >
                {t.settings.adminLink}
              </Link>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("py-6", className)}>{children}</div>;
}

function SectionHeader({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <IconBadge size="sm">{icon}</IconBadge>
      <div className="min-w-0">
        <h3 className="text-[15px] font-extrabold text-ink">{title}</h3>
        <p className="text-sm text-muted">{body}</p>
      </div>
    </div>
  );
}
