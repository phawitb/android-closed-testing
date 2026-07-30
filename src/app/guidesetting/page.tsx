import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SiteHeader } from "@/components/SiteHeader";
import { SetupIntro, SetupSteps } from "@/components/SetupGuide";
import { ButtonLink, Container, Page } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { appNav, siteNav } from "@/lib/i18n/nav";

export const metadata = {
  title: "Setup Guide — Closed Testing",
  description:
    "The Google Play Console changes required before a 14-day closed testing cycle can start.",
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
    </Page>
  );
}
