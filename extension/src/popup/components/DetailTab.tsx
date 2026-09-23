import React from 'react';
import { CheckItem } from './CheckItem';
import type { AuditResult } from '../../types';

interface DetailTabProps {
  audit: AuditResult;
}

function fmt(n: number | undefined): string {
  if (n === undefined) return '—';
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

export const DetailTab: React.FC<DetailTabProps> = ({ audit }) => {
  return (
    <div className="detail-tab">
      <section className="detail-section">
        <h4 className="detail-section-title">📄 On-Page</h4>
        <CheckItem
          label="Meta Title"
          value={audit.title ? `${audit.title.length} kar` : 'Tidak ada'}
          status={
            !audit.title ? 'critical' : audit.title.length >= 30 && audit.title.length <= 60 ? 'passed' : 'warning'
          }
          detail={audit.title || '—'}
        />
        <CheckItem
          label="Meta Description"
          value={audit.description ? `${audit.description.length} kar` : 'Tidak ada'}
          status={
            !audit.description
              ? 'critical'
              : audit.description.length >= 50 && audit.description.length <= 160
              ? 'passed'
              : 'warning'
          }
          detail={audit.description ? audit.description.substring(0, 60) + '...' : '—'}
        />
        <CheckItem
          label="H1 Tag"
          value={audit.h1_count}
          status={audit.h1_count === 1 ? 'passed' : audit.h1_count === 0 ? 'critical' : 'warning'}
          detail={audit.h1_count === 1 ? 'Optimal' : audit.h1_count === 0 ? 'Tidak ada H1!' : `${audit.h1_count} H1 ditemukan`}
        />
        <CheckItem
          label="H2 Tags"
          value={audit.h2_count}
          status={audit.h2_count > 0 ? 'passed' : 'info'}
        />
        <CheckItem
          label="H3 Tags"
          value={audit.h3_count}
          status="info"
        />
        <CheckItem
          label="Jumlah Kata"
          value={`${audit.word_count.toLocaleString()} kata`}
          status={audit.word_count >= 300 ? 'passed' : audit.word_count >= 150 ? 'warning' : 'critical'}
          detail={audit.word_count < 150 ? 'Konten terlalu tipis' : audit.word_count >= 600 ? 'Konten kaya' : 'Konten cukup'}
        />
      </section>

      <section className="detail-section">
        <h4 className="detail-section-title">⚙️ Technical</h4>
        <CheckItem
          label="HTTPS / SSL"
          value={audit.has_ssl ? 'Aktif' : 'Tidak aktif'}
          status={audit.has_ssl ? 'passed' : 'critical'}
        />
        <CheckItem
          label="Meta Viewport"
          value={audit.has_viewport ? 'Ada' : 'Tidak ada'}
          status={audit.has_viewport ? 'passed' : 'critical'}
          detail={!audit.has_viewport ? 'Mobile-first indexing akan bermasalah' : 'Mobile-friendly'}
        />
        <CheckItem
          label="Canonical Tag"
          value={audit.canonical ? 'Ada' : 'Tidak ada'}
          status={audit.canonical ? 'passed' : 'warning'}
          detail={audit.canonical ? audit.canonical.substring(0, 40) + '...' : 'Risiko duplicate content'}
        />
        <CheckItem
          label="Meta Robots"
          value={audit.robots || 'Default'}
          status={audit.robots && audit.robots.includes('noindex') ? 'critical' : 'info'}
          detail={audit.robots && audit.robots.includes('noindex') ? '⚠️ Halaman di-noindex!' : undefined}
        />
        <CheckItem
          label="Ukuran Halaman"
          value={fmt(audit.page_size_bytes)}
          status={audit.page_size_bytes > 500 * 1024 ? 'warning' : 'passed'}
          detail={audit.page_size_bytes > 500 * 1024 ? 'Pertimbangkan kompresi' : 'Ukuran optimal'}
        />
      </section>

      <section className="detail-section">
        <h4 className="detail-section-title">🖼️ Media & Links</h4>
        <CheckItem
          label="Total Gambar"
          value={audit.images_total}
          status="info"
        />
        <CheckItem
          label="Gambar Tanpa Alt"
          value={audit.images_missing_alt}
          status={
            audit.images_missing_alt === 0
              ? 'passed'
              : audit.images_missing_alt > audit.images_total / 2
              ? 'critical'
              : 'warning'
          }
          detail={audit.images_missing_alt === 0 ? 'Semua alt text lengkap' : `${audit.images_missing_alt} gambar perlu alt text`}
        />
        <CheckItem
          label="Link Internal"
          value={audit.internal_links}
          status={audit.internal_links > 0 ? 'passed' : 'warning'}
        />
        <CheckItem
          label="Link Eksternal"
          value={audit.external_links}
          status="info"
        />
      </section>

      <section className="detail-section">
        <h4 className="detail-section-title">📱 Social (Open Graph)</h4>
        <CheckItem
          label="OG Title"
          value={audit.og_title ? 'Ada' : 'Tidak ada'}
          status={audit.og_title ? 'passed' : 'warning'}
          detail={audit.og_title ? audit.og_title.substring(0, 40) : undefined}
        />
        <CheckItem
          label="OG Description"
          value={audit.og_description ? 'Ada' : 'Tidak ada'}
          status={audit.og_description ? 'passed' : 'info'}
        />
        <CheckItem
          label="OG Image"
          value={audit.og_image ? 'Ada' : 'Tidak ada'}
          status={audit.og_image ? 'passed' : 'warning'}
          detail={!audit.og_image ? 'Social preview tidak optimal' : undefined}
        />
      </section>
    </div>
  );
};
