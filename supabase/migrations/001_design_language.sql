-- Migration: add design_language to audits + inconsistent observation type
-- Run in: supabase.com/dashboard/project/txhiertfctonpfwblkbi/sql/new

alter table public.audits
  add column if not exists design_language jsonb;

alter table public.observations
  drop constraint if exists observations_type_check;

alter table public.observations
  add constraint observations_type_check
  check (type in ('wasted_moment', 'unconsidered', 'strong', 'inconsistent'));
