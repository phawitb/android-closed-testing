# Android Closed Testing — 12 Testers Pro

Web app for submitting an Android app to a 14-day Google Play closed testing
cycle and tracking every day of it. Built to match the mobile app screens in
`app_capture_reference/`, using the Play Console screenshots in `images/` for
the setup guide.

- **Stack** — Next.js 16 (App Router), React 19, Tailwind 4, Supabase, Stripe.
- **Auth** — Google sign-in via Supabase Auth.
- **Data** — `ct_*` tables in this project's own Supabase database.
- **Billing** — Stripe Checkout for buying token packages, plus tokens an
  admin can still issue by hand from `/admin`.
- **Language** — Thai and English, switchable anywhere, Thai by default.

## One-time setup

### 1. Create the Supabase project

New project at [supabase.com/dashboard](https://supabase.com/dashboard). Then
**Settings → API** for `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 2. Enable Google sign-in

**Authentication → Sign In / Providers → Google**. Supabase shows a callback
URL of the form `https://<ref>.supabase.co/auth/v1/callback` — paste that into
an OAuth 2.0 Client ID in
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)
under *Authorised redirect URIs*, then bring the client ID and secret back to
Supabase.

Also under **Authentication → URL Configuration → Redirect URLs**, add:

```
http://localhost:3000/auth/callback
```

Plus your deployed origin when you ship it.

### 3. Apply the SQL migrations

The app cannot read or write anything until these run. Open the SQL editor for
your project and run **every file** in `supabase/migrations`, oldest first:

1. [`20260729120000_closed_testing.sql`](supabase/migrations/20260729120000_closed_testing.sql)
2. [`20260729180000_admin_accounts_and_packages.sql`](supabase/migrations/20260729180000_admin_accounts_and_packages.sql)
3. [`20260730090000_site_settings_and_guided_flow.sql`](supabase/migrations/20260730090000_site_settings_and_guided_flow.sql)
4. [`20260730140000_stripe_orders.sql`](supabase/migrations/20260730140000_stripe_orders.sql)
5. [`20260730160000_paid_app_promo_codes.sql`](supabase/migrations/20260730160000_paid_app_promo_codes.sql)
6. [`20260730180000_thb_single_package.sql`](supabase/migrations/20260730180000_thb_single_package.sql)
7. [`20260730200000_checkout_defaults.sql`](supabase/migrations/20260730200000_checkout_defaults.sql)

Together they create:

| Object | Purpose |
| --- | --- |
| `ct_apps` | One row per submitted app: name, type, store link, contact, status, cycle dates, promo codes |
| `ct_tokens` | Testing tokens — one token activates one app |
| `ct_packages` | What you sell: name, token count, price |
| `ct_admins` | Which Google accounts may open `/admin` |
| `ct_settings` | Editable copy and defaults — buy link, label, note, support email, default language/currency/payment method |
| `ct_orders` | One row per fulfilled Stripe Checkout session |
| `ct_is_admin()` | Membership check used by every admin RPC |
| `ct_validate_token` | Checks a code in the wizard without spending it |
| `ct_create_app_with_token` | Creates the submission and redeems the token in one transaction |
| `ct_fulfil_order` | Mints the tokens a paid Stripe session promised (idempotent per session) |
| `ct_my_tokens` | The signed-in user's own unused tokens, for the redeem page |
| `ct_redeem_token`, `ct_request_form_answers` | Owner actions |
| `ct_admin_*` | Admin console reads and writes |

The second migration seeds `phawit.boo@gmail.com` as the first admin, plus two
starter packages. Change the seeded email at the top of that file before
running it if someone else owns the project.

The third is what the guided submission flow runs on — without it the wizard
cannot check tokens ("Could not check that token" is the symptom), and the buy
link falls back to `/pricing`. The fourth and fifth are needed for Stripe
checkout and the paid-app promo-code prompt respectively.

### 4. Enable Stripe (optional)

Without Stripe keys, the pricing page still works — packages fall back to
whatever link `/admin/settings` points at (by default `/pricing` itself, which
hides the buy button entirely). To take real payments:

