import type { AuditResult, RecommendationItem, AuditAIReport, ChatMessage } from '../types';

export const DEEPSEEK_MODEL = 'deepseek-chat';
const STORAGE_KEY = 'seo_ai_ext_deepseek_key';

export const getDeepSeekApiKey = (): string => {
  return localStorage.getItem(STORAGE_KEY) ?? '';
};

export const setDeepSeekApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * Generates a heuristic SEO audit report based on the audit data.
 * If DeepSeek API key is present, uses the live API for enhanced insights.
 */
export async function generateAuditReport(
  audit: AuditResult | null | undefined,
  forceRealApi = false
): Promise<AuditAIReport> {
  const apiKey = getDeepSeekApiKey();
  const isDeepSeekConnected = Boolean(apiKey);
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!audit) {
    return {
      url: '',
      score: 0,
      modelName: 'SEO Engine (Standby)',
      generatedAt: timeString,
      executiveSummary: 'Halaman tidak tersedia. Buka website apapun lalu klik ikon extension.',
      criticalCount: 0,
      warningCount: 0,
      passedCount: 0,
      recommendations: [],
      quickWins: [],
      isDeepSeekConnected,
    };
  }

  // Try live DeepSeek API if key is configured
  if (isDeepSeekConnected && forceRealApi) {
    try {
      const liveReport = await callDeepSeekApiForAudit(audit, apiKey);
      return liveReport;
    } catch (err) {
      console.warn('[SEO Analyzer] DeepSeek API error, falling back to heuristic:', err);
    }
  }

  // Heuristic analysis
  return buildHeuristicReport(audit, isDeepSeekConnected, timeString);
}

