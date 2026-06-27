'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { generateRoast } from '@/actions/audit';

interface RoastCardProps {
  auditId: string;
  existingRoast?: string | null;
}

export function RoastCard({ auditId, existingRoast }: RoastCardProps) {
  const [roast, setRoast] = useState<string | null>(existingRoast ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleReveal() {
    setLoading(true);
    try {
      const text = await generateRoast(auditId);
      setRoast(text);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!roast) return;
    await navigator.clipboard.writeText(roast);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!roast) {
    return (
      <div className="flex flex-col items-start">
        <button
          type="button"
          onClick={handleReveal}
          disabled={loading}
          className="text-xs text-ink-300 hover:text-ink-600 transition-colors underline underline-offset-2 decoration-dashed"
        >
          {loading ? 'Getting the honest version…' : 'Want the honest version?'}
        </button>
      </div>
    );
  }

  return (
    <div className="roast-card-enter rounded-xl border border-ink-200 bg-ink-900 p-6 flex flex-col gap-4">
      <p className="text-[11px] font-mono uppercase tracking-widest text-ink-500">The honest version</p>
      <p className="text-base text-white leading-relaxed font-medium">{roast}</p>
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-ink-400 hover:text-white hover:bg-white/10"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
