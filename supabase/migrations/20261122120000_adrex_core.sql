-- Adrex core tables.
-- Safe to run more than once. Paste into Supabase > SQL Editor > New query > Run.
--
-- Who can read what:
--   * A signed-in merchant can read only their own profile, API keys (never the key itself)
--     and checks.
--   * visits, demo_usage, sponsor_leads, audit_log and app_settings are only reachable by
--     the server using the service role key. The browser can never read or write them.

-- ---------------------------------------------------------------- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  company text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (company) on public.profiles to authenticated;

-- Every new sign-up gets a profile row automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- People who signed up before this ran.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------- admin_users
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users: read own row" on public.admin_users;
create policy "admin_users: read own row" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Admins are added only from the SQL editor or the server, never from the browser.
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

-- ---------------------------------------------------------------- api_keys
-- Only a fingerprint (SHA-256 hash) of each key is stored. The key itself is shown once.
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Default',
  prefix text not null,
  key_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists api_keys_user_idx on public.api_keys (user_id);

alter table public.api_keys enable row level security;

drop policy if exists "api_keys: read own" on public.api_keys;
create policy "api_keys: read own" on public.api_keys
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.api_keys from anon, authenticated;
grant select (id, user_id, name, prefix, created_at, last_used_at, revoked_at)
  on public.api_keys to authenticated;

-- ------------------------------------------------------------------ checks
-- One row per postcode check. No street address, name or phone number is stored.
create table if not exists public.checks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete cascade,
  api_key_id uuid references public.api_keys (id) on delete set null,
  source text not null check (source in ('web', 'api')),
  country text not null default 'NG' check (country ~ '^[A-Z]{2}$'),
  postcode text not null,
  result text not null check (result in ('found', 'not_found', 'error')),
  status text check (status in ('verified', 'review', 'high_risk')),
  score smallint check (score between 0 and 100),
  state text,
  error_code text,
  latency_ms integer,
  visitor_hash text
);

create index if not exists checks_user_time_idx on public.checks (user_id, created_at desc);
create index if not exists checks_time_idx on public.checks (created_at desc);
create index if not exists checks_country_time_idx on public.checks (country, created_at desc);

alter table public.checks enable row level security;

drop policy if exists "checks: read own" on public.checks;
create policy "checks: read own" on public.checks
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.checks from anon, authenticated;
grant select on public.checks to authenticated;

-- ------------------------------------------------------------------ visits
-- Page visits for the admin page. The visitor is a daily-rotating hash, never a raw IP address.
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  country text check (country is null or country ~ '^[A-Z]{2}$'),
  referrer_host text,
  visitor_hash text,
  is_bot boolean not null default false
);

create index if not exists visits_time_idx on public.visits (created_at desc);

alter table public.visits enable row level security;
revoke all on public.visits from anon, authenticated;

-- -------------------------------------------------------------- demo_usage
-- Free checks used per visitor per day (replaces the in-memory counter).
create table if not exists public.demo_usage (
  visitor_hash text not null,
  day date not null,
  count integer not null default 0,
  primary key (visitor_hash, day)
);

alter table public.demo_usage enable row level security;
revoke all on public.demo_usage from anon, authenticated;

-- Adds one use and returns true, or returns false when the visitor is already at the limit.
create or replace function public.bump_demo_usage(p_hash text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  used integer;
begin
  insert into public.demo_usage as u (visitor_hash, day, count)
  values (p_hash, (now() at time zone 'utc')::date, 1)
  on conflict (visitor_hash, day)
  do update set count = u.count + 1
  where u.count < p_limit
  returning u.count into used;

  return used is not null;
end;
$$;

revoke execute on function public.bump_demo_usage(text, integer) from public, anon, authenticated;
grant execute on function public.bump_demo_usage(text, integer) to service_role;

-- ----------------------------------------------------------- sponsor_leads
create table if not exists public.sponsor_leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  organisation text,
  message text,
  country text check (country is null or country ~ '^[A-Z]{2}$')
);

alter table public.sponsor_leads enable row level security;
revoke all on public.sponsor_leads from anon, authenticated;

-- --------------------------------------------------------------- audit_log
-- A permanent record of what admins do.
create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  target text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists audit_log_time_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;
revoke all on public.audit_log from anon, authenticated;

-- ------------------------------------------------------------ app_settings
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (key, value) values
  ('demo_enabled', 'true'::jsonb),
  ('free_checks_per_day', '3'::jsonb)
on conflict (key) do nothing;