1. Get your keys from the
   [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) → `STRIPE_SECRET_KEY`
   and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`.
2. That's enough for the success-page fulfilment path. If you also want a
   webhook safety net for customers who close the tab before the redirect,
   run `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally
   and copy the printed secret into `STRIPE_WEBHOOK_SECRET`.

Checkout only offers **Card and PromptPay**. Apple Pay and Google Pay are
switched off account-wide on the Stripe side (Dashboard → Settings → Payment
methods → the account's default configuration has `apple_pay` and
`google_pay` set to off) — that's an account setting, not something this repo
enforces, so it needs redoing per Stripe account. `adaptive_pricing: { enabled: false }`
on every session (`src/app/pricing/actions.ts`) stops Stripe from also
offering to convert the price into the buyer's local currency, so Checkout
always shows the package's own currency and nothing else.

PromptPay needs a THB session, so it only appears for THB packages — the
seeded package (`Single App`, ฿1,699) is THB for exactly that reason; a
package in another currency falls back to card only. Whichever method
`/admin/settings` has as the **default payment method** is listed first in
the `payment_method_types` array, but Stripe's hosted checkout page reorders
payment methods itself and always opens with Card pre-expanded — there is no
session parameter that overrides that (confirmed against Stripe's own docs).
To make PromptPay the one actually shown expanded by default, reorder payment
methods for the account's configuration in the
[Stripe Dashboard](https://dashboard.stripe.com/settings/payment_methods)
instead. Each purchase is locked to quantity 1 (no `adjustable_quantity` on
the line item), matching one token per checkout.

### 5. Run it

```bash
npm run dev
```

## Environment

Fill in `.env.local`; `.env.example` lists every variable. There are no admin
secrets to configure — admin access lives in the `ct_admins` table. Stripe
keys are optional (see above).

## Routes

| Route | What it does |
| --- | --- |
| `/` | Marketing landing page. No token box and no packages — it explains the Play rule and sends people to sign in |
| `/login` | Google sign-in |
| `/pricing` | Packages, what every plan includes, and Stripe Checkout |
| `/guidesetting` | The Play Console setup guide, public — no sign-in needed |
| `/dashboard` | My Apps — status and day-N-of-14 progress per app |
| `/dashboard/apps/new` | The guided 3-step submission: setup guide → token → app details |
| `/dashboard/apps/[id]` | App Details — progress ring, 14-day timeline, compliance sidebar |
| `/dashboard/apps/[id]/activate` | Enter a token ID for an app submitted before the guided flow |
| `/dashboard/apps/[id]/setup` | Setup Guide using the `images/` screenshots, scoped to one app |
| `/dashboard/redeem` | Start a submission with a token, or activate an older app |
| `/checkout/success`, `/checkout/cancelled` | Stripe's return URLs — success mints and shows the tokens |
| `/api/stripe/webhook` | Optional fulfilment safety net (see step 4 above) |
| `/admin` | Dashboard — stats, what needs attention, running cycles |
| `/admin/apps` | Every submission, with the controls to drive its cycle |
| `/admin/tokens` | Token packages and token issuing |
| `/admin/team` | Which Google accounts have admin access |
| `/admin/settings` | The buy-a-package link, its label and note, and a support email |

## The flow

Selling can happen two ways: through Stripe Checkout on `/pricing`, or
off-platform with an admin issuing a token by hand from `/admin/tokens`.
Either way the customer ends up with a code and redeems it themselves.

1. **Buy** (optional) — `/pricing` starts a Stripe Checkout session for the
   package's exact price. On return, `/checkout/success` calls
   `fulfilCheckoutSession`, which verifies the session is `paid` with Stripe
   directly and then calls `ct_fulfil_order` to mint that package's tokens.
   The function keys off the Stripe session id, so a refreshed success page or
   a retried webhook can never mint the same order twice. Tokens are tied to
   the buyer's account (`ct_my_tokens`) as well as shown once on the page.
2. Sign in with Google.
3. Everything else happens in one wizard at `/dashboard/apps/new`:
   - **Before you begin** — the Play Console setup guide, with a screenshot
     for every step (same content as the public `/guidesetting` page). The
     customer says whether the track is ready or whether they will finish it
     later; that answer becomes `setup_confirmed_at`.
   - **Activate** — paste the token. It is checked with `ct_validate_token`
     without being spent, and the card beside it links to whatever the admin
     set as the buy link in `/admin/settings` (or straight to Stripe once
     that's configured). Buying leaves the site, so the draft is kept in
     `localStorage` and restored on return.
   - **App details** — name, contact, opt-in URL, free/paid. Paid apps are
     told to prepare 14 promo codes; the actual submission happens later (see
     below). Finishing calls `ct_create_app_with_token`, which creates the app
     and redeems the token in one transaction — a failed redemption can never
     leave a half-finished app behind.
4. **Paid apps only** — on the App Details page, the day-1 row of Daily
   Activity reads "Send promo codes…" until the cycle starts. Clicking it
   opens a form for the 14 Play Store codes; submitting sets `promo_codes` and
   `promo_codes_submitted_at` (owner-writable columns, same pattern as
   `setup_confirmed_at`), which the admin console surfaces on the submission
   card.
5. An admin presses **Start cycle today** in `/admin`, which sets day 1.
6. The customer watches the timeline advance. Days are derived from the start
   date in Asia/Bangkok, so no cron job is needed — an admin can still pin a
   specific day with **Pin current day**.

## Language

Every customer-facing screen is translated (`src/lib/i18n/dictionaries.ts`);
the admin console stays English-only since it's an internal tool. The choice
lives in a `ct_locale` cookie (`src/lib/i18n/config.ts`) and is switched
anywhere via the pill toggle in the header — no page reload needed beyond the
`router.refresh()` that redraws server components in the new language. A
visitor with no cookie yet gets whichever language `/admin/settings` has as
the **default language** (`getLocale()` in `src/lib/i18n/server.ts`, Thai if
that setting can't be read). `<RichText>` renders the `**bold**` markers and
`{placeholder}` substitutions used inside dictionary strings.

## Layout

Screens are built for desktop first and scale down: a sticky top bar
(`AppHeader`) instead of back arrows, content in a `Container` up to
`max-w-7xl`, two-column app details, a grid of app cards, and the wizard's
vertical stepper rail. On phones the same pages collapse to one column and the
primary action becomes a bar fixed to the bottom of the viewport.

## Admin console

Sign in with Google like any other user. If your email is in `ct_admins` the
console opens; otherwise you get a "No admin access" page. Admins also see a
shortcut to it in **Settings**.

- **Dashboard** — counts, three "needs attention" buckets (setup confirmed and
  ready to start, cycle ending, form answers requested), and every running
  cycle with its day and progress bar.
- **Submissions** — per app: status, day-1 date, cycle length, pin the current
  day, the form answers the customer sees, an internal note, a one-click
  **Start cycle today**, and (for paid apps) the 14 promo codes once the
  customer has submitted them.
- **Tokens & Packages** — create and edit the packages you sell, then issue
  tokens either from a package (mints its whole token count) or as a custom
  amount. New codes are shown once with a copy button.
- **Admins** — add a teammate by Google account email, before or after they
  have ever signed in. You cannot remove yourself, and one admin must remain.
- **Settings** — two groups, both saved to `ct_settings`:
  - **Defaults** — the language a first-time visitor gets, the currency
    prefilled when creating a new package, and which payment method is
    requested first at checkout (see the PromptPay-ordering caveat above).
  - **Buy a package link** — where "Buy a package" points (a full `https://`
    checkout URL or an internal path such as `/pricing`), the button label,
    the note shown beside it, and an optional support email. Picked up by the
    wizard, the activation screen and the pricing page.

## Security notes

- Owners can only read their own rows. Column-level grants mean they can edit
  their submission fields but **cannot** set `status`, `started_on` or
  `token_id` — only the SECURITY DEFINER functions and the admin console can.
- `ct_tokens` and `ct_admins` are not readable through the API at all; codes
  cannot be enumerated and the admin list cannot be read by non-admins.
- Every `ct_admin_*` RPC calls `ct_require_admin()`, which checks the caller's
  own JWT against `ct_admins`. Hiding the UI is not the control — a non-admin
  calling the RPCs directly gets `admin access required`.
- Redeeming is atomic: `ct_redeem_token` locks both rows, so the same code
  cannot activate two apps.
