import Link from 'next/link';
import type { FlowWithStats, Screen } from '@/lib/types';

interface FlowCardProps {
  flow: FlowWithStats & { screens?: Pick<Screen, 'id' | 'image_url' | 'order_index'>[] };
}

export function FlowCard({ flow }: FlowCardProps) {
  const thumbScreen = flow.screens
    ?.slice()
    .sort((a, b) => a.order_index - b.order_index)[0];

  const hasScore = flow.latestScore !== null;
  const hasDelta = flow.scoreDelta !== null;

  return (
    <Link
      href={`/flows/${flow.id}`}
      className="group flex gap-4 rounded-xl border border-ink-100 p-4 hover:border-ink-200 hover:bg-ink-50 transition-colors"
    >
      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-ink-100">
        {thumbScreen?.image_url ? (
          <img
            src={thumbScreen.image_url}
            alt={flow.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-300">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="14" height="14" rx="2" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <h3 className="font-medium text-ink-900 truncate group-hover:text-accent transition-colors">
            {flow.name}
          </h3>
          <p className="text-xs text-ink-400 mt-0.5">
            {flow.screenCount} screen{flow.screenCount !== 1 ? 's' : ''}
            {flow.auditCount > 0 && ` · ${flow.auditCount} version${flow.auditCount !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          {hasScore ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-ink-900">{flow.latestScore}</span>
              <span className="text-xs text-ink-400">/100</span>
              {hasDelta && flow.scoreDelta !== 0 && (
                <span
                  className={[
                    'text-xs font-mono font-medium',
                    flow.scoreDelta! > 0 ? 'text-green-600' : 'text-red-500',
                  ].join(' ')}
                >
                  {flow.scoreDelta! > 0 ? '↑' : '↓'} {Math.abs(flow.scoreDelta!)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-ink-300 italic">No critique yet</span>
          )}

          <time className="text-xs text-ink-300" dateTime={flow.created_at}>
            {formatDate(flow.created_at)}
          </time>
        </div>
      </div>
    </Link>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
