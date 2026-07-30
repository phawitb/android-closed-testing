-- Paid-app promo codes
--
-- Paid apps need 14 Play Store promo codes before testing can start. Rather
-- than asking the customer to email support, they paste them straight into
-- the app from the Daily Activity timeline (day 1, before the cycle starts).
-- Column-level grants mirror setup_confirmed_at: the owner can write these
-- two columns directly, everything else about the row stays protected by the
-- existing RLS policy.

alter table public.ct_apps
  add column if not exists promo_codes text,
  add column if not exists promo_codes_submitted_at timestamptz;

grant update (promo_codes, promo_codes_submitted_at)
  on public.ct_apps to authenticated;

-- Admin console needs to see what was submitted. The return shape changed
-- (two new columns), so the old function must be dropped first.
drop function if exists public.ct_admin_apps();

create or replace function public.ct_admin_apps()
returns table (
  id uuid,
  name text,
  app_type text,
  store_url text,
  contact_email text,
  status text,
  owner_email text,
  token_code text,
  setup_confirmed_at timestamptz,
  started_on date,
  total_days int,
  day_override int,
  form_answers text,
  form_answers_requested_at timestamptz,
  form_answers_sent_at timestamptz,
  admin_note text,
  promo_codes text,
  promo_codes_submitted_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  return query
    select a.id, a.name, a.app_type, a.store_url, a.contact_email, a.status,
           u.email::text, t.code, a.setup_confirmed_at, a.started_on,
           a.total_days, a.day_override, a.form_answers,
           a.form_answers_requested_at, a.form_answers_sent_at, a.admin_note,
           a.promo_codes, a.promo_codes_submitted_at,
           a.created_at
      from public.ct_apps a
      left join auth.users u on u.id = a.owner_id
      left join public.ct_tokens t on t.id = a.token_id
     order by a.created_at desc;
end;
$$;

grant execute on function public.ct_admin_apps() to authenticated;
