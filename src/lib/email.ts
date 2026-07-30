import { Resend } from "resend";

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
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.log(`[email] skipped (RESEND_API_KEY not set): ${subject} -> ${to}`);
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
