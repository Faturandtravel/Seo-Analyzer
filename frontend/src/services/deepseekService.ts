import type { AuditResult, ChatMessage } from '../types';

export interface RecommendationItem {
  id: string;
  priority: 'critical' | 'warning' | 'info' | 'passed';
  category: 'On-Page' | 'Performance' | 'Technical' | 'Social' | 'Content';
  title: string;
  description: string;
  impact: string;
  actionSnippet?: string;
  reasoning?: string;
}

export interface AuditAIReport {
  url: string;
  score: number;
  modelName: string;
  generatedAt: string;
  executiveSummary: string;
  criticalCount: number;
  warningCount: number;
  passedCount: number;
  recommendations: RecommendationItem[];
  quickWins: string[];
  isDeepSeekConnected: boolean;
}

const STORAGE_KEY = 'seo_deepseek_api_key';
export const DEEPSEEK_MODEL = 'deepseek-chat';

export const getDeepSeekApiKey = (): string => {
  return (
    localStorage.getItem(STORAGE_KEY) ||
    import.meta.env.VITE_DEEPSEEK_API_KEY ||
    ''
  );
};

export const setDeepSeekApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

/**
 * Membangun Laporan Rekomendasi Audit Terstruktur.
 * Jika API Key DeepSeek tersedia, dapat memanggil endpoint DeepSeek completions.
 * Jika belum, menghasilkan analisis heuristik cerdas berbasis auditResult.
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
      modelName: 'DeepSeek-V3 (Standby)',
      generatedAt: timeString,
      executiveSummary: 'Belum ada website yang diaudit. Masukkan URL target untuk menghasilkan laporan rekomendasi audit komprehensif.',
      criticalCount: 0,
      warningCount: 0,
      passedCount: 0,
      recommendations: [],
      quickWins: [],
      isDeepSeekConnected,
    };
  }

  // Jika user sudah mengisi API Key dan meminta live API call
  if (isDeepSeekConnected && forceRealApi) {
    try {
      const liveReport = await callDeepSeekApiForAudit(audit, apiKey);
      if (liveReport) return liveReport;
    } catch (err) {
      console.warn('Gagal memanggil DeepSeek API secara langsung, beralih ke analisis lokal terstruktur:', err);
    }
  }

  // Analisis lokal terstruktur siap saji (High-grade heuristic report generator)
  const recommendations: RecommendationItem[] = [];
  const quickWins: string[] = [];

  // 1. HTTP Status & Server
  if (audit.status_code !== 200) {
    recommendations.push({
      id: 'http-status',
      priority: 'critical',
      category: 'Technical',
      title: `Respons Server Tidak Normal (HTTP ${audit.status_code})`,
      description: `Server mengembalikan status HTTP ${audit.status_code}. Mesin perayap Google membutuhkan kode status 200 OK untuk mengindeks halaman dengan benar.`,
      impact: 'Kritis (+20 Poin)',
      actionSnippet: `// Pastikan server web / routing mengembalikan status 200 OK\n// Periksa konfigurasi Nginx / Apache / Cloudflare untuk URL: ${audit.url}`,
      reasoning: 'Halaman dengan kode selain 200 berisiko didrop dari indeks Google atau ditandai sebagai URL rusak.',
    });
  } else {
    recommendations.push({
      id: 'http-status-ok',
      priority: 'passed',
      category: 'Technical',
      title: 'HTTP Status 200 OK',
      description: 'Halaman dapat diakses publik dengan kode status berhasil 200 OK.',
      impact: 'Optimal',
      reasoning: 'Memenuhi standar perayapan crawler Googlebot.',
    });
  }

  // 2. Latency / TTFB Speed
  if (audit.response_time_ms > 700) {
    recommendations.push({
      id: 'ttfb-high',
      priority: 'critical',
      category: 'Performance',
      title: `Waktu Respons Server Lambat (${audit.response_time_ms}ms)`,
      description: `Waktu respons server melebihi ambang batas rekomendasi Core Web Vitals (maksimal <300ms). Latensi tinggi menyebabkan bounce rate meningkat.`,
      impact: '+12 - 15 Poin',
      actionSnippet: `# Rekomendasi Optimasi Header:\nCache-Control: public, max-age=31536000, immutable\nContent-Encoding: br (Brotli compression)`,
      reasoning: 'Google menetapkan performa server (TTFB) sebagai faktor peringkat UX langsung pada Core Web Vitals.',
    });
  } else if (audit.response_time_ms > 300) {
    recommendations.push({
      id: 'ttfb-med',
      priority: 'warning',
      category: 'Performance',
      title: `Optimalkan Kecepatan Respons Server (${audit.response_time_ms}ms)`,
      description: 'Waktu respons masih cukup dapat diterima namun berpeluang dipercepat dengan Edge CDN caching atau kompresi Brotli.',
      impact: '+5 Poin',
      actionSnippet: `// Aktifkan Cloudflare Edge Caching atau Vercel Edge Middleware`,
      reasoning: 'TTFB di bawah 200ms memaksimalkan alokasi crawl budget Google.',
    });
  } else {
    recommendations.push({
      id: 'ttfb-fast',
      priority: 'passed',
      category: 'Performance',
      title: `Kecepatan Server Sangat Cepat (${audit.response_time_ms}ms)`,
      description: 'Respons server sangat prima dan berada di standar teratas Core Web Vitals.',
      impact: 'Optimal',
    });
  }

  // 3. Meta Title
  const titleLen = audit.title?.trim().length || 0;
  if (!audit.title || titleLen === 0) {
    recommendations.push({
      id: 'title-missing',
      priority: 'critical',
      category: 'On-Page',
      title: 'Tag <title> Tidak Ditemukan',
      description: 'Halaman ini tidak memiliki tag title di dalam elemen <head>. Ini adalah elemen On-Page SEO terpenting.',
      impact: 'Kritis (+15 Poin)',
      actionSnippet: `<title>${getCleanDomain(audit.url)} | Solusi Terbaik & Terpercaya</title>`,
      reasoning: 'Judul halaman adalah faktor terkuat dalam penentuan kata kunci dan snippet hasil pencarian Google (SERP).',
    });
    quickWins.push('Tambahkan tag <title> deskriptif (30-60 karakter)');
  } else if (titleLen < 30) {
    recommendations.push({
      id: 'title-short',
      priority: 'warning',
      category: 'On-Page',
      title: `Tag <title> Terlalu Pendek (${titleLen} karakter)`,
      description: `Judul "${audit.title}" masih di bawah panjang ideal (30 - 60 karakter). Tambahkan kata kunci utama dan branding.`,
      impact: '+5 Poin',
      actionSnippet: `<title>${audit.title} - Layanan Profesional & Terpercaya</title>`,
      reasoning: 'Title yang terlalu ringkas mengurangi potensi peringkat pada pencarian long-tail.',
    });
  } else if (titleLen > 65) {
    recommendations.push({
      id: 'title-long',
      priority: 'warning',
      category: 'On-Page',
      title: `Tag <title> Berisiko Terpotong di Google (${titleLen} karakter)`,
      description: `Judul melebihi 60 karakter dan berpotensi terpotong tanda elipsis (...) pada layar smartphone atau Google SERP desktop.`,
      impact: '+3 Poin CTR',
      actionSnippet: `<title>${audit.title.slice(0, 58)}...</title>`,
      reasoning: 'Google membatasi tampilan lebar judul sekitar 580 pixel (~60 karakter).',
    });
  } else {
    recommendations.push({
      id: 'title-passed',
      priority: 'passed',
      category: 'On-Page',
      title: `Tag <title> Optimal (${titleLen} karakter)`,
      description: `"${audit.title}" memiliki panjang ideal untuk keterbacaan di hasil pencarian.`,
      impact: 'Optimal',
    });
  }

  // 4. Meta Description
  const descLen = audit.description?.trim().length || 0;
  if (!audit.description || descLen === 0) {
    recommendations.push({
      id: 'desc-missing',
      priority: 'critical',
      category: 'On-Page',
      title: 'Meta Description Tidak Ditemukan',
      description: 'Halaman tidak menyediakan ringkasan meta description. Google akan mengambil teks acak dari konten halaman.',
      impact: 'Kritis (+10 Poin)',
      actionSnippet: `<meta name="description" content="Temukan solusi lengkap di ${getCleanDomain(audit.url)}. Kami menyediakan panduan, layanan berkualitas tinggi, dan dukungan 24/7." />`,
      reasoning: 'Meta description yang menarik meningkatkan Click-Through Rate (CTR) organik hingga 30%.',
    });
    quickWins.push('Sematkan meta description sepanjang 120-155 karakter');
  } else if (descLen < 50) {
    recommendations.push({
      id: 'desc-short',
      priority: 'warning',
      category: 'On-Page',
      title: `Meta Description Terlalu Pendek (${descLen} karakter)`,
      description: 'Deskripsi saat ini belum memanfaatkan batas optimal 120-155 karakter untuk menyertakan Call to Action (CTA).',
      impact: '+3 Poin',
      actionSnippet: `<meta name="description" content="${audit.description} Dapatkan informasi lengkap dan hubungi kami hari ini!" />`,
    });
  } else {
    recommendations.push({
      id: 'desc-passed',
      priority: 'passed',
      category: 'On-Page',
      title: `Meta Description Terverifikasi (${descLen} karakter)`,
      description: 'Deskripsi meta telah terkonfigurasi dengan baik untuk cuplikan pencarian.',
      impact: 'Optimal',
    });
  }

  // 5. Heading Structure (H1)
  if (audit.h1_count === 0) {
    recommendations.push({
      id: 'h1-missing',
      priority: 'critical',
      category: 'On-Page',
      title: 'Tag Heading <h1> Tidak Ditemukan',
      description: 'Tidak ada elemen <h1> pada halaman. Tag H1 berfungsi sebagai topik utama halaman bagi mesin pencari.',
      impact: 'Kritis (+8 Poin)',
      actionSnippet: `<h1>Selamat Datang di ${getCleanDomain(audit.url)} - Solusi Terdepan</h1>`,
      reasoning: 'Struktur hierarki heading wajib memiliki tepat satu H1 di bagian atas konten utama.',
    });
    quickWins.push('Pasang tepat satu tag <h1> di awal konten');
  } else if (audit.h1_count > 1) {
    recommendations.push({
      id: 'h1-multiple',
      priority: 'warning',
      category: 'On-Page',
      title: `Ditemukan Lebih dari Satu <h1> (${audit.h1_count} H1)`,
      description: 'Praktik terbaik SEO menyarankan hanya menggunakan satu <h1> per dokumen HTML agar hierarki konten tidak ambigu.',
      impact: '+4 Poin',
      actionSnippet: `<!-- Gunakan 1x <h1> untuk tema utama, ubah heading lainnya menjadi <h2> atau <h3> -->`,
    });
  } else {
    recommendations.push({
      id: 'h1-passed',
      priority: 'passed',
      category: 'On-Page',
      title: 'Struktur Heading <h1> Sempurna (Tepat 1 H1)',
      description: 'Hierarki topik utama halaman telah terstruktur dengan benar.',
      impact: 'Optimal',
    });
  }

  // 6. Canonical URL
  if (!audit.canonical) {
    recommendations.push({
      id: 'canonical-missing',
      priority: 'warning',
      category: 'Technical',
      title: 'Tag Canonical Tidak Ditemukan',
      description: 'Tidak ada tag <link rel="canonical">. Hal ini dapat menyebabkan masalah duplikasi konten jika URL diakses via variasi protokol atau parameter query.',
      impact: '+5 Poin',
      actionSnippet: `<link rel="canonical" href="${audit.url}" />`,
      reasoning: 'Canonical tag menginstruksikan Googlebot URL resmi yang harus diindeks.',
    });
    quickWins.push('Pasang canonical link tag mengarah ke URL utama');
  } else {
    recommendations.push({
      id: 'canonical-passed',
      priority: 'passed',
      category: 'Technical',
      title: 'Canonical Tag Terverifikasi',
      description: `Mengarah ke: ${audit.canonical}`,
      impact: 'Optimal',
    });
  }

  // 7. Mobile Viewport
  if (!audit.has_viewport) {
    recommendations.push({
      id: 'viewport-missing',
      priority: 'critical',
      category: 'Technical',
      title: 'Tag Viewport Mobile Hilang',
      description: 'Tanpa tag viewport, website akan gagal dalam uji Google Mobile-Friendly dan Mobile-First Indexing.',
      impact: 'Kritis (+5 Poin)',
      actionSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`,
      reasoning: 'Google mengindeks web berbasis tampilan mobile terlebih dahulu (Mobile-First Index).',
    });
  } else {
    recommendations.push({
      id: 'viewport-passed',
      priority: 'passed',
      category: 'Technical',
      title: 'Mobile Viewport Aktif',
      description: 'Halaman siap untuk Mobile-First Indexing Google.',
      impact: 'Optimal',
    });
  }

  // 8. Image Alt Attributes
  const missingAlt = audit.images_missing_alt || 0;
  const totalImg = audit.images_total || 0;
  if (missingAlt > 0) {
    recommendations.push({
      id: 'images-alt',
      priority: missingAlt > 3 ? 'critical' : 'warning',
      category: 'On-Page',
      title: `${missingAlt} dari ${totalImg} Gambar Tidak Memiliki Atribut 'alt'`,
      description: 'Atribut alt membantu Google Image Search mengindeks gambar Anda dan memastikan kepatuhan aksesibilitas pembaca layar (WCAG).',
      impact: '+5 Poin',
      actionSnippet: `<img src="/assets/hero.jpg" alt="Deskripsi gambar yang relevan dengan kata kunci halaman" />`,
      reasoning: 'Google tidak dapat "melihat" gambar tanpa teks alternatif kontekstual.',
    });
    quickWins.push(`Lengkapi alt text pada ${missingAlt} gambar yang belum terisi`);
  } else if (totalImg > 0) {
    recommendations.push({
      id: 'images-passed',
      priority: 'passed',
      category: 'On-Page',
      title: `Semua Gambar Memiliki Alt Text (${totalImg} gambar)`,
      description: 'Aksesibilitas dan potensi pengindeksan Google Images maksimal.',
      impact: 'Optimal',
    });
  }

  // 9. Social & Open Graph
  if (!audit.og_image || !audit.og_title) {
    recommendations.push({
      id: 'og-tags',
      priority: 'info',
      category: 'Social',
      title: 'Open Graph Social Sharing Belum Lengkap',
      description: 'Lengkapi og:title, og:description, dan og:image agar tampilan preview saat dibagikan ke WhatsApp, LinkedIn, atau Twitter tampil profesional.',
      impact: '+CTR Sosial',
      actionSnippet: `<meta property="og:title" content="${audit.title || 'Judul Halaman'}" />\n<meta property="og:description" content="${audit.description || 'Deskripsi singkat'}" />\n<meta property="og:image" content="${audit.url}/og-preview.png" />`,
    });
  } else {
    recommendations.push({
      id: 'og-passed',
      priority: 'passed',
      category: 'Social',
      title: 'Open Graph Social Meta Tags Aktif',
      description: 'Tampilan card preview media sosial sudah terkonfigurasi dengan gambar dan judul.',
      impact: 'Optimal',
    });
  }

  // 10. SSL / HTTPS
  if (audit.has_ssl === false || audit.url.startsWith('http://')) {
    recommendations.push({
      id: 'ssl-missing',
      priority: 'critical',
      category: 'Technical',
      title: 'Koneksi Tidak Aman (Tanpa SSL / HTTPS)',
      description: 'Website menggunakan koneksi HTTP yang tidak terenkripsi. Google menandai situs tanpa HTTPS sebagai "Not Secure".',
      impact: 'Kritis (+5 Poin)',
      actionSnippet: `// Aktifkan sertifikat SSL gratis (Let's Encrypt / Cloudflare SSL)\n// Redirect 301 semua HTTP ke HTTPS`,
    });
  }

  // Hitung status
  const criticalCount = recommendations.filter((r) => r.priority === 'critical').length;
  const warningCount = recommendations.filter((r) => r.priority === 'warning').length;
  const passedCount = recommendations.filter((r) => r.priority === 'passed').length;

  const score = audit.score ?? 70;
  let summary = '';
  if (score >= 85) {
    summary = `Kesehatan SEO untuk ${audit.url} berada dalam kategori sangat baik (${score}/100). Ditemukan ${criticalCount} isu kritis dan ${warningCount} peningkatan minor yang disarankan untuk mempertahankan dominasi peringkat Google.`;
  } else if (score >= 60) {
    summary = `Situs ${audit.url} memperoleh skor ${score}/100 dengan status Cukup. Mengatasi ${criticalCount} masalah prioritas tinggi berpotensi mendongkrak skor hingga 90+ dan menaikkan posisi kata kunci pencarian.`;
  } else {
    summary = `Situs ${audit.url} membutuhkan perbaikan teknis segera (skor ${score}/100). Ditemukan ${criticalCount} masalah kritis yang menghalangi perayapan optimal mesin pencari Google.`;
  }

  return {
    url: audit.url,
    score,
    modelName: isDeepSeekConnected ? 'DeepSeek-V3 (Connected)' : 'DeepSeek AI Engine (Prepared)',
    generatedAt: timeString,
    executiveSummary: summary,
    criticalCount,
    warningCount,
    passedCount,
    recommendations,
    quickWins,
    isDeepSeekConnected,
  };
}

/**
 * Panggilan nyata ke DeepSeek API ketika pengguna memasukkan API Key.
 */
