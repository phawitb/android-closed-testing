import { Card } from "@/components/ui";
import { getSettings } from "@/lib/settings.server";
import { isStripeConfigured } from "@/lib/stripe";
import { SettingsForm } from "./SettingsForm";
import { ClearAllDataButton } from "./ClearAllDataButton";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const secretKeySet = isStripeConfigured();
  const checkoutOn = secretKeySet && Boolean(settings.stripePublishableKey);

  return (
    <div className="space-y-4">
      <SettingsForm settings={settings} />

      <Card className="border-brand-tint bg-brand-faint">
        <h2 className="text-lg font-extrabold text-ink">Checkout status</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-ink">Secret Key</strong> —{" "}
            {secretKeySet ? "configured" : "not set"} via{" "}
            <code className="text-ink">STRIPE_SECRET_KEY</code> in{" "}
            <code className="text-ink">.env.local</code>. This never lives in
            the database — only whoever deploys the app can set it.
          </li>
          <li>
            <strong className="text-ink">Publishable Key</strong> —{" "}
            {settings.stripePublishableKey ? "set" : "not set"} above. Safe to
            store here; it&rsquo;s already meant to ship to the browser.
          </li>
        </ul>
        <p className="mt-4 text-sm font-bold text-ink">
          Checkout is currently{" "}
          <span className={checkoutOn ? "text-ok" : "text-brand"}>
            {checkoutOn ? "ON" : "OFF"}
          </span>{" "}
          — both keys are required for customers to be able to buy a package.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-extrabold text-ink">Danger zone</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Resets the app to a fresh state: every submission, message thread,
          token, and Stripe order record is deleted. Packages, admin accounts,
          and these settings are kept.
        </p>
        <div className="mt-4">
          <ClearAllDataButton />
        </div>
      </Card>
    </div>
  );
}
