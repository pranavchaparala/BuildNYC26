-- Loupe — designer-first schema (no auth dependency)
-- Run this in: supabase.com/dashboard/project/txhiertfctonpfwblkbi/sql/new

create extension if not exists "uuid-ossp";

create table if not exists public.flows (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  context text,
  created_at timestamptz not null default now()
);

create table if not exists public.screens (
  id uuid primary key default uuid_generate_v4(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  order_index integer not null,
  image_url text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audits (
  id uuid primary key default uuid_generate_v4(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  version integer not null,
  score integer check (score >= 0 and score <= 100),
  summary text,
  roast text,
  design_language jsonb,
  status text not null default 'pending' check (status in ('pending', 'processing', 'complete', 'error')),
  error_message text,
  email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(flow_id, version)
);

create table if not exists public.observations (
  id uuid primary key default uuid_generate_v4(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  screen_id uuid references public.screens(id),
  type text not null check (type in ('wasted_moment', 'unconsidered', 'strong', 'inconsistent')),
  body text not null,
  action text,
  screen_index integer
);

create table if not exists public.shares (
  id uuid primary key default uuid_generate_v4(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  slug text unique not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists screens_flow_id_idx on public.screens(flow_id);
create index if not exists audits_flow_id_idx on public.audits(flow_id);
create index if not exists observations_audit_id_idx on public.observations(audit_id);
create index if not exists shares_slug_idx on public.shares(slug);

-- Storage bucket (public so image URLs work without auth)
insert into storage.buckets (id, name, public)
values ('screens', 'screens', true)
on conflict (id) do nothing;
