'use client';

import { Badge } from '@/components/ui/Badge';
import type { Observation } from '@/lib/types';

interface ObservationItemProps {
  observation: Observation;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function ObservationItem({ observation, isHighlighted, onClick }: ObservationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left rounded-xl border p-4 flex flex-col gap-3 transition-all duration-150',
        'hover:border-ink-200',
        isHighlighted
          ? 'border-accent bg-accent/5'
          : 'border-ink-100 bg-white',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <Badge type={observation.type} />
        {observation.screen_index !== null && (
          <span className="text-[10px] font-mono text-ink-300 shrink-0">
            Screen {observation.screen_index + 1}
          </span>
        )}
      </div>
      <p className="text-sm text-ink-700 leading-relaxed">{observation.body}</p>
      {observation.action && (
        <div className="flex gap-2 rounded-lg bg-ink-50 px-3 py-2.5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-300 shrink-0 pt-0.5">
            {observation.type === 'strong' ? 'Protect' : 'Do this'}
          </span>
          <p className="text-sm text-ink-700 leading-relaxed">{observation.action}</p>
        </div>
      )}
    </button>
  );
}
