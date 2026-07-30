"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { today } from "@/lib/testing";
import { sendTestingCompleteEmail } from "@/lib/email";

export type AdminState = { error?: string; notice?: string; codes?: string[] };

function text(value: FormDataEntryValue | null) {
  const out = String(value ?? "").trim();
  return out ? out : null;
}

function int(value: FormDataEntryValue | null) {
  const out = String(value ?? "").trim();
  if (!out) return null;
  const parsed = Number(out);
  return Number.isInteger(parsed) ? parsed : null;
}

/** Every admin RPC re-checks ct_admins server-side; this is just a fast path. */
async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Please sign in again.");
  return supabase;
}

function friendly(message: string | undefined) {
  if (!message) return "Something went wrong. Please try again.";
  if (message.includes("admin access required")) {
    return "Your account no longer has admin access.";
  }
  return message;
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/apps");
  revalidatePath("/admin/tokens");
  revalidatePath("/admin/team");
  revalidatePath("/admin/settings");
}

// ---------------------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------------------
export async function updateApp(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const appId = String(formData.get("app_id") ?? "");
  if (!appId) return { error: "Missing app." };

  const startNow = formData.get("start_now") === "1";
  const status = startNow ? "in_progress" : text(formData.get("status"));

  const { error } = await supabase.rpc("ct_admin_update_app", {
    p_app_id: appId,
    p_status: status,
    p_started_on: startNow ? today() : text(formData.get("started_on")),
    p_clear_started_on: formData.get("clear_started_on") === "1",
    p_day_override: int(formData.get("day_override")),
    p_clear_day_override: formData.get("clear_day_override") === "1",
    p_total_days: int(formData.get("total_days")),
    p_admin_note: text(formData.get("admin_note")),
  });

  if (error) {
    console.error("ct_admin_update_app failed", error);
    return { error: friendly(error.message) };
  }

  if (status === "completed") {
    const { data: claimRows } = await supabase.rpc(
      "ct_admin_claim_completed_email",
      { p_app_id: appId },
    );
    const claim = claimRows?.[0] as
      | { claimed: boolean; name: string; contact_email: string }
      | undefined;
    if (claim?.claimed && claim.contact_email) {
      await sendTestingCompleteEmail(claim.contact_email, {
        appName: claim.name,
      });
    }
  }

  refresh();
  revalidatePath(`/dashboard/apps/${appId}`);
  return { notice: startNow ? "Cycle started." : "Saved." };
}

