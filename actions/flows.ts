'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createSupabaseClient } from '@/lib/supabase';
import { uploadScreens, deleteScreens } from '@/lib/storage';

export async function createFlow(formData: FormData) {
  const db = createSupabaseClient();

  const name = (formData.get('name') as string)?.trim();
  const context = (formData.get('context') as string) || null;

  if (!name) throw new Error('Flow name is required');

  const { data: flow, error } = await db
    .from('flows')
    .insert({ name, context })
    .select()
    .single();

  if (error) throw new Error(`Flow creation failed: ${error.message}`);

  revalidatePath('/flows', 'layout');
  redirect(`/flows/${flow.id}`);
}

export async function addScreensToFlow(formData: FormData) {
  const db = createSupabaseClient();

  const flowId = formData.get('flowId') as string;
  const files = formData.getAll('screens') as File[];

  if (!flowId) throw new Error('Flow ID is required');
  if (!files.length) throw new Error('No files provided');

  // Start after the last existing screen
  const { data: existing } = await db
    .from('screens')
    .select('order_index')
    .eq('flow_id', flowId)
    .order('order_index', { ascending: false })
    .limit(1);

  const startIndex = (existing?.[0]?.order_index ?? -1) + 1;
  const orders = files.map((_, i) => startIndex + i);

  const screenData = await uploadScreens(files, orders);

  const { error } = await db
    .from('screens')
    .insert(screenData.map(s => ({ ...s, flow_id: flowId })));

  if (error) throw new Error(`Screen insert failed: ${error.message}`);
}

export async function renameFlow(flowId: string, name: string) {
  const db = createSupabaseClient();

  const trimmed = name?.trim();
  if (!trimmed) throw new Error('Flow name is required');

  const { error } = await db.from('flows').update({ name: trimmed }).eq('id', flowId);
  if (error) throw new Error(`Rename failed: ${error.message}`);

  revalidatePath('/flows', 'layout');
}

export async function deleteFlow(flowId: string) {
  const db = createSupabaseClient();

  const { data: screens } = await db
    .from('screens')
    .select('storage_path')
    .eq('flow_id', flowId);

  if (screens?.length) {
    await deleteScreens(screens.map(s => s.storage_path));
  }

  const { error } = await db.from('flows').delete().eq('id', flowId);
  if (error) throw new Error(`Delete failed: ${error.message}`);

  revalidatePath('/flows', 'layout');
}
