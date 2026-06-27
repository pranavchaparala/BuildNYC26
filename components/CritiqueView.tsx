'use client';

import { useState } from 'react';
import { ScreenStrip } from '@/components/ScreenStrip';
import { ObservationItem } from '@/components/ObservationItem';
import { ScoreTrendGraph } from '@/components/ScoreTrendGraph';
import { VersionSelector } from '@/components/VersionSelector';
import { RunAuditButton } from '@/components/RunAuditButton';
import { ShareButton } from '@/components/ShareButton';
import { RoastCard } from '@/components/RoastCard';
import type { Audit, Flow, Screen, Observation } from '@/lib/types';
import { OBSERVATION_ORDER } from '@/lib/types';

interface CritiqueViewProps {
  flow: Flow & { screens: Screen[] };
  allAudits: Pick<Audit, 'id' | 'version' | 'score' | 'status'>[];
  currentAudit: (Audit & { observations: Observation[] }) | null;
  shareSlug?: string | null;
  processingAuditId?: string | null;
  versionScores: { version: number; score: number }[];
  inline?: boolean;
}

/*
 * AUDIT REVEAL STORYBOARD
 *
 *    0ms   page arrives with skeleton placeholders
 *  200ms   score ring fills (800ms spring)
 *  500ms   score number transitions in
 *  800ms   summary paragraph fades up
 * 1100ms   observations stagger in (80ms apart)
 */
const REVEAL_TIMING = {
  scoreRing:   200,
  scoreNumber: 500,
  summary:     800,
  obsStagger:  1100,
  obsDelay:    80,
};

export function CritiqueView({
  flow,
  allAudits,
  currentAudit,
  shareSlug,
  processingAuditId,
  versionScores,
  inline = false,
}: CritiqueViewProps) {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(!!processingAuditId);
  const [revealed] = useState(!processingAuditId && !!currentAudit);

  const sortedObservations = currentAudit?.observations
    ? [...currentAudit.observations].sort(
        (a, b) => OBSERVATION_ORDER.indexOf(a.type) - OBSERVATION_ORDER.indexOf(b.type)
      )
    : [];

  function handleObservationClick(obs: Observation) {
    if (obs.screen_index !== null) setActiveScreenIndex(obs.screen_index);
  }

  const score = currentAudit?.score;
  const circumference = 2 * Math.PI * 45;
  const ringOffset =
    score !== null && score !== undefined
      ? circumference - (score / 100) * circumference
      : circumference;

  const critiqueContent = (
    <div className="flex flex-col gap-8">
      {/* Actions header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <VersionSelector
            audits={allAudits}
            currentVersion={currentAudit?.version ?? 1}
            flowId={flow.id}
          />
          {versionScores.length >= 2 && <ScoreTrendGraph versions={versionScores} />}
        </div>
        <div className="flex items-center gap-2">
          {currentAudit?.id && (
            <ShareButton auditId={currentAudit.id} flowId={flow.id} existingSlug={shareSlug} />
          )}
        </div>
      </div>

      {/* Score */}
      {isProcessing ? (
        <LoadingSkeleton />
      ) : score !== null && score !== undefined ? (
        <div
          className={revealed ? 'animate-fade-up' : ''}
          style={{ animationDelay: `${REVEAL_TIMING.scoreRing}ms` }}
        >
          <ScoreDisplay score={score} circumference={circumference} ringOffset={ringOffset} />
          {score < 40 && (
            <div className="mt-4">
              <RoastCard auditId={currentAudit!.id} existingRoast={currentAudit!.roast} />
            </div>
          )}
        </div>
      ) : null}

      {/* Summary */}
      {!isProcessing && currentAudit?.summary && (
        <div
          className="animate-fade-up"
          style={{ animationDelay: `${REVEAL_TIMING.summary}ms` }}
        >
          <p className="text-xs font-mono uppercase tracking-widest text-ink-300 mb-3">Summary</p>
          <p className="text-ink-700 leading-relaxed">{currentAudit.summary}</p>
        </div>
      )}

      {/* Observations */}
      {!isProcessing && sortedObservations.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-mono uppercase tracking-widest text-ink-300">Observations</p>
          {sortedObservations.map((obs, i) => (
            <div
              key={obs.id}
              className="animate-fade-up"
              style={{ animationDelay: `${REVEAL_TIMING.obsStagger + i * REVEAL_TIMING.obsDelay}ms` }}
            >
              <ObservationItem
                observation={obs}
                isHighlighted={obs.screen_index === activeScreenIndex}
                onClick={() => handleObservationClick(obs)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Inline mode: no screen strip, no full-height container — embeds into a card
  if (inline) {
    return critiqueContent;
  }

  // Full-screen mode: left screen strip + right critique panel
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="w-[120px] shrink-0 border-r border-ink-100 overflow-y-auto p-3 scrollbar-thin">
        <ScreenStrip
          screens={flow.screens}
          activeIndex={activeScreenIndex}
          onSelect={setActiveScreenIndex}
          isLoading={isProcessing}
        />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-8 py-8">
          {critiqueContent}
        </div>
      </div>
    </div>
  );
}

function ScoreDisplay({
  score,
  circumference,
  ringOffset,
}: {
  score: number;
  circumference: number;
  ringOffset: number;
}) {
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="38" fill="none" stroke="#F5F5F5" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="38" fill="none" stroke="#6B5CE7" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ringOffset}
            className="animate-ring-fill"
            style={{ '--ring-offset': ringOffset } as React.CSSProperties}
          />
        </svg>
        <span className="text-2xl font-bold text-ink-900 z-10">{score}</span>
      </div>
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-300 mb-1">Craft score</p>
        <p className="text-3xl font-semibold text-ink-900">
          {score}<span className="text-lg font-normal text-ink-300">/100</span>
        </p>
        <p className="text-sm text-ink-400 mt-1">
          {score >= 80
            ? 'High intentionality. Most moments earn their place.'
            : score >= 60
            ? 'Solid baseline. A few moments where care ran out.'
            : score >= 40
            ? 'Functional, but several unconsidered moments.'
            : 'Little evidence of care in the details.'}
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <div className="skeleton w-24 h-24 rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-8 w-16 rounded" />
          <div className="skeleton h-4 w-48 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-4/6 rounded" />
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-xl border border-ink-100 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="skeleton h-5 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
