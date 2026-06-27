'use server';

import { nanoid } from 'nanoid';
import { createSupabaseClient } from '@/lib/supabase';

export async function createShare(auditId: string): Promise<string> {
  const db = createSupabaseClient();

  const { data: existing } = await db
    .from('shares')
    .select('slug')
    .eq('audit_id', auditId)
    .maybeSingle();

  if (existing?.slug) return existing.slug;

  const slug = nanoid(10);
  const { error } = await db.from('shares').insert({ audit_id: auditId, slug });
  if (error) throw new Error(`Share creation failed: ${error.message}`);

  return slug;
}
