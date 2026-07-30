import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { Card, Container, Page, StatusPill } from "@/components/ui";
import { SetupIntro, SetupSteps } from "@/components/SetupGuide";
import { ArrowLeft } from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import type { TestingApp } from "@/lib/testing";
import { CompleteSetupButton } from "./CompleteSetupButton";

export const metadata = { title: "Setup Guide — Closed Testing" };

export default async function SetupGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=/dashboard/apps/${id}/setup`);

  const [{ data }, { data: isAdmin }] = await Promise.all([
    supabase.from("ct_apps").select("*").eq("id", id).maybeSingle(),
    supabase.rpc("ct_is_admin"),
  ]);

  if (!data) notFound();
  const app = data as TestingApp;
  const done = Boolean(app.setup_confirmed_at);

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
      />

      <Container width="xl" className="pt-6 pb-32 lg:pb-20">
        <Link
          href={`/dashboard/apps/${id}`}
          className="-ml-2 inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-bold text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {app.name}
        </Link>

        <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
              {t.setupPage.eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">
              {t.setupPage.title}
            </h1>
            <p className="mt-2 max-w-2xl text-[17px] text-muted">
              {t.setupPage.subtitle}
            </p>
          </div>
          {done && <StatusPill label={t.setupPage.confirmed} tone="ok" />}
        </header>

        <div className="mt-8 space-y-5">
          <SetupIntro t={t.setupGuide} />
          <SetupSteps t={t.setupGuide} copy={t.copy} />
        </div>

        <Card className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-ink">
              {done ? t.setupPage.doneTitle : t.setupPage.askTitle}
            </h2>
            <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted">
              {done ? t.setupPage.doneBody : t.setupPage.askBody}
            </p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[18rem]">
            <CompleteSetupButton
              appId={id}
              done={done}
              label={t.setupPage.button}
              doneLabel={t.setupPage.buttonDone}
              busyLabel={t.setupPage.buttonSaving}
            />
          </div>
        </Card>
      </Container>
    </Page>
  );
}
