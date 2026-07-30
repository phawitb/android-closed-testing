-- Per-day admin log
--
-- One row per (app, day): the admin's chosen state for that day (locked /
-- current / completed — the same three states the customer's timeline
-- already computes automatically, just made overridable by hand) plus an
-- optional free-text update the customer sees in their Daily Activity
-- timeline (e.g. "12 testers opened the app today"). Marking the final day
-- completed auto-completes the app and reuses the same completed-email
-- guard as ct_admin_claim_completed_email, so re-saving it never
-- double-sends mail.

create table if not exists public.ct_app_day_logs (
  app_id uuid not null references public.ct_apps (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  day int not null check (day >= 1),
  state text not null default 'locked'
    check (state in ('locked', 'current', 'completed')),
  message text check (message is null or char_length(message) <= 2000),
  updated_at timestamptz not null default now(),
  updated_by text,
  primary key (app_id, day)
);

create index if not exists ct_app_day_logs_app_idx
  on public.ct_app_day_logs (app_id);

alter table public.ct_app_day_logs enable row level security;
revoke all on public.ct_app_day_logs from anon, authenticated;
grant select on public.ct_app_day_logs to authenticated;

drop policy if exists ct_app_day_logs_select on public.ct_app_day_logs;
create policy ct_app_day_logs_select on public.ct_app_day_logs
  for select to authenticated
  using (owner_id = (select auth.uid()) or public.ct_is_admin());

drop function if exists public.ct_admin_set_day_log(uuid, int, boolean, text);

create or replace function public.ct_admin_set_day_log(
  p_app_id uuid,
  p_day int,
  p_state text,
  p_message text
)
returns table (newly_completed boolean, name text, contact_email text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app public.ct_apps%rowtype;
  v_claimed boolean := false;
  v_message text;
begin
  perform public.ct_require_admin();

  if p_state not in ('locked', 'current', 'completed') then
    raise exception 'invalid state' using errcode = '22023';
  end if;

  select * into v_app from public.ct_apps where id = p_app_id;
  if not found then
    raise exception 'app not found' using errcode = 'P0002';
  end if;
  if p_day < 1 or p_day > v_app.total_days then
    raise exception 'day out of range' using errcode = '22003';
  end if;

  v_message := nullif(trim(coalesce(p_message, '')), '');

  insert into public.ct_app_day_logs
    (app_id, owner_id, day, state, message, updated_at, updated_by)
  values
    (p_app_id, v_app.owner_id, p_day, p_state, v_message, now(),
     lower(auth.jwt() ->> 'email'))
  on conflict (app_id, day) do update
     set state = excluded.state,
         message = excluded.message,
         updated_at = now(),
         updated_by = excluded.updated_by;

  if p_state = 'completed' and p_day = v_app.total_days then
    update public.ct_apps
       set status = 'completed',
           completed_email_sent_at = now()
     where id = p_app_id
       and status <> 'completed'
       and completed_email_sent_at is null
    returning true into v_claimed;
  end if;

  return query select coalesce(v_claimed, false), v_app.name, v_app.contact_email;
end;
$$;

revoke all on function public.ct_admin_set_day_log(uuid, int, text, text)
  from anon, authenticated;
grant execute on function public.ct_admin_set_day_log(uuid, int, text, text)
  to authenticated;
