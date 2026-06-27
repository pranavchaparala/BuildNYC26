'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NewFlowModal } from '@/components/NewFlowModal';
import { renameFlow, deleteFlow } from '@/actions/flows';

interface SidebarFlow {
  id: string;
  name: string;
}

const LONG_PRESS_MS = 500;

export function FlowSidebar({ flows }: { flows: SidebarFlow[] }) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  // Context menu (opened via long-press or right-click)
  const [menuFlow, setMenuFlow] = useState<SidebarFlow | null>(null);
  const [renameTarget, setRenameTarget] = useState<SidebarFlow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SidebarFlow | null>(null);

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function clearPressTimer() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function startPress(flow: SidebarFlow) {
    longPressed.current = false;
    clearPressTimer();
    pressTimer.current = setTimeout(() => {
      longPressed.current = true;
      setMenuFlow(flow);
    }, LONG_PRESS_MS);
  }

  return (
    <>
      <nav className="flex flex-col gap-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-300 px-2 py-1.5 mb-0.5">
          Flows
        </p>

        {flows.map(flow => {
          const isActive = pathname.startsWith(`/flows/${flow.id}`);
          return (
            <Link
              key={flow.id}
              href={`/flows/${flow.id}`}
              onContextMenu={e => {
                e.preventDefault();
                setMenuFlow(flow);
              }}
              onPointerDown={() => startPress(flow)}
              onPointerUp={clearPressTimer}
              onPointerLeave={clearPressTimer}
              onPointerMove={clearPressTimer}
              onClick={e => {
                if (longPressed.current) {
                  e.preventDefault();
                  longPressed.current = false;
                }
              }}
              className={[
                'group flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 truncate active:scale-[0.98] select-none',
                isActive
                  ? 'bg-ink-100 text-ink-900 font-medium'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 hover:translate-x-0.5',
              ].join(' ')}
            >
              <span className="truncate">{flow.name}</span>
            </Link>
          );
        })}

        {flows.length === 0 && (
          <p className="text-xs text-ink-300 px-3 py-2">No flows yet</p>
        )}

        <div className="mt-2 pt-2 border-t border-ink-100">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition-all duration-150 active:scale-[0.98]"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New flow
          </button>
        </div>
      </nav>

      {showModal && <NewFlowModal onClose={() => setShowModal(false)} />}

      {menuFlow && (
        <FlowContextMenu
          flowName={menuFlow.name}
          onClose={() => setMenuFlow(null)}
          onRename={() => {
            setRenameTarget(menuFlow);
            setMenuFlow(null);
          }}
          onDelete={() => {
            setDeleteTarget(menuFlow);
            setMenuFlow(null);
          }}
        />
      )}

      {renameTarget && (
        <RenameFlowModal flow={renameTarget} onClose={() => setRenameTarget(null)} />
      )}

      {deleteTarget && (
        <DeleteFlowModal
          flow={deleteTarget}
          isActive={pathname.startsWith(`/flows/${deleteTarget.id}`)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

/* ── Long-press action sheet ── */
function FlowContextMenu({
  flowName,
  onClose,
  onRename,
  onDelete,
}: {
  flowName: string;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[260px] pointer-events-auto animate-scale-in overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <p className="text-xs text-ink-400">Flow</p>
            <p className="text-sm font-medium text-ink-900 truncate">{flowName}</p>
          </div>
          <div className="border-t border-ink-100">
            <button
              onClick={onRename}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9.5 1.5l3 3L5 12l-3.5.5L2 9l7.5-7.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
              Rename
            </button>
            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-ink-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 3.5h10M5 3.5V2a1 1 0 011-1h2a1 1 0 011 1v1.5M3 3.5l.5 8a1 1 0 001 1h5a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Rename modal ── */
function RenameFlowModal({ flow, onClose }: { flow: SidebarFlow; onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const name = new FormData(e.currentTarget).get('name') as string;
    startTransition(async () => {
      try {
        await renameFlow(flow.id, name);
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-scale-in">
          <div className="p-6">
            <h2 className="text-base font-semibold text-ink-900 mb-5">Rename flow</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                ref={inputRef}
                name="name"
                type="text"
                defaultValue={flow.name}
                required
                className="w-full px-3 py-2 rounded-lg border border-ink-200 text-sm text-ink-900 placeholder-ink-300 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
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
                  {isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Delete confirmation ── */
function DeleteFlowModal({
  flow,
  isActive,
  onClose,
}: {
  flow: SidebarFlow;
  isActive: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteFlow(flow.id);
        if (isActive) {
          router.push('/flows');
        } else {
          router.refresh();
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto animate-scale-in">
          <div className="p-6">
            <h2 className="text-base font-semibold text-ink-900 mb-2">Delete flow?</h2>
            <p className="text-sm text-ink-500 leading-relaxed mb-5">
              <span className="font-medium text-ink-700">{flow.name}</span> and all its screens and
              critiques will be permanently deleted. This cannot be undone.
            </p>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg text-sm text-ink-500 border border-ink-200 hover:bg-ink-50 hover:text-ink-900 transition-colors active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
