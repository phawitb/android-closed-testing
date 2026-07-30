import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import {
  ButtonLink,
  Card,
  Container,
  IconBadge,
  Page,
  StatusPill,
  cn,
} from "@/components/ui";
import { ProgressRing } from "@/components/ProgressRing";
import { RichText } from "@/components/RichText";
import {
  ArrowLeft,
  Bolt,
  Check,
  ExternalLink,
  Gauge,
  Lock,
  ShieldCheck,
  Warning,
} from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import type { Dict } from "@/lib/i18n/dictionaries";
import {
  TESTER_GROUP_URL,
  buildTimeline,
  currentDay,
  dayCopy,
  formatDay,
  progressPercent,
  type AppDayLog,
  type AppMessage,
  type TestingApp,
  type TimelineDay,
} from "@/lib/testing";
import { PromoCodesButton } from "./PromoCodesButton";
import { SetupGuideTrigger } from "./SetupGuideTrigger";
import { MessageThread } from "./MessageThread";

export const metadata = { title: "App Details — Closed Testing" };

export default async function AppDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { id } = await params;
  const { welcome } = await searchParams;
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/dashboard/apps/${id}`);

  const [
    { data },
    { data: isAdmin },
    { data: messageRows },
    { data: dayLogRows },
  ] = await Promise.all([
    supabase.from("ct_apps").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("ct_is_admin"),
    supabase
      .from("ct_app_messages")
      .select("*")
      .eq("app_id", id)
      .order("created_at"),
    supabase.from("ct_app_day_logs").select("*").eq("app_id", id),
  ]);

  if (!data) notFound();

  const app = data as TestingApp;
  const messages = (messageRows ?? []) as AppMessage[];
  const dayLogs = (dayLogRows ?? []) as AppDayLog[];
  const dayLogByDay = new Map(dayLogs.map((log) => [log.day, log]));
  const day = currentDay(app);
  const timeline = buildTimeline(app);
  const running = app.status === "in_progress" || app.status === "completed";

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
      />

      <Container width="xl" className="pt-6 pb-20">
        <Link
          href="/dashboard"
          className="-ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-bold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.common.myApps}
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <IconBadge size="lg">
              <Gauge className="h-7 w-7" />
            </IconBadge>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl leading-tight font-extrabold text-ink sm:text-4xl">
                  {app.name}
                </h1>
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
              <p className="mt-1.5 text-[17px] text-muted">
                {app.status === "draft"
                  ? t.appDetails.draft
                  : app.status === "awaiting_setup"
                    ? t.appDetails.awaitingSetup
                    : app.status === "cancelled"
                      ? t.appDetails.cancelled
                      : `${t.common.day} ${day} ${t.common.of} ${app.total_days} · ${progressPercent(app)}% ${t.appDetails.complete}`}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            {app.status === "draft" && (
              <ButtonLink
                href={`/dashboard/apps/${id}/activate`}
                variant="primary"
                size="md"
              >
                {t.appDetails.activate}
              </ButtonLink>
            )}
            <SetupGuideTrigger
              appId={id}
              done={Boolean(app.setup_confirmed_at)}
              primary={app.status === "awaiting_setup"}
              t={t}
            />
          </div>
        </header>

        {welcome && (
          <Card className="ct-pop mt-6 border-emerald-200 bg-emerald-50">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
                <Check className="h-5 w-5" />
              </span>
              <p className="text-[15px] leading-relaxed text-emerald-900">
                <strong>{t.appDetails.welcomeTitle}</strong>{" "}
                {t.appDetails.welcomeBody}
              </p>
            </div>
          </Card>
        )}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:gap-8">
          {/* ------------------------------------------------------ main */}
          <div className="min-w-0 space-y-6">
            {running && (
              <Card className="flex flex-col items-center gap-7 py-8 sm:flex-row sm:items-center sm:justify-center sm:gap-10">
                <ProgressRing
                  day={day}
                  total={app.total_days}
                  label={`${t.common.day} ${t.common.of} ${app.total_days}`}
                />
                <div className="text-center sm:text-left">
                  <p className="text-sm font-extrabold tracking-[0.14em] text-muted uppercase">
                    {t.appDetails.testingProgress}
                  </p>
                  <p className="font-display mt-2 text-3xl font-extrabold text-ink">
                    {t.common.day} {day} {t.common.of} {app.total_days}
                  </p>
                  <p className="mt-1 text-[15px] text-muted">
                    {app.started_on
                      ? `${t.appDetails.started} ${formatDay(app.started_on)}`
                      : t.appDetails.waitingStart}
                  </p>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-dim sm:w-64">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-brand-strong to-brand"
                      style={{ width: `${progressPercent(app)}%` }}
                    />
                  </div>
                </div>
              </Card>
            )}

            {app.status === "awaiting_setup" && app.setup_confirmed_at && (
              <Card className="border-emerald-200 bg-emerald-50">
                <p className="text-[15px] leading-relaxed text-emerald-800">
                  <strong>{t.appDetails.setupConfirmedTitle}</strong>{" "}
                  {t.appDetails.setupConfirmedBody}
                </p>
              </Card>
            )}

            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-2xl font-extrabold text-ink">
                  {t.appDetails.dailyActivity}
                </h2>
                <span className="text-sm font-bold text-muted">
                  {app.total_days} {t.common.days}
                </span>
              </div>

              <Card className="p-5 sm:p-6">
                <ol className="relative">
                  {timeline.map((entry, index) => (
                    <DayRow
                      key={entry.day}
                      entry={entry}
                      last={index === timeline.length - 1}
                      scheduled={Boolean(app.started_on)}
                      log={dayLogByDay.get(entry.day)}
                      t={t}
                      promo={
                        app.app_type === "paid" && app.status !== "cancelled"
                          ? {
                              appId: id,
                              submitted: Boolean(app.promo_codes_submitted_at),
                            }
                          : undefined
                      }
                    />
                  ))}
                </ol>
              </Card>
            </section>

            <div className="overflow-hidden rounded-2xl bg-linear-to-br from-[var(--grad-from)] to-[var(--grad-to)] p-6 text-white shadow-xl shadow-brand/20 sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-2xl leading-tight font-extrabold sm:text-3xl">
                {t.appDetails.handledTitle}
              </h3>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/85">
                {t.appDetails.handledBody}
              </p>
            </div>
          </div>

          {/* --------------------------------------------------- sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <h3 className="text-sm font-extrabold tracking-wider text-muted uppercase">
                {t.appDetails.submission}
              </h3>
              <dl className="mt-4 space-y-3 text-[15px]">
                <Row
                  label={t.appDetails.appType}
                  value={
                    app.app_type === "free"
                      ? t.appDetails.freeApp
                      : t.appDetails.paidApp
                  }
                />
                <Row label={t.appDetails.optInUrl} value={app.store_url} link />
                <Row label={t.appDetails.contact} value={app.contact_email} />
                <Row
                  label={t.appDetails.setupStatus}
                  value={
                    app.setup_confirmed_at
                      ? t.appDetails.setupYes
                      : t.appDetails.setupNo
                  }
                />
                {app.app_type === "paid" && (
                  <Row
                    label={t.appDetails.promo.statusLabel}
                    value={
                      app.promo_codes_submitted_at
                        ? t.appDetails.promo.yes
                        : t.appDetails.promo.no
                    }
                  />
                )}
              </dl>
            </Card>

            <MessageThread appId={id} initialMessages={messages} t={t} />

            <Card className="border-brand-tint bg-brand-faint">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-extrabold tracking-wider text-brand uppercase">
                  {t.appDetails.policyEyebrow}
                </p>
                <StatusPill label={t.appDetails.policyLocked} tone="brand" />
              </div>
              <div className="mt-3 flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand">
                  <Warning className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-lg font-extrabold text-ink">
                    {app.total_days} {t.appDetails.policyTitle}
                  </h4>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">
                    <RichText
                      text={t.appDetails.policyBody}
                      values={{ days: app.total_days }}
                    />
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Check className="h-5 w-5" />
                </span>
                <h3 className="text-lg leading-tight font-extrabold text-ink">
                  {t.appDetails.complianceTitle}
                </h3>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {t.appDetails.complianceBody}
              </p>
              <a
                href={TESTER_GROUP_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-brand-tint bg-white px-6 py-3 text-[15px] font-bold text-brand transition hover:bg-brand-faint"
              >
                <ExternalLink className="h-4 w-4" />
                {t.appDetails.joinTesting}
              </a>
            </Card>
          </aside>
        </div>
      </Container>
    </Page>
  );
}

function Row({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-extrabold tracking-wider text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 font-bold break-all text-ink">
        {link && value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand underline underline-offset-4"
          >
            {value}
          </a>
        ) : (
          value || "—"
        )}
      </dd>
    </div>
  );
}

function DayRow({
  entry,
  last,
  scheduled,
  log,
  t,
  promo,
}: {
  entry: TimelineDay;
  last: boolean;
  scheduled: boolean;
  /** Admin's per-day log — its state overrides the date-computed one. */
  log?: AppDayLog;
  t: Dict;
  /** Paid, unstarted apps get a "send promo codes" prompt on day 1. */
  promo?: { appId: string; submitted: boolean };
}) {
  const state = log?.state ?? entry.state;
  const done = state === "completed";
  const current = state === "current";
  const showPromoCta = Boolean(promo) && entry.day === 1 && state === "locked";

  return (
    <li className={cn("relative flex gap-4", last ? "pb-0" : "pb-5")}>
      {!last && (
        <span
          aria-hidden
          className={cn(
            "absolute top-9 bottom-0 left-[15px] w-0.5",
            done ? "bg-brand/40" : "bg-line",
          )}
        />
      )}

      <span
        className={cn(
          "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2",
          done && "border-brand/40 bg-white text-brand",
          current && "border-brand bg-brand text-white",
          state === "locked" && "border-line bg-white text-muted",
        )}
      >
        {done ? (
          <Check className="h-4 w-4" />
        ) : current ? (
          <Bolt className="h-4 w-4" />
        ) : (
          <Lock className="h-3.5 w-3.5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4
            className={cn(
              "text-lg font-extrabold",
              state === "locked" ? "text-muted" : "text-ink",
            )}
          >
            {t.common.day} {entry.day}
          </h4>
          {done ? (
            <StatusPill label={t.appDetails.timeline.ready} tone="muted" />
          ) : current ? (
            <StatusPill label={t.appDetails.timeline.today} tone="brand" />
          ) : (
            <StatusPill label={t.appDetails.timeline.locked} tone="muted" />
          )}
        </div>
        <p
          className={cn(
            "mt-0.5 text-[15px] leading-snug",
            state === "locked" ? "text-muted/80" : "text-muted",
          )}
        >
          {showPromoCta && promo ? (
            promo.submitted ? (
              t.appDetails.promo.submittedNotice
            ) : (
              <PromoCodesButton appId={promo.appId} t={t} />
            )
          ) : (
            dayCopy(entry, state, scheduled, t)
          )}
        </p>
        {log?.message && !(showPromoCta && !promo?.submitted) && (
          <p className="mt-2 rounded-lg bg-brand-faint px-3 py-2 text-[14px] leading-snug text-ink">
            <span className="mr-1.5 text-xs font-extrabold tracking-wider text-brand uppercase">
              {t.appDetails.timeline.teamUpdate}
            </span>
            {log.message}
          </p>
        )}
      </div>
    </li>
  );
}
