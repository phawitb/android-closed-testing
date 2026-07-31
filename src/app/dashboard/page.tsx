import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import {
  Card,
  Container,
  IconBadge,
  Page,
  StatusPill,
  cn,
} from "@/components/ui";
import { Bolt, Gauge, Ticket } from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import type { Dict } from "@/lib/i18n/dictionaries";
import { currentDay, progressPercent, type TestingApp } from "@/lib/testing";
import { SubmitAppButton } from "./SubmitAppButton";

export const metadata = { title: "My Apps" };

export default async function DashboardPage() {
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [{ data, error }, { data: isAdmin }] = await Promise.all([
    supabase
      .from("ct_apps")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.rpc("ct_is_admin"),
  ]);

  const apps = (data ?? []) as TestingApp[];
  const running = apps.filter((app) => app.status === "in_progress").length;
  const needsAction = apps.filter(
    (app) => app.status === "draft" || app.status === "awaiting_setup",
  ).length;

  const summary =
    `${apps.length} ${apps.length === 1 ? t.dashboard.countOne : t.dashboard.countMany}` +
    (running ? ` · ${running} ${t.dashboard.inProgress}` : "") +
    (needsAction ? ` · ${needsAction} ${t.dashboard.needAttention}` : "");

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
        cta={{ href: "/dashboard/apps/new", label: t.common.submitApp }}
      />

      <Container width="xl" className="pt-8 pb-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-2 text-[17px] text-muted">
              {apps.length === 0 ? t.dashboard.emptySubtitle : summary}
            </p>
          </div>

          <SubmitAppButton t={t} className="sm:hidden lg:inline-flex" />
        </header>

        {error && (
          <Card className="mt-6 border-brand-tint bg-brand-faint">
            <p className="text-sm font-semibold text-brand">
              {t.dashboard.loadError}
            </p>
          </Card>
        )}

        {!error && apps.length === 0 && (
          <Card className="ct-pop mt-8 px-6 py-14 text-center">
            <IconBadge size="lg" className="mx-auto">
              <Gauge className="h-7 w-7" />
            </IconBadge>
            <h2 className="mt-5 text-2xl font-extrabold text-ink">
              {t.dashboard.emptyTitle}
            </h2>
          </Card>
        )}

        {apps.length > 0 && (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <li key={app.id}>
                <AppCard app={app} t={t} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </Page>
  );
}

function AppCard({ app, t }: { app: TestingApp; t: Dict }) {
  const day = currentDay(app);
  const percent = progressPercent(app);
  const running =
    app.status === "in_progress" ||
    app.status === "completed" ||
    app.status === "awaiting_setup";

  const subtitle =
    app.status === "draft"
      ? t.dashboard.subtitleDraft
      : app.status === "awaiting_setup"
        ? app.setup_confirmed_at
          ? t.dashboard.subtitleSetupConfirmed
          : t.dashboard.subtitleSetup
        : app.status === "cancelled"
          ? t.dashboard.subtitleCancelled
          : t.dashboard.subtitleRunning;

  return (
    <Link
      href={`/dashboard/apps/${app.id}`}
      className="lift ct-pop flex h-full flex-col rounded-xl border border-line bg-surface p-5 shadow-sm shadow-black/[0.03] hover:border-brand-tint sm:p-6"
    >
      <div className="flex items-start gap-4">
        <IconBadge size="lg">
          <Gauge className="h-7 w-7" />
        </IconBadge>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="truncate text-xl font-extrabold text-ink">
              {app.name}
            </h2>
            <StatusPill
              label={t.status[app.status]}
              tone={
                app.status === "in_progress"
                  ? "brand"
                  : app.status === "completed"
                    ? "ok"
                    : app.status === "awaiting_setup"
                      ? "warn"
                      : "muted"
              }
            />
          </div>
          <p className="mt-0.5 text-[15px] text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        {running ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-muted">
                {t.dashboard.testingProgress}
              </span>
              <span className="text-sm font-extrabold text-ink">
                {t.common.day} {day} {t.common.of} {app.total_days}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-dim">
              <div
                className={cn(
                  "h-full rounded-full bg-linear-to-r from-brand-strong to-brand transition-all",
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm font-bold text-brand">
            {app.status === "draft" ? (
              <Ticket className="h-4 w-4" />
            ) : (
              <Bolt className="h-4 w-4" />
            )}
            {app.status === "draft"
              ? t.dashboard.actionActivate
              : t.dashboard.actionView}
          </span>
        )}
      </div>
    </Link>
  );
}
