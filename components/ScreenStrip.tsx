'use client';

import type { Screen } from '@/lib/types';

interface ScreenStripProps {
  screens: Screen[];
  activeIndex: number;
  onSelect: (index: number) => void;
  isLoading?: boolean;
}

export function ScreenStrip({ screens, activeIndex, onSelect, isLoading }: ScreenStripProps) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto scrollbar-thin pr-1">
      {/* Loading: scan bar over greyscale thumbnails */}
      {isLoading && (
        <div className="text-xs text-ink-400 text-center py-2 font-mono">Reviewing…</div>
      )}

      {screens
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((screen, i) => (
          <button
            key={screen.id}
            type="button"
            onClick={() => onSelect(i)}
            className={[
              'relative w-full aspect-[9/16] rounded-lg overflow-hidden border-2 shrink-0 transition-all duration-150',
              'screen-thumb',
              activeIndex === i ? 'is-active border-accent' : 'border-transparent hover:border-ink-200',
              isLoading ? 'grayscale' : '',
            ].join(' ')}
          >
            <img
              src={screen.image_url}
              alt={`Screen ${i + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Scan bar overlay during loading */}
            {isLoading && i === 0 && (
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-scan"
                />
              </div>
            )}

            {/* Index badge */}
            <div className="absolute bottom-1 left-1 text-[9px] font-mono bg-black/60 text-white rounded px-1 py-0.5">
              {i + 1}
            </div>
          </button>
        ))}
    </div>
  );
}
