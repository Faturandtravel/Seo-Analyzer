import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

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
  const totalTicks = 26;
  const activeTicksCount = Math.round((progress / 100) * totalTicks);

  return (
    <div className="dashboard-card daily-progress-card">
      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">SEO Health Score</h3>
        <button
          className="card-icon-link"
          title="Lihat Detail Audit"
          onClick={onViewScoreChange}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>

      {/* Radial Segmented Arc Gauge */}
      <div className="progress-gauge-wrapper">
        <svg viewBox="0 0 200 125" className="segmented-gauge-svg">
          {Array.from({ length: totalTicks }).map((_, index) => {
            // Arc spans from 180 degrees (left) to 0 degrees (right)
            const angleDeg = 180 - (index / (totalTicks - 1)) * 180;
            const angleRad = (angleDeg * Math.PI) / 180;

            const cx = 100;
            const cy = 105;
            const rInner = 68;
            const rOuter = 88;

            const x1 = cx + rInner * Math.cos(angleRad);
            const y1 = cy - rInner * Math.sin(angleRad);
            const x2 = cx + rOuter * Math.cos(angleRad);
            const y2 = cy - rOuter * Math.sin(angleRad);

            const isActive = index < activeTicksCount;

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? '#22c55e' : '#e2e8f0'}
                strokeWidth={4}
                strokeLinecap="round"
                className="gauge-tick"
                style={{
                  transition: 'stroke 0.4s ease',
                }}
              />
            );
          })}
        </svg>

        {/* Center Percentage Display */}
        <div className="gauge-center-content">
          <span className="gauge-number">{progress}%</span>
          <span className="gauge-sub-badge">
            <CheckCircle2 size={11} className="text-green-500" />
            <span>{statusLabel}</span>
          </span>
        </div>
      </div>

      {/* Bottom Footer Link */}
      <div className="daily-progress-footer">
        <button
          className="view-score-link"
          onClick={onViewScoreChange}
        >
          <span>View Score Breakdown</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
