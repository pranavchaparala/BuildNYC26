import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    throw new Error(
      'Supabase misconfigured: NEXT_PUBLIC_SUPABASE_URL is not set. Add it in Vercel → Settings → Environment Variables, then redeploy (NEXT_PUBLIC_ vars are baked in at build time).'
    );
  }
  if (!key) {
    throw new Error(
      'Supabase misconfigured: no Supabase key found. Set SUPABASE_SERVICE_ROLE_KEY in Vercel → Settings → Environment Variables, then redeploy.'
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
