import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. Only for work the user must not be able to do
 * themselves — right now that is fulfilling a paid Stripe order, which mints
 * tokens. Never import this from a client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to fulfil paid orders",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
