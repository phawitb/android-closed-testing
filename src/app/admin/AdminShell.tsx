import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "./AdminNav";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <main className="brand-glow min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.14em] text-brand uppercase">
              Closed Testing
            </p>
            <h1 className="mt-1 text-3xl font-extrabold text-ink">
              Admin console
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{email}</span>
            <Link
              href="/dashboard"
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-surface-dim"
            >
              Exit
            </Link>
          </div>
        </header>

        <AdminNav />

        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}