async function callDeepSeekApiForAudit(
  audit: AuditResult,
  apiKey: string
): Promise<AuditAIReport | null> {
  const model = DEEPSEEK_MODEL;
  const systemPrompt = `Anda adalah Auditor Senior SEO Teknis kelas dunia. Anda bertugas menganalisis data audit website dan menghasilkan rekomendasi aksi perbaikan yang terstruktur, konkret, dan memiliki estimasi dampak skor. Berikan jawaban dalam format JSON valid.`;

  const userPrompt = `Analisis data audit SEO berikut untuk URL: ${audit.url}
Data teknis:
- Status Code: ${audit.status_code}
- Response Time: ${audit.response_time_ms}ms
- Title: "${audit.title}" (panjang: ${audit.title?.length || 0})
- Description: "${audit.description}" (panjang: ${audit.description?.length || 0})
- H1 Count: ${audit.h1_count}
- Canonical: "${audit.canonical || 'None'}"
- Viewport: ${audit.has_viewport}
- SSL: ${audit.has_ssl}
- Total Images: ${audit.images_total || 0}, Missing Alt: ${audit.images_missing_alt || 0}
- Word Count: ${audit.word_count || 0}

Buat respons JSON dengan struktur:
{
  "executiveSummary": "ringkasan kondisi SEO situs...",
  "quickWins": ["poin 1", "poin 2"],
  "recommendations": [
    {
      "id": "slug",
      "priority": "critical|warning|info|passed",
      "category": "On-Page|Performance|Technical|Social|Content",
      "title": "judul rekomendasi",
      "description": "penjelasan masalah",
      "impact": "+X Poin",
      "actionSnippet": "kode perbaikan jika relevan",
      "reasoning": "alasan teknis mengapa penting"
    }
  ]
}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`DeepSeek API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const contentStr = data.choices?.[0]?.message?.content;
    if (!contentStr) return null;

    const parsed = JSON.parse(contentStr);
    const recs: RecommendationItem[] = parsed.recommendations || [];

    const criticalCount = recs.filter((r) => r.priority === 'critical').length;
    const warningCount = recs.filter((r) => r.priority === 'warning').length;
    const passedCount = recs.filter((r) => r.priority === 'passed').length;

    return {
      url: audit.url,
      score: audit.score ?? 70,
      modelName: `${model} (Live)`,
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      executiveSummary: parsed.executiveSummary || 'Laporan audit rekomendasi dari DeepSeek.',
      criticalCount,
      warningCount,
      passedCount,
      recommendations: recs,
      quickWins: parsed.quickWins || [],
      isDeepSeekConnected: true,
    };
  } catch (error) {
    console.error('DeepSeek API request failed:', error);
    return null;
  }
}