function buildHeuristicReport(
  audit: AuditResult,
  isDeepSeekConnected: boolean,
  timeString: string
): AuditAIReport {
  const recommendations: RecommendationItem[] = [];
  const quickWins: string[] = [];

  // 1. TITLE analysis
  if (!audit.title || audit.title.trim().length === 0) {
    recommendations.push({
      id: 'title-missing',
      priority: 'critical',
      category: 'On-Page',
      title: 'Tag <title> Tidak Ditemukan',
      description:
        'Halaman ini tidak memiliki tag title. Ini adalah elemen SEO paling dasar dan krusial untuk indexing Google.',
      impact: 'Dampak Sangat Tinggi',
      actionSnippet: '<title>Judul Halaman Utama | Nama Brand (30-60 karakter)</title>',
      reasoning:
        'Google menggunakan title tag sebagai faktor peringkat utama. Tanpa title, halaman tidak akan muncul di SERP dengan deskripsi yang relevan.',
    });
    quickWins.push('Tambahkan tag <title> yang deskriptif (30-60 karakter) di <head>');
  } else if (audit.title.trim().length < 20) {
    recommendations.push({
      id: 'title-short',
      priority: 'warning',
      category: 'On-Page',
      title: 'Title Tag Terlalu Pendek',
      description: `Title saat ini hanya ${audit.title.trim().length} karakter: "${audit.title}". Idealnya 30–60 karakter.`,
      impact: 'Dampak Tinggi',
      actionSnippet: `<title>${audit.title} | Deskripsi Brand Anda (target 30-60 karakter)</title>`,
    });
    quickWins.push('Panjangkan title tag hingga 30–60 karakter untuk optimasi SERP');
  } else if (audit.title.trim().length > 60) {
    recommendations.push({
      id: 'title-long',
      priority: 'warning',
      category: 'On-Page',
      title: 'Title Tag Terlalu Panjang',
      description: `Title saat ini ${audit.title.trim().length} karakter, melebihi batas 60 karakter. Google akan memotong title di hasil pencarian.`,
      impact: 'Dampak Sedang',
    });
  } else {
    recommendations.push({
      id: 'title-ok',
      priority: 'passed',
      category: 'On-Page',
      title: 'Title Tag Optimal',
      description: `Title "${audit.title}" (${audit.title.trim().length} karakter) berada dalam rentang ideal 30–60 karakter.`,
      impact: 'Status Optimal',
    });
  }

  // 2. META DESCRIPTION
  if (!audit.description || audit.description.trim().length === 0) {
    recommendations.push({
      id: 'desc-missing',
      priority: 'critical',
      category: 'On-Page',
      title: 'Meta Description Tidak Ada',
      description:
        'Halaman tidak memiliki meta description. Google mungkin mengambil teks acak dari halaman sebagai snippet yang tidak relevan.',
      impact: 'Dampak Tinggi',
      actionSnippet:
        '<meta name="description" content="Deskripsi halaman Anda yang menarik, mengandung keyword utama, 50-160 karakter." />',
      reasoning:
        'Meta description mempengaruhi Click-Through Rate (CTR) di SERP. Deskripsi yang baik meningkatkan organik traffic hingga 30%.',
    });
    quickWins.push('Tambahkan meta description (50-160 karakter) yang mengandung keyword target');
  } else if (audit.description.trim().length < 50 || audit.description.trim().length > 160) {
    recommendations.push({
      id: 'desc-length',
      priority: 'warning',
      category: 'On-Page',
      title: 'Panjang Meta Description Tidak Ideal',
      description: `Meta description saat ini ${audit.description.trim().length} karakter. Idealnya 50–160 karakter untuk tampilan SERP optimal.`,
      impact: 'Dampak Sedang',
    });
  } else {
    recommendations.push({
      id: 'desc-ok',
      priority: 'passed',
      category: 'On-Page',
      title: 'Meta Description Optimal',
      description: `Meta description (${audit.description.trim().length} karakter) berada dalam rentang ideal.`,
      impact: 'Status Optimal',
    });
  }

  // 3. H1 TAG
  if (audit.h1_count === 0) {
    recommendations.push({
      id: 'h1-missing',
      priority: 'critical',
      category: 'On-Page',
      title: 'Tag H1 Tidak Ditemukan',
      description:
        'Halaman tidak memiliki tag H1. H1 adalah signal terkuat untuk memberitahu Google tentang topik utama halaman.',
      impact: 'Dampak Sangat Tinggi',
      actionSnippet: '<h1>Judul Utama Halaman Yang Mengandung Keyword Primer</h1>',
    });
    quickWins.push('Tambahkan satu tag H1 yang mengandung keyword utama halaman');
  } else if (audit.h1_count > 1) {
    recommendations.push({
      id: 'h1-multiple',
      priority: 'warning',
      category: 'On-Page',
      title: `${audit.h1_count} Tag H1 Terdeteksi`,
      description:
        'Penggunaan lebih dari satu H1 memperlemah sinyal relevansi topik. Gunakan tepat 1 H1 per halaman.',
      impact: 'Dampak Sedang',
    });
  } else {
    recommendations.push({
      id: 'h1-ok',
      priority: 'passed',
      category: 'On-Page',
      title: 'Struktur H1 Optimal',
      description: 'Tepat 1 tag H1 ditemukan — struktur heading yang sempurna untuk SEO.',
      impact: 'Status Optimal',
    });
  }

  // 4. CANONICAL
  if (!audit.canonical) {
    recommendations.push({
      id: 'canonical-missing',
      priority: 'warning',
      category: 'Technical',
      title: 'Canonical Tag Tidak Ada',
      description:
        'Tanpa canonical tag, Google mungkin mengindeks URL duplikat (dengan/tanpa www, dengan parameter query string) yang memecah link equity.',
      impact: 'Dampak Sedang',
      actionSnippet: `<link rel="canonical" href="${audit.url}" />`,
    });
    quickWins.push('Tambahkan tag canonical untuk mencegah duplicate content issues');
  } else {
    recommendations.push({
      id: 'canonical-ok',
      priority: 'passed',
      category: 'Technical',
      title: 'Canonical Tag Tersedia',
      description: `Canonical tag mengarah ke: ${audit.canonical}`,
      impact: 'Status Optimal',
    });
  }

  // 5. VIEWPORT (MOBILE)
  if (!audit.has_viewport) {
    recommendations.push({
      id: 'viewport-missing',
      priority: 'critical',
      category: 'Technical',
      title: 'Meta Viewport Tidak Ada — Mobile Broken',
      description:
        'Halaman tidak memiliki meta viewport. Google menggunakan Mobile-First Indexing, sehingga ini berdampak sangat besar pada peringkat.',
      impact: 'Dampak Kritis',
      actionSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    });
    quickWins.push('Tambahkan meta viewport untuk mobile-first indexing Google');
  } else {
    recommendations.push({
      id: 'viewport-ok',
      priority: 'passed',
      category: 'Technical',
      title: 'Mobile Viewport Tersedia',
      description: 'Meta viewport dikonfigurasi — halaman mobile-friendly.',
      impact: 'Status Optimal',
    });
  }

  // 6. SSL
  if (!audit.has_ssl) {
    recommendations.push({
      id: 'ssl-missing',
      priority: 'critical',
      category: 'Technical',
      title: 'HTTPS / SSL Tidak Aktif',
      description:
        'Halaman berjalan di HTTP. Chrome menandai ini sebagai "Not Secure" dan Google menggunakan HTTPS sebagai faktor peringkat.',
      impact: 'Dampak Sangat Tinggi',
    });
  } else {
    recommendations.push({
      id: 'ssl-ok',
      priority: 'passed',
      category: 'Technical',
      title: 'HTTPS / SSL Aktif',
      description: 'Koneksi terenkripsi HTTPS — sinyal kepercayaan yang kuat untuk Google.',
      impact: 'Status Optimal',
    });
  }

  // 7. IMAGES ALT TEXT
  if (audit.images_missing_alt > 0) {
    const pct = Math.round((audit.images_missing_alt / audit.images_total) * 100);
    const severity = pct > 50 ? 'critical' : 'warning';
    recommendations.push({
      id: 'images-alt',
      priority: severity,
      category: 'Content',
      title: `${audit.images_missing_alt} Gambar Tanpa Alt Text (${pct}%)`,
      description: `${audit.images_missing_alt} dari ${audit.images_total} gambar tidak memiliki atribut alt. Alt text membantu Google Images indexing dan aksesibilitas.`,
      impact: pct > 50 ? 'Dampak Tinggi' : 'Dampak Sedang',
      actionSnippet: '<img src="foto.jpg" alt="Deskripsi gambar yang informatif dan mengandung keyword" />',
    });
    if (pct > 30) quickWins.push(`Tambahkan alt text pada ${audit.images_missing_alt} gambar yang belum memilikinya`);
  } else if (audit.images_total > 0) {
    recommendations.push({
      id: 'images-ok',
      priority: 'passed',
      category: 'Content',
      title: 'Semua Gambar Memiliki Alt Text',
      description: `Semua ${audit.images_total} gambar memiliki atribut alt — optimal untuk aksesibilitas dan SEO gambar.`,
      impact: 'Status Optimal',
    });
  }

  // 8. OPEN GRAPH
  if (!audit.og_title && !audit.og_image) {
    recommendations.push({
      id: 'og-missing',
      priority: 'warning',
      category: 'Social',
      title: 'Open Graph Tags Tidak Ada',
      description:
        'Tanpa OG tags, link share di Facebook, Twitter/X, WhatsApp, dan LinkedIn tidak akan memiliki preview yang menarik.',
      impact: 'Dampak Sedang',
      actionSnippet: `<meta property="og:title" content="${audit.title || 'Judul Halaman'}" />\n<meta property="og:description" content="${audit.description || 'Deskripsi halaman'}" />\n<meta property="og:image" content="https://domain.com/og-image.jpg" />\n<meta property="og:url" content="${audit.url}" />`,
    });
    quickWins.push('Tambahkan Open Graph tags untuk tampilan link share yang profesional di sosial media');
  } else if (audit.og_title && audit.og_image) {
    recommendations.push({
      id: 'og-ok',
      priority: 'passed',
      category: 'Social',
      title: 'Open Graph Tags Lengkap',
      description: 'OG title dan OG image tersedia — link share di sosial media akan tampil optimal.',
      impact: 'Status Optimal',
    });
  } else {
    recommendations.push({
      id: 'og-partial',
      priority: 'warning',
      category: 'Social',
      title: 'Open Graph Tidak Lengkap',
      description: `${!audit.og_title ? 'og:title ' : ''}${!audit.og_image ? 'og:image ' : ''}belum dikonfigurasi.`,
      impact: 'Dampak Rendah',
    });
  }

  // 9. WORD COUNT
  if (audit.word_count < 150) {
    recommendations.push({
      id: 'wordcount-thin',
      priority: 'warning',
      category: 'Content',
      title: `Konten Tipis — Hanya ${audit.word_count} Kata`,
      description:
        'Halaman dengan konten kurang dari 150 kata berisiko mendapat "thin content penalty" dari Google. Perkaya dengan konten yang bernilai.',
      impact: 'Dampak Sedang',
    });
  } else if (audit.word_count >= 600) {
    recommendations.push({
      id: 'wordcount-rich',
      priority: 'passed',
      category: 'Content',
      title: `Konten Kaya — ${audit.word_count.toLocaleString()} Kata`,
      description: 'Jumlah kata menunjukkan konten yang substansial dan potensial untuk peringkat tinggi.',
      impact: 'Status Optimal',
    });
  }

  // 10. H2 structure
  if (audit.h2_count === 0 && audit.h1_count > 0) {
    recommendations.push({
      id: 'h2-missing',
      priority: 'info',
      category: 'On-Page',
      title: 'Tidak Ada Sub-Heading H2',
      description:
        'Tambahkan tag H2 untuk memecah konten panjang dan membantu crawler memahami hierarki konten halaman.',
      impact: 'Dampak Rendah',
    });
  }

  const criticalCount = recommendations.filter((r) => r.priority === 'critical').length;
  const warningCount = recommendations.filter((r) => r.priority === 'warning').length;
  const passedCount = recommendations.filter((r) => r.priority === 'passed').length;

  // Build executive summary
  let executiveSummary: string;
  if (criticalCount >= 3) {
    executiveSummary = `Audit menemukan ${criticalCount} masalah kritis yang perlu segera diperbaiki. Halaman ini memiliki fundamental SEO yang perlu dibangun dari awal. Fokus pada title, meta description, dan heading structure terlebih dahulu.`;
  } else if (criticalCount > 0) {
    executiveSummary = `Ditemukan ${criticalCount} isu kritis dan ${warningCount} peringatan. Selesaikan isu kritis lebih dahulu untuk perbaikan peringkat yang signifikan. ${passedCount} parameter SEO sudah optimal.`;
  } else if (warningCount > 0) {
    executiveSummary = `Fondasi SEO cukup solid dengan ${passedCount} parameter optimal. Terdapat ${warningCount} area yang bisa ditingkatkan untuk mendorong peringkat lebih tinggi di Google SERP.`;
  } else {
    executiveSummary = `Halaman ini memiliki implementasi SEO yang sangat baik! Semua ${passedCount} parameter teknis SEO sudah optimal. Pertahankan kualitas konten dan monitor Core Web Vitals secara berkala.`;
  }

  return {
    url: audit.url,
    score: 0, // Will be set by caller using seoCalculator
    modelName: isDeepSeekConnected ? `DeepSeek (${DEEPSEEK_MODEL})` : 'SEO Heuristik Engine',
    generatedAt: timeString,
    executiveSummary,
    criticalCount,
    warningCount,
    passedCount,
    recommendations,
    quickWins: quickWins.slice(0, 4),
    isDeepSeekConnected,
  };
}

