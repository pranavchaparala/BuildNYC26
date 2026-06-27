-- Migration: add actionable step to observations
-- Run in: supabase.com/dashboard/project/txhiertfctonpfwblkbi/sql/new

alter table public.observations
  add column if not exists action text;
