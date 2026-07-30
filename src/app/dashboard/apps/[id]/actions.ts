"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import {
  sendAdminOwnerMessageEmail,
  sendAdminSetupReadyEmail,
} from "@/lib/email";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function confirmSetup(appId: string): Promise<ActionResult> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: t.tokenErrors.signIn };

  const { data, error } = await supabase
    .from("ct_apps")
    .update({ setup_confirmed_at: new Date().toISOString() })
    .eq("id", appId)
    .eq("owner_id", user.id)
    .select("name")
    .single();

  if (error) {
    console.error("confirmSetup failed", error);
    return { ok: false, error: t.formErrors.save };
  }

  await sendAdminSetupReadyEmail(data.name);

  revalidatePath(`/dashboard/apps/${appId}`);
  revalidatePath(`/dashboard/apps/${appId}/setup`);
  return { ok: true };
}

export async function redeemToken(
  appId: string,
  code: string,
): Promise<ActionResult> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: t.tokenErrors.signIn };

  const { error } = await supabase.rpc("ct_redeem_token", {
    p_code: code.trim().toUpperCase(),
    p_app_id: appId,
  });

  if (error) {
    const message = error.message ?? "";
    if (message.includes("invalid token")) {
      return { ok: false, error: t.tokenErrors.invalid };
    }
    if (message.includes("already used")) {
      return { ok: false, error: t.tokenErrors.used };
    }
    if (message.includes("already activated")) {
      return { ok: false, error: t.formErrors.save };
    }
    console.error("redeemToken failed", error);
    return { ok: false, error: t.formErrors.save };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/apps/${appId}`);
  return { ok: true };
}

/** Paid-app owner action: send the 14 Play Store promo codes before day 1. */
export async function submitPromoCodes(
  appId: string,
  codes: string,
): Promise<ActionResult> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: t.tokenErrors.signIn };

  const trimmed = codes.trim();
  if (!trimmed) return { ok: false, error: t.appDetails.promo.required };

  const { error } = await supabase
    .from("ct_apps")
    .update({
      promo_codes: trimmed,
      promo_codes_submitted_at: new Date().toISOString(),
    })
    .eq("id", appId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("submitPromoCodes failed", error);
    return { ok: false, error: t.formErrors.save };
  }

  revalidatePath(`/dashboard/apps/${appId}`);
  return { ok: true };
}

/** Owner action: report an issue or reply, shown to admin on the same thread. */
export async function reportIssue(
  appId: string,
  body: string,
): Promise<ActionResult> {
  const { t } = await getT();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: t.tokenErrors.signIn };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: t.messages.required };

  const { error } = await supabase.rpc("ct_send_app_message", {
    p_app_id: appId,
    p_body: trimmed,
  });

  if (error) {
    console.error("reportIssue failed", error);
    return { ok: false, error: t.formErrors.save };
  }

  const { data: appRow } = await supabase
    .from("ct_apps")
    .select("name")
    .eq("id", appId)
    .single();
  if (appRow) {
    await sendAdminOwnerMessageEmail(appRow.name, trimmed);
  }

  revalidatePath(`/dashboard/apps/${appId}`);
  return { ok: true };
}
