"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink, Container, cn } from "./ui";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Menu, ShieldCheck } from "./icons";
import type { Locale } from "@/lib/i18n/config";

export type SiteNavLabels = {
  how: string;
  rule: string;
  included: string;
  pricing: string;
  faq: string;
  signIn: string;
  getStarted: string;
  myApps: string;
  menu: string;
};

/** Marketing header. No token box and no packages — signing in comes first. */
export function SiteHeader({
  signedIn,
  nav,
  locale,
}: {
  signedIn: boolean;
  nav: SiteNavLabels;
  locale: Locale;
}) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#how", label: nav.how },
    { href: "#requirement", label: nav.rule },
    { href: "#included", label: nav.included },
    { href: "#pricing", label: nav.pricing },
    { href: "#faq", label: nav.faq },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-background/80 backdrop-blur-md">
      <Container width="full" className="flex h-16 items-center gap-6 lg:h-20">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-extrabold text-ink">
            Closed Testing
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-[15px] font-bold text-muted transition hover:bg-surface-dim hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <LocaleSwitcher locale={locale} />

          {signedIn ? (
            <ButtonLink href="/dashboard" variant="dark" size="sm">
              {nav.myApps}
            </ButtonLink>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-bold text-ink transition hover:bg-surface-dim sm:inline-flex"
              >
                {nav.signIn}
              </Link>
              <ButtonLink href="/login" variant="primary" size="sm">
                {nav.getStarted}
              </ButtonLink>
            </>
          )}

          <button
            type="button"
            aria-label={nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="rounded-full p-2 text-ink transition hover:bg-surface-dim lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </Container>

      <div
        className={cn(
          "overflow-hidden border-t border-line transition-[max-height] duration-200 lg:hidden",
          open ? "max-h-72" : "max-h-0 border-t-0",
        )}
      >
        <Container width="full" className="flex flex-col py-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-[15px] font-bold text-ink-soft transition hover:bg-surface-dim"
            >
              {link.label}
            </a>
          ))}
        </Container>
      </div>
    </header>
  );
}
