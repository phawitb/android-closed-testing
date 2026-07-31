import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Card, Container, Page, cn } from "@/components/ui";
import { ArrowRight, Check } from "@/components/icons";
import { getSettings } from "@/lib/settings.server";
import { isCheckoutEnabled } from "@/lib/stripe";
import { getT } from "@/lib/i18n/server";
import { appNav, siteNav } from "@/lib/i18n/nav";
import { formatPrice } from "@/app/admin/types";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { BuyButton } from "./BuyButton";

export const metadata = {
  title: "Plans & Pricing",
  ...pageMetadata({
    title: "Plans & Pricing — Closed Testing",
    description:
      "Token packages for Google Play closed testing cycles — pick a package, activate an app, and every 14-day cycle runs with real testers.",
    path: "/pricing",
  }),
};

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
  const stripeOn = isCheckoutEnabled(settings.stripePublishableKey);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing",
        item: `${siteUrl}/pricing`,
      },
    ],
  };

  return (
    <Page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd)}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        {t.common.skipToContent}
      </a>
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

      <main id="main-content">
      <Container width="xl" className="pt-10 pb-20 lg:pt-14">
        <p className="text-center text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
          {t.pricing.eyebrow}
        </p>

        {packages.length > 0 && (
          <ul
            className={cn(
              "mt-6 grid gap-5",
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
                      : t.pricing.appsMany}
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
      </Container>
      </main>
    </Page>
  );
}
