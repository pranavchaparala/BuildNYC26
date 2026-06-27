'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createShare } from '@/actions/shares';

interface ShareButtonProps {
  auditId: string;
  flowId: string;
  existingSlug?: string | null;
}

export function ShareButton({ auditId, flowId, existingSlug }: ShareButtonProps) {
  const [slug, setSlug] = useState<string | null>(existingSlug ?? null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const s = await createShare(auditId);
      setSlug(s);
      await copyLink(s);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(s: string) {
    const url = `${window.location.origin}/flows/${flowId}/share/${s}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (slug) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => copyLink(slug)}
      >
        {copied ? '✓ Copied' : 'Copy share link'}
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      loading={loading}
      onClick={handleShare}
    >
      Share critique
    </Button>
  );
}
