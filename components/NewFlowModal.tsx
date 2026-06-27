'use client';

import { useRef, useState, useTransition, useEffect } from 'react';
import { createFlow } from '@/actions/flows';

export function NewFlowModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createFlow(fd);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-popover w-full max-w-sm pointer-events-auto animate-scale-in">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-ink-900">New flow</h2>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-md flex items-center justify-center text-ink-300 hover:text-ink-700 hover:bg-ink-50 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-600">Flow name</label>
                <input
                  ref={inputRef}
                  name="name"
                  type="text"
                  placeholder="e.g. Onboarding — v3"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-900 placeholder-ink-300 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-600">
                  Context <span className="text-ink-300 font-normal">(optional)</span>
                </label>
                <textarea
                  name="context"
                  placeholder="What is this flow trying to do?"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-900 placeholder-ink-300 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg text-sm text-ink-500 border border-ink-200 hover:bg-ink-50 hover:text-ink-900 transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-ink-900 text-white hover:bg-ink-700 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Creating…' : 'Create flow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