/**
 * Layanan Chat Interaktif Copilot dengan DeepSeek.
 */
export async function askDeepSeekCopilot(
  question: string,
  audit?: AuditResult | null,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  const apiKey = getDeepSeekApiKey();

  // Jika live DeepSeek API Key tersedia
  if (apiKey) {
    try {
      const model = DEEPSEEK_MODEL;
      const messagesPayload = [
        {
          role: 'system',
          content: `Anda adalah asisten AI SEO Copilot bertenaga DeepSeek. Jawab pertanyaan user seputar SEO, Core Web Vitals, metadata, dan arsitektur website dengan jelas, ringkas, dan dapat langsung dipraktikkan.
Konteks website yang diaudit saat ini:
- URL: ${audit?.url || 'Belum ada'}
- Title: ${audit?.title || 'N/A'}
- TTFB: ${audit?.response_time_ms || 0}ms
- H1: ${audit?.h1_count ?? 0}
- Gambar tanpa alt: ${audit?.images_missing_alt || 0}/${audit?.images_total || 0}`,
        },
        ...chatHistory.slice(-4).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: question },
      ];

      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: messagesPayload,
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply;
      }
    } catch (e) {
      console.warn('Gagal memanggil live DeepSeek chat, menggunakan respons kontekstual lokal:', e);
    }
  }

  // Fallback cerdas jika belum menggunakan live API key
  const lower = question.toLowerCase();
  const domain = audit?.url ? getCleanDomain(audit.url) : 'website Anda';

  if (lower.includes('score') || lower.includes('skor') || lower.includes('100') || lower.includes('tingkatkan')) {
    return `Rencana Aksi DeepSeek untuk Mencapai Skor 100/100 pada ${domain}:
1. Meta Title: Pastikan panjang judul antara 30-60 karakter dengan kata kunci utama.
2. Meta Description: Sediakan ringkasan 120-155 karakter yang menyertakan ajakan bertindak (CTA).
3. Hierarki Heading: Pastikan tepat ada satu <h1> dan rapikan sub-heading <h2>.
4. Optimalisasi Gambar: Lengkapi seluruh atribut 'alt' pada ${audit?.images_total || 0} gambar.
5. Kecepatan TTFB: Pangkas waktu respons server saat ini (${audit?.response_time_ms || 150}ms) ke bawah 200ms dengan Edge Caching.`;
  }

  if (lower.includes('h1') || lower.includes('heading') || lower.includes('judul')) {
    return `Struktur Heading untuk ${domain}:
Website saat ini memiliki ${audit?.h1_count ?? 0} tag <h1>.
Rekomendasi DeepSeek:
• Gunakan hanya satu tag <h1> per halaman untuk topik utama.
• Pecah bagian konten menggunakan tag <h2> dan <h3> secara berjenjang.`;
  }

  if (lower.includes('kecepatan') || lower.includes('speed') || lower.includes('ttfb') || lower.includes('lambat')) {
    return `Diagnosa Kecepatan & Latensi Server (${audit?.response_time_ms || 120}ms):
Untuk memangkas response time ke standar tercepat Google:
1. Pasang header 'Cache-Control: public, max-age=31536000' pada aset statis.
2. Manfaatkan format gambar generasi baru (WebP / AVIF).
3. Gunakan CDN seperti Cloudflare atau Vercel Edge Network.`;
  }

  if (lower.includes('meta') || lower.includes('deskripsi') || lower.includes('title')) {
    return `Analisis Meta Tags ${domain}:
• Judul saat ini: "${audit?.title || 'Belum terpasang'}"
• Deskripsi saat ini: "${audit?.description || 'Belum terpasang'}"
Rekomendasi: Tambahkan Unique Selling Proposition (USP) serta nama brand di akhir judul, dan pastikan deskripsi memiliki daya tarik klik (CTR).`;
  }

  return `Insight DeepSeek AI untuk ${domain}:
Audit mendeteksi ${audit?.images_missing_alt ? `${audit.images_missing_alt} gambar belum memiliki alt text` : 'atribut gambar terpasang baik'}, dengan kecepatan respons ${audit?.response_time_ms || 150}ms.
Anda dapat memeriksa tab 'Laporan Rekomendasi' untuk melihat rincian langkah perbaikan kode lengkap dengan snippet yang dapat langsung disalin.`;
}

function getCleanDomain(rawUrl: string): string {
  try {
    return rawUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'domain.com';
  } catch {
    return 'domain.com';
  }
}
