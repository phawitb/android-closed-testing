import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { sendPaymentReceivedEmail } from "@/lib/email";

export type Fulfilment =
  | { status: "paid"; codes: string[]; email: string | null; packageName: string | null; amountLabel: string | null }
  | { status: "pending" }
  | { status: "failed" };

/**
 * Turns a paid Stripe Checkout Session into tokens. Safe to call as often as
 * you like: ct_fulfil_order keys off the session id, so the codes are minted
 * once and read back afterwards.
 */
export async function fulfilCheckoutSession(
  sessionId: string,
): Promise<Fulfilment> {
  const session = await stripe().checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return session.status === "expired" ? { status: "failed" } : { status: "pending" };
  }

  const packageId = session.metadata?.package_id ?? null;
  if (!packageId) {
    console.error("checkout session without package_id", sessionId);
    return { status: "failed" };
  }

  const email =
    session.customer_details?.email ?? session.metadata?.email ?? null;

  const supabase = createAdminClient();

  // ct_fulfil_order is itself idempotent (repeat calls just hand back the
  // same codes), but we only want to email once — check whether this
  // session was already recorded before fulfilling it.
  const { data: existingOrder } = await supabase
    .from("ct_orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();
  const isNewOrder = !existingOrder;

  const { data, error } = await supabase.rpc("ct_fulfil_order", {
    p_session_id: session.id,
    p_package_id: packageId,
    p_user_id: session.metadata?.user_id ?? null,
    p_email: email,
    p_amount: session.amount_total ?? null,
    p_currency: session.currency ?? null,
  });

  if (error) {
    console.error("ct_fulfil_order failed", error);
    throw new Error(error.message);
  }

  const codes = ((data ?? []) as Array<string | { code: string }>).map((row) =>
    typeof row === "string" ? row : row.code,
  );
  const packageName = session.metadata?.package_name ?? null;

  if (isNewOrder && email) {
    await sendPaymentReceivedEmail(email, { packageName, codes });
  }

  return {
    status: "paid",
    codes,
    email,
    packageName,
    amountLabel: formatAmount(session.amount_total, session.currency),
  };
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null || !currency) return null;
  const locale = currency.toUpperCase() === "THB" ? "th-TH" : "en-IE";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}
