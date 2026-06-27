'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { runAudit, pollAuditStatus } from '@/actions/audit';

interface RunAuditButtonProps {
  flowId: string;
  pendingAuditId?: string | null;
  onProcessing?: (isProcessing: boolean) => void;
  variant?: 'primary' | 'dark';
}

export function RunAuditButton({ flowId, pendingAuditId, onProcessing, variant = 'primary' }: RunAuditButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(pendingAuditId ?? null);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = loading || !!pollingId;

  useEffect(() => {
    if (!pollingId) {
      onProcessing?.(false);
      return;
    }
    onProcessing?.(true);
    let polls = 0;
    const MAX_POLLS = 80; // ~4 min before giving up on a stalled run
    const interval = setInterval(async () => {
      polls += 1;
      const result = await pollAuditStatus(pollingId);
      if (result?.status === 'complete' || result?.status === 'error') {
        clearInterval(interval);
        setPollingId(null);
        onProcessing?.(false);
        if (result.status === 'error') {
          setError(result.error_message ?? 'Critique failed — try again');
        }
        router.refresh();
      } else if (polls >= MAX_POLLS) {
        clearInterval(interval);
        setPollingId(null);
        onProcessing?.(false);
        setError('This run stalled. Click Run critique to try again.');
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [pollingId, router, onProcessing]);

  async function handleRun() {
    setError(null);
    setLoading(true);
    try {
      const result = await runAudit(flowId);
      setPollingId(result.auditId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        onClick={handleRun}
        loading={isProcessing}
        disabled={isProcessing}
        variant={variant}
        size="sm"
      >
        {isProcessing ? 'Reviewing…' : 'Run critique'}
      </Button>
      {error && (
        <p className="text-xs text-red-500 max-w-[200px] text-right">{error}</p>
      )}
    </div>
  );
}
