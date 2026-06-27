interface VersionScore {
  version: number;
  score: number;
}

interface ScoreTrendGraphProps {
  versions: VersionScore[];
}

export function ScoreTrendGraph({ versions }: ScoreTrendGraphProps) {
  if (versions.length < 2) return null;

  const W = 200;
  const H = 60;
  const PADDING = { x: 8, y: 6 };

  const minScore = Math.min(...versions.map(v => v.score));
  const maxScore = Math.max(...versions.map(v => v.score));
  const scoreRange = Math.max(maxScore - minScore, 20); // min 20pt range for legibility

  const toX = (i: number) =>
    PADDING.x + (i / (versions.length - 1)) * (W - PADDING.x * 2);

  const toY = (score: number) =>
    H - PADDING.y - ((score - (minScore - scoreRange * 0.1)) / (scoreRange * 1.2)) * (H - PADDING.y * 2);

  const points = versions.map((v, i) => ({ x: toX(i), y: toY(v.score), ...v }));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const isUp = latest.score >= previous.score;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-300">Score trend</p>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
      >
        {/* Grid line at 50 */}
        <line
          x1={PADDING.x}
          y1={toY(50)}
          x2={W - PADDING.x}
          y2={toY(50)}
          stroke="#F5F5F5"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={isUp ? '#22C55E' : '#EF4444'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={isUp ? '#22C55E' : '#EF4444'} />
            <title>v{p.version}: {p.score}/100</title>
          </g>
        ))}

        {/* Version labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={H - 1}
            textAnchor="middle"
            className="fill-ink-300"
            style={{ fontSize: 9, fontFamily: 'ui-monospace' }}
          >
            v{p.version}
          </text>
        ))}
      </svg>
    </div>
  );
}