async function callDeepSeekApiForAudit(audit: AuditResult, apiKey: string): Promise<AuditAIReport> {
  const prompt = `Kamu adalah ahli SEO senior. Analisis data audit SEO berikut dan berikan laporan JSON terstruktur.

Data Audit:
URL: ${audit.url}
Title: "${audit.title}" (${audit.title?.length || 0} karakter)
Meta Description: "${audit.description}" (${audit.description?.length || 0} karakter)
H1 Count: ${audit.h1_count}
H2 Count: ${audit.h2_count}
H3 Count: ${audit.h3_count}
Canonical: ${audit.canonical || 'Tidak ada'}
Robots: ${audit.robots || 'Tidak ada'}
Has Viewport: ${audit.has_viewport}
Has SSL: ${audit.has_ssl}
Images Total: ${audit.images_total}, Missing Alt: ${audit.images_missing_alt}
OG Title: ${audit.og_title || 'Tidak ada'}
OG Image: ${audit.og_image ? 'Ada' : 'Tidak ada'}
Word Count: ${audit.word_count}
Internal Links: ${audit.internal_links}
External Links: ${audit.external_links}

Berikan analisis mendalam dalam format JSON dengan field:
- executiveSummary: string (2-3 kalimat ringkasan insight kritis)
- recommendations: array of {id, priority (critical|warning|passed|info), category (On-Page|Technical|Social|Content|Performance), title, description, impact, actionSnippet?, reasoning?}
- quickWins: string[] (max 4, perbaikan paling mudah dan berdampak tinggi)

Berikan respons HANYA JSON, tanpa markdown atau teks lain.`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid DeepSeek response format');

  const parsed = JSON.parse(jsonMatch[0]);
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    url: audit.url,
    score: 0,
    modelName: `DeepSeek (${DEEPSEEK_MODEL})`,
    generatedAt: now,
    executiveSummary: parsed.executiveSummary ?? '',
    criticalCount: (parsed.recommendations ?? []).filter((r: RecommendationItem) => r.priority === 'critical').length,
    warningCount: (parsed.recommendations ?? []).filter((r: RecommendationItem) => r.priority === 'warning').length,
    passedCount: (parsed.recommendations ?? []).filter((r: RecommendationItem) => r.priority === 'passed').length,
    recommendations: parsed.recommendations ?? [],
    quickWins: parsed.quickWins ?? [],
    isDeepSeekConnected: true,
  };
}

