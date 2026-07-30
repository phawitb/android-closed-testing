import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { PlanCard } from "@/components/PlanCard";
import { RichText } from "@/components/RichText";
import { ButtonLink, Card, Container, IconBadge, Page } from "@/components/ui";
import { ArrowLeft, ArrowRight, Dollar, Lock } from "@/components/icons";
import { getSettings } from "@/lib/settings.server";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import { normaliseTokenCode, type TestingApp } from "@/lib/testing";
import { RedeemForm } from "./RedeemForm";

export const metadata = { title: "Activate — Closed Testing" };

export default async function ActivatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { id } = await params;
  const { code } = await searchParams;
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/dashboard/apps/${id}/activate`);

  const [{ data }, { data: isAdmin }, settings] = await Promise.all([
    supabase.from("ct_apps").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("ct_is_admin"),
    getSettings(),
  ]);

  if (!data) notFound();
  const app = data as TestingApp;

  if (app.token_id) redirect(`/dashboard/apps/${id}/setup`);

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
      />

      <Container width="lg" className="pt-6 pb-20">
        <Link
          href={`/dashboard/apps/${id}`}
          className="-ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-bold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {app.name}
        </Link>

        <header className="mt-4">
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
            {t.activate.title}
          </h1>
          <p className="mt-2 text-[17px] text-muted">
            <RichText text={t.activate.subtitle} values={{ name: app.name }} />
          </p>
        </header>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-3">
                <IconBadge size="sm">
                  <Lock className="h-5 w-5" />
                </IconBadge>
                <h2 className="text-xl font-extrabold text-ink">
                  {t.activate.cardTitle}
                </h2>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {t.activate.cardBody}
              </p>
              <div className="mt-5">
                <RedeemForm
                  appId={id}
                  defaultCode={code ? normaliseTokenCode(code) : ""}
                  labels={{
                    tokenLabel: t.activate.tokenLabel,
                    submit: t.activate.submit,
                    checking: t.activate.checking,
                    tooShort: t.tokenErrors.tooShort,
                  }}
                />
              </div>
            </Card>

            <Card className="border-brand-tint bg-brand-faint">
              <div className="flex items-center gap-3">
                <IconBadge size="sm" tone="white">
                  <Dollar className="h-5 w-5" />
                </IconBadge>
                <h2 className="text-lg font-extrabold text-ink">
                  {t.activate.noTokenTitle}
                </h2>
              </div>
              <div className="mt-4">
                <ButtonLink href="/pricing" variant="primary" size="md" full>
                  {t.activate.noTokenCta}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
              {settings.supportEmail && (
                <p className="mt-3 text-sm text-muted">
                  {t.activate.questions}{" "}
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="font-bold text-brand underline underline-offset-4"
                  >
                    {settings.supportEmail}
                  </a>
                </p>
              )}
            </Card>
          </div>

          <PlanCard copy={t.plan} showPrice={false} />
        </div>
      </Container>
    </Page>
  );
}
