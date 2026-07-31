import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { Page } from "@/components/ui";
import { getSettings } from "@/lib/settings.server";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import { normaliseTokenCode, type MyToken } from "@/lib/testing";
import { SubmitWizard } from "./SubmitWizard";

export const metadata = { title: "Submit an app" };

export default async function NewAppPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; fromPurchase?: string }>;
}) {
  const { code, fromPurchase } = await searchParams;
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/apps/new");

  const [{ data: isAdmin }, settings, { data: tokenRows }] = await Promise.all([
    supabase.rpc("ct_is_admin"),
    getSettings(),
    supabase.rpc("ct_my_tokens"),
  ]);

  const myTokens = ((tokenRows ?? []) as MyToken[])
    .filter((row) => row.status === "unused")
    .map((row) => row.code);

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
      />
      <SubmitWizard
        defaultEmail={user.email ?? ""}
        tokenCode={code ? normaliseTokenCode(code) : null}
        autoValidateToken={fromPurchase === "1"}
        myTokens={myTokens}
        settings={settings}
        t={t}
      />
    </Page>
  );
}
