-- Admin "reset to a fresh app" button.
--
-- Wipes every customer-generated row (submissions, their message threads,
-- tokens, and Stripe order records) while leaving the admin's own setup
-- untouched: admin accounts, packages, and site settings all survive.

create or replace function public.ct_admin_clear_all_data()
returns table (apps_deleted bigint, tokens_deleted bigint, orders_deleted bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_apps bigint;
  v_tokens bigint;
  v_orders bigint;
begin
  perform public.ct_require_admin();

  -- Cascades from ct_apps would take these too, but deleting explicitly
  -- keeps the order obvious and doesn't depend on that cascade staying put.
  -- Every statement carries "where true" only because this project's
  -- Postgres has a no-WHERE-clause guard on DELETE — it's not a real filter.
  delete from public.ct_app_messages where true;

  with deleted as (delete from public.ct_apps where true returning 1)
  select count(*) into v_apps from deleted;

  with deleted as (delete from public.ct_tokens where true returning 1)
  select count(*) into v_tokens from deleted;

  with deleted as (delete from public.ct_orders where true returning 1)
  select count(*) into v_orders from deleted;

  return query select v_apps, v_tokens, v_orders;
end;
$$;

revoke all on function public.ct_admin_clear_all_data() from anon, authenticated;
grant execute on function public.ct_admin_clear_all_data() to authenticated;
