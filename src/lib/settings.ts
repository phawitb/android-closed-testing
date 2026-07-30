import { DEFAULT_LOCALE, normaliseLocale, type Locale } from "./i18n/config";

/**
 * Copy an admin can change from /admin/settings without a deploy.
 *
 * Client-safe on purpose — the reader lives in `settings.server.ts` so that
 * client components can share these types and helpers.
 */
export type PaymentMethod = "promptpay" | "card";

export type SiteSettings = {
  /**
   * The customer-facing on/off switch for checkout, independent of the
   * server-only Stripe Secret Key (.env.local). Not itself a secret — it's
   * already meant to ship to the browser — but checkout only actually runs
   * when the Secret Key is also configured (see `isStripeConfigured`).
   */
  stripePublishableKey: string;
  supportEmail: string;
  /** What a first-time visitor sees before they pick a language themselves. */
  defaultLocale: Locale;
  /** Prefilled currency when an admin creates a new package. */
  defaultCurrency: string;
  /** Which Checkout payment method is listed first (best-effort — see note in /admin/settings). */
  defaultPaymentMethod: PaymentMethod;
};

export const SETTING_KEYS = [
  "stripe_publishable_key",
  "support_email",
  "default_locale",
  "default_currency",
  "default_payment_method",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const DEFAULT_SETTINGS: SiteSettings = {
  stripePublishableKey: "",
  supportEmail: "",
  defaultLocale: DEFAULT_LOCALE,
  defaultCurrency: "THB",
  defaultPaymentMethod: "promptpay",
};

function normalisePaymentMethod(value: string | undefined): PaymentMethod {
  return value === "card" ? "card" : "promptpay";
}

export function settingsFromRows(
  rows: Array<{ key: string; value: string }> | null,
): SiteSettings {
  const map = new Map((rows ?? []).map((row) => [row.key, row.value.trim()]));
  const pick = (key: SettingKey, fallback: string) => map.get(key) || fallback;

  return {
    stripePublishableKey: pick(
      "stripe_publishable_key",
      DEFAULT_SETTINGS.stripePublishableKey,
    ),
    supportEmail: pick("support_email", DEFAULT_SETTINGS.supportEmail),
    defaultLocale: normaliseLocale(map.get("default_locale")),
    defaultCurrency: pick(
      "default_currency",
      DEFAULT_SETTINGS.defaultCurrency,
    ).toUpperCase(),
    defaultPaymentMethod: normalisePaymentMethod(
      map.get("default_payment_method"),
    ),
  };
}
