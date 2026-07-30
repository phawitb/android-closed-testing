-- Drop the "buy a package link" fallback, add Stripe Publishable Key
--
-- buy_url/buy_label/buy_note only ever mattered as a fallback shown when
-- Stripe wasn't configured (see pricing/page.tsx) -- when Stripe is on,
-- checkout already goes straight through Stripe Checkout Sessions and never
-- reads these fields. Removing the external-link concept and letting the
-- admin manage the (non-secret) Publishable Key from the web UI gives them a
-- real on/off switch for checkout without ever touching the Secret Key,
-- which stays server-only in .env.local as Stripe recommends.

create or replace function public.ct_admin_save_settings(p_settings jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  insert into public.ct_settings (key, value, updated_by, updated_at)
  select entry.key,
         coalesce(entry.value, ''),
         lower(auth.jwt() ->> 'email'),
         now()
    from jsonb_each_text(p_settings) as entry(key, value)
   where entry.key in (
     'stripe_publishable_key', 'support_email',
     'default_locale', 'default_currency', 'default_payment_method'
   )
  on conflict (key) do update
     set value = excluded.value,
         updated_by = excluded.updated_by,
         updated_at = now();
end;
$$;

grant execute on function public.ct_admin_save_settings(jsonb) to authenticated;
