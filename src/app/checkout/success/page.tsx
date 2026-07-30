import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CopyField } from "@/components/CopyField";
import { ButtonLink, Card, Container, IconBadge, Page } from "@/components/ui";
import { ArrowRight, Check, Ticket } from "@/components/icons";
import { fulfilCheckoutSession } from "@/lib/checkout";
import { isStripeConfigured } from "@/lib/stripe";
import { getT } from "@/lib/i18n/server";
import { appNav } from "@/lib/i18n/nav";
import { fill } from "@/components/RichText";
import { PendingRetry } from "./PendingRetry";

export const metadata = { title: "Payment complete — Closed Testing" };
export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fpricing");
  if (!sessionId || !isStripeConfigured()) redirect("/pricing");

  const { data: isAdmin } = await supabase.rpc("ct_is_admin");

  let result;
  try {
    result = await fulfilCheckoutSession(sessionId);
  } catch {
    result = { status: "pending" as const };
  }

  const codes = result.status === "paid" ? result.codes : [];
  const firstCode = codes[0];

  // Straight back into the wizard, one step past "enter your token" — the
  // token this payment minted is already known-good, no need to make the
  // customer copy it in by hand.
  if (result.status === "paid" && firstCode) {
    redirect(
      `/dashboard/apps/new?code=${encodeURIComponent(firstCode)}&fromPurchase=1`,
    );
  }

  return (
    <Page>
      <AppHeader
        email={user.email}
        isAdmin={Boolean(isAdmin)}
        nav={appNav(t)}
        locale={locale}
        t={t}
      />

      <Container width="md" className="pt-10 pb-20">
        {result.status === "paid" ? (
          <>
            <div className="text-center">
              <IconBadge
                size="lg"
                tone="solid"
                className="mx-auto bg-emerald-600"
              >
                <Check className="h-7 w-7" />
              </IconBadge>
              <h1 className="mt-6 text-3xl font-extrabold text-ink sm:text-4xl">
                {t.checkout.successTitle}
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-[17px] leading-relaxed text-muted">
                {t.checkout.successBody}
              </p>
              {result.amountLabel && (
                <p className="mt-2 text-sm font-bold text-muted">
                  {t.checkout.orderSummary}: {result.packageName ?? "—"} ·{" "}
                  {result.amountLabel}
                </p>
              )}
            </div>

            <Card className="mt-8">
              <div className="flex items-center gap-3">
                <IconBadge size="sm">
                  <Ticket className="h-5 w-5" />
                </IconBadge>
                <h2 className="text-xl font-extrabold text-ink">
                  {t.checkout.tokensTitle}
                </h2>
              </div>

              <ul className="mt-5 space-y-3">
                {codes.map((code) => (
                  <li key={code}>
                    <CopyField value={code} />
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-sm leading-relaxed text-muted">
                {fill(t.checkout.tokensHint, {
                  email: result.email ?? user.email ?? "",
                })}
              </p>
            </Card>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={
                  firstCode
                    ? `/dashboard/apps/new?code=${encodeURIComponent(firstCode)}`
                    : "/dashboard/apps/new"
                }
                variant="primary"
                size="lg"
              >
                {t.checkout.useNow}
                <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="outline" size="lg">
                {t.checkout.backToApps}
              </ButtonLink>
            </div>
          </>
        ) : (
          <Card className="text-center">
            {result.status === "pending" && <PendingRetry />}
            <h1 className="text-2xl font-extrabold text-ink">
              {result.status === "pending"
                ? t.checkout.successTitle
                : t.checkout.failedTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              {result.status === "pending"
                ? t.checkout.pending
                : t.checkout.failedBody}
            </p>
            <div className="mt-6 flex justify-center">
              {result.status === "pending" ? (
                <ButtonLink
                  href={`/checkout/success?session_id=${encodeURIComponent(sessionId)}`}
                  variant="primary"
                  size="md"
                >
                  {t.checkout.retry}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              ) : (
                <ButtonLink href="/pricing" variant="outline" size="md">
                  {t.checkout.backToPricing}
                </ButtonLink>
              )}
            </div>
          </Card>
        )}
      </Container>
    </Page>
  );
}
