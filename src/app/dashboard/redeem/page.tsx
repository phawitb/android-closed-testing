import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ButtonLink, Card, Container, IconBadge, Page } from "@/components/ui";
import { CopyField } from "@/components/CopyField";
import { ArrowRight, Gauge, Ticket } from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import {
  normaliseTokenCode,
  type MyToken,
  type TestingApp,
} from "@/lib/testing";

export const metadata = { title: "Redeem a token — Closed Testing" };

export default async function RedeemPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const token = code ? normaliseTokenCode(code) : "";
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = token
      ? `/dashboard/redeem?code=${encodeURIComponent(token)}`
      : "/dashboard/redeem";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const [{ data }, { data: isAdmin }, { data: tokenRows }] = await Promise.all([
    supabase
      .from("ct_apps")
      .select("*")
      .is("token_id", null)
      .order("created_at", { ascending: false }),
    supabase.rpc("ct_is_admin"),
    supabase.rpc("ct_my_tokens"),
  ]);

  const apps = (data ?? []) as TestingApp[];
  const myTokens = ((tokenRows ?? []) as MyToken[]).filter(
    (row) => row.status === "unused",
  );
  const newAppHref = token
    ? `/dashboard/apps/new?code=${encodeURIComponent(token)}`
    : "/dashboard/apps/new";

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
      />

      <Container width="lg" className="pt-8 pb-20">
        <header>
          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
            {t.redeem.title}
          </h1>
          <p className="mt-2 text-[17px] text-muted">{t.redeem.subtitle}</p>
        </header>

        {token && (
          <Card className="mt-6 max-w-md">
            <CopyField
              value={token}
              label={t.redeem.yourToken}
              hint={t.copy.clickToCopy}
              copiedLabel={t.copy.copied}
            />
          </Card>
        )}

        <Card className="mt-6 flex flex-col gap-5 border-brand-tint bg-brand-faint lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-ink">
              {t.redeem.newTitle}
            </h2>
            <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted">
              {t.redeem.newBody}
            </p>
          </div>
          <ButtonLink
            href={newAppHref}
            variant="primary"
            size="md"
            className="shrink-0"
          >
            {t.redeem.newCta}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Card>

        {myTokens.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <IconBadge size="sm">
                <Ticket className="h-5 w-5" />
              </IconBadge>
              <h2 className="text-xl font-extrabold text-ink">
                {t.checkout.tokensTitle}
              </h2>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {myTokens.map((row) => (
                <li key={row.code}>
                  <Card className="flex h-full flex-col gap-3">
                    <CopyField
                      value={row.code}
                      label={row.package_name ?? undefined}
                      hint={t.copy.clickToCopy}
                      copiedLabel={t.copy.copied}
                    />
                    <ButtonLink
                      href={`/dashboard/apps/new?code=${encodeURIComponent(row.code)}`}
                      variant="secondary"
                      size="sm"
                      className="mt-auto"
                    >
                      {t.checkout.useNow}
                    </ButtonLink>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        )}

        {apps.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-extrabold text-ink">
              {t.redeem.existingTitle}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {apps.map((app) => (
                <li key={app.id}>
                  <Link
                    href={
                      token
                        ? `/dashboard/apps/${app.id}/activate?code=${encodeURIComponent(token)}`
                        : `/dashboard/apps/${app.id}/activate`
                    }
                    className="lift flex items-center gap-4 rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-brand-tint"
                  >
                    <IconBadge>
                      <Gauge className="h-6 w-6" />
                    </IconBadge>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-extrabold text-ink">
                        {app.name}
                      </span>
                      <span className="block truncate text-[15px] text-muted">
                        {app.app_type === "free"
                          ? t.appDetails.freeApp
                          : t.appDetails.paidApp}{" "}
                        · {t.redeem.notActivated}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </Page>
  );
}
