-- CreatorsMela Collab Tracker — Fresh Supabase PostgreSQL Schema
-- Cleans up existing tables and recreates all tables, triggers, constraints, and RLS policies fresh.
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard -> SQL Editor)

create extension if not exists pgcrypto;

-- 0. Clean up existing tables and functions for a fresh start
drop table if exists public.automation_logs cascade;
drop table if exists public.deals cascade;
drop table if exists public.brands cascade;
drop table if exists public.creators cascade;
drop table if exists public.automation_configs cascade;

-- 1. Creators Table
create table public.creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text not null default '',
  platform text not null default 'Multi-platform'
    check (platform in ('Instagram', 'YouTube', 'Multi-platform')),
  niche text not null,
  follower_count bigint not null default 0 check (follower_count >= 0),
  engagement_rate numeric(5,2) not null default 4.80,
  base_rate bigint not null default 75000,
  email text not null default '',
  manager_name text not null default 'Talent Ops Desk',
  tier text not null default 'Exclusive'
    check (tier in ('Exclusive', 'Roster', 'Network')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_creators_created_at on public.creators (created_at desc);

-- 2. Brands Table
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text not null default 'CONSUMER',
  contact_name text not null default '',
  contact_email text not null default '',
  website text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_brands_name_lower on public.brands (lower(name));
create index idx_brands_created_at on public.brands (created_at desc);

-- 3. Deals Table (strictly requires both a registered creator AND a registered brand)
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  brand_name text not null,
  brand_sector text not null default 'COLLAB',
  campaign_title text not null default '',
  deliverables text not null default '1 IG Reel + 2 Stories',
  deal_value bigint not null default 0 check (deal_value >= 0),
  agency_fee_pct numeric(5,2) not null default 15,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Paid')),
  due_date text not null default '',
  notes text not null default '',
  last_automated_status text
    check (last_automated_status in ('Pending', 'Confirmed', 'Paid')),
  confirmed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_deals_creator_id on public.deals (creator_id);
create index idx_deals_brand_id on public.deals (brand_id);
create index idx_deals_status on public.deals (status);
create index idx_deals_updated_at on public.deals (updated_at desc);

-- 4. Automation Config Table (Singleton)
create table public.automation_configs (
  singleton_key text primary key default 'default',
  trigger_on_confirmed boolean not null default true,
  trigger_on_paid boolean not null default true,
  channel_slack boolean not null default true,
  channel_sheets boolean not null default true,
  channel_email boolean not null default false,
  channel_webhook boolean not null default true,
  slack_webhook_url text not null default '',
  sheets_webhook_url text not null default '',
  custom_webhook_url text not null default '',
  manager_email text not null default 'talent-ops@creatorsmela.com',
  use_loopback_test_sink boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 5. Automation Logs Table (backend audit log for notification dispatches)
create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  deal_id text not null,
  creator_id text not null,
  creator_name text not null,
  brand_name text not null,
  deal_value bigint not null default 0,
  previous_status text not null,
  new_status text not null check (new_status in ('Pending', 'Confirmed', 'Paid')),
  channel text not null check (channel in ('slack', 'sheets', 'email', 'webhook')),
  mode text not null check (mode in ('live', 'loopback', 'simulated')),
  status text not null check (status in ('delivered', 'failed')),
  http_status integer not null default 200,
  latency_ms integer not null default 0,
  idempotency_key text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  response_body text not null default '',
  triggered_at timestamptz not null default now()
);

create index idx_automation_logs_triggered_at
  on public.automation_logs (triggered_at desc);

-- 6. Database Triggers: updated_at + Paid status immutability lock
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_paid_deal_status_change()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'Paid' and new.status is distinct from 'Paid' then
    raise exception 'Paid deals are locked and their status cannot be changed.';
  end if;
  return new;
end;
$$;

create trigger trg_creators_updated_at
  before update on public.creators
  for each row execute function public.set_updated_at();

create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

create trigger trg_deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

create trigger trg_deals_paid_lock
  before update on public.deals
  for each row execute function public.prevent_paid_deal_status_change();

create trigger trg_automation_configs_updated_at
  before update on public.automation_configs
  for each row execute function public.set_updated_at();

-- 7. Seed default automation config row
insert into public.automation_configs (singleton_key)
values ('default')
on conflict (singleton_key) do nothing;

-- 8. Permissions & Row-Level Security Policies
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter table public.creators enable row level security;
alter table public.brands enable row level security;
alter table public.deals enable row level security;
alter table public.automation_configs enable row level security;
alter table public.automation_logs enable row level security;

create policy "Allow full access on creators"
  on public.creators for all
  to anon, authenticated, service_role
  using (true) with check (true);

create policy "Allow full access on brands"
  on public.brands for all
  to anon, authenticated, service_role
  using (true) with check (true);

create policy "Allow full access on deals"
  on public.deals for all
  to anon, authenticated, service_role
  using (true) with check (true);

create policy "Allow full access on automation_configs"
  on public.automation_configs for all
  to anon, authenticated, service_role
  using (true) with check (true);

create policy "Allow full access on automation_logs"
  on public.automation_logs for all
  to anon, authenticated, service_role
  using (true) with check (true);

comment on schema public is '@graphql({"inflect_names": true})';

notify pgrst, 'reload schema';
