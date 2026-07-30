-- Admin-configurable defaults: language, currency, payment method
--
-- Lets an admin pick what a first-time visitor sees before they've made any
-- choice of their own: which language the site opens in, which currency new
-- packages are priced in by default, and which payment method Checkout is
-- asked to prioritise. ct_admin_save_settings's key allowlist grows to match.

insert into public.ct_settings (key, value) values
  ('default_locale', 'th'),
  ('default_currency', 'THB'),
  ('default_payment_method', 'promptpay')
on conflict (key) do nothing;

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
     'buy_url', 'buy_label', 'buy_note', 'support_email',
     'default_locale', 'default_currency', 'default_payment_method'
   )
  on conflict (key) do update
     set value = excluded.value,
         updated_by = excluded.updated_by,
         updated_at = now();
end;
$$;

grant execute on function public.ct_admin_save_settings(jsonb) to authenticated;
