import { ArrowUpRight, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface DailyProgressCardProps {
  progress?: number;
  onViewScoreChange?: () => void;
  statusLabel?: string;
}

export const DailyProgressCard = ({
  progress = 85,
  onViewScoreChange,
  statusLabel = 'Optimal SEO',
}: DailyProgressCardProps) => {
  const isOptimal = progress >= 80;
  const isFair = progress >= 50 && progress < 80;

  // Arc calculation for SVG circular gauge
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="vercel-card vercel-score-gauge-card">
      {/* Header */}
      <div className="vercel-card-header">
        <div className="vercel-card-title-group">
          <div className="vercel-card-icon-tag">
            <ShieldCheck size={15} />
          </div>
          <div>
            <h3 className="vercel-card-title">SEO Health Index</h3>
            <p className="vercel-card-sub">Weighted 0–100 search engine readiness</p>
          </div>
        </div>

        <button
          type="button"
          className="vercel-icon-action-btn"
          title="Inspect score breakdown"
          onClick={onViewScoreChange}
        >
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Modern Circular Vercel Gauge */}
      <div className="vercel-gauge-center">
        <div className="vercel-circle-gauge-wrapper">
          <svg className="vercel-circle-svg" width="150" height="150" viewBox="0 0 150 150">
            {/* Background Track */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              className="vercel-gauge-bg-circle"
              strokeWidth="9"
              fill="none"
            />
            {/* Active Progress Fill */}
            <circle
              cx="75"
              cy="75"
              r={radius}
              className={`vercel-gauge-active-circle ${isOptimal ? 'optimal' : isFair ? 'fair' : 'poor'}`}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform="rotate(-90 75 75)"
            />
          </svg>

          {/* Centered Big Value */}
          <div className="vercel-gauge-text-overlay">
            <span className="vercel-gauge-big-num font-mono">{progress}</span>
            <span className="vercel-gauge-denom font-mono">/100</span>
          </div>
        </div>

        <div className="vercel-gauge-status-badge">
          {isOptimal ? (
            <span className="status-pill-optimal">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>{statusLabel}</span>
            </span>
          ) : (
            <span className="status-pill-warning">
              <AlertTriangle size={13} className="text-amber-400" />
              <span>{statusLabel}</span>
            </span>
          )}
        </div>
      </div>

      {/* Breakdown mini items */}
      <div className="vercel-score-factors">
        <div className="score-factor-row">
          <span className="factor-name">Status & TLS/SSL</span>
          <span className="factor-val text-emerald-400 font-mono">100%</span>
        </div>
        <div className="score-factor-row">
          <span className="factor-name">Meta & Heading</span>
          <span className="factor-val font-mono">{progress >= 70 ? 'Passed' : 'Needs Fix'}</span>
        </div>
        <div className="score-factor-row">
          <span className="factor-name">Payload & Speed</span>
          <span className="factor-val font-mono">{progress >= 80 ? 'Fast' : 'Average'}</span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="vercel-card-footer">
        <button
          type="button"
          className="vercel-card-footer-btn"
          onClick={onViewScoreChange}
        >
          <span>View Diagnostics Log</span>
          <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
};
