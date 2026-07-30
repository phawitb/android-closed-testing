"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/server";
import { isEmail, normaliseStoreUrl, normaliseTokenCode } from "@/lib/testing";
import { sendAppSubmittedEmail } from "@/lib/email";

export type TokenCheck = { ok: true } | { ok: false; error: string };

/** PostgREST reports a missing function as PGRST202 — worth saying out loud. */
function isMissingFunction(error: { code?: string; message?: string }) {
  return (
    error.code === "PGRST202" ||
    (error.message ?? "").includes("Could not find the function")
  );
}

/** Step 1: tell the customer whether their code works, without spending it. */
export async function checkToken(code: string): Promise<TokenCheck> {
  const { t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: t.tokenErrors.signIn };

  const value = normaliseTokenCode(code);
  if (value.length < 6) {
    return { ok: false, error: t.tokenErrors.tooShort };
  }

  const { data, error } = await supabase.rpc("ct_validate_token", {
    p_code: value,
  });

  if (error) {
    console.error("ct_validate_token failed", error);
    return {
      ok: false,
      error: isMissingFunction(error)
        ? t.tokenErrors.missingSetup
        : t.tokenErrors.generic,
    };
  }

  const result = data as { ok: boolean; reason: string } | null;
  if (result?.ok) return { ok: true };

  const reason = result?.reason ?? "invalid";
  const message =
    reason === "used"
      ? t.tokenErrors.used
      : reason === "void"
        ? t.tokenErrors.void
        : t.tokenErrors.invalid;

  return { ok: false, error: message };
}

export type CreateAppResult =
  | { ok: true; id: string }
  | { ok: false; error: string; step?: 1 | 3 };

/**
 * Step 3: create the submission and spend the token in one transaction, so a
 * failed redemption can never leave a half-finished app behind.
 */
export async function createApp(input: {
  code: string;
  name: string;
  appType: "free" | "paid";
  storeUrl: string;
  contactEmail: string;
  setupConfirmed: boolean;
  promoCodes?: string;
}): Promise<CreateAppResult> {
  const { t } = await getT();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: t.tokenErrors.signIn };

  const code = normaliseTokenCode(input.code);
  if (code.length < 6) {
    return { ok: false, error: t.formErrors.tokenFirst, step: 1 };
  }

  const name = input.name.trim();
  if (!name || name.length > 120) {
    return { ok: false, error: t.formErrors.name };
  }

  if (input.appType !== "free" && input.appType !== "paid") {
    return { ok: false, error: t.formErrors.type };
  }

  const storeUrl = normaliseStoreUrl(input.storeUrl);
  if (!storeUrl) {
    return { ok: false, error: t.formErrors.url };
  }

  const contactEmail = input.contactEmail.trim().toLowerCase();
  if (!isEmail(contactEmail)) {
    return { ok: false, error: t.formErrors.email };
  }

  const { data, error } = await supabase.rpc("ct_create_app_with_token", {
    p_code: code,
    p_name: name,
    p_app_type: input.appType,
    p_store_url: storeUrl,
    p_contact_email: contactEmail,
    p_setup_confirmed: input.setupConfirmed,
  });

  if (error) {
    console.error("ct_create_app_with_token failed", error);

    if (isMissingFunction(error)) {
      return { ok: false, error: t.tokenErrors.missingSetup, step: 1 };
    }
    if (error.message.includes("invalid token")) {
      return { ok: false, error: t.tokenErrors.invalid, step: 1 };
    }
    if (error.message.includes("token already used")) {
      return { ok: false, error: t.tokenErrors.used, step: 1 };
    }

    return { ok: false, error: t.formErrors.save };
  }

  const result = data as { id: string } | null;
  if (!result?.id) {
    return { ok: false, error: t.formErrors.save };
  }

  const promoCodes = input.promoCodes?.trim();
  if (input.appType === "paid" && promoCodes) {
    const { error: promoError } = await supabase
      .from("ct_apps")
      .update({
        promo_codes: promoCodes,
        promo_codes_submitted_at: new Date().toISOString(),
      })
      .eq("id", result.id)
      .eq("owner_id", user.id);

    if (promoError) {
      // The app itself was created successfully — don't fail the whole
      // submission over this. The owner can still send codes later from
      // the app's Daily Activity page.
      console.error("promo codes at creation failed", promoError);
    }
  }

  await sendAppSubmittedEmail(contactEmail, { appName: name });

  revalidatePath("/dashboard");
  return { ok: true, id: result.id };
}
