"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Button,
  ButtonLink,
  Card,
  Container,
  ErrorText,
  FieldLabel,
  IconBadge,
  NoticeText,
  StepBar,
  Sticky,
  TextField,
  cn,
} from "@/components/ui";
import { SetupIntro, SetupSteps } from "@/components/SetupGuide";
import { GuideShot } from "@/components/GuideShot";
import { RedeemModal } from "@/components/RedeemModal";
import { RichText } from "@/components/RichText";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardList,
  Dollar,
  LinkIcon,
  Lock,
  Mail,
  Phone,
  Ticket,
} from "@/components/icons";
import { isEmail, normaliseStoreUrl } from "@/lib/testing";
import type { SiteSettings } from "@/lib/settings";
import type { Dict } from "@/lib/i18n/dictionaries";
import { checkToken, createApp } from "./actions";

const STEP_ICONS = [Ticket, ClipboardList, Phone];
const TOTAL_STEPS = 3;
const STORAGE_KEY = "ct-submit-wizard";

type AppType = "free" | "paid";
type SetupChoice = "done" | null;

type Draft = {
  step: number;
  setupChoice: SetupChoice;
  code: string;
  name: string;
  appType: AppType;
  storeUrl: string;
  email: string;
  promoCodes: string;
};

export function SubmitWizard({
  defaultEmail,
  tokenCode,
  myTokens,
  settings,
  t,
}: {
  defaultEmail: string;
  tokenCode: string | null;
  myTokens: string[];
  settings: SiteSettings;
  t: Dict;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [setupChoice, setSetupChoice] = useState<SetupChoice>(null);
  const [code, setCode] = useState(tokenCode ?? myTokens[0] ?? "");
  const [tokenOk, setTokenOk] = useState(false);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState("");
  const [appType, setAppType] = useState<AppType>("free");
  const [storeUrl, setStoreUrl] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [promoCodes, setPromoCodes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [restored, setRestored] = useState(false);

  // Buying a package sends people off-site, so the answers they already gave
  // survive the round trip. localStorage does not exist during SSR, so the
  // draft can only be applied after mount — a one-shot sync, not a loop.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as Partial<Draft>;
        if (draft.setupChoice === "done") setSetupChoice("done");
        if (!tokenCode && draft.code) setCode(draft.code);
        if (draft.name) setName(draft.name);
        if (draft.appType) setAppType(draft.appType);
        if (draft.storeUrl) setStoreUrl(draft.storeUrl);
        if (draft.email) setEmail(draft.email);
        if (draft.promoCodes) setPromoCodes(draft.promoCodes);
        if (draft.step && draft.step >= 1 && draft.step <= TOTAL_STEPS) {
          setStep(draft.step);
        }
      }
    } catch {
      // A corrupt draft is not worth blocking the flow for.
    }
    setRestored(true);
  }, [tokenCode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!restored) return;
    const draft: Draft = {
      step,
      setupChoice,
      code,
      name,
      appType,
      storeUrl,
      email,
      promoCodes,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Private mode — the wizard still works, it just won't remember.
    }
  }, [
    restored,
    step,
    setupChoice,
    code,
    name,
    appType,
    storeUrl,
    email,
    promoCodes,
  ]);

  function goTo(next: number) {
    setError(null);
    setStep(Math.min(TOTAL_STEPS, Math.max(1, next)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function verifyToken() {
    setError(null);
    setChecking(true);
    startTransition(async () => {
      const result = await checkToken(code);
      setChecking(false);
      if (!result.ok) {
        setTokenOk(false);
        setError(result.error);
        return;
      }
      setTokenOk(true);
      goTo(step + 1);
    });
  }

  function finalize() {
    setError(null);
    startTransition(async () => {
      const result = await createApp({
        code,
        name,
        appType,
        storeUrl,
        contactEmail: email,
        setupConfirmed: setupChoice === "done",
        promoCodes: appType === "paid" ? promoCodes : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        if (result.step) setStep(result.step);
        return;
      }

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nothing to clean up.
      }
      router.push(`/dashboard/apps/${result.id}?welcome=1`);
      router.refresh();
    });
  }

  const canContinue =
    step === 1
      ? code.trim().length >= 6
      : step === 2
        ? setupChoice === "done"
        : Boolean(name.trim()) &&
          Boolean(normaliseStoreUrl(storeUrl)) &&
          isEmail(email) &&
          (appType !== "paid" || promoCodes.trim().length > 0);

  return (
    <Container width="xl" className="pt-8 pb-32 lg:pb-16">
      <div className="mb-8 lg:mb-10">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          {t.wizard.title}
        </h1>
      </div>

      <div className="lg:hidden">
        <StepBar step={step} total={TOTAL_STEPS} />
        <p className="mt-3 text-sm font-bold text-muted">
          {t.wizard.step} {step} {t.wizard.stepOf} {TOTAL_STEPS} —{" "}
          {t.wizard.steps[step - 1].title}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:mt-0 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <Rail step={step} onSelect={goTo} tokenOk={tokenOk} t={t} />

        <div className="min-w-0">
          {step === 1 && (
            <section className="ct-pop space-y-5">
              <StepTitle
                index={1}
                title={t.wizard.step1.title}
                body={t.wizard.step1.body}
                t={t}
              />

              <Card>
                <div className="flex items-center gap-3">
                  <IconBadge size="sm">
                    <Lock className="h-5 w-5" />
                  </IconBadge>
                  <h3 className="text-xl font-extrabold text-ink">
                    {t.wizard.step1.cardTitle}
                  </h3>
                </div>

                <div className="mt-5 max-w-md">
                  <label className="block">
                    <TextField
                      icon={<Ticket className="h-5 w-5" />}
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value);
                        setTokenOk(false);
                        setError(null);
                      }}
                      placeholder="12TP-XXXX-XXXX"
                      autoComplete="off"
                      spellCheck={false}
                      className="font-mono tracking-wider uppercase"
                      autoFocus
                    />
                  </label>

                  {myTokens.length > 0 && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      <RichText
                        text={
                          myTokens.length === 1
                            ? t.wizard.step1.tokensAvailableOne
                            : t.wizard.step1.tokensAvailableMany
                        }
                        values={{ count: myTokens.length }}
                        strongClassName="text-brand"
                      />
                      {myTokens.length > 1 && (
                        <>
                          {" "}
                          <button
                            type="button"
                            onClick={() => setRedeemOpen(true)}
                            className="font-bold text-brand underline underline-offset-4"
                          >
                            {t.wizard.step1.viewTokens}
                          </button>
                        </>
                      )}
                    </p>
                  )}

                  {tokenOk ? (
                    <NoticeText>{t.wizard.step1.valid}</NoticeText>
                  ) : (
                    <ErrorText>{error}</ErrorText>
                  )}
                </div>
              </Card>

              <BuyCard settings={settings} t={t} />
            </section>
          )}

          {step === 2 && (
            <section className="ct-pop space-y-5">
              <StepTitle
                index={2}
                title={t.wizard.step2.title}
                body={t.wizard.step2.body}
                t={t}
              />

              <SetupIntro t={t.setupGuide} />
              <SetupSteps t={t.setupGuide} copy={t.copy} />

              <Card className="border-brand-tint bg-brand-faint">
                <h3 className="text-lg font-extrabold text-ink">
                  {t.wizard.step2.question}
                </h3>
                <p className="mt-1 text-[15px] text-muted">
                  {t.wizard.step2.hint}
                </p>

                <div className="mt-4">
                  <ChoiceCard
                    role="checkbox"
                    selected={setupChoice === "done"}
                    onSelect={() =>
                      setSetupChoice((current) =>
                        current === "done" ? null : "done",
                      )
                    }
                    title={t.wizard.step2.doneTitle}
                    body={t.wizard.step2.doneBody}
                  />
                </div>
              </Card>
            </section>
          )}

          {step === 3 && (
            <section className="ct-pop space-y-5">
              <StepTitle
                index={3}
                title={t.wizard.step3.title}
                body={t.wizard.step3.body}
                t={t}
              />

              <Card>
                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block">
                    <FieldLabel>{t.wizard.step3.appName}</FieldLabel>
                    <TextField
                      icon={<Phone className="h-5 w-5" />}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t.wizard.step3.appNamePlaceholder}
                      maxLength={120}
                      autoFocus
                    />
                  </label>

                  <label className="block">
                    <FieldLabel>{t.wizard.step3.contactEmail}</FieldLabel>
                    <TextField
                      icon={<Mail className="h-5 w-5" />}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                    />
                  </label>

                  <div className="lg:col-span-2">
                    <FieldLabel>{t.wizard.step3.optInUrl}</FieldLabel>
                    <TextField
                      icon={<LinkIcon className="h-5 w-5" />}
                      value={storeUrl}
                      onChange={(event) => setStoreUrl(event.target.value)}
                      placeholder="https://play.google.com/apps/testing/com.yourapp"
                      inputMode="url"
                      autoCapitalize="none"
                      spellCheck={false}
                      aria-label={t.wizard.step3.optInUrl}
                    />
                    <details className="group mt-2">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-bold text-brand [&::-webkit-details-marker]:hidden">
                        {t.wizard.step3.optInHintToggle}
                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                      </summary>
                      <div className="mt-3 space-y-3">
                        <p className="text-sm leading-relaxed text-muted">
                          <RichText text={t.wizard.step3.optInHint} />
                        </p>
                        <GuideShot
                          src="/guide/link.png"
                          alt="Play Console Testers tab showing How testers join your test with Copy link highlighted"
                        />
                      </div>
                    </details>
                  </div>

                  <div className="lg:col-span-2">
                    <FieldLabel>{t.wizard.step3.appType}</FieldLabel>
                    <div
                      className="grid gap-3 sm:grid-cols-2"
                      role="radiogroup"
                      aria-label={t.wizard.step3.appType}
                    >
                      <ChoiceCard
                        selected={appType === "free"}
                        onSelect={() => setAppType("free")}
                        title={t.wizard.step3.freeTitle}
                        body={t.wizard.step3.freeBody}
                      />
                      <ChoiceCard
                        selected={appType === "paid"}
                        onSelect={() => setAppType("paid")}
                        title={t.wizard.step3.paidTitle}
                        body={t.wizard.step3.paidBody}
                      />
                    </div>
                  </div>

                  {appType === "paid" && (
                    <div className="lg:col-span-2 rounded-lg border-2 border-brand-tint bg-brand-faint p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <IconBadge size="sm" tone="solid">
                          <Dollar className="h-5 w-5" />
                        </IconBadge>
                        <h4 className="text-base font-extrabold text-ink">
                          {t.appDetails.promo.statusLabel}
                        </h4>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                        <RichText
                          text={t.appDetails.promo.modalBody}
                          strongClassName="font-extrabold text-brand"
                        />
                      </p>
                      <textarea
                        value={promoCodes}
                        onChange={(event) => setPromoCodes(event.target.value)}
                        placeholder={t.appDetails.promo.placeholder}
                        rows={6}
                        className="mt-4 w-full resize-y rounded-lg border-2 border-brand-tint bg-white px-4 py-3 font-mono text-sm text-ink outline-none placeholder:text-muted focus:border-brand"
                      />
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-brand-tint bg-brand-faint">
                <h3 className="text-sm font-extrabold tracking-wider text-brand uppercase">
                  {t.wizard.step3.summary}
                </h3>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <SummaryRow label={t.wizard.step3.appName} value={name} />
                  <SummaryRow
                    label={t.wizard.step3.appType}
                    value={
                      appType === "free"
                        ? t.wizard.step3.freeTitle
                        : t.wizard.step3.paidTitle
                    }
                  />
                  <SummaryRow
                    label={t.wizard.step3.optInUrl}
                    value={storeUrl}
                  />
                  <SummaryRow
                    label={t.wizard.step3.contactEmail}
                    value={email}
                  />
                  <SummaryRow
                    label={t.wizard.step3.summaryToken}
                    value={code.toUpperCase()}
                  />
                  <SummaryRow
                    label={t.wizard.step3.summarySetup}
                    value={t.wizard.step3.setupDone}
                  />
                  {appType === "paid" && (
                    <SummaryRow
                      label={t.appDetails.promo.statusLabel}
                      value={
                        promoCodes.trim()
                          ? t.appDetails.promo.yes
                          : t.appDetails.promo.no
                      }
                    />
                  )}
                </dl>
              </Card>
            </section>
          )}

          {step !== 1 && <ErrorText>{error}</ErrorText>}

          <Sticky className="mt-8" width="xl">
            <div className="flex items-center gap-3">
              {step > 1 ? (
                <Button
                  onClick={() => goTo(step - 1)}
                  variant="outline"
                  size="lg"
                  className="shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">{t.common.back}</span>
                </Button>
              ) : (
                <ButtonLink
                  href="/dashboard"
                  variant="outline"
                  size="lg"
                  className="hidden shrink-0 sm:inline-flex"
                >
                  {t.common.cancel}
                </ButtonLink>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  onClick={() => (step === 1 ? verifyToken() : goTo(step + 1))}
                  disabled={!canContinue || checking}
                  variant="primary"
                  size="lg"
                  full
                >
                  {step === 1 && checking
                    ? t.wizard.step1.checking
                    : t.common.continue}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  onClick={finalize}
                  disabled={pending || !canContinue}
                  variant="primary"
                  size="lg"
                  full
                >
                  {pending ? t.wizard.step3.submitting : t.wizard.step3.submit}
                </Button>
              )}
            </div>
          </Sticky>
        </div>
      </div>

      <RedeemModal
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        t={t}
      />
    </Container>
  );
}

