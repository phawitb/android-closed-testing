export const LOCALES = ["th", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Thai is the default — most customers here read Thai first. */
export const DEFAULT_LOCALE: Locale = "th";

export const LOCALE_COOKIE = "ct_locale";
/** A year: the choice should outlive the session. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_LABEL: Record<Locale, string> = {
  th: "ไทย",
  en: "Eng",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function normaliseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
