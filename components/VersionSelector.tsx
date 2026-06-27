'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Audit } from '@/lib/types';

interface VersionSelectorProps {
  audits: Pick<Audit, 'id' | 'version' | 'score' | 'status'>[];
  currentVersion: number;
  flowId: string;
}

export function VersionSelector({ audits, currentVersion, flowId }: VersionSelectorProps) {
  const router = useRouter();
  const sorted = [...audits].sort((a, b) => b.version - a.version);

  if (audits.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-mono text-ink-400 uppercase tracking-wider">Version</label>
      <select
        value={currentVersion}
        onChange={e => router.push(`/flows/${flowId}?v=${e.target.value}`)}
        className="text-sm border border-ink-200 rounded-lg px-2 py-1 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {sorted.map(audit => (
          <option key={audit.id} value={audit.version} disabled={audit.status !== 'complete'}>
            v{audit.version}
            {audit.score !== null ? ` — ${audit.score}/100` : ''}
            {audit.status !== 'complete' ? ` (${audit.status})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
