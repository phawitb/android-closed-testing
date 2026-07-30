import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, Card, Container, IconBadge, Page } from "@/components/ui";
import { Warning } from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { appNav, siteNav } from "@/lib/i18n/nav";

export const metadata = { title: "Checkout cancelled — Closed Testing" };

export default async function CheckoutCancelledPage() {
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

      <Container width="md" className="pt-16 pb-20">
        <Card className="text-center">
          <IconBadge size="lg" className="mx-auto bg-amber-100 text-amber-700">
            <Warning className="h-7 w-7" />
          </IconBadge>
          <h1 className="mt-6 text-2xl font-extrabold text-ink sm:text-3xl">
            {t.checkout.cancelledTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
            {t.checkout.cancelledBody}
          </p>
          <div className="mt-7 flex justify-center">
            <ButtonLink href="/pricing" variant="primary" size="md">
              {t.checkout.backToPricing}
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Page>
  );
}
