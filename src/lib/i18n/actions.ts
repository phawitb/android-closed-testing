"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  normaliseLocale,
} from "./config";

/** Stores the visitor's language choice for a year. */
export async function setLocale(value: string) {
  const locale = normaliseLocale(value);
  const store = await cookies();

  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return locale;
}
