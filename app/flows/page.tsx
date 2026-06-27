import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function FlowsPage() {
  const db = createSupabaseClient();
  const { data: flows } = await db
    .from('flows')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1);

  if (flows && flows.length > 0) {
    redirect(`/flows/${flows[0].id}`);
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="bg-white rounded-xl p-12 text-center max-w-sm w-full flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-full bg-ink-50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="#A8A8A8" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="2" fill="#A8A8A8" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink-900 mb-1">No flows yet</h2>
          <p className="text-sm text-ink-400 leading-relaxed">
            Upload a product flow and get a critique focused on craft, not errors.
          </p>
        </div>
        <Link
          href="/upload"
          className="bg-ink-900 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-ink-700 transition-colors"
        >
          Upload your first flow
        </Link>
      </div>
    </div>
  );
}
