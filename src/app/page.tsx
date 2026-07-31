import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { ProgressRing } from "@/components/ProgressRing";
import { AppLogo } from "@/components/AppLogo";
import {
  ButtonLink,
  Card,
  Container,
  IconBadge,
  SectionHeading,
  StatusPill,
  cn,
} from "@/components/ui";
import {
  ArrowRight,
  Bolt,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Gauge,
  Lock,
  PlayStore,
  ShieldCheck,
  Star,
  Ticket,
  Users,
} from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { siteNav } from "@/lib/i18n/nav";
import type { Dict } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/app/admin/types";

export const metadata = {
  title: "Closed Testing — 14 days of Google Play closed testing",
  description:
    "Google Play asks for 12 testers and 14 continuous days of closed testing before production access. We run the cycle with real testers and you follow every day from one dashboard.",
};

const HOW_ICONS = [ClipboardList, Ticket, Gauge];
const RULE_ICONS = [Users, Calendar, Lock, ClipboardList];

type PublicPackage = {
  id: string;
  name: string;
  description: string | null;
  token_count: number;
  price_cents: number;
  currency: string;
};

export default async function HomePage() {
  const { locale, t } = await getT();

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: packagesData },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("ct_packages")
      .select("id, name, description, token_count, price_cents, currency")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const packages = (packagesData ?? []) as PublicPackage[];
  const signedIn = Boolean(user);
  const startHref = signedIn
    ? "/dashboard/apps/new"
    : "/login?next=%2Fdashboard%2Fapps%2Fnew";

  return (
    <div className="hero-canvas min-h-screen bg-background">
      <SiteHeader signedIn={signedIn} nav={siteNav(t)} locale={locale} />

      {/* ------------------------------------------------------------- hero */}
      <Container width="full" className="pt-14 pb-16 lg:pt-24 lg:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div className="ct-pop">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-tint bg-white/70 px-4 py-1.5 text-xs font-extrabold tracking-wider text-brand uppercase">
              <PlayStore className="h-4 w-4" />
              {t.landing.badge}
            </span>

            <h1 className="mt-6 text-[2.6rem] leading-[1.1] font-extrabold text-ink sm:text-6xl xl:text-[4rem]">
              {t.landing.titleTop}
              <span className="block bg-linear-to-r from-[var(--grad-from)] to-[var(--grad-to)] bg-clip-text text-transparent">
                {t.landing.titleAccent}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted xl:text-xl">
              {t.landing.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={startHref} variant="primary" size="lg">
                {signedIn ? t.landing.ctaSignedIn : t.landing.ctaSignedOut}
                <Bolt className="h-5 w-5" />
              </ButtonLink>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-7 py-4 text-base font-bold text-ink transition hover:bg-surface-dim"
              >
                {t.landing.ctaSecondary}
                <ChevronDown className="h-5 w-5" />
              </a>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-8">
              {[
                { icon: Users, value: "12+", label: t.landing.stats.testers },
                { icon: Calendar, value: "14", label: t.landing.stats.days },
                {
                  icon: ShieldCheck,
                  value: "100%",
                  label: t.landing.stats.policy,
                },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label}>
                  <Icon className="h-5 w-5 text-brand" />
                  <dd className="font-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                    {value}
                  </dd>
                  <dt className="mt-0.5 text-[13px] leading-snug text-muted">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <HeroPreview t={t} />
        </div>
      </Container>

      {/* ------------------------------------------------------ the Play rule */}
      <section
        id="requirement"
        className="scroll-mt-24 border-y border-line bg-surface-sunken py-16 lg:py-24"
      >
        <Container width="full">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            <SectionHeading
              eyebrow={t.landing.rule.eyebrow}
              title={t.landing.rule.title}
              body={t.landing.rule.body}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {t.landing.rule.cards.map((card, index) => {
                const Icon = RULE_ICONS[index] ?? Users;
                return (
                  <Card key={card.title} className="lift h-full">
                    <IconBadge size="sm">
                      <Icon className="h-5 w-5" />
                    </IconBadge>
                    <h3 className="mt-4 text-lg font-extrabold text-ink">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                      {card.body}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------- how it works */}
      <section id="how" className="scroll-mt-24 py-16 lg:py-24">
        <Container width="full">
          <SectionHeading
            align="center"
            eyebrow={t.landing.how.eyebrow}
            title={t.landing.how.title}
            body={t.landing.how.body}
          />

          <ol className="relative mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
            <span
              aria-hidden
              className="absolute top-[3.25rem] right-[16%] left-[16%] hidden h-px bg-linear-to-r from-brand-tint via-brand/40 to-brand-tint lg:block"
            />
            {t.landing.how.cards.map((card, index) => {
              const Icon = HOW_ICONS[index] ?? Bolt;
              return (
                <li key={card.title} className="relative">
                  <Card className="lift h-full">
                    <div className="flex items-center gap-3">
                      <IconBadge tone="solid">
                        <Icon className="h-5 w-5" />
                      </IconBadge>
                      <span className="text-xs font-extrabold tracking-[0.16em] text-muted uppercase">
                        {t.landing.how.step} {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-2xl font-extrabold text-ink">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {card.body}
                    </p>
                    <p className="mt-4 inline-flex items-start gap-2 text-sm font-bold text-brand">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      {card.detail}
                    </p>
                  </Card>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ------------------------------------------------------- what you get */}
      <section
        id="included"
        className="scroll-mt-24 border-y border-line bg-surface-sunken py-16 lg:py-24"
      >
        <Container width="full">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow={t.landing.included.eyebrow}
                title={t.landing.included.title}
                body={t.landing.included.body}
              />

              <ul className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {t.plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] leading-snug font-semibold text-ink-soft">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <TimelinePreview t={t} />
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------------------- reviews */}
      <section
        id="reviews"
        className="scroll-mt-24 border-y border-line bg-surface-sunken py-16 lg:py-24"
      >
        <Container width="full">
          <SectionHeading
            align="center"
            eyebrow={t.landing.reviews.eyebrow}
            title={t.landing.reviews.title}
            body={t.landing.reviews.body}
          />

          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 rounded-2xl border border-line bg-surface p-6 text-center sm:grid-cols-3 sm:gap-4 sm:p-8">
            <div>
              <p className="font-display text-5xl font-extrabold text-ink">
                {t.landing.reviews.average}
                <span className="text-xl font-bold text-muted">
                  {" "}
                  / 5
                </span>
              </p>
              <StarRow rating={5} className="mt-2 justify-center" />
              <p className="mt-2 text-sm font-semibold text-muted">
                {t.landing.reviews.countLabel}
              </p>
            </div>
            <div className="border-t border-line pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
              <p className="font-display text-5xl font-extrabold text-brand">
                {t.landing.reviews.appsApproved.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-muted">
                {t.landing.reviews.appsApproved.label}
              </p>
            </div>
            <div className="border-t border-line pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
              <p className="font-display text-5xl font-extrabold text-brand">
                {t.landing.reviews.successRate.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-muted">
                {t.landing.reviews.successRate.label}
              </p>
            </div>
          </div>

          <ul className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.landing.reviews.items.map((review) => (
              <li key={review.name}>
                <Card className="lift h-full">
                  <StarRow rating={review.rating} />
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-tint text-sm font-extrabold text-brand">
                      {review.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-ink">
                        {review.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {review.role}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ----------------------------------------------------------- pricing */}
      <section id="pricing" className="scroll-mt-24 py-16 lg:py-24">
        <Container width="full">
          <SectionHeading
            align="center"
            eyebrow={t.landing.pricingTeaser.eyebrow}
            title={t.landing.pricingTeaser.title}
            body={t.landing.pricingTeaser.body}
          />

          {packages.length > 0 && (
            <ul
              className={cn(
                "mx-auto mt-10 grid gap-5",
                packages.length === 1
                  ? "max-w-sm"
                  : "max-w-4xl sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {packages.map((pkg, index) => (
                <li key={pkg.id}>
                  <Card
                    className={cn(
                      "lift h-full",
                      index === 0 &&
                        packages.length > 1 &&
                        "border-brand-tint ring-1 ring-brand-tint",
                    )}
                  >
                    <h3 className="text-xl font-extrabold text-ink">
                      {pkg.name}
                    </h3>
                    {pkg.description && (
                      <p className="mt-1 text-[15px] leading-relaxed text-muted">
                        {pkg.description}
                      </p>
                    )}
                    <p className="font-display mt-5 text-4xl font-extrabold text-ink">
                      {formatPrice(pkg.price_cents, pkg.currency)}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                      <Check className="h-4 w-4" />
                      {pkg.token_count}{" "}
                      {pkg.token_count === 1
                        ? t.pricing.appsOne
                        : t.pricing.appsMany}
                    </p>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {packages.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-line bg-surface p-6 sm:p-8">
              <p className="text-xs font-extrabold tracking-[0.14em] text-brand uppercase">
                {t.pricing.everyPackage}
              </p>
              <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {t.plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-tint text-brand">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[15px] leading-snug font-semibold text-ink-soft">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-9 flex justify-center">
            <ButtonLink href="/pricing" variant="primary" size="lg">
              {t.landing.pricingTeaser.cta}
              <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- faq */}
      <section id="faq" className="scroll-mt-24 py-16 lg:py-24">
        <Container width="full">
          <SectionHeading
            align="center"
            eyebrow={t.landing.faq.eyebrow}
            title={t.landing.faq.title}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {t.landing.faq.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-line bg-surface p-5 shadow-sm shadow-black/[0.03] transition open:border-brand-tint sm:p-6"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                  <span className="text-[17px] font-extrabold text-ink">
                    {item.q}
                  </span>
                  <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-brand transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- cta */}
      <Container width="full" className="pb-20">
        <div className="overflow-hidden rounded-2xl bg-linear-to-br from-[var(--grad-from)] to-[var(--grad-to)] px-6 py-14 text-center text-white shadow-xl shadow-brand/20 sm:px-12 lg:py-20">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-white/20">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl leading-tight font-extrabold sm:text-5xl">
            {t.landing.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            {t.landing.cta.body}
          </p>
          <div className="mt-9 flex justify-center">
            <ButtonLink
              href={startHref}
              variant="secondary"
              size="lg"
              className="border-transparent shadow-lg shadow-black/10"
            >
              {signedIn
                ? t.landing.cta.buttonSignedIn
                : t.landing.cta.buttonSignedOut}
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* ------------------------------------------------------------- footer */}
      <footer className="border-t border-line py-10">
        <Container
          width="full"
          className="flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row"
        >
          <span className="inline-flex items-center gap-2">
            <AppLogo className="h-7 w-7" />
            <span className="font-display font-extrabold text-ink">
              Closed Testing
            </span>
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href="#how" className="transition hover:text-ink">
              {t.landing.nav.how}
            </a>
            <a href="#faq" className="transition hover:text-ink">
              {t.landing.nav.faq}
            </a>
            <Link href="/pricing" className="transition hover:text-ink">
              {t.common.plans}
            </Link>
            <Link href="/guidesetting" className="transition hover:text-ink">
              {t.guidePage.title}
            </Link>
            <Link href="/login" className="transition hover:text-ink">
              {t.common.signIn}
            </Link>
          </div>
          <span>© {new Date().getFullYear()} Closed Testing</span>
        </Container>
      </footer>
    </div>
  );
}

/** Row of five stars, filled up to `rating`. */
function StarRow({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "h-4 w-4",
            index < rating ? "text-amber-400" : "text-line",
          )}
        />
      ))}
    </div>
  );
}

/** The dashboard, faked at a glance — the hero's proof that this is a product. */
function HeroPreview({ t }: { t: Dict }) {
  const rows = [
    { day: 8, label: t.landing.preview.completed, state: "done" },
    { day: 9, label: t.landing.preview.current, state: "current" },
    { day: 10, label: t.landing.preview.scheduled, state: "locked" },
  ];

  return (
    <div className="ct-pop-2 relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-2xl bg-linear-to-br from-[var(--grad-from)]/12 to-[var(--grad-to)]/12 blur-2xl"
      />

      <Card className="rounded-2xl p-6 shadow-xl shadow-black/[0.06] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconBadge>
              <Gauge className="h-5 w-5" />
            </IconBadge>
            <div>
              <p className="text-lg leading-tight font-extrabold text-ink">
                {t.landing.preview.appName}
              </p>
              <p className="text-sm text-muted">
                {t.landing.preview.appStatus}
              </p>
            </div>
          </div>
          <StatusPill label={t.landing.preview.inProgress} />
        </div>

        <div className="mt-7 flex justify-center">
          <ProgressRing
            day={9}
            total={14}
            size={168}
            label={`${t.common.day} ${t.common.of} 14`}
          />
        </div>

        <ul className="mt-7 space-y-3">
          {rows.map((row) => (
            <li
              key={row.day}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3",
                row.state === "current"
                  ? "border-brand-tint bg-brand-faint"
                  : "border-line",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2",
                  row.state === "done" && "border-brand/40 text-brand",
                  row.state === "current" && "border-brand bg-brand text-white",
                  row.state === "locked" && "border-line text-muted",
                )}
              >
                {row.state === "done" ? (
                  <Check className="h-4 w-4" />
                ) : row.state === "current" ? (
                  <Bolt className="h-4 w-4" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-extrabold text-ink">
                  {t.common.day} {row.day}
                </span>
                <span className="block truncate text-sm text-muted">
                  {row.label}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="absolute -bottom-5 -left-4 hidden rounded-lg border border-line bg-white px-4 py-3 shadow-lg shadow-black/5 sm:block">
        <p className="text-xs font-extrabold tracking-wider text-muted uppercase">
          {t.landing.preview.testersToday}
        </p>
        <p className="font-display text-xl font-extrabold text-ink">
          12{" "}
          <span className="text-sm font-bold text-emerald-600">
            {t.landing.preview.active}
          </span>
        </p>
      </div>
    </div>
  );
}

/** Compact 14-day strip used beside the feature list. */
function TimelinePreview({ t }: { t: Dict }) {
  return (
    <Card className="rounded-2xl p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <h3 className="text-xl font-extrabold text-ink">
          {t.landing.included.timelineTitle}
        </h3>
        <span className="text-sm font-bold text-muted">14 {t.common.days}</span>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {Array.from({ length: 14 }, (_, index) => {
          const day = index + 1;
          const done = day < 9;
          const current = day === 9;

          return (
            <div
              key={day}
              className={cn(
                "grid aspect-square place-items-center rounded-lg text-sm font-extrabold",
                done && "bg-brand-tint text-brand",
                current &&
                  "bg-linear-to-br from-brand-strong to-brand text-white shadow-md shadow-brand/25",
                !done && !current && "bg-surface-dim text-muted",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-6 space-y-3 border-t border-line pt-5">
        <p className="flex items-start gap-3 text-[15px] leading-snug text-muted">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          {t.landing.included.note13}
        </p>
        <p className="flex items-start gap-3 text-[15px] leading-snug text-muted">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          {t.landing.included.note14}
        </p>
      </div>
    </Card>
  );
}
