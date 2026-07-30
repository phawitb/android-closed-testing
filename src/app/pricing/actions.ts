"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import {
  isStripeConfigured,
  siteUrl,
  stripe,
  toStripeAmount,
} from "@/lib/stripe";
import { getT } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings.server";
import type { PaymentMethod } from "@/lib/settings";

/**
 * Card and PromptPay only — PromptPay needs a THB session, so it's only
 * offered for THB packages. `preferred` (from /admin/settings) is listed
 * first, but Stripe's hosted checkout page reorders payment methods itself
 * and always opens with Card pre-expanded; there is no session parameter
 * that overrides that. Apple Pay / Google Pay are switched off account-wide
 * in the Stripe Dashboard, which is what actually keeps them off this list.
 */
function paymentMethodTypes(
  currency: string,
  preferred: PaymentMethod,
): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  if (currency.toLowerCase() !== "thb") return ["card"];
  return preferred === "card" ? ["card", "promptpay"] : ["promptpay", "card"];
}

export type CheckoutResult = { ok: false; error: string; signIn?: boolean };

/**
 * Creates a Stripe Checkout Session for one package and sends the customer to
 * it. The price comes from the database, never from the browser.
 */
export async function startCheckout(
  packageId: string,
): Promise<CheckoutResult> {
  const { t } = await getT();

  if (!isStripeConfigured()) {
    return { ok: false, error: t.checkout.unavailable };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: t.tokenErrors.signIn, signIn: true };
  }

  const [{ data, error }, settings] = await Promise.all([
    supabase
      .from("ct_packages")
      .select("id, name, description, token_count, price_cents, currency")
      .eq("id", packageId)
      .eq("is_active", true)
      .maybeSingle(),
    getSettings(),
  ]);

  if (error || !data) {
    return { ok: false, error: t.checkout.failedBody };
  }

  const pkg = data as {
    id: string;
    name: string;
    description: string | null;
    token_count: number;
    price_cents: number;
    currency: string;
  };

  let url: string | null = null;

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      payment_method_types: paymentMethodTypes(
        pkg.currency,
        settings.defaultPaymentMethod,
      ),
      // Otherwise Stripe offers to convert the price into the buyer's local
      // currency, showing a currency picker on top of the payment form.
      adaptive_pricing: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: pkg.currency.toLowerCase(),
            unit_amount: toStripeAmount(pkg.price_cents, pkg.currency),
            product_data: {
              name: pkg.name,
              description:
                pkg.description ??
                `${pkg.token_count} testing token${pkg.token_count === 1 ? "" : "s"}`,
            },
          },
        },
      ],
      metadata: {
        package_id: pkg.id,
        package_name: pkg.name,
        user_id: user.id,
        email: user.email ?? "",
      },
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/checkout/cancelled`,
    });

    url = session.url;
  } catch (cause) {
    console.error("stripe checkout session failed", cause);
    return { ok: false, error: t.checkout.failedBody };
  }

  if (!url) return { ok: false, error: t.checkout.failedBody };

  redirect(url);
}
