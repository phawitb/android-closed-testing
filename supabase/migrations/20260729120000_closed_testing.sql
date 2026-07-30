-- Android Closed Testing — schema
--
-- Everything is namespaced with a ct_ prefix and builds on Supabase's own
-- auth.users table.

-- ---------------------------------------------------------------------------
-- Server secrets
-- ---------------------------------------------------------------------------
-- RLS is enabled with no policies, so anon/authenticated can never read this
-- table. Only the SECURITY DEFINER functions below (which bypass RLS) can.
create table if not exists public.ct_secrets (
  name text primary key,
  value text not null
);

alter table public.ct_secrets enable row level security;
revoke all on public.ct_secrets from anon, authenticated;

insert into public.ct_secrets (name, value) values
  ('admin', 'Botan2711oo')
on conflict (name) do nothing;

create or replace function public.ct_check_secret(p_name text, p_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected text;
begin
  select value into v_expected from public.ct_secrets where name = p_name;
  if v_expected is null or p_secret is null or p_secret <> v_expected then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.ct_check_secret(text, text) from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Tokens
-- ---------------------------------------------------------------------------
create table if not exists public.ct_tokens (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  plan text not null default 'pro',
  status text not null default 'unused' check (status in ('unused', 'used', 'void')),
  issued_to_email text,
  redeemed_by uuid references auth.users (id) on delete set null,
  redeemed_app_id uuid,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Apps
-- ---------------------------------------------------------------------------
create table if not exists public.ct_apps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  app_type text not null default 'free' check (app_type in ('free', 'paid')),
  store_url text not null default '',
  contact_email text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'awaiting_setup', 'in_progress', 'completed', 'cancelled')),
  token_id uuid references public.ct_tokens (id) on delete set null,
  setup_confirmed_at timestamptz,
  started_on date,
  total_days int not null default 14 check (total_days between 1 and 60),
  day_override int check (day_override is null or day_override >= 0),
  form_answers text,
  form_answers_requested_at timestamptz,
  form_answers_sent_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ct_tokens
  drop constraint if exists ct_tokens_redeemed_app_id_fkey;
alter table public.ct_tokens
  add constraint ct_tokens_redeemed_app_id_fkey
  foreign key (redeemed_app_id) references public.ct_apps (id) on delete set null;

create index if not exists ct_apps_owner_idx on public.ct_apps (owner_id, created_at desc);
create index if not exists ct_tokens_status_idx on public.ct_tokens (status, created_at desc);

create or replace function public.ct_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ct_apps_touch on public.ct_apps;
create trigger ct_apps_touch
  before update on public.ct_apps
  for each row execute function public.ct_touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.ct_apps enable row level security;
alter table public.ct_tokens enable row level security;

-- Tokens are never readable or writable directly — only through the
-- SECURITY DEFINER functions below.
revoke all on public.ct_tokens from anon, authenticated;

-- Owners may read and delete their own apps, and insert new ones. Updates are
-- limited to the submission fields via column privileges, so an owner cannot
-- promote their own app to `in_progress` or backdate `started_on`.
revoke all on public.ct_apps from anon, authenticated;
grant select, insert, delete on public.ct_apps to authenticated;
grant update (name, app_type, store_url, contact_email, setup_confirmed_at)
  on public.ct_apps to authenticated;

drop policy if exists ct_apps_select_own on public.ct_apps;
create policy ct_apps_select_own on public.ct_apps
  for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists ct_apps_insert_own on public.ct_apps;
create policy ct_apps_insert_own on public.ct_apps
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'draft');

drop policy if exists ct_apps_update_own on public.ct_apps;
create policy ct_apps_update_own on public.ct_apps
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Only drafts can be deleted by their owner; anything paid for stays on record.
drop policy if exists ct_apps_delete_own_draft on public.ct_apps;
create policy ct_apps_delete_own_draft on public.ct_apps
  for delete to authenticated
  using (owner_id = (select auth.uid()) and status = 'draft' and token_id is null);

-- ---------------------------------------------------------------------------
-- Token codes
-- ---------------------------------------------------------------------------
create or replace function public.ct_generate_code()
returns text
language plpgsql
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_out text := '';
  i int;
begin
  for i in 1..8 loop
    v_out := v_out || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
  end loop;
  return '12TP-' || substr(v_out, 1, 4) || '-' || substr(v_out, 5, 4);
end;
$$;