export async function askDeepSeekCopilot(
  userMessage: string,
  auditResult: AuditResult | null | undefined,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = getDeepSeekApiKey();

  const contextBlock = auditResult
    ? `Konteks halaman aktif yang sedang diaudit:
URL: ${auditResult.url}
Title: "${auditResult.title}"
Skor SEO: ${auditResult.score ?? '?'}/100
H1: ${auditResult.h1_count}, H2: ${auditResult.h2_count}
SSL: ${auditResult.has_ssl ? 'Ya' : 'Tidak'}, Viewport: ${auditResult.has_viewport ? 'Ya' : 'Tidak'}
Meta Description: ${auditResult.description ? 'Ada' : 'Tidak ada'}
Canonical: ${auditResult.canonical ? 'Ada' : 'Tidak ada'}
Images: ${auditResult.images_total} total, ${auditResult.images_missing_alt} tanpa alt`
    : 'Tidak ada halaman aktif yang diaudit saat ini.';

  if (!apiKey) {
    // Fallback local response
    return generateLocalChatResponse(userMessage, auditResult);
  }

  const messages = [
    {
      role: 'system',
      content: `Kamu adalah konsultan SEO ahli yang memberikan saran teknis spesifik, actionable, dan berbasis data. Selalu berikan contoh kode HTML/implementasi ketika relevan. Jawab dalam Bahasa Indonesia yang profesional namun mudah dipahami.\n\n${contextBlock}`,
    },
    ...history.slice(-6).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'Tidak ada respons dari AI.';
}

function generateLocalChatResponse(question: string, audit: AuditResult | null | undefined): string {
  const q = question.toLowerCase();

  if (!audit) {
    return 'Saya membutuhkan data audit halaman untuk memberikan saran spesifik. Buka halaman website apapun dan klik extension untuk menganalisis.';
  }

  if (q.includes('title') || q.includes('judul')) {
    if (!audit.title) return 'Halaman ini tidak memiliki title tag! Tambahkan segera: `<title>Judul Halaman | Brand</title>` di dalam `<head>`. Ini adalah faktor SEO paling dasar.';
    if (audit.title.length > 60) return `Title "${audit.title}" terlalu panjang (${audit.title.length} karakter). Pangkas hingga 50-60 karakter agar tidak terpotong di Google SERP.`;
    return `Title "${audit.title}" (${audit.title.length} karakter) sudah dalam rentang optimal. Pastikan mengandung keyword primer di awal judul.`;
  }

  if (q.includes('description') || q.includes('deskripsi')) {
    if (!audit.description) return 'Tidak ada meta description! Tambahkan: `<meta name="description" content="Deskripsi 50-160 karakter mengandung keyword dan CTA." />`. Ini meningkatkan CTR di Google.';
    return `Meta description ada (${audit.description.length} karakter). ${audit.description.length > 160 ? 'Terlalu panjang, pangkas hingga 160 karakter.' : 'Panjang sudah optimal.'}`;
  }

  if (q.includes('skor') || q.includes('score')) {
    return `Skor SEO halaman ini adalah ${audit.score ?? '?'}/100. ${audit.score && audit.score >= 80 ? 'Bagus! Pertahankan dan fokus pada Core Web Vitals.' : 'Ada ruang peningkatan. Lihat tab Rekomendasi untuk action plan prioritas tinggi.'}`;
  }

  if (q.includes('gambar') || q.includes('image') || q.includes('alt')) {
    if (audit.images_missing_alt > 0) return `${audit.images_missing_alt} gambar tanpa alt text. Tambahkan atribut alt deskriptif: \`<img src="..." alt="Deskripsi spesifik gambar mengandung keyword" />\`. Ini penting untuk Google Images dan aksesibilitas.`;
    return `Semua ${audit.images_total} gambar memiliki alt text. Pastikan alt text deskriptif dan mengandung keyword relevan.`;
  }

  if (q.includes('ssl') || q.includes('https')) {
    return audit.has_ssl
      ? 'Halaman menggunakan HTTPS — bagus! SSL adalah faktor peringkat Google dan membangun kepercayaan pengguna.'
      : 'Halaman menggunakan HTTP! Migrate ke HTTPS segera. SSL gratis tersedia via Let\'s Encrypt. Google memprioritaskan situs HTTPS di peringkat pencarian.';
  }

  if (q.includes('h1') || q.includes('heading')) {
    if (audit.h1_count === 0) return 'Tidak ada H1! Tambahkan tepat 1 tag H1 yang mengandung keyword utama halaman. Contoh: `<h1>Jual Kamera DSLR Murah di Jakarta</h1>`';
    if (audit.h1_count > 1) return `Ada ${audit.h1_count} H1! Gunakan hanya 1 H1 per halaman. Ubah H1 tambahan menjadi H2 atau H3 untuk hierarki konten yang tepat.`;
    return 'H1 sudah optimal (tepat 1). Pastikan H1 mengandung keyword utama dan berbeda dari title tag.';
  }

  return `Untuk pertanyaan "${question}", saya perlu API key DeepSeek untuk memberikan analisis yang lebih mendalam. Konfigurasi API key di tab Pengaturan, atau tanyakan hal spesifik seperti title, description, H1, images, atau SSL untuk saran langsung dari data halaman ini.`;
}
