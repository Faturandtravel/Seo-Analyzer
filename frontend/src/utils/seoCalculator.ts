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
    recommendations.push(`HTTP Status ${audit.status_code}. Ensure the web server returns a 200 OK status code.`);
  }

  if (audit.response_time_ms > 500) {
    recommendations.push(`Server response time is ${audit.response_time_ms}ms. Optimize with edge caching, Brotli compression, or a global CDN.`);
  } else {
    recommendations.push(`Server response latency is excellent (${audit.response_time_ms}ms), well within Google Web Vitals targets.`);
  }

  if (!audit.title) {
    recommendations.push('Missing <title> tag! Add a concise, keyword-rich title between 30 and 60 characters.');
  }

  if (!audit.description) {
    recommendations.push('Missing meta description! Add a summary between 50 and 160 characters to optimize search snippet CTR.');
  }

  if (audit.h1_count === 0) {
    recommendations.push('No <h1> tag detected. Add exactly one H1 tag to establish the main topic of this page.');
  } else if (audit.h1_count > 1) {
    recommendations.push(`Found ${audit.h1_count} <h1> tags. It is recommended to use only 1 primary H1 heading per page.`);
  }

  if (!audit.canonical) {
    recommendations.push('Canonical tag is missing. Add <link rel="canonical" href="..."> to prevent duplicate content indexing.');
  }

  if (audit.images_missing_alt && audit.images_missing_alt > 0) {
    recommendations.push(`${audit.images_missing_alt} of ${audit.images_total} images are missing descriptive alt text.`);
  }

  if (!audit.has_viewport) {
    recommendations.push('Missing <meta name="viewport"> tag! This site may fail Google Mobile-First Indexing checks.');
  }

  if (!audit.og_image) {
    recommendations.push('Missing og:image tag. Add an Open Graph preview image for rich link shares on social networks.');
  }

  if ((audit.word_count || 0) < 150) {
    recommendations.push(`Body content is low (${audit.word_count || 0} words). Expand with useful, relevant text to avoid thin content penalties.`);
  }

  return recommendations;
}
