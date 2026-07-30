-- Idempotency guard for the "testing complete" email
--
-- The admin can save an already-completed submission again (e.g. editing the
-- internal note), so a plain "status = completed" check in application code
-- would resend the email on every save. This atomically "claims" the send:
-- it only flips completed_email_sent_at from null once, so only the first
-- caller to see it null gets true back.

alter table public.ct_apps
  add column if not exists completed_email_sent_at timestamptz;

-- Returns the app's name/contact email too, so the caller doesn't need a
-- second round trip just to know who to email.
create or replace function public.ct_admin_claim_completed_email(p_app_id uuid)
returns table (claimed boolean, name text, contact_email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_app public.ct_apps%rowtype;
begin
  perform public.ct_require_admin();

  update public.ct_apps
     set completed_email_sent_at = now()
   where id = p_app_id
     and status = 'completed'
     and completed_email_sent_at is null
  returning * into v_app;

  get diagnostics v_count = row_count;

  if v_count = 0 then
    select * into v_app from public.ct_apps where id = p_app_id;
  end if;

  return query select (v_count > 0), v_app.name, v_app.contact_email;
end;
$$;

grant execute on function public.ct_admin_claim_completed_email(uuid) to authenticated;
