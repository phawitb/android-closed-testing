import type { AppStatus } from "@/lib/testing";

export type AdminApp = {
  id: string;
  name: string;
  app_type: "free" | "paid";
  store_url: string;
  contact_email: string;
  status: AppStatus;
  owner_email: string | null;
  token_code: string | null;
  setup_confirmed_at: string | null;
  started_on: string | null;
  total_days: number;
  day_override: number | null;
  form_answers: string | null;
  form_answers_requested_at: string | null;
  form_answers_sent_at: string | null;
  admin_note: string | null;
  promo_codes: string | null;
  promo_codes_submitted_at: string | null;
  created_at: string;
};

export type AdminToken = {
  id: string;
  code: string;
  plan: string;
  status: "unused" | "used" | "void";
  issued_to_email: string | null;
  package_name: string | null;
  redeemed_app_name: string | null;
  redeemed_at: string | null;
  created_at: string;
};

export type AdminPackage = {
  id: string;
  name: string;
  description: string | null;
  token_count: number;
  price_cents: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  issued_count: number;
  created_at: string;
};

export type AdminAccount = {
  email: string;
  note: string | null;
  added_by: string | null;
  created_at: string;
  has_signed_in: boolean;
};

export function formatPrice(cents: number, currency: string) {
  // "en-IE" picks the ISO code + Western grouping most currencies expect;
  // THB reads oddly that way ("THB 1,699.00"), so it gets the locale whose
  // Intl data actually renders the ฿ symbol.
  const locale = currency.toUpperCase() === "THB" ? "th-TH" : "en-IE";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}
