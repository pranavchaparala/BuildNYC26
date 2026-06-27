import type { ObservationType } from '@/lib/types';
import { OBSERVATION_LABELS } from '@/lib/types';

interface BadgeProps {
  type: ObservationType;
  size?: 'sm' | 'md';
}

const typeClasses: Record<ObservationType, string> = {
  strong: 'bg-green-50 text-green-700',
  inconsistent: 'bg-blue-50 text-blue-700',
  unconsidered: 'bg-amber-50 text-amber-700',
  wasted_moment: 'bg-red-50 text-red-700',
};

export function Badge({ type, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-mono font-medium uppercase tracking-wider rounded',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        typeClasses[type],
      ].join(' ')}
    >
      {OBSERVATION_LABELS[type]}
    </span>
  );
}
