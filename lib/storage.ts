import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const BUCKET = 'screens';

export async function uploadScreens(
  files: File[],
  orders: number[]
): Promise<{ order_index: number; image_url: string; storage_path: string }[]> {
  return Promise.all(
    files.map(async (file, i) => {
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buf = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buf, { contentType: file.type, upsert: false });

      if (error) throw new Error(`Upload failed: ${error.message}`);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return { order_index: orders[i] ?? i, image_url: data.publicUrl, storage_path: path };
    })
  );
}

export async function deleteScreen(storagePath: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([storagePath]);
}

export async function deleteScreens(storagePaths: string[]): Promise<void> {
  if (storagePaths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(storagePaths);
}
