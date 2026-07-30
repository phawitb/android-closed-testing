import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/stripe";

/** Mail is optional — without a key these calls just log and skip. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

let client: Resend | null = null;

function resend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  client ??= new Resend(key);
  return client;
}

function from(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Closed Testing <onboarding@resend.dev>"
  );
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.log(
      `[email] skipped (RESEND_API_KEY not set): ${subject} -> ${to}`,
    );
    return;
  }

  try {
    await resend().emails.send({ from: from(), to, subject, html });
  } catch (error) {
    // Email is a nice-to-have, never worth failing the request that
    // triggered it — payment/submission/completion already happened.
    console.error("sendEmail failed", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Every email in ct_admins — the table only service role can read. */
async function adminRecipients(): Promise<string[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("ct_admins").select("email");
    if (error) throw error;
    return (data ?? [])
      .map((row) => (row as { email: string }).email)
      .filter(Boolean);
  } catch (error) {
    console.error("adminRecipients failed", error);
    return [];
  }
}

/** A task just landed in the admin console — mirror it to every admin's inbox. */
async function notifyAdmins(subject: string, bodyHtml: string): Promise<void> {
  const to = await adminRecipients();
  if (to.length === 0) return;
  await sendEmail({ to, subject, html: wrap(subject, bodyHtml) });
}

function wrap(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #131320;">
      <h1 style="font-size: 20px;">${title}</h1>
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 13px; color: #8a8a99;">— Closed Testing</p>
    </div>
  `;
}

export async function sendPaymentReceivedEmail(
  to: string,
  { packageName, codes }: { packageName: string | null; codes: string[] },
): Promise<void> {
  await sendEmail({
    to,
    subject: "Payment received — your token is ready",
    html: wrap(
      "Payment received",
      `
        <p>Thanks for your purchase${packageName ? ` of <strong>${packageName}</strong>` : ""}.</p>
        <p>Your token${codes.length > 1 ? "s" : ""}:</p>
        <p style="font-family: monospace; font-size: 15px;">${codes.join("<br>")}</p>
        <p>Use it to submit an app whenever you're ready.</p>
      `,
    ),
  });
}

export async function sendAppSubmittedEmail(
  to: string,
  { appName }: { appName: string },
): Promise<void> {
  await sendEmail({
    to,
    subject: `We received your submission — ${appName}`,
    html: wrap(
      "Submission received",
      `
        <p><strong>${appName}</strong> has been submitted for closed testing.</p>
        <p>Once your Play Console setup is confirmed, we'll start your 14-day cycle and you can follow progress from your dashboard.</p>
      `,
    ),
  });
}

export async function sendTestingCompleteEmail(
  to: string,
  { appName }: { appName: string },
): Promise<void> {
  await sendEmail({
    to,
    subject: `Testing complete — ${appName}`,
    html: wrap(
      "Testing complete",
      `
        <p>Your 14-day closed testing cycle for <strong>${appName}</strong> is complete.</p>
        <p>Check your dashboard for your production access answers, then submit Google's form and promote your release to production.</p>
      `,
    ),
  });
}

/** Customer confirmed their Play Console setup — the cycle is ready to start. */
export async function sendAdminSetupReadyEmail(appName: string): Promise<void> {
  await notifyAdmins(
    `Ready to start — ${appName}`,
    `
      <p><strong>${escapeHtml(appName)}</strong> confirmed their Play Console setup and is ready for you to start the cycle.</p>
      <p><a href="${siteUrl()}/admin/apps">Open submissions</a></p>
    `,
  );
}

/** Customer sent a message on their app thread — it needs an admin reply. */
export async function sendAdminOwnerMessageEmail(
  appName: string,
  message: string,
): Promise<void> {
  await notifyAdmins(
    `New message — ${appName}`,
    `
      <p><strong>${escapeHtml(appName)}</strong> sent a message that needs a reply.</p>
      <p style="white-space: pre-wrap; background: #f4f4f8; border-radius: 8px; padding: 12px;">${escapeHtml(message)}</p>
      <p><a href="${siteUrl()}/admin/apps">Open submissions</a></p>
    `,
  );
}
