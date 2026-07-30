import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Container, Page } from "@/components/ui";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Check, ClipboardList, ShieldCheck, Ticket } from "@/components/icons";
import { getT } from "@/lib/i18n/server";
import { GoogleButton } from "./GoogleButton";

export const metadata = { title: "Sign in — Closed Testing" };

const STEP_ICONS = [ClipboardList, Ticket, Check];

function safePath(value: string | undefined) {
  if (!value) return "/dashboard";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const destination = safePath(next);
  const { locale, t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(destination);

  return (
    <Page className="hero-canvas flex flex-col" glow={false}>
      <Container width="xl" className="flex flex-1 items-center py-10 lg:py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="ct-pop">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="font-display text-lg font-extrabold text-ink">
                  Closed Testing
                </span>
              </Link>
              <LocaleSwitcher locale={locale} />
            </div>

            <h1 className="mt-10 text-4xl leading-tight font-extrabold text-ink sm:text-5xl">
              {t.login.title}
            </h1>
            <p className="mt-3 max-w-md text-lg text-muted">
              {t.login.subtitle}
            </p>

            <ul className="mt-10 space-y-5">
              {t.login.steps.map((step, index) => {
                const Icon = STEP_ICONS[index] ?? Check;
                return (
                  <li key={step.title} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-tint text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[15px] font-extrabold text-ink">
                        {index + 1}. {step.title}
                      </p>
                      <p className="mt-0.5 text-[15px] leading-snug text-muted">
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <Card className="ct-pop-2 mx-auto w-full max-w-md rounded-2xl p-7 shadow-xl shadow-black/[0.06] sm:p-9">
            <h2 className="text-2xl font-extrabold text-ink">
              {t.login.cardTitle}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              {t.login.cardBody}
            </p>

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

            <p className="mt-6 text-center text-sm text-muted">
              {t.login.newHere}{" "}
              <Link
                href="/"
                className="font-bold text-brand underline underline-offset-4"
              >
                {t.login.seeHow}
              </Link>
            </p>
          </Card>
        </div>
      </Container>
    </Page>
  );
}
