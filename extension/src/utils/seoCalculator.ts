import type { AuditResult } from '../types';

export function calculateSeoScore(audit: AuditResult): number {
  if (audit.error || !audit.title) {
    return 10;
  }

  let score = 0;

  // 1. Status code (Max 15)
  if (audit.status_code === 200) score += 15;
  else if (audit.status_code >= 300 && audit.status_code < 400) score += 8;
  else score += 2;

  // 2. Meta Title (Max 15)
  if (audit.title && audit.title.trim().length > 0) {
    score += 8;
    const len = audit.title.trim().length;
    if (len >= 30 && len <= 60) score += 7;
    else if (len > 10 && len < 90) score += 3;
  }

  // 3. Meta Description (Max 10)
  if (audit.description && audit.description.trim().length > 0) {
    score += 6;
    const len = audit.description.trim().length;
    if (len >= 50 && len <= 160) score += 4;
    else score += 1;
  }

  // 4. Headings H1, H2 (Max 15)
  if (audit.h1_count === 1) score += 10;
  else if (audit.h1_count > 1) score += 5;
  if (audit.h2_count > 0) score += 5;

  // 5. Canonical Tag (Max 10)
  if (audit.canonical && audit.canonical.trim().length > 0) score += 10;

  // 6. Mobile Viewport (Max 10)
  if (audit.has_viewport) score += 10;

  // 7. SSL / HTTPS (Max 10)
  if (audit.has_ssl) score += 10;

  // 8. Images with Alt text (Max 10)
  if (audit.images_total === 0) {
    score += 10;
  } else {
    const altRatio = (audit.images_total - audit.images_missing_alt) / audit.images_total;
    score += Math.round(altRatio * 10);
  }

  // 9. Open Graph Social Tags (Max 5)
  if (audit.og_image || audit.og_title) score += 5;

  return Math.min(100, Math.max(10, score));
}

export function getSeoGrade(score: number): { grade: string; color: string; label: string } {
  if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Excellent' };
  if (score >= 80) return { grade: 'A', color: '#34d399', label: 'Sangat Baik' };
  if (score >= 70) return { grade: 'B', color: '#60a5fa', label: 'Baik' };
  if (score >= 55) return { grade: 'C', color: '#f59e0b', label: 'Cukup' };
  if (score >= 40) return { grade: 'D', color: '#f97316', label: 'Perlu Perbaikan' };
  return { grade: 'F', color: '#ef4444', label: 'Kritis' };
}
