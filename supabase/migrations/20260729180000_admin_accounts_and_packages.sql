-- Admin accounts + token packages
--
-- Replaces the shared admin password with real Google accounts. An admin is
-- any signed-in user whose email is listed in ct_admins, so every admin RPC
-- now authorises off auth.jwt() instead of a secret passed from the server.

-- ---------------------------------------------------------------------------
-- Admin accounts
-- ---------------------------------------------------------------------------
create table if not exists public.ct_admins (
  email text primary key,
  note text,
  added_by text,
  created_at timestamptz not null default now()
);

alter table public.ct_admins enable row level security;
revoke all on public.ct_admins from anon, authenticated;

insert into public.ct_admins (email, note)
values ('phawit.boo@gmail.com', 'Owner')
on conflict (email) do nothing;

/**
 * True when the caller is signed in with an email listed in ct_admins.
 * SECURITY DEFINER so it can read ct_admins, which nobody else can.
 */
create or replace function public.ct_is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.ct_admins
     where email = lower(nullif(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.ct_is_admin() to authenticated;

create or replace function public.ct_require_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.ct_is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Token packages
-- ---------------------------------------------------------------------------
create table if not exists public.ct_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text,
  token_count int not null default 1 check (token_count between 1 and 100),
  price_cents int not null default 0 check (price_cents >= 0),
  currency text not null default 'EUR' check (char_length(currency) = 3),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ct_packages enable row level security;
revoke all on public.ct_packages from anon, authenticated;
grant select on public.ct_packages to anon, authenticated;

-- Anyone may read the packages that are on sale; only admins write, and they
-- do that through the RPCs below.
drop policy if exists ct_packages_read_active on public.ct_packages;
create policy ct_packages_read_active on public.ct_packages
  for select to anon, authenticated
  using (is_active or public.ct_is_admin());

insert into public.ct_packages (name, description, token_count, price_cents, currency, sort_order)
select 'Single App', 'One testing token for one app.', 1, 849, 'EUR', 1
where not exists (select 1 from public.ct_packages);

insert into public.ct_packages (name, description, token_count, price_cents, currency, sort_order)
select 'Studio Pack', 'Five tokens for five apps.', 5, 3745, 'EUR', 2
where not exists (select 1 from public.ct_packages where name = 'Studio Pack');

-- Tokens remember which package they were issued from.
alter table public.ct_tokens
  add column if not exists package_id uuid references public.ct_packages (id) on delete set null;

-- ---------------------------------------------------------------------------
-- Replace the password-guarded admin functions
-- ---------------------------------------------------------------------------
drop function if exists public.ct_admin_apps(text);
drop function if exists public.ct_admin_update_app(text, uuid, text, date, boolean, int, boolean, int, text, text);
drop function if exists public.ct_admin_tokens(text);
drop function if exists public.ct_admin_create_tokens(text, int, text, text);
drop function if exists public.ct_admin_void_token(text, uuid);
drop function if exists public.ct_check_secret(text, text);
drop table if exists public.ct_secrets;

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
           a.created_at
      from public.ct_apps a
      left join auth.users u on u.id = a.owner_id
      left join public.ct_tokens t on t.id = a.token_id
     order by a.created_at desc;
end;
$$;

grant execute on function public.ct_admin_apps() to authenticated;

create or replace function public.ct_admin_update_app(
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
  perform public.ct_require_admin();

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
  uuid, text, date, boolean, int, boolean, int, text, text
) to authenticated;

create or replace function public.ct_admin_tokens()
returns table (
  id uuid,
  code text,
  plan text,
  status text,
  issued_to_email text,
  package_name text,
  redeemed_app_name text,
  redeemed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  return query
    select t.id, t.code, t.plan, t.status, t.issued_to_email, p.name,
           a.name, t.redeemed_at, t.created_at
      from public.ct_tokens t
      left join public.ct_apps a on a.id = t.redeemed_app_id
      left join public.ct_packages p on p.id = t.package_id
     order by t.created_at desc
     limit 500;
end;
$$;

grant execute on function public.ct_admin_tokens() to authenticated;

create or replace function public.ct_admin_create_tokens(
  p_count int default 1,
  p_email text default null,
  p_package_id uuid default null
)
returns setof text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_count int := p_count;
  i int;
begin
  perform public.ct_require_admin();

  -- Issuing from a package mints exactly that package's token count.
  if p_package_id is not null then
    select token_count into v_count
      from public.ct_packages where id = p_package_id;
    if v_count is null then
      raise exception 'package not found' using errcode = 'P0002';
    end if;
  end if;

  if v_count is null or v_count < 1 or v_count > 100 then
    raise exception 'count must be between 1 and 100' using errcode = '22023';
  end if;

  for i in 1..v_count loop
    loop
      v_code := public.ct_generate_code();
      exit when not exists (select 1 from public.ct_tokens where code = v_code);
    end loop;

    insert into public.ct_tokens (code, issued_to_email, package_id)
    values (v_code, p_email, p_package_id);

    return next v_code;
  end loop;
end;
$$;

grant execute on function public.ct_admin_create_tokens(int, text, uuid) to authenticated;

create or replace function public.ct_admin_void_token(p_token_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  update public.ct_tokens set status = 'void'
   where id = p_token_id and status = 'unused';

  if not found then
    raise exception 'token not found or already used' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.ct_admin_void_token(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Packages: admin CRUD
-- ---------------------------------------------------------------------------
create or replace function public.ct_admin_packages()
returns table (
  id uuid,
  name text,
  description text,
  token_count int,
  price_cents int,
  currency text,
  is_active boolean,
  sort_order int,
  issued_count bigint,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  return query
    select p.id, p.name, p.description, p.token_count, p.price_cents,
           p.currency, p.is_active, p.sort_order,
           (select count(*) from public.ct_tokens t where t.package_id = p.id),
           p.created_at
      from public.ct_packages p
     order by p.sort_order, p.created_at;
end;
$$;

grant execute on function public.ct_admin_packages() to authenticated;

create or replace function public.ct_admin_save_package(
  p_id uuid default null,
  p_name text default null,
  p_description text default null,
  p_token_count int default 1,
  p_price_cents int default 0,
  p_currency text default 'EUR',
  p_is_active boolean default true,
  p_sort_order int default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  perform public.ct_require_admin();

  if p_name is null or trim(p_name) = '' then
    raise exception 'name is required' using errcode = '22023';
  end if;

  if p_id is null then
    insert into public.ct_packages
      (name, description, token_count, price_cents, currency, is_active, sort_order)
    values
      (trim(p_name), nullif(trim(coalesce(p_description, '')), ''), p_token_count,
       p_price_cents, upper(p_currency), p_is_active, p_sort_order)
    returning id into v_id;
  else
    update public.ct_packages
       set name = trim(p_name),
           description = nullif(trim(coalesce(p_description, '')), ''),
           token_count = p_token_count,
           price_cents = p_price_cents,
           currency = upper(p_currency),
           is_active = p_is_active,
           sort_order = p_sort_order
     where id = p_id
     returning id into v_id;

    if v_id is null then
      raise exception 'package not found' using errcode = 'P0002';
    end if;
  end if;

  return v_id;
end;
$$;

grant execute on function public.ct_admin_save_package(
  uuid, text, text, int, int, text, boolean, int
) to authenticated;

create or replace function public.ct_admin_delete_package(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  delete from public.ct_packages where id = p_id;

  if not found then
    raise exception 'package not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.ct_admin_delete_package(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Admin accounts: list / add / remove
-- ---------------------------------------------------------------------------
create or replace function public.ct_admin_list_admins()
returns table (
  email text,
  note text,
  added_by text,
  created_at timestamptz,
  has_signed_in boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ct_require_admin();

  return query
    select a.email, a.note, a.added_by, a.created_at,
           exists (select 1 from auth.users u where lower(u.email) = a.email)
      from public.ct_admins a
     order by a.created_at;
end;
$$;

grant execute on function public.ct_admin_list_admins() to authenticated;

create or replace function public.ct_admin_add_admin(
  p_email text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  perform public.ct_require_admin();

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid email' using errcode = '22023';
  end if;

  insert into public.ct_admins (email, note, added_by)
  values (v_email, nullif(trim(coalesce(p_note, '')), ''),
          lower(auth.jwt() ->> 'email'))
  on conflict (email) do nothing;
end;
$$;

grant execute on function public.ct_admin_add_admin(text, text) to authenticated;

create or replace function public.ct_admin_remove_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_remaining int;
begin
  perform public.ct_require_admin();

  if v_email = lower(auth.jwt() ->> 'email') then
    raise exception 'you cannot remove your own access' using errcode = 'P0001';
  end if;

  select count(*) into v_remaining from public.ct_admins;
  if v_remaining <= 1 then
    raise exception 'at least one admin must remain' using errcode = 'P0001';
  end if;

  delete from public.ct_admins where email = v_email;

  if not found then
    raise exception 'admin not found' using errcode = 'P0002';
  end if;
end;
$$;

grant execute on function public.ct_admin_remove_admin(text) to authenticated;
