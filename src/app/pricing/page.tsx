import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SiteHeader } from "@/components/SiteHeader";
import { PlanCard } from "@/components/PlanCard";
import {
  ButtonLink,
  Card,
  Container,
  Page,
  SectionHeading,
  cn,
} from "@/components/ui";
import { ArrowRight, Check, Ticket } from "@/components/icons";
import { getSettings } from "@/lib/settings.server";
import { isCheckoutEnabled } from "@/lib/stripe";
import { getT } from "@/lib/i18n/server";
import { appNav, siteNav } from "@/lib/i18n/nav";
import { formatPrice } from "@/app/admin/types";
import { BuyButton } from "./BuyButton";

export const metadata = { title: "Plans & Pricing — Closed Testing" };

type PublicPackage = {
  id: string;
  name: string;
  description: string | null;
  token_count: number;
  price_cents: number;
  currency: string;
};

export default async function PricingPage() {
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, { data: isAdmin }, settings] = await Promise.all([
    supabase
      .from("ct_packages")
      .select("id, name, description, token_count, price_cents, currency")
      .eq("is_active", true)
      .order("sort_order"),
    user ? supabase.rpc("ct_is_admin") : Promise.resolve({ data: false }),
    getSettings(),
  ]);

  const packages = (data ?? []) as PublicPackage[];
  const startHref = user
    ? "/dashboard/apps/new"
    : "/login?next=%2Fdashboard%2Fapps%2Fnew";

  const stripeOn = isCheckoutEnabled(settings.stripePublishableKey);

  return (
    <Page>
      {user ? (
        <AppHeader
          email={user.email}
          isAdmin={Boolean(isAdmin)}
          nav={appNav(t)}
          locale={locale}
          t={t}
        />
      ) : (
        <SiteHeader signedIn={false} nav={siteNav(t)} locale={locale} />
      )}

      <Container width="xl" className="pt-10 pb-20 lg:pt-14">
        <SectionHeading
          align="center"
          eyebrow={t.pricing.eyebrow}
          title={t.pricing.title}
          body={t.pricing.subtitle}
        />

        {packages.length > 0 && (
          <ul
            className={cn(
              "mt-12 grid gap-5",
              packages.length === 1
                ? "mx-auto max-w-sm"
                : "sm:grid-cols-2 lg:grid-cols-3",
            )}
          >
            {packages.map((pkg, index) => (
              <li key={pkg.id}>
                <Card
                  className={cn(
                    "lift flex h-full flex-col",
                    index === 0 && "border-brand-tint ring-1 ring-brand-tint",
                  )}
                >
                  {index === 0 && packages.length > 1 && (
                    <span className="mb-4 inline-flex w-fit items-center rounded-full bg-brand-tint px-3 py-1 text-[11px] font-extrabold tracking-wider text-brand uppercase">
                      {t.pricing.popular}
                    </span>
                  )}
                  <h3 className="text-2xl font-extrabold text-ink">
                    {pkg.name}
                  </h3>
                  {pkg.description && (
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
                      {pkg.description}
                    </p>
                  )}

                  <p className="font-display mt-6 text-4xl font-extrabold text-ink">
                    {formatPrice(pkg.price_cents, pkg.currency)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                    <Check className="h-4 w-4" />
                    {pkg.token_count}{" "}
                    {pkg.token_count === 1
                      ? t.pricing.appsOne
                      : t.pricing.appsMany}{" "}
                    · {pkg.token_count}{" "}
                    {pkg.token_count === 1
                      ? t.pricing.tokensOne
                      : t.pricing.tokensMany}
                  </p>

                  <div className="mt-auto pt-7">
                    {stripeOn ? (
                      user ? (
                        <BuyButton
                          packageId={pkg.id}
                          label={t.pricing.buy}
                          busyLabel={t.pricing.buying}
                          variant={index === 0 ? "primary" : "secondary"}
                        />
                      ) : (
                        <ButtonLink
                          href="/login?next=%2Fpricing"
                          variant={index === 0 ? "primary" : "secondary"}
                          size="md"
                          full
                        >
                          {t.pricing.signInToBuy}
                          <ArrowRight className="h-4 w-4" />
                        </ButtonLink>
                      )
                    ) : (
                      <p className="text-sm leading-relaxed text-muted">
                        {t.checkout.unavailable}
                      </p>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <Card className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
              <Ticket className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-ink">
                {t.pricing.haveToken}
              </h2>
              <p className="mt-1 text-[15px] text-muted">
                {t.pricing.haveTokenBody}
                {settings.supportEmail && (
                  <>
                    {" "}
                    <a
                      href={`mailto:${settings.supportEmail}`}
                      className="font-bold text-brand underline underline-offset-4"
                    >
                      {settings.supportEmail}
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          <ButtonLink
            href={startHref}
            variant="primary"
            size="md"
            className="shrink-0"
          >
            {t.pricing.startSubmission}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <PlanCard copy={t.plan} showPrice={false} />

          <Card>
            <h2 className="text-2xl font-extrabold text-ink">
              {t.pricing.howTitle}
            </h2>
            <ol className="mt-5 space-y-4">
              {t.pricing.how.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-tint text-sm font-extrabold text-brand">
                    {index + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-muted">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 rounded-lg bg-surface-dim px-4 py-3 text-sm text-muted">
              {t.pricing.codeLooksLike}{" "}
              <span className="font-mono font-bold text-ink">
                12TP-XXXX-XXXX
              </span>
            </p>
          </Card>
        </div>
      </Container>
    </Page>
  );
}
