import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import { FlowSidebar } from '@/components/FlowSidebar';

export const dynamic = 'force-dynamic';

export default async function FlowsLayout({ children }: { children: React.ReactNode }) {
  const db = createSupabaseClient();
  const { data: flows } = await db
    .from('flows')
    .select('id, name')
    .order('created_at', { ascending: false });

  const flowList = (flows ?? []) as { id: string; name: string }[];

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Left sidebar */}
      <aside className="w-52 shrink-0 flex flex-col gap-3 p-3 overflow-y-auto">
        {/* Logo card */}
        <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2.5 shrink-0">
          <img src="/icon.png" alt="" className="w-6 h-6" />
          <span className="font-semibold text-ink-900 tracking-tight text-sm">Loupe</span>
        </div>

        {/* Flows card */}
        <div className="bg-white rounded-xl p-2 flex-1 flex flex-col justify-between">
          <FlowSidebar flows={flowList} />
          <div className="pt-2 border-t border-ink-100 mt-2">
            <Link
              href="/flows/new"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New flow
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-3">
        {children}
      </main>
    </div>
  );
}
