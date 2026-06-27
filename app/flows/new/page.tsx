'use client';

import { useRef, useState, useTransition } from 'react';
import { createFlow } from '@/actions/flows';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function NewFlowPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createFlow(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <div className="max-w-lg pt-4">
      <div className="card p-7">
        <h1 className="text-lg font-semibold text-ink-900 mb-1">New flow</h1>
        <p className="text-sm text-ink-400 mb-7">
          Give it a name. Add screens after.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Flow name"
            name="name"
            placeholder="e.g. Onboarding — v3"
            required
            autoFocus
          />

          <Textarea
            label="Context"
            name="context"
            placeholder="What is this flow trying to do? Any constraints?"
            hint="Optional — but the more specific, the sharper the critique."
            rows={3}
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="pt-1">
            <Button type="submit" variant="dark" loading={isPending} disabled={isPending}>
              {isPending ? 'Creating…' : 'Create flow'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
