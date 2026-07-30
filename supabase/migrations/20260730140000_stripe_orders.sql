-- Stripe checkout: orders and token delivery
--
-- Payment is verified against Stripe on the server; this file only records the
-- result and mints the tokens the package promises. ct_fulfil_order is the one
-- function that can create tokens out of thin air, so it is callable by the
-- service role only — never by anon or authenticated.

-- Who bought a token, so buyers can find their codes again.
alter table public.ct_tokens
  add column if not exists bought_by uuid references auth.users (id) on delete set null;

create index if not exists ct_tokens_bought_by_idx
  on public.ct_tokens (bought_by, created_at desc);

create table if not exists public.ct_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  package_id uuid references public.ct_packages (id) on delete set null,
  amount_total int,
  currency text,
  token_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.ct_orders enable row level security;
revoke all on public.ct_orders from anon, authenticated;

/**
 * Idempotent fulfilment. The order row is inserted first, so two concurrent
 * calls for the same Stripe session (the success page and the webhook, say)
 * can never mint two batches of tokens — the loser just reads back the codes.
 */
create or replace function public.ct_fulfil_order(
  p_session_id text,
  p_package_id uuid,
  p_user_id uuid default null,
  p_email text default null,
  p_amount int default null,
  p_currency text default null
)
returns setof text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_count int;
  v_code text;
  v_id uuid;
  v_ids uuid[] := '{}';
  i int;
begin
  if p_session_id is null or trim(p_session_id) = '' then
    raise exception 'session id is required' using errcode = '22023';
  end if;

  insert into public.ct_orders
    (stripe_session_id, user_id, email, package_id, amount_total, currency)
  values
    (p_session_id, p_user_id, lower(nullif(trim(coalesce(p_email, '')), '')),
     p_package_id, p_amount, lower(p_currency))
  on conflict (stripe_session_id) do nothing
  returning id into v_order_id;

  -- Someone else already fulfilled this session: hand back the same codes.
  if v_order_id is null then
    return query
      select t.code
        from public.ct_orders o
        join public.ct_tokens t on t.id = any (o.token_ids)
       where o.stripe_session_id = p_session_id
       order by t.created_at;
    return;
  end if;

  select token_count into v_count
    from public.ct_packages where id = p_package_id;

  if v_count is null then
    raise exception 'package not found' using errcode = 'P0002';
  end if;

  for i in 1..v_count loop
    loop
      v_code := public.ct_generate_code();
      exit when not exists (select 1 from public.ct_tokens where code = v_code);
    end loop;

    insert into public.ct_tokens (code, issued_to_email, package_id, bought_by)
    values (v_code, lower(nullif(trim(coalesce(p_email, '')), '')),
            p_package_id, p_user_id)
    returning id into v_id;

    v_ids := array_append(v_ids, v_id);
  end loop;

  update public.ct_orders set token_ids = v_ids where id = v_order_id;

  return query
    select t.code from public.ct_tokens t
     where t.id = any (v_ids)
     order by t.created_at;
end;
$$;

revoke all on function public.ct_fulfil_order(text, uuid, uuid, text, int, text)
  from anon, authenticated;

/**
 * The caller's own tokens — bought through checkout, or issued to their email
 * by an admin. ct_tokens itself stays unreadable.
 */
create or replace function public.ct_my_tokens()
returns table (
  code text,
  status text,
  package_name text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(nullif(auth.jwt() ->> 'email', ''));
begin
  if v_uid is null then
    raise exception 'sign in required' using errcode = '42501';
  end if;

  return query
    select t.code, t.status, p.name, t.created_at
      from public.ct_tokens t
      left join public.ct_packages p on p.id = t.package_id
     where t.bought_by = v_uid
        or (v_email is not null and lower(t.issued_to_email) = v_email)
     order by t.created_at desc
     limit 100;
end;
$$;

grant execute on function public.ct_my_tokens() to authenticated;