// ---------------------------------------------------------------------------
function Rail({
  step,
  onSelect,
  tokenOk,
  t,
}: {
  step: number;
  onSelect: (next: number) => void;
  tokenOk: boolean;
  t: Dict;
}) {
  return (
    <nav className="hidden lg:block" aria-label={t.wizard.title}>
      <ol className="sticky top-24 space-y-1">
        {t.wizard.steps.map((entry, index) => {
          const number = index + 1;
          const Icon = STEP_ICONS[index] ?? ClipboardList;
          const active = number === step;
          const done = number < step || (number === 1 && tokenOk && step > 1);
          const reachable = number <= step;

          return (
            <li key={entry.title}>
              <button
                type="button"
                onClick={() => reachable && onSelect(number)}
                disabled={!reachable}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition",
                  active && "bg-brand-faint",
                  reachable && !active && "hover:bg-surface-dim",
                  !reachable && "cursor-not-allowed opacity-55",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition",
                    done
                      ? "border-brand bg-brand text-white"
                      : active
                        ? "border-brand text-brand"
                        : "border-line text-muted",
                  )}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[15px] font-extrabold",
                      active ? "text-brand" : "text-ink",
                    )}
                  >
                    {entry.title}
                  </span>
                  <span className="block text-sm leading-snug text-muted">
                    {entry.caption}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepTitle({
  index,
  title,
  body,
  t,
}: {
  index: number;
  title: string;
  body: string;
  t: Dict;
}) {
  return (
    <div className="hidden lg:block">
      <p className="text-xs font-extrabold tracking-[0.16em] text-brand uppercase">
        {t.wizard.step} {index} {t.wizard.stepOf} {TOTAL_STEPS}
      </p>
      <h2 className="mt-1.5 text-3xl font-extrabold text-ink">{title}</h2>
      <p className="mt-1.5 text-[17px] text-muted">{body}</p>
    </div>
  );
}

function ChoiceCard({
  selected,
  onSelect,
  title,
  body,
  role = "radio",
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  body: string;
  role?: "radio" | "checkbox";
}) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-xl border-2 bg-white px-4 py-4 text-left transition",
        selected
          ? "border-brand shadow-md shadow-brand/10"
          : "border-line hover:border-brand-tint",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full transition",
          selected ? "bg-brand text-white" : "bg-surface-dim text-transparent",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-extrabold text-ink">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">
          {body}
        </span>
      </span>
    </button>
  );
}

function BuyCard({ settings, t }: { settings: SiteSettings; t: Dict }) {
  return (
    <Card className="border-brand-tint bg-brand-faint">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <IconBadge size="sm" tone="white">
              <Dollar className="h-5 w-5" />
            </IconBadge>
            <h3 className="text-xl font-extrabold text-ink">
              {t.wizard.step1.noTokenTitle}
            </h3>
          </div>
          {settings.supportEmail && (
            <p className="mt-1 text-sm text-muted">
              {t.wizard.step1.questions}{" "}
              <a
                href={`mailto:${settings.supportEmail}`}
                className="font-bold text-brand underline underline-offset-4"
              >
                {settings.supportEmail}
              </a>
            </p>
          )}
        </div>

        <ButtonLink
          href="/pricing"
          variant="primary"
          size="md"
          className="shrink-0"
        >
          {t.wizard.step1.noTokenCta}
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-extrabold tracking-wider text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 font-bold break-all text-ink">{value || "—"}</dd>
    </div>
  );
}
