import { MetricCardItem } from './MetricCardItem';
import type { MetricCardData, AuditResult } from '../types';

interface MetricCardsProps {
  auditResult?: AuditResult | null;
  onCardClick?: (id: string) => void;
}

export const MetricCards = ({ auditResult, onCardClick }: MetricCardsProps) => {
  const isHealthy = !auditResult?.error && auditResult?.status_code === 200;
  const responseTime = auditResult?.response_time_ms || 134;
  const statusCode = auditResult?.status_code || 200;
  const h1Count = auditResult ? auditResult.h1_count : 1;
  const h2Count = auditResult?.h2_count || 0;

  const imagesTotal = auditResult?.images_total || 0;
  const imagesMissing = auditResult?.images_missing_alt || 0;
  const imagesAltOk = imagesTotal - imagesMissing;

  const pageSizeKb = auditResult?.page_size_bytes
    ? (auditResult.page_size_bytes / 1024).toFixed(1)
    : '45.2';

  const cardsToDisplay: MetricCardData[] = [
    {
      id: 'status',
      title: 'SERVER STATUS & SSL',
      value: `${statusCode}`,
      change: isHealthy ? '200 OK' : 'Error',
      isPositive: isHealthy,
      subtext: auditResult?.has_ssl !== false ? 'HTTPS TLS Encrypted (Secure)' : 'Insecure HTTP (No SSL)',
      progressPercent: isHealthy ? 100 : 20,
      platform: 'status',
    },
    {
      id: 'speed',
      title: 'RESPONSE TIME & TTFB',
      value: `${responseTime} ms`,
      change: responseTime < 300 ? 'Fast' : responseTime < 600 ? 'Moderate' : 'Slow',
      isPositive: responseTime < 600,
      subtext: `Payload: ${pageSizeKb} KB • Target: <300ms`,
      progressPercent: Math.max(20, Math.min(100, Math.round(100 - responseTime / 15))),
      platform: 'speed',
    },
    {
      id: 'headings',
      title: 'H1 & HEADING STRUCTURE',
      value: `${h1Count} H1`,
      change: h1Count === 1 ? '1 H1 (Optimal)' : h1Count === 0 ? 'Missing H1' : `${h1Count} H1 (Multiple)`,
      isPositive: h1Count === 1,
      subtext: h2Count > 0 ? `${h2Count} H2 subheadings found` : 'No H2 subheadings found',
      progressPercent: h1Count === 1 ? 100 : 40,
      platform: 'heading',
    },
    {
      id: 'images',
      title: 'IMAGE ALT ATTRIBUTES',
      value: `${imagesTotal} Images`,
      change: imagesMissing === 0 ? '100% Alt Tags' : `${imagesMissing} Missing Alt`,
      isPositive: imagesMissing === 0,
      subtext: imagesTotal > 0 ? `${imagesAltOk}/${imagesTotal} images with alt text` : 'No images on page',
      progressPercent: imagesTotal > 0 ? Math.round((imagesAltOk / imagesTotal) * 100) : 100,
      platform: 'image',
    },
  ];

  return (
    <div className="vercel-metrics-grid">
      {cardsToDisplay.map((card) => (
        <MetricCardItem
          key={card.id}
          card={card}
          onClick={() => onCardClick && onCardClick(card.id)}
        />
      ))}
    </div>
  );
};
