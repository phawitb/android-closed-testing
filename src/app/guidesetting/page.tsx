import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupIntro, SetupSteps } from "@/components/SetupGuide";
import { ButtonLink, Container, Page } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { appNav, siteNav } from "@/lib/i18n/nav";
import { jsonLd, pageMetadata } from "@/lib/seo";

export const metadata = {
  title: "Setup Guide",
  ...pageMetadata({
    title: "Setup Guide — Closed Testing",
    description:
      "The Google Play Console changes required before a 14-day closed testing cycle can start.",
    path: "/guidesetting",
  }),
};

/**
 * Public mirror of the in-app setup guide. No sign-in required — a customer
 * (or their teammate) can read every step before ever creating an account.
 */
export default async function PublicGuideSettingPage() {
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: isAdmin } = user
    ? await supabase.rpc("ct_is_admin")
    : { data: false };

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
        name: "Setup Guide",
        item: `${siteUrl}/guidesetting`,
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
      <Container width="md" className="pt-10 pb-20">
        <header>
          <p className="text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
            {t.guidePage.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
            {t.guidePage.title}
          </h1>
          <p className="mt-2 max-w-2xl text-[17px] text-muted">
            {t.guidePage.subtitle}
          </p>
        </header>

        <div className="mt-8 space-y-5">
          <SetupIntro t={t.setupGuide} />
          <SetupSteps t={t.setupGuide} copy={t.copy} />
        </div>

        {!user && (
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/login?next=%2Fdashboard%2Fapps%2Fnew" variant="primary" size="lg">
              {t.guidePage.cta}
            </ButtonLink>
          </div>
        )}
      </Container>
      </main>
    </Page>
  );
}
