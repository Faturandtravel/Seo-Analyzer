import { Globe, Zap, Type, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import type { MetricCardData } from '../types';

interface MetricCardItemProps {
  card: MetricCardData;
  onClick?: () => void;
}

export const MetricCardItem = ({ card, onClick }: MetricCardItemProps) => {
  const renderIcon = () => {
    switch (card.platform) {
      case 'status':
        return <ShieldCheck size={16} className="text-zinc-400" />;
      case 'speed':
        return <Zap size={16} className="text-zinc-400" />;
      case 'heading':
        return <Type size={16} className="text-zinc-400" />;
      case 'image':
        return <ImageIcon size={16} className="text-zinc-400" />;
      default:
        return <Globe size={16} className="text-zinc-400" />;
    }
  };

  return (
    <div className="vercel-metric-card" onClick={onClick} role="button" tabIndex={0}>
      {/* Top Header */}
      <div className="vercel-metric-header">
        <span className="vercel-metric-label">{card.title}</span>
        <div className="vercel-metric-icon-box">{renderIcon()}</div>
      </div>

      {/* Main Metric Value & Status Pill */}
      <div className="vercel-metric-main">
        <div className="vercel-metric-value-row">
          <span className="vercel-metric-val font-mono">{card.value}</span>
          <span className={`vercel-metric-pill ${card.isPositive ? 'good' : 'warning'}`}>
            <span className={`vercel-dot ${card.isPositive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{card.change}</span>
          </span>
        </div>

        <p className="vercel-metric-subtext">{card.subtext}</p>
      </div>

      {/* Vercel Micro Progress Track */}
      <div className="vercel-metric-footer">
        <div className="vercel-metric-track">
          <div
            className={`vercel-metric-fill ${card.isPositive ? 'good' : 'warning'}`}
            style={{ width: `${Math.min(100, Math.max(0, card.progressPercent))}%` }}
          />
        </div>
        <span className="vercel-metric-percent font-mono">{card.progressPercent}%</span>
      </div>
    </div>
  );
};
