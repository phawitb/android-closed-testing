"use client";

import { useActionState } from "react";
import { Card, ErrorText, NoticeText, cn } from "@/components/ui";
import type { SiteSettings } from "@/lib/settings";
import { LOCALE_LABEL, LOCALES } from "@/lib/i18n/config";
import { saveSettings, type AdminState } from "../actions";

const input =
  "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    saveSettings,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <Card>
        <h2 className="text-lg font-extrabold text-ink">Defaults</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          What a first-time visitor sees before they&rsquo;ve chosen anything
          themselves.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">
              Default language
            </span>
            <select
              name="default_locale"
              defaultValue={settings.defaultLocale}
              className={input}
            >
              {LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {LOCALE_LABEL[locale]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">
              Default currency
            </span>
            <input
              name="default_currency"
              defaultValue={settings.defaultCurrency}
              maxLength={3}
              placeholder="THB"
              className={cn(input, "font-mono uppercase")}
            />
            <span className="mt-1 block text-xs text-muted">
              Prefills new packages in Tokens &amp; Packages.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-muted">
              Default payment method
            </span>
            <select
              name="default_payment_method"
              defaultValue={settings.defaultPaymentMethod}
              className={input}
            >
              <option value="promptpay">PromptPay</option>
              <option value="card">Card</option>
            </select>
            <span className="mt-1 block text-xs text-muted">
              Listed first at checkout — see note below.
            </span>
          </label>
        </div>

        <p className="mt-5 rounded-xl bg-surface-dim px-4 py-3 text-xs leading-relaxed text-muted">
          Stripe&rsquo;s hosted checkout page reorders payment methods itself and
          does not expose an API setting for which one opens pre-selected —
          this only sets the order this app requests. To force PromptPay (or
          Card) to be the one shown expanded by default, drag it to the top in
          the{" "}
          <a
            href="https://dashboard.stripe.com/settings/payment_methods"
            target="_blank"
            rel="noreferrer noopener"
            className="font-bold text-brand underline underline-offset-4"
          >
            Stripe Dashboard → Settings → Payment methods
          </a>
          . Apple Pay and Google Pay are switched off there too, account-wide.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-extrabold text-ink">Stripe checkout</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          The Secret Key is configured separately, server-side only, via{" "}
          <code className="text-ink">STRIPE_SECRET_KEY</code> in{" "}
          <code className="text-ink">.env.local</code> — it can charge and
          refund real money, so it never lives here. The Publishable Key below
          is not secret (it&rsquo;s already meant to ship to the browser) and acts
          as your on/off switch for checkout: paste it in once the Secret Key
          is set to turn buying on, or clear it to turn checkout off without
          touching the server.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block lg:max-w-md">
            <span className="mb-1.5 block text-xs font-bold text-muted">
              Publishable key
            </span>
            <input
              name="stripe_publishable_key"
              defaultValue={settings.stripePublishableKey}
              placeholder="pk_live_…"
              className={cn(input, "font-mono")}
            />
          </label>

          <label className="block lg:max-w-sm">
            <span className="mb-1.5 block text-xs font-bold text-muted">
              Support email (optional)
            </span>
            <input
              name="support_email"
              type="email"
              defaultValue={settings.supportEmail}
              placeholder="support@example.com"
              className={input}
            />
          </label>
        </div>
      </Card>

      <ErrorText>{state.error}</ErrorText>
      <NoticeText>{state.notice}</NoticeText>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
