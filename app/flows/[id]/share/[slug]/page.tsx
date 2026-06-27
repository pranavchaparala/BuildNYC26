import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { ObservationItem } from '@/components/ObservationItem';
import type { Observation } from '@/lib/types';
import { OBSERVATION_ORDER } from '@/lib/types';

interface PageProps {
  params: { id: string; slug: string };
}

export default async function SharePage({ params }: PageProps) {
  const db = createSupabaseClient();

  // Fetch share → audit → observations + flow + screens
  const { data: share } = await db
    .from('shares')
    .select(`
      slug,
      audits(
        id,
        score,
        summary,
        version,
        status,
        observations(*),
        flows(id, name, context, screens(id, image_url, order_index))
      )
    `)
    .eq('slug', params.slug)
    .single();

  if (!share) notFound();

  const audit = share.audits as any;
  if (!audit || audit.status !== 'complete') notFound();

  const flow = audit.flows as any;

  // Verify the flow id matches the URL
  if (flow.id !== params.id) notFound();

  const observations: Observation[] = [...(audit.observations ?? [])].sort(
    (a: Observation, b: Observation) =>
      OBSERVATION_ORDER.indexOf(a.type) - OBSERVATION_ORDER.indexOf(b.type)
  );

  const topObservations = observations.slice(0, 3);
  const screens = [...(flow.screens ?? [])].sort((a: any, b: any) => a.order_index - b.order_index);
  const firstScreen = screens[0];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const ringOffset = audit.score !== null
    ? circumference - (audit.score / 100) * circumference
    : circumference;

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal nav */}
      <header className="border-b border-ink-100">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-ink-900 tracking-tight">
            <img src="/icon.png" alt="" className="w-5 h-5" />
            Loupe
          </span>
          <Link
            href="/"
            className="text-sm text-accent hover:underline"
          >
            Critique your own flow →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        {/* Flow title + meta */}
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-300 mb-2">
            Critique — Version {audit.version}
          </p>
          <h1 className="text-2xl font-semibold text-ink-900">{flow.name}</h1>
          {screens.length > 0 && (
            <p className="text-sm text-ink-400 mt-1">{screens.length} screen{screens.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-10 mb-12">
          {/* Screen preview */}
          {firstScreen && (
            <div className="shrink-0 w-32 h-[200px] rounded-xl overflow-hidden bg-ink-100 border border-ink-100">
              <img
                src={firstScreen.image_url}
                alt="First screen"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Score */}
          <div className="flex flex-col justify-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 -rotate-90" width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#F5F5F5" strokeWidth="5" />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="#6B5CE7"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="text-xl font-bold text-ink-900 z-10">{audit.score}</span>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-ink-300 mb-0.5">Craft score</p>
                <p className="text-2xl font-semibold text-ink-900">
                  {audit.score}<span className="text-base font-normal text-ink-300">/100</span>
                </p>
              </div>
            </div>

            {/* Summary */}
            {audit.summary && (
              <p className="text-ink-600 leading-relaxed max-w-md">{audit.summary}</p>
            )}
          </div>
        </div>

        {/* Top 3 observations */}
        {topObservations.length > 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-300">
              Top observations
            </p>
            {topObservations.map((obs: Observation) => (
              <ObservationItem key={obs.id} observation={obs} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-ink-100 p-8 text-center flex flex-col items-center gap-4">
          <p className="text-ink-700 font-medium">How intentional is your product flow?</p>
          <p className="text-sm text-ink-400 max-w-sm">
            Upload your screens and get an honest critique focused on craft, not errors.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-ink-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-ink-700 transition-colors"
          >
            Critique my flow →
          </Link>
        </div>
      </main>
    </div>
  );
}
