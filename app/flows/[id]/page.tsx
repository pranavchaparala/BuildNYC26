import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import { RunAuditButton } from '@/components/RunAuditButton';
import { FigmaImportButton } from '@/components/FigmaImportButton';
import { AddScreensButton } from '@/components/AddScreensButton';
import { CritiqueView } from '@/components/CritiqueView';
import type { Audit, Screen, Observation } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
  searchParams: { v?: string };
}

export default async function FlowPage({ params, searchParams }: PageProps) {
  const db = createSupabaseClient();

  const { data: flow } = await db
    .from('flows')
    .select('*, screens(*)')
    .eq('id', params.id)
    .single();

  if (!flow) notFound();

  const { data: allAudits } = await db
    .from('audits')
    .select('id, version, score, status, created_at, error_message')
    .eq('flow_id', flow.id)
    .order('created_at', { ascending: false });

  const audits = allAudits ?? [];
  const completedAudits = audits.filter(a => a.status === 'complete');
  const processingAudit = audits.find(a => a.status === 'processing');

  // Only load critique detail when ?v=N is explicitly in the URL
  const requestedVersion = searchParams.v ? parseInt(searchParams.v, 10) : null;
  const targetAudit = requestedVersion
    ? completedAudits.find(a => a.version === requestedVersion) ?? null
    : null;

  let currentAudit: (Audit & { observations: Observation[] }) | null = null;
  if (targetAudit) {
    const { data } = await db
      .from('audits')
      .select('*, observations(*)')
      .eq('id', targetAudit.id)
      .single();
    currentAudit = data as (Audit & { observations: Observation[] }) | null;
  }

  let shareSlug: string | null = null;
  if (currentAudit) {
    const { data: share } = await db
      .from('shares')
      .select('slug')
      .eq('audit_id', currentAudit.id)
      .maybeSingle();
    shareSlug = share?.slug ?? null;
  }

  const versionScores = completedAudits
    .filter(a => a.score !== null)
    .map(a => ({ version: a.version, score: a.score as number }))
    .sort((a, b) => a.version - b.version);

  const screens = ((flow.screens as Screen[]) ?? []).sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <div className="flex flex-col gap-3 pb-3">
      {/* ── Screen grid ── */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-semibold text-ink-900">{flow.name}</h1>
          {screens.length > 0 && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full shrink-0">
              {screens.length} Screen{screens.length !== 1 ? 's' : ''}
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <FigmaImportButton />
            {screens.length > 0 && (
              <RunAuditButton
                flowId={flow.id}
                pendingAuditId={processingAudit?.id ?? null}
                variant="dark"
              />
            )}
          </div>
        </div>

        {screens.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-ink-400 mb-4">No screens yet.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-x-4 gap-y-5">
          {screens.map((screen, i) => (
            <ScreenCell key={screen.id} screen={screen} index={i} />
          ))}
          <AddScreensButton flowId={flow.id} />
        </div>
      </div>

      {/* ── Previous critiques ── */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink-900 mb-1">Previous Critique</h2>
        {audits.length === 0 ? (
          <p className="text-sm text-ink-400 mt-3">
            {screens.length === 0
              ? 'Add screens first, then run a critique.'
              : 'No critiques yet — run one above.'}
          </p>
        ) : (
          <div className="mt-2">
            {audits.map((audit, i) => (
              <CritiqueRow
                key={audit.id}
                audit={audit}
                flowId={flow.id}
                flowName={flow.name}
                screenCount={screens.length}
                isLast={i === audits.length - 1}
                isActive={currentAudit?.id === audit.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Critique detail (only when ?v=N is set) ── */}
      {currentAudit && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ink-900">
              Critique v{currentAudit.version}
            </h2>
            <Link
              href={`/flows/${flow.id}`}
              className="text-xs text-ink-400 hover:text-ink-700 transition-colors"
            >
              ✕ Close
            </Link>
          </div>
          <CritiqueView
            flow={{ ...flow, screens }}
            allAudits={audits}
            currentAudit={currentAudit}
            shareSlug={shareSlug}
            processingAuditId={processingAudit?.id ?? null}
            versionScores={versionScores}
            inline
          />
        </div>
      )}
    </div>
  );
}

function ScreenCell({ screen, index }: { screen: Screen; index: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="aspect-[3/2] rounded-xl overflow-hidden border border-ink-100 bg-ink-50">
        <img
          src={screen.image_url}
          alt={`Screen ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-xs text-ink-400">Screen {index + 1}</p>
    </div>
  );
}

function CritiqueRow({
  audit,
  flowId,
  flowName,
  screenCount,
  isLast,
  isActive,
}: {
  audit: {
    id: string;
    version: number;
    score: number | null;
    status: string;
    created_at: string;
    error_message?: string | null;
  };
  flowId: string;
  flowName: string;
  screenCount: number;
  isLast: boolean;
  isActive: boolean;
}) {
  const date = new Date(audit.created_at);
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const isClickable = audit.status === 'complete';

  const inner = (
    <div
      className={[
        'flex items-center gap-4 py-3.5 -mx-2 px-3 rounded-lg transition-colors',
        isActive ? 'bg-accent/5' : isClickable ? 'hover:bg-ink-50 cursor-pointer' : '',
        !isLast ? 'border-b border-ink-100 rounded-none' : '',
      ].join(' ')}
    >
      <span className="text-sm font-medium text-ink-800 flex-1 min-w-0 truncate">
        {flowName} Critique — {screenCount} Screen{screenCount !== 1 ? 's' : ''}
      </span>
      <StatusPill audit={audit} />
      <span className="text-sm text-ink-400 tabular-nums shrink-0">
        {dateStr} | {timeStr}
      </span>
    </div>
  );

  if (!isClickable) return inner;
  return <Link href={`/flows/${flowId}?v=${audit.version}`}>{inner}</Link>;
}

function StatusPill({
  audit,
}: {
  audit: { status: string; score: number | null };
}) {
  if (audit.status === 'complete' && audit.score !== null) {
    return (
      <span className="shrink-0 text-sm text-ink-400">
        Score <span className="font-semibold text-ink-900">{audit.score}</span>
      </span>
    );
  }
  if (audit.status === 'processing') {
    return (
      <span className="shrink-0 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
        Running…
      </span>
    );
  }
  if (audit.status === 'error') {
    return (
      <span className="shrink-0 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
        Failed
      </span>
    );
  }
  return null;
}
