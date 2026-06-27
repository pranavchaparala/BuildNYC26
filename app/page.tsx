import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-ink-100">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-ink-900 tracking-tight">
            <img src="/icon.svg" alt="" className="w-5 h-5" />
            Loupe
          </span>
          <a
            href="/flows"
            className="text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            My flows →
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <div className="pt-28 pb-20">
          <h1 className="text-[56px] leading-[1.08] font-semibold tracking-tight text-ink-900 max-w-[680px]">
            Your designs work.
            <br />
            <span className="text-ink-300">Do they care?</span>
          </h1>

          <p className="mt-8 text-lg text-ink-400 max-w-[420px] leading-relaxed">
            Upload a product flow. Get an honest critique focused on craft, intention, and the moments where care ran out.
          </p>

          <div className="mt-10 flex items-center gap-4">
            <a
              href="/flows/new"
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-ink-700 transition-colors"
            >
              Critique my flow
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <span className="text-sm text-ink-300">No bug reports. No accessibility checklists.</span>
          </div>
        </div>

        {/* Example observation — shows what the product does before you sign up */}
        <div className="border-t border-ink-100 pt-16 pb-24">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-300 mb-8">
            What a critique looks like
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ExampleObservation
              type="wasted_moment"
              screen="Screen 3"
              body="The confirmation screen does exactly what it needs to and nothing more. There's no moment of arrival — just a checkmark and a button. The user just completed something. This is the place to make them feel it."
            />
            <ExampleObservation
              type="unconsidered"
              screen="Screen 1"
              body="The empty state copy says 'No items yet.' That's a description, not an invitation. You know what this person is about to do here. Write for them specifically."
            />
            <ExampleObservation
              type="strong"
              screen="Screen 5"
              body="The error message is written in plain language and tells the user what to do next, not what went wrong. This is rare. Protect this."
            />
          </div>
        </div>

        {/* Score example */}
        <div className="border-t border-ink-100 pt-16 pb-32">
          <div className="flex flex-col md:flex-row md:items-start gap-12">
            <div className="shrink-0">
              <ScoreExample score={71} />
            </div>
            <div className="max-w-[400px]">
              <p className="text-2xl font-semibold text-ink-900 leading-snug mb-4">
                A score that means something.
              </p>
              <p className="text-ink-400 leading-relaxed">
                Not a bug count. Not an accessibility audit. A measure of how intentional the design decisions feel — whether every moment earns its place.
              </p>
              <p className="mt-4 text-ink-400 leading-relaxed">
                Track improvement across versions. See exactly where care ran out.
              </p>
              <a
                href="/flows/new"
                className="mt-8 inline-flex items-center text-sm text-accent font-medium hover:underline"
              >
                Get your score →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ExampleObservation({
  type,
  screen,
  body,
}: {
  type: 'wasted_moment' | 'unconsidered' | 'strong';
  screen: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-ink-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Badge type={type} />
        <span className="text-xs text-ink-300 font-mono">{screen}</span>
      </div>
      <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
    </div>
  );
}

function ScoreExample({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#F5F5F5" strokeWidth="8" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="#6B5CE7"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-3xl font-semibold text-ink-900">{score}</span>
        <span className="text-sm text-ink-400">/100</span>
      </div>
    </div>
  );
}
