export const PLAN = {
  name: "Pro Plan",
  badge: "Testers Pro",
  tagline: "Guaranteed Production Access",
  priceLabel: "€8.49",
  unit: "/per app",
  features: [
    "Production Access Guarantee",
    "12+ Real Testers interact with your app daily for 14 days",
    "12 Real Testers Delivered",
    "Daily Active Engagement",
    "Manual Policy Compliance Check",
    "Form answers shared after testing",
    "Fully Handled by Our Team",
    "Money Back Guarantee",
  ],
} as const;

export const TESTER_GROUP_EMAIL = "12TestersPro@googlegroups.com";
export const TESTER_GROUP_URL = "https://groups.google.com/g/12testerspro";
export const DEFAULT_TOTAL_DAYS = 14;

/** Row shape returned by the `ct_my_tokens` RPC. */
export type MyToken = {
  code: string;
  status: string;
  package_name: string | null;
};

/** A single row from `ct_app_messages` — the per-app owner/admin thread. */
export type AppMessage = {
  id: string;
  app_id: string;
  sender: "owner" | "admin";
  body: string;
  created_at: string;
};

export type AppStatus =
  | "draft"
  | "awaiting_setup"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TestingApp = {
  id: string;
  owner_id: string;
  name: string;
  app_type: "free" | "paid";
  store_url: string;
  contact_email: string;
  status: AppStatus;
  token_id: string | null;
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
  updated_at: string;
};

export const STATUS_LABEL: Record<AppStatus, string> = {
  draft: "DRAFT",
  awaiting_setup: "SETUP REQUIRED",
  in_progress: "IN PROGRESS",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

/** Calendar date in Asia/Bangkok, as YYYY-MM-DD. */
export function today(timeZone = "Asia/Bangkok"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toUTCDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(isoDate: string, days: number): string {
  const date = toUTCDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const ms = toUTCDate(to).getTime() - toUTCDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDay(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(toUTCDate(isoDate));
}

export type DayState = "completed" | "current" | "locked";

export type TimelineDay = {
  day: number;
  date: string | null;
  state: DayState;
  isFinalDay: boolean;
  isFormAnswersDay: boolean;
};

/**
 * The day the cycle is on right now: 0 before it starts, and clamped to
 * totalDays once it has run its course. An admin `day_override` wins over the
 * date maths so a cycle can be paused or nudged by hand.
 */
export function currentDay(app: {
  status: AppStatus;
  started_on: string | null;
  total_days: number;
  day_override: number | null;
}): number {
  if (app.day_override !== null && app.day_override !== undefined) {
    return Math.max(0, Math.min(app.day_override, app.total_days));
  }
  if (app.status === "completed") return app.total_days;
  if (app.status !== "in_progress" || !app.started_on) return 0;

  const elapsed = daysBetween(app.started_on, today()) + 1;
  return Math.max(0, Math.min(elapsed, app.total_days));
}

export function buildTimeline(app: {
  status: AppStatus;
  started_on: string | null;
  total_days: number;
  day_override: number | null;
}): TimelineDay[] {
  const active = currentDay(app);
  const total = app.total_days;

  return Array.from({ length: total }, (_, index) => {
    const day = index + 1;
    return {
      day,
      date: app.started_on ? addDays(app.started_on, index) : null,
      state: day < active ? "completed" : day === active ? "current" : "locked",
      isFinalDay: day === total,
      isFormAnswersDay: day === total - 1,
    };
  });
}

export function progressPercent(app: {
  status: AppStatus;
  started_on: string | null;
  total_days: number;
  day_override: number | null;
}): number {
  return Math.round((currentDay(app) / app.total_days) * 100);
}

/** A submission is only complete once every wizard field has been filled in. */
export function isSubmissionComplete(app: {
  name: string;
  store_url: string;
  contact_email: string;
}): boolean {
  return Boolean(
    app.name.trim() && app.store_url.trim() && app.contact_email.trim(),
  );
}

export function normaliseStoreUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normaliseTokenCode(value: string): string {
  return value.trim().toUpperCase();
}
