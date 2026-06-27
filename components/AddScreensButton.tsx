'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addScreensToFlow } from '@/actions/flows';

export function AddScreensButton({ flowId }: { flowId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: File[]) {
    const images = files.filter(f => f.type.startsWith('image/'));
    if (!images.length) return;

    setIsPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('flowId', flowId);
      fd.set('count', String(images.length));
      images.forEach((f, i) => fd.append(`screen_${i}`, f));
      await addScreensToFlow(fd);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files) upload(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => !isPending && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          upload(Array.from(e.dataTransfer.files));
        }}
        className={[
          'aspect-[3/2] w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors',
          isDragging
            ? 'border-accent bg-accent/5'
            : isPending
            ? 'border-ink-200 bg-ink-50 cursor-not-allowed opacity-60'
            : 'border-ink-200 bg-ink-50/40 hover:border-ink-300 hover:bg-ink-50 cursor-pointer',
        ].join(' ')}
      >
        {isPending ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-ink-200 border-t-ink-500 rounded-full animate-spin" />
            <p className="text-xs text-ink-400">Uploading…</p>
          </div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-lg border border-ink-200 bg-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2v8M4 6l4-4 4 4M2 12h12"
                  stroke="#A8A8A8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-xs text-ink-400">Click to upload, or drag and drop</p>
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
