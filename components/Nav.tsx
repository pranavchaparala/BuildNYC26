import Link from 'next/link';

export function Nav() {
  return (
    <header className="border-b border-ink-100 bg-white">
      <nav className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900 tracking-tight">
          <img src="/icon.png" alt="" className="w-5 h-5" />
          Loupe
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/flows" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">
            Flows
          </Link>
          <Link href="/upload" className="text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-dark transition-colors">
            New flow
          </Link>
        </div>
      </nav>
    </header>
  );
}
