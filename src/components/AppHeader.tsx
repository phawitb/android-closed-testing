"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ButtonLink, Container, cn } from "./ui";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SettingsModal } from "./SettingsModal";
import { TokenBadge } from "./TokenBadge";
import { Settings, ShieldCheck } from "./icons";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

export type AppNavLabels = {
  myApps: string;
  submitApp: string;
  plans: string;
  settings: string;
  admin: string;
};

/** Top bar for every signed-in screen — the desktop replacement for back arrows. */
export function AppHeader({
  email,
  isAdmin = false,
  cta,
  nav,
  locale,
  t,
}: {
  email?: string | null;
  isAdmin?: boolean;
  cta?: { href: string; label: string } | null;
  nav: AppNavLabels;
  locale: Locale;
  t: Dict;
}) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: nav.myApps, exact: true },
    { href: "/dashboard/apps/new", label: nav.submitApp },
    { href: "/pricing", label: nav.plans },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-background/85 backdrop-blur-md">
        <Container width="xl" className="flex h-16 items-center gap-4 lg:h-18">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display hidden text-lg font-extrabold text-ink sm:inline">
              Closed Testing
            </span>
          </Link>

          <nav className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-sm font-bold whitespace-nowrap transition lg:px-4 lg:text-[15px]",
                    active
                      ? "bg-brand-tint text-brand"
                      : "text-muted hover:bg-surface-dim hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <TokenBadge t={t} />

            <LocaleSwitcher locale={locale} className="hidden sm:inline-flex" />

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-full border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-surface-dim lg:inline-flex"
              >
                {nav.admin}
              </Link>
            )}

            {cta && (
              <ButtonLink
                href={cta.href}
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                {cta.label}
              </ButtonLink>
            )}

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={nav.settings}
              title={email ?? nav.settings}
              className={cn(
                "rounded-full p-2.5 transition hover:bg-surface-dim",
                settingsOpen ? "text-brand" : "text-ink",
              )}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        email={email}
        isAdmin={isAdmin}
        locale={locale}
        t={t}
      />
    </>
  );
}
