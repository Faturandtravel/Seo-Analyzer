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
      title: 'HTTP Status & SSL',
      value: statusCode,
      change: isHealthy ? '200 OK' : 'Error',
      isPositive: isHealthy,
      subtext: auditResult?.has_ssl ? 'HTTPS Enkripsi Aktif' : 'HTTP Biasa (Non-SSL)',
      progressPercent: isHealthy ? 100 : 20,
      platform: 'status',
    },
    {
      id: 'speed',
      title: 'Respon & Ukuran Payload',
      value: `${responseTime} ms`,
      change: responseTime < 400 ? 'Cepat' : 'Lambat',
      isPositive: responseTime < 500,
      subtext: `Ukuran Dokumen: ${pageSizeKb} KB`,
      progressPercent: Math.max(20, Math.min(100, Math.round(100 - responseTime / 15))),
      platform: 'speed',
    },
    {
      id: 'headings',
      title: 'Hierarki Heading (H1 & H2)',
      value: `${h1Count} H1`,
      change: h1Count === 1 ? 'Optimal' : 'Perbaiki',
      isPositive: h1Count === 1,
      subtext: h2Count > 0 ? `${h2Count} Sub-heading H2 terdeteksi` : 'Tidak ada tag H2',
      progressPercent: h1Count === 1 ? 100 : 40,
      platform: 'heading',
    },
    {
      id: 'images',
      title: 'Audit Gambar & Alt Text',
      value: `${imagesTotal} Gambar`,
      change: imagesMissing === 0 ? 'Semua Alt OK' : `${imagesMissing} Kurang Alt`,
      isPositive: imagesMissing === 0,
      subtext: imagesTotal > 0 ? `${imagesAltOk}/${imagesTotal} gambar ber-alt` : 'Tidak ada gambar',
      progressPercent: imagesTotal > 0 ? Math.round((imagesAltOk / imagesTotal) * 100) : 100,
      platform: 'image',
    },
  ];

  return (
    <div className="metrics-grid">
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
