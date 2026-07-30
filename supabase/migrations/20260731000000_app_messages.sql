-- Customer <-> admin messaging per app
--
-- A simple, refresh-based (no realtime) thread per submission: the owner can
-- report an issue, an admin can reply. Both sides read the same rows through
-- one RLS policy; writes go through a single SECURITY DEFINER function so
-- there's no direct-insert path a client could get wrong (it resolves who's
-- allowed to post and stamps owner_id from the app record itself).

create table if not exists public.ct_app_messages (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.ct_apps (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  sender text not null check (sender in ('owner', 'admin')),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists ct_app_messages_app_idx
  on public.ct_app_messages (app_id, created_at);

alter table public.ct_app_messages enable row level security;
revoke all on public.ct_app_messages from anon, authenticated;
grant select on public.ct_app_messages to authenticated;

drop policy if exists ct_app_messages_select on public.ct_app_messages;
create policy ct_app_messages_select on public.ct_app_messages
  for select to authenticated
  using (owner_id = (select auth.uid()) or public.ct_is_admin());

create or replace function public.ct_send_app_message(p_app_id uuid, p_body text)
returns public.ct_app_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_app public.ct_apps%rowtype;
  v_sender text;
  v_row public.ct_app_messages%rowtype;
begin
  if v_uid is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  select * into v_app from public.ct_apps where id = p_app_id;
  if not found then
    raise exception 'app not found' using errcode = 'P0002';
  end if;

  if v_app.owner_id = v_uid then
    v_sender := 'owner';
  elsif public.ct_is_admin() then
    v_sender := 'admin';
  else
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if length(trim(p_body)) = 0 then
    raise exception 'message required' using errcode = 'P0001';
  end if;

  insert into public.ct_app_messages (app_id, owner_id, sender, body)
  values (p_app_id, v_app.owner_id, v_sender, trim(p_body))
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.ct_send_app_message(uuid, text) to authenticated;
