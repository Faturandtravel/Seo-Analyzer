import type { AuditResult } from '../types';

export function calculateSeoScore(audit: AuditResult): number {
  if (audit.error || !audit.status_code) {
    return 10;
  }

  let score = 0;

  // 1. Status code (Max 20)
  if (audit.status_code === 200) {
    score += 20;
  } else if (audit.status_code >= 300 && audit.status_code < 400) {
    score += 10;
  } else {
    score += 2;
  }

  // 2. Response Time (Max 20)
  if (audit.response_time_ms > 0) {
    if (audit.response_time_ms <= 300) {
      score += 20;
    } else if (audit.response_time_ms <= 700) {
      score += 14;
    } else if (audit.response_time_ms <= 1500) {
      score += 8;
    } else {
      score += 3;
    }
  }

  // 3. Meta Title (Max 15)
  if (audit.title && audit.title.trim().length > 0) {
    score += 10;
    const len = audit.title.trim().length;
    if (len >= 30 && len <= 60) {
      score += 5; // ideal length
    } else if (len > 10 && len < 90) {
      score += 2;
    }
  }

  // 4. Meta Description (Max 10)
  if (audit.description && audit.description.trim().length > 0) {
    score += 7;
    const len = audit.description.trim().length;
    if (len >= 50 && len <= 160) {
      score += 3;
    } else {
      score += 1;
    }
  }

  // 5. Headings H1, H2 (Max 10)
  if (audit.h1_count === 1) {
    score += 7;
  } else if (audit.h1_count > 1) {
    score += 4;
  }
  if ((audit.h2_count || 0) > 0) {
    score += 3;
  }

  // 6. Canonical Tag (Max 5)
  if (audit.canonical && audit.canonical.trim().length > 0) {
    score += 5;
  }

  // 7. Mobile Viewport (Max 5)
  if (audit.has_viewport) {
    score += 5;
  }

  // 8. SSL / HTTPS (Max 5)
  if (audit.has_ssl) {
    score += 5;
  }

  // 9. Images with Alt text (Max 5)
  if ((audit.images_total || 0) === 0) {
    score += 5;
  } else {
    const missingAlt = audit.images_missing_alt || 0;
    const altRatio = (audit.images_total! - missingAlt) / audit.images_total!;
    score += Math.round(altRatio * 5);
  }

  // 10. Open Graph Social Tags (Max 5)
  if (audit.og_image || audit.og_title) {
    score += 5;
  }

  return Math.min(100, Math.max(15, score));
}

export function getSeoRecommendations(audit: AuditResult): string[] {
  const recommendations: string[] = [];

  if (audit.status_code !== 200) {
    recommendations.push(`HTTP Status ${audit.status_code}. Pastikan server mengembalikan 200 OK.`);
  }

  if (audit.response_time_ms > 500) {
    recommendations.push(`Response time ${audit.response_time_ms}ms. Pertimbangkan caching, kompresi Gzip/Brotli, atau CDN.`);
  } else {
    recommendations.push(`Kecepatan respon server sangat baik (${audit.response_time_ms}ms).`);
  }

  if (!audit.title) {
    recommendations.push('Tag <title> tidak ditemukan! Tambahkan judul halaman 30-60 karakter.');
  }

  if (!audit.description) {
    recommendations.push('Meta description kosong! Tambahkan ringkasan konten 50-160 karakter untuk CTR Google.');
  }

  if (audit.h1_count === 0) {
    recommendations.push('Tidak ada tag <h1>. Buat tepat 1 tag H1 sebagai judul topik utama.');
  } else if (audit.h1_count > 1) {
    recommendations.push(`Ditemukan ${audit.h1_count} tag <h1>. Direkomendasikan hanya 1 tag H1 per halaman.`);
  }

  if (!audit.canonical) {
    recommendations.push('Tag canonical belum ada. Tambahkan <link rel="canonical" href="..."> untuk cegah duplikasi konten.');
  }

  if (audit.images_missing_alt && audit.images_missing_alt > 0) {
    recommendations.push(`Ada ${audit.images_missing_alt} dari ${audit.images_total} gambar yang belum memiliki atribut alt text.`);
  }

  if (!audit.has_viewport) {
    recommendations.push('Tag <meta name="viewport"> tidak terdeteksi! Website mungkin tidak lulus uji Mobile-First Indexing Google.');
  }

  if (!audit.og_image) {
    recommendations.push('Tag og:image belum ada. Thumbnail akan kosong saat link website dibagikan di media sosial atau WhatsApp.');
  }

  if ((audit.word_count || 0) < 150) {
    recommendations.push(`Jumlah kata (${audit.word_count || 0} kata) tergolong tipis (thin content). Tambahkan konten informatif.`);
  }

  return recommendations;
}
