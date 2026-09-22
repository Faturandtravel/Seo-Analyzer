import { GoogleIcon, SlackIcon, GmailIcon, StatusIcon, SpeedIcon, HeadingIcon, ImageIcon, LinkIcon } from './icons/BrandIcons';
import type { MetricCardData } from '../types';

interface MetricCardItemProps {
  card: MetricCardData;
  onClick?: () => void;
}

export const MetricCardItem = ({ card, onClick }: MetricCardItemProps) => {
  const renderIcon = () => {
    switch (card.platform) {
      case 'google':
        return <GoogleIcon size={22} />;
      case 'slack':
        return <SlackIcon size={22} />;
      case 'gmail':
        return <GmailIcon size={22} />;
      case 'status':
        return <StatusIcon size={22} />;
      case 'speed':
        return <SpeedIcon size={22} />;
      case 'heading':
        return <HeadingIcon size={22} />;
      case 'image':
        return <ImageIcon size={22} />;
      case 'link':
        return <LinkIcon size={22} />;
      default:
        return <GoogleIcon size={22} />;
    }
  };

  return (
    <div className="metric-card" onClick={onClick}>
      {/* Top Header with title and platform logo */}
      <div className="metric-card-header">
        <h3 className="metric-card-title">{card.title}</h3>
        <div className="metric-card-icon">{renderIcon()}</div>
      </div>

      {/* Value and Percentage Badge */}
      <div className="metric-card-body">
        <div className="metric-value-row">
          <span className="metric-value">{card.value}</span>
          <span className={`metric-badge ${card.isPositive ? 'positive' : 'negative'}`}>
            {card.change}
          </span>
        </div>

        {/* Subtext info */}
        <p className="metric-subtext">{card.subtext}</p>
      </div>

      {/* Bottom Progress Bar & Percentage */}
      <div className="metric-progress-container">
        <div className="metric-progress-track">
          <div
            className="metric-progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, card.progressPercent))}%` }}
          />
        </div>
        <span className="metric-progress-label">{card.progressPercent}%</span>
      </div>
    </div>
  );
};
