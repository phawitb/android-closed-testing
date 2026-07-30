-- Site settings + the guided "setup → token → submit" flow
--
-- The onboarding order changed: a customer now reads the setup guide, then
-- activates a token (or follows the admin-configured buy link), and only then
-- fills in the submission form. The app row therefore has to be created and
-- the token redeemed in one atomic step, which is what
-- ct_create_app_with_token does. ct_validate_token lets the token step give
-- instant feedback without burning the code.

-- ---------------------------------------------------------------------------
-- Editable site settings
-- ---------------------------------------------------------------------------
create table if not exists public.ct_settings (
  key text primary key,
  value text not null default '',
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.ct_settings enable row level security;
revoke all on public.ct_settings from anon, authenticated;
grant select on public.ct_settings to anon, authenticated;

-- Settings are public copy (a buy link, a support address); only admins write,
-- and they do that through the RPC below.
drop policy if exists ct_settings_read on public.ct_settings;
create policy ct_settings_read on public.ct_settings
  for select to anon, authenticated
  using (true);

insert into public.ct_settings (key, value) values
  ('buy_url', '/pricing'),
  ('buy_label', 'Buy a package'),
  ('buy_note', 'We send your token by email right after payment.'),
  ('support_email', '')
on conflict (key) do nothing;

/**
 * Upsert a batch of settings from a flat JSON object. Unknown keys are
 * ignored so the console can never invent new ones.
 */
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
   where entry.key in ('buy_url', 'buy_label', 'buy_note', 'support_email')
  on conflict (key) do update
     set value = excluded.value,
         updated_by = excluded.updated_by,
         updated_at = now();
end;
$$;

grant execute on function public.ct_admin_save_settings(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Check a token without spending it
-- ---------------------------------------------------------------------------
/**
 * Tells a signed-in user whether the code they typed is usable. Codes are
 * 32^8 wide and this never returns anything but a reason string, so it cannot
 * be used to harvest them.
 */
create or replace function public.ct_validate_token(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  select status into v_status
    from public.ct_tokens
   where upper(trim(code)) = upper(trim(coalesce(p_code, '')));

  if v_status is null then
    return json_build_object('ok', false, 'reason', 'invalid');
  end if;

  if v_status = 'used' then
    return json_build_object('ok', false, 'reason', 'used');
  end if;

  if v_status <> 'unused' then
    return json_build_object('ok', false, 'reason', 'void');
  end if;

  return json_build_object('ok', true, 'reason', 'valid');
end;
$$;

grant execute on function public.ct_validate_token(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Create the submission and spend the token in one transaction
-- ---------------------------------------------------------------------------
create or replace function public.ct_create_app_with_token(
  p_code text,
  p_name text,
  p_app_type text default 'free',
  p_store_url text default '',
  p_contact_email text default '',
  p_setup_confirmed boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_token public.ct_tokens%rowtype;
  v_app public.ct_apps%rowtype;
  v_name text := trim(coalesce(p_name, ''));
  v_email text := lower(trim(coalesce(p_contact_email, '')));
  v_url text := trim(coalesce(p_store_url, ''));
begin
  if v_uid is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  if char_length(v_name) < 1 or char_length(v_name) > 120 then
    raise exception 'app name is required' using errcode = '22023';
  end if;

  if coalesce(p_app_type, 'free') not in ('free', 'paid') then
    raise exception 'invalid app type' using errcode = '22023';
  end if;

  if v_url = '' then
    raise exception 'opt-in URL is required' using errcode = '22023';
  end if;

  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'contact email is required' using errcode = '22023';
  end if;

  select * into v_token from public.ct_tokens
   where upper(trim(code)) = upper(trim(coalesce(p_code, '')))
   for update;

  if not found then
    raise exception 'invalid token' using errcode = 'P0002';
  end if;

  if v_token.status <> 'unused' then
    raise exception 'token already used' using errcode = 'P0001';
  end if;

  insert into public.ct_apps
    (owner_id, name, app_type, store_url, contact_email, status, token_id,
     setup_confirmed_at)
  values
    (v_uid, v_name, coalesce(p_app_type, 'free'), v_url, v_email,
     'awaiting_setup', v_token.id,
     case when p_setup_confirmed then now() else null end)
  returning * into v_app;

  update public.ct_tokens
     set status = 'used',
         redeemed_by = v_uid,
         redeemed_app_id = v_app.id,
         redeemed_at = now()
   where id = v_token.id;

  return json_build_object('id', v_app.id, 'status', v_app.status);
end;
$$;

grant execute on function public.ct_create_app_with_token(
  text, text, text, text, text, boolean
) to authenticated;