-- ---------------------------------------------------------------------------
-- Redeem a token against one of your own apps
-- ---------------------------------------------------------------------------
create or replace function public.ct_redeem_token(p_code text, p_app_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_token public.ct_tokens%rowtype;
  v_app public.ct_apps%rowtype;
begin
  if v_uid is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  select * into v_app from public.ct_apps
   where id = p_app_id and owner_id = v_uid
   for update;

  if not found then
    raise exception 'app not found' using errcode = 'P0002';
  end if;

  if v_app.token_id is not null then
    raise exception 'app already activated' using errcode = 'P0001';
  end if;

  select * into v_token from public.ct_tokens
   where upper(trim(code)) = upper(trim(p_code))
   for update;

  if not found then
    raise exception 'invalid token' using errcode = 'P0002';
  end if;

  if v_token.status <> 'unused' then
    raise exception 'token already used' using errcode = 'P0001';
  end if;

  update public.ct_tokens
     set status = 'used',
         redeemed_by = v_uid,
         redeemed_app_id = v_app.id,
         redeemed_at = now()
   where id = v_token.id;

  update public.ct_apps
     set token_id = v_token.id,
         status = 'awaiting_setup'
   where id = v_app.id
   returning * into v_app;

  return json_build_object('id', v_app.id, 'status', v_app.status);
end;
$$;

grant execute on function public.ct_redeem_token(text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin console
-- ---------------------------------------------------------------------------
create or replace function public.ct_admin_apps(p_secret text)
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
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_check_secret('admin', p_secret);

  return query
    select a.id, a.name, a.app_type, a.store_url, a.contact_email, a.status,
           u.email::text, t.code, a.setup_confirmed_at, a.started_on,
           a.total_days, a.day_override, a.form_answers,
           a.form_answers_requested_at, a.form_answers_sent_at, a.admin_note,
           a.created_at
      from public.ct_apps a
      left join auth.users u on u.id = a.owner_id
      left join public.ct_tokens t on t.id = a.token_id
     order by a.created_at desc;
end;
$$;

grant execute on function public.ct_admin_apps(text) to anon, authenticated;

create or replace function public.ct_admin_update_app(
  p_secret text,
  p_app_id uuid,
  p_status text default null,
  p_started_on date default null,
  p_clear_started_on boolean default false,
  p_day_override int default null,
  p_clear_day_override boolean default false,
  p_total_days int default null,
  p_admin_note text default null,
  p_form_answers text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_check_secret('admin', p_secret);

  update public.ct_apps
     set status = coalesce(p_status, status),
         started_on = case
           when p_clear_started_on then null
           else coalesce(p_started_on, started_on)
         end,
         day_override = case
           when p_clear_day_override then null
           else coalesce(p_day_override, day_override)
         end,
         total_days = coalesce(p_total_days, total_days),
         admin_note = coalesce(p_admin_note, admin_note),
         form_answers = coalesce(p_form_answers, form_answers),
         form_answers_sent_at = case
           when p_form_answers is not null then now()
           else form_answers_sent_at
         end
   where id = p_app_id;

  if not found then
    raise exception 'app not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.ct_admin_update_app(
  text, uuid, text, date, boolean, int, boolean, int, text, text
) to anon, authenticated;

create or replace function public.ct_admin_tokens(p_secret text)
returns table (
  id uuid,
  code text,
  plan text,
  status text,
  issued_to_email text,
  redeemed_app_name text,
  redeemed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_check_secret('admin', p_secret);

  return query
    select t.id, t.code, t.plan, t.status, t.issued_to_email,
           a.name, t.redeemed_at, t.created_at
      from public.ct_tokens t
      left join public.ct_apps a on a.id = t.redeemed_app_id
     order by t.created_at desc
     limit 500;
end;
$$;

grant execute on function public.ct_admin_tokens(text) to anon, authenticated;

create or replace function public.ct_admin_create_tokens(
  p_secret text,
  p_count int default 1,
  p_plan text default 'pro',
  p_email text default null
)
returns setof text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  i int;
begin
  perform public.ct_check_secret('admin', p_secret);

  if p_count is null or p_count < 1 or p_count > 100 then
    raise exception 'count must be between 1 and 100' using errcode = '22023';
  end if;

  for i in 1..p_count loop
    loop
      v_code := public.ct_generate_code();
      exit when not exists (select 1 from public.ct_tokens where code = v_code);
    end loop;

    insert into public.ct_tokens (code, plan, issued_to_email)
    values (v_code, coalesce(p_plan, 'pro'), p_email);

    return next v_code;
  end loop;
end;
$$;

grant execute on function public.ct_admin_create_tokens(text, int, text, text)
  to anon, authenticated;

create or replace function public.ct_admin_void_token(p_secret text, p_token_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_check_secret('admin', p_secret);

  update public.ct_tokens
     set status = 'void'
   where id = p_token_id and status = 'unused';

  if not found then
    raise exception 'token not found or already used' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.ct_admin_void_token(text, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Owner action: ask for the form answers near the end of the cycle
-- ---------------------------------------------------------------------------
create or replace function public.ct_request_form_answers(p_app_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  update public.ct_apps
     set form_answers_requested_at = now()
   where id = p_app_id and owner_id = v_uid;

  if not found then
    raise exception 'app not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.ct_request_form_answers(uuid) to authenticated;
