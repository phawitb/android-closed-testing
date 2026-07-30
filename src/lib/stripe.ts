import Stripe from "stripe";

/** Card payment is optional — without keys the buy buttons simply hide. */
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Checkout is only actually offered once both are true: the developer has
 * configured the server-only Secret Key (.env.local), and the admin has
 * pasted the account's Publishable Key into /admin/settings. The admin can
 * flip checkout on or off from the web UI by adding/clearing that field,
 * without ever touching the Secret Key or redeploying.
 */
export function isCheckoutEnabled(publishableKey: string): boolean {
  return isStripeConfigured() && Boolean(publishableKey.trim());
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

  client ??= new Stripe(key);
  return client;
}

/** Absolute origin for Stripe's return URLs. */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (configured || "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Stripe wants the smallest currency unit, which for zero-decimal currencies
 * is the whole unit. Prices are stored in cents, so those need dividing.
 */
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf",
  "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

export function toStripeAmount(cents: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toLowerCase())
    ? Math.round(cents / 100)
    : Math.round(cents);
}
