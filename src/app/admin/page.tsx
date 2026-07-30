import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, StatusPill, cn } from "@/components/ui";
import { Bolt, Gauge, Lock, Warning } from "@/components/icons";
import {
  STATUS_LABEL,
  currentDay,
  formatDay,
  progressPercent,
} from "@/lib/testing";
import type { AdminApp, AdminPackage, AdminToken } from "./types";
import { formatPrice } from "./types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [appsResult, tokensResult, packagesResult] = await Promise.all([
    supabase.rpc("ct_admin_apps"),
    supabase.rpc("ct_admin_tokens"),
    supabase.rpc("ct_admin_packages"),
  ]);

  const apps = (appsResult.data ?? []) as AdminApp[];
  const tokens = (tokensResult.data ?? []) as AdminToken[];
  const packages = (packagesResult.data ?? []) as AdminPackage[];
  const loadError =
    appsResult.error ?? tokensResult.error ?? packagesResult.error;

  const running = apps.filter((a) => a.status === "in_progress");
  const awaitingSetup = apps.filter((a) => a.status === "awaiting_setup");
  const drafts = apps.filter((a) => a.status === "draft");
  const completed = apps.filter((a) => a.status === "completed");
  const unusedTokens = tokens.filter((t) => t.status === "unused");

  // Things a human needs to act on today.
  const readyToStart = awaitingSetup.filter((a) => a.setup_confirmed_at);
  const finishing = running.filter(
    (a) => currentDay(a) >= a.total_days - 1,
  );

  return (
    <div className="space-y-8">
      {loadError && (
        <Card className="border-brand-tint bg-brand-faint">
          <p className="text-sm font-semibold text-brand">
            Could not load data: {loadError.message}
          </p>
        </Card>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="In progress" value={running.length} tone="brand" />
        <Stat label="Awaiting setup" value={awaitingSetup.length} />
        <Stat label="Completed" value={completed.length} tone="ok" />
        <Stat label="Unused tokens" value={unusedTokens.length} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold text-ink">Needs attention</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Attention
            icon={<Bolt className="h-5 w-5" />}
            title="Ready to start"
            count={readyToStart.length}
            body="Setup confirmed by the customer — start the cycle."
            apps={readyToStart}
            empty="Nothing waiting."
          />
          <Attention
            icon={<Warning className="h-5 w-5" />}
            title="Cycle ending"
            count={finishing.length}
            body="On day 13 or 14 — check in and send their production access answers."
            apps={finishing}
            empty="No cycle ending yet."
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold text-ink">Running cycles</h2>
          <Link
            href="/admin/apps"
            className="text-sm font-bold text-brand underline underline-offset-4"
          >
            All submissions
          </Link>
        </div>

        {running.length === 0 ? (
          <Card className="py-10 text-center text-muted">
            No cycle is running right now.
          </Card>
        ) : (
          <div className="space-y-3">
            {running.map((app) => (
              <Card key={app.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
                      <Gauge className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-ink">
                        {app.name}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {app.owner_email ?? "unknown"}
                        {app.started_on
                          ? ` · started ${formatDay(app.started_on)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-ink">
                    Day {currentDay(app)} / {app.total_days}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-dim">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-brand-strong to-brand"
                    style={{ width: `${progressPercent(app)}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-extrabold text-ink">Packages</h2>
            <Link
              href="/admin/tokens"
              className="text-sm font-bold text-brand underline underline-offset-4"
            >
              Manage
            </Link>
          </div>
          <ul className="space-y-2">
            {packages.map((pkg) => (
              <li
                key={pkg.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-dim px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold text-ink">
                    {pkg.name}
                  </span>
                  <span className="block text-sm text-muted">
                    {pkg.token_count} token{pkg.token_count === 1 ? "" : "s"} ·{" "}
                    {pkg.issued_count} issued
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-extrabold text-ink">
                    {formatPrice(pkg.price_cents, pkg.currency)}
                  </span>
                  {!pkg.is_active && (
                    <span className="text-xs font-bold text-muted">hidden</span>
                  )}
                </span>
              </li>
            ))}
            {packages.length === 0 && (
              <li className="py-6 text-center text-muted">No packages yet.</li>
            )}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-extrabold text-ink">
            Latest submissions
          </h2>
          <ul className="space-y-2">
            {apps.slice(0, 6).map((app) => (
              <li
                key={app.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-dim px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate font-bold text-ink">
                    {app.name}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {app.owner_email ?? "unknown"}
                  </span>
                </span>
                <StatusPill
                  label={STATUS_LABEL[app.status]}
                  tone={
                    app.status === "in_progress"
                      ? "brand"
                      : app.status === "completed"
                        ? "ok"
                        : "muted"
                  }
                />
              </li>
            ))}
            {apps.length === 0 && (
              <li className="py-6 text-center text-muted">
                No submissions yet.
              </li>
            )}
          </ul>
          {drafts.length > 0 && (
            <p className="mt-3 text-sm text-muted">
              {drafts.length} draft{drafts.length === 1 ? "" : "s"} not yet
              activated with a token.
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "brand" | "ok";
}) {
  return (
    <Card className="p-5">
      <p className="text-xs font-bold tracking-wider text-muted uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-display mt-1 text-4xl font-extrabold",
          tone === "brand" ? "text-brand" : tone === "ok" ? "text-ok" : "text-ink",
        )}
      >
        {value}
      </p>
    </Card>
  );
}

function Attention({
  icon,
  title,
  count,
  body,
  apps,
  empty,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  body: string;
  apps: AdminApp[];
  empty: string;
}) {
  return (
    <Card className={cn("h-full", count > 0 && "border-brand-tint bg-brand-faint")}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            count > 0 ? "bg-brand text-white" : "bg-surface-dim text-muted",
          )}
        >
          {count > 0 ? icon : <Lock className="h-4 w-4" />}
        </span>
        <div>
          <p className="font-extrabold text-ink">{title}</p>
          <p className="text-sm text-muted">{count} waiting</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>

      <ul className="mt-3 space-y-1">
        {apps.slice(0, 4).map((app) => (
          <li key={app.id}>
            <Link
              href="/admin/apps"
              className="block truncate text-sm font-bold text-brand underline underline-offset-4"
            >
              {app.name}
            </Link>
          </li>
        ))}
        {apps.length === 0 && (
          <li className="text-sm text-muted">{empty}</li>
        )}
      </ul>
    </Card>
  );
}
