import { createClient } from "@/lib/supabase/server";
import { settingsFromRows, type SiteSettings } from "./settings";

/** Reads ct_settings. Falls back to the defaults if the table is missing. */
export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("ct_settings").select("key, value");
  return settingsFromRows(data as Array<{ key: string; value: string }> | null);
}
