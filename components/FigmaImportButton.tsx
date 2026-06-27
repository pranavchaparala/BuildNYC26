'use client';

import { useCallback } from 'react';

/**
 * Opens the Figma desktop app via its deep link. If the app isn't installed,
 * the protocol handler does nothing, so we fall back to figma.com in the browser.
 */
export function FigmaImportButton() {
  const openFigma = useCallback(() => {
    const fallback = window.setTimeout(() => {
      window.open('https://www.figma.com/files', '_blank', 'noopener,noreferrer');
    }, 1200);

    // If the app opens, the tab loses focus and we cancel the web fallback.
    const cancel = () => window.clearTimeout(fallback);
    window.addEventListener('blur', cancel, { once: true });

    window.location.href = 'figma://';
  }, []);

  return (
    <button
      type="button"
      onClick={openFigma}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md border border-ink-200 text-ink-700 bg-white hover:bg-ink-50 hover:border-ink-300 transition-colors active:scale-[0.98]"
    >
      <svg width="14" height="14" viewBox="0 0 38 57" fill="none" aria-hidden="true">
        <path d="M19 28.5a9.5 9.5 0 119.5 9.5A9.5 9.5 0 0119 28.5z" fill="#1ABCFE" />
        <path d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 11-19 0z" fill="#0ACF83" />
        <path d="M19 0v19h9.5a9.5 9.5 0 100-19H19z" fill="#FF7262" />
        <path d="M0 9.5A9.5 9.5 0 009.5 19H19V0H9.5A9.5 9.5 0 000 9.5z" fill="#F24E1E" />
        <path d="M0 28.5A9.5 9.5 0 009.5 38H19V19H9.5A9.5 9.5 0 000 28.5z" fill="#A259FF" />
      </svg>
      Import from Figma
    </button>
  );
}
