"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink, Container, cn } from "./ui";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { SettingsModal } from "./SettingsModal";
import { TokenBadge } from "./TokenBadge";
import { AppLogo } from "./AppLogo";
import { Menu, Settings } from "./icons";
import { hasWizardDraftInProgress } from "@/lib/wizardDraft";
import type { Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionaries";

export type AppNavLabels = {
  myApps: string;
  submitApp: string;
  plans: string;
  settings: string;
  admin: string;
  menu: string;
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
  const [menuOpen, setMenuOpen] = useState(false);

  // A saved wizard draft past step 1 means there's a submission to resume —
  // the CTA should read "Continue" instead of restarting from "Add New App".
  const [resumingWizard, setResumingWizard] = useState(false);
  // localStorage doesn't exist during SSR, so this can only run post-mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setResumingWizard(hasWizardDraftInProgress());
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const links = [
    { href: "/dashboard", label: nav.myApps, exact: true },
    { href: "/dashboard/apps/new", label: nav.submitApp },
    { href: "/pricing", label: nav.plans },
  ];

  const effectiveCta =
    cta && cta.href === "/dashboard/apps/new" && resumingWizard
      ? { ...cta, label: t.common.continueApp }
      : cta;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-background/85 backdrop-blur-md">
        <Container width="xl" className="flex h-16 items-center gap-4 lg:h-18">
          <Link href="/dashboard" className="inline-flex items-center gap-2.5">
            <AppLogo className="h-9 w-9" />
            <span className="font-display hidden text-lg font-extrabold text-ink sm:inline">
              Closed Testing
            </span>
          </Link>

          <nav className="-mx-1 hidden flex-1 items-center gap-1 overflow-x-auto px-1 lg:flex">
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

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <div className="hidden items-center gap-2 lg:flex">
              <TokenBadge t={t} />
              <LocaleSwitcher locale={locale} />

              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-surface-dim"
                >
                  {nav.admin}
                </Link>
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

            {effectiveCta && (
              <ButtonLink href={effectiveCta.href} variant="primary" size="sm">
                {effectiveCta.label}
              </ButtonLink>
            )}

            <button
              type="button"
              aria-label={nav.menu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              className="rounded-full p-2 text-ink transition hover:bg-surface-dim lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>

        <div
          className={cn(
            "overflow-hidden border-t border-line transition-[max-height] duration-200 lg:hidden",
            menuOpen ? "max-h-96" : "max-h-0 border-t-0",
          )}
        >
          <Container width="xl" className="flex flex-col gap-1 py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-bold text-ink-soft transition hover:bg-surface-dim"
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-bold text-ink-soft transition hover:bg-surface-dim"
              >
                {nav.admin}
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSettingsOpen(true);
              }}
              className="rounded-lg px-3 py-3 text-left text-[15px] font-bold text-ink-soft transition hover:bg-surface-dim"
            >
              {nav.settings}
            </button>

            <div className="flex items-center gap-3 px-3 py-2">
              <TokenBadge t={t} />
              <LocaleSwitcher locale={locale} />
            </div>
          </Container>
        </div>
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