export async function sendMessage(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const appId = String(formData.get("app_id") ?? "");
  const body = text(formData.get("body"));
  if (!appId || !body) return { error: "Write a message first." };

  const { error } = await supabase.rpc("ct_send_app_message", {
    p_app_id: appId,
    p_body: body,
  });

  if (error) {
    console.error("ct_send_app_message failed", error);
    return { error: friendly(error.message) };
  }

  refresh();
  revalidatePath(`/dashboard/apps/${appId}`);
  return { notice: "Sent." };
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
export async function createTokens(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const packageId = text(formData.get("package_id"));
  const count = int(formData.get("count")) ?? 1;

  if (!packageId && (count < 1 || count > 100)) {
    return { error: "Choose between 1 and 100 tokens." };
  }

  const { data, error } = await supabase.rpc("ct_admin_create_tokens", {
    p_count: count,
    p_email: text(formData.get("email")),
    p_package_id: packageId,
  });

  if (error) {
    console.error("ct_admin_create_tokens failed", error);
    return { error: friendly(error.message) };
  }

  const codes = (data as string[]) ?? [];
  refresh();
  return {
    notice: `Created ${codes.length} token${codes.length === 1 ? "" : "s"}.`,
    codes,
  };
}

export async function voidToken(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const { error } = await supabase.rpc("ct_admin_void_token", {
    p_token_id: String(formData.get("token_id") ?? ""),
  });

  if (error) {
    console.error("ct_admin_void_token failed", error);
    return { error: friendly(error.message) };
  }

  refresh();
  return { notice: "Token voided." };
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------
export async function savePackage(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const name = text(formData.get("name"));
  if (!name) return { error: "Give the package a name." };

  const tokenCount = int(formData.get("token_count")) ?? 1;
  if (tokenCount < 1 || tokenCount > 100) {
    return { error: "Token count must be between 1 and 100." };
  }

  const price = Number(String(formData.get("price") ?? "0").trim());
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Enter a valid price." };
  }

  const { error } = await supabase.rpc("ct_admin_save_package", {
    p_id: text(formData.get("package_id")),
    p_name: name,
    p_description: text(formData.get("description")),
    p_token_count: tokenCount,
    p_price_cents: Math.round(price * 100),
    p_currency: text(formData.get("currency")) ?? "EUR",
    p_is_active: formData.get("is_active") === "1",
    p_sort_order: int(formData.get("sort_order")) ?? 0,
  });

  if (error) {
    console.error("ct_admin_save_package failed", error);
    return { error: friendly(error.message) };
  }

  refresh();
  revalidatePath("/pricing");
  return { notice: "Package saved." };
}

export async function deletePackage(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const { error } = await supabase.rpc("ct_admin_delete_package", {
    p_id: String(formData.get("package_id") ?? ""),
  });

  if (error) {
    console.error("ct_admin_delete_package failed", error);
    return { error: friendly(error.message) };
  }

  refresh();
  revalidatePath("/pricing");
  return { notice: "Package deleted." };
}

// ---------------------------------------------------------------------------
// Site settings
// ---------------------------------------------------------------------------
export async function saveSettings(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const stripePublishableKey = String(
    formData.get("stripe_publishable_key") ?? "",
  ).trim();
  if (stripePublishableKey && !/^pk_(test|live)_/.test(stripePublishableKey)) {
    return {
      error: "That doesn't look like a Stripe publishable key (pk_test_… or pk_live_…).",
    };
  }

  const supportEmail = String(formData.get("support_email") ?? "").trim();
  if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    return { error: "That support address does not look like an email." };
  }

  const defaultLocale = String(formData.get("default_locale") ?? "th").trim();
  if (!["th", "en"].includes(defaultLocale)) {
    return { error: "Pick a valid default language." };
  }

  const defaultCurrency = String(formData.get("default_currency") ?? "THB")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{3}$/.test(defaultCurrency)) {
    return { error: "Currency must be a 3-letter code, e.g. THB." };
  }

  const defaultPaymentMethod = String(
    formData.get("default_payment_method") ?? "promptpay",
  ).trim();
  if (!["promptpay", "card"].includes(defaultPaymentMethod)) {
    return { error: "Pick a valid default payment method." };
  }

  const { error } = await supabase.rpc("ct_admin_save_settings", {
    p_settings: {
      stripe_publishable_key: stripePublishableKey,
      support_email: supportEmail,
      default_locale: defaultLocale,
      default_currency: defaultCurrency,
      default_payment_method: defaultPaymentMethod,
    },
  });

  if (error) {
    console.error("ct_admin_save_settings failed", error);
    return { error: friendly(error.message) };
  }

  refresh();
  revalidatePath("/pricing");
  revalidatePath("/dashboard/apps/new");
  // The default language lives in the root layout, which every route shares.
  revalidatePath("/", "layout");
  return { notice: "Settings saved." };
}

// ---------------------------------------------------------------------------
// Admin accounts
// ---------------------------------------------------------------------------
export async function addAdmin(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const email = text(formData.get("email"));
  if (!email) return { error: "Enter the Google account email." };

  const { error } = await supabase.rpc("ct_admin_add_admin", {
    p_email: email,
    p_note: text(formData.get("note")),
  });

  if (error) {
    console.error("ct_admin_add_admin failed", error);
    return {
      error: error.message.includes("invalid email")
        ? "That does not look like an email address."
        : friendly(error.message),
    };
  }

  refresh();
  return { notice: `${email.toLowerCase()} can now open the admin console.` };
}

export async function removeAdmin(
  _state: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const supabase = await adminClient();

  const { error } = await supabase.rpc("ct_admin_remove_admin", {
    p_email: String(formData.get("email") ?? ""),
  });

  if (error) {
    console.error("ct_admin_remove_admin failed", error);
    return { error: friendly(error.message) };
  }

  refresh();
  return { notice: "Admin removed." };
}
