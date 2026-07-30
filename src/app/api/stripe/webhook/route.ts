import { NextResponse, type NextRequest } from "next/server";
import { isStripeConfigured, stripe } from "@/lib/stripe";
import { fulfilCheckoutSession } from "@/lib/checkout";

/**
 * Safety net for customers who close the tab before Stripe redirects them
 * back. Optional: without STRIPE_WEBHOOK_SECRET the endpoint refuses events,
 * because an unverified body must never be trusted to mint tokens.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch (cause) {
    console.error("stripe webhook signature check failed", cause);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as { id: string };
    try {
      await fulfilCheckoutSession(session.id);
    } catch (cause) {
      console.error("fulfilment from webhook failed", cause);
      // 500 so Stripe retries.
      return NextResponse.json({ error: "fulfilment failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
