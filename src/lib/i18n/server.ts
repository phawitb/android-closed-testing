import { cookies } from "next/headers";
import { getSettings } from "@/lib/settings.server";
import { isLocale, LOCALE_COOKIE, normaliseLocale, type Locale } from "./config";
import { getDictionary, type Dict } from "./dictionaries";

/**
 * The locale for this request: the visitor's own cookie choice if they've
 * ever switched, otherwise whatever an admin set as the site default in
 * /admin/settings (falling back to Thai if that can't be read).
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieValue = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieValue)) return cookieValue;

  const settings = await getSettings();
  return normaliseLocale(settings.defaultLocale);
}

export async function getT(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
