import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Container, Page } from "@/components/ui";
import { getT } from "@/lib/i18n/server";
import { GoogleButton } from "./GoogleButton";

export const metadata = { title: "Sign in — Closed Testing" };

function safePath(value: string | undefined) {
  if (!value) return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const destination = safePath(next);
  const { t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(destination);

  return (
    <Page className="hero-canvas flex flex-col" glow={false}>
      <Container
        width="xl"
        className="flex flex-1 items-start justify-center pt-16 pb-16 sm:pt-24 lg:pt-28"
      >
        <Card className="ct-pop-2 mx-auto w-full max-w-md rounded-2xl p-7 shadow-xl shadow-black/[0.06] sm:p-9">
          <h2 className="text-2xl font-extrabold text-ink">
            {t.login.cardTitle}
          </h2>

          {error && (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-brand-tint bg-brand-faint px-4 py-3 text-sm font-semibold text-brand"
            >
              {error === "exchange"
                ? t.login.errorExpired
                : t.login.errorGeneric}
            </p>
          )}

          <div className="mt-8">
            <GoogleButton
              next={destination}
              label={t.login.button}
              busyLabel={t.login.signingIn}
            />
          </div>
        </Card>
      </Container>
    </Page>
  );
}
