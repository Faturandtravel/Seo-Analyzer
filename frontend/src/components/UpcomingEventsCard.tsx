import { useState } from 'react';
import {
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  Image as ImageIcon,
  Share2,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import type { AuditResult } from '../types';

interface UpcomingEventsCardProps {
  auditResult?: AuditResult | null;
  onItemClick?: (title: string) => void;
}

export const UpcomingEventsCard = ({ auditResult }: UpcomingEventsCardProps) => {
  const [selectedFilter, setSelectedFilter] = useState('Semua Audit');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Semua');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories = ['Semua', 'On-Page', 'Gambar', 'Sosial (OG)', 'Teknis'];

  const copyCode = (key: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasTitle = Boolean(auditResult?.title);
  const hasDesc = Boolean(auditResult?.description);
  const hasOptimalH1 = auditResult?.h1_count === 1;
  const hasCanonical = Boolean(auditResult?.canonical);
  const hasViewport = Boolean(auditResult?.has_viewport);
  const hasSsl = Boolean(auditResult?.has_ssl);
  const hasOgImage = Boolean(auditResult?.og_image);
  const imagesMissingAlt = auditResult?.images_missing_alt || 0;
  const imagesTotal = auditResult?.images_total || 0;
  const imagesAllAlt = imagesTotal === 0 || imagesMissingAlt === 0;

  // Build checklist items
  const items = [
    {
      key: 'title',
      category: 'On-Page',
      title: hasTitle ? 'Meta Title Terpasang' : 'Meta Title Belum Ada',
      desc: auditResult?.title
        ? `${auditResult.title.slice(0, 32)}... (${auditResult.title.length} karakter)`
        : 'Tambahkan tag <title> di bagian <head>',
      status: hasTitle ? 'success' : 'warning',
      icon: <FileText size={15} />,
      fixSnippet: '<title>Judul Halaman Relevan 30-60 Karakter</title>',
    },
    {
      key: 'desc',
      category: 'On-Page',
      title: hasDesc ? 'Meta Description Ditemukan' : 'Meta Description Kosong',
      desc: auditResult?.description
        ? `${auditResult.description.slice(0, 34)}...`
        : 'Sangat direkomendasikan untuk menaikkan CTR di Google',
      status: hasDesc ? 'success' : 'warning',
      icon: <FileText size={15} />,
      fixSnippet: '<meta name="description" content="Ringkasan informatif konten halaman 50-160 karakter di sini.">',
    },
    {
      key: 'h1',
      category: 'On-Page',
      title: hasOptimalH1 ? 'Struktur Tag H1 Ideal' : `${auditResult?.h1_count ?? 0} Tag H1 Ditemukan`,
      desc: hasOptimalH1
        ? 'Tepat 1 tag H1 sebagai judul utama'
        : (auditResult?.h1_count === 0 ? 'Gunakan 1 tag <h1>' : 'Terlalu banyak tag <h1> di satu halaman'),
      status: hasOptimalH1 ? 'success' : 'warning',
      icon: <Zap size={15} />,
      fixSnippet: '<h1>Judul Utama Topik Halaman</h1>',
    },
    {
      key: 'images',
      category: 'Gambar',
      title: imagesAllAlt ? 'Alt Text Gambar Lengkap' : `${imagesMissingAlt} Gambar Kurang Alt`,
      desc: imagesTotal > 0
        ? `${imagesTotal - imagesMissingAlt}/${imagesTotal} gambar memiliki atribut alt`
        : 'Tidak ada elemen <img> terdeteksi',
      status: imagesAllAlt ? 'success' : 'warning',
      icon: <ImageIcon size={15} />,
      fixSnippet: '<img src="banner.jpg" alt="Deskripsi gambar untuk SEO dan tuna netra">',
    },
    {
      key: 'canonical',
      category: 'Teknis',
      title: hasCanonical ? 'Tag Canonical Valid' : 'Tag Canonical Belum Ada',
      desc: auditResult?.canonical
        ? auditResult.canonical.slice(0, 35) + '...'
        : 'Tambahkan rel="canonical" untuk mencegah penalti konten ganda',
      status: hasCanonical ? 'success' : 'warning',
      icon: <Zap size={15} />,
      fixSnippet: `<link rel="canonical" href="${auditResult?.url || 'https://domain.com/halaman'}">`,
    },
    {
      key: 'og',
      category: 'Sosial (OG)',
      title: hasOgImage ? 'Open Graph Image (Social) OK' : 'Tag og:image Kosong',
      desc: hasOgImage
        ? 'Thumbnail tampil saat link dibagikan di WhatsApp/X'
        : 'Belum ada thumbnail untuk preview media sosial',
      status: hasOgImage ? 'success' : 'warning',
      icon: <Share2 size={15} />,
      fixSnippet: '<meta property="og:image" content="https://domain.com/social-preview.jpg">',
    },
    {
      key: 'viewport',
      category: 'Teknis',
      title: hasViewport ? 'Mobile Viewport Aktif' : 'Mobile Viewport Tidak Ditemukan',
      desc: hasViewport ? 'Lolos standar Mobile-First Indexing Google' : 'Website tidak responsif di perangkat ponsel',
      status: hasViewport ? 'success' : 'warning',
      icon: <Zap size={15} />,
      fixSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    },
    {
      key: 'ssl',
      category: 'Teknis',
      title: hasSsl ? 'Enkripsi HTTPS/SSL Aktif' : 'Koneksi Tidak Terenkripsi (HTTP)',
      desc: hasSsl ? 'Sertifikat SSL valid dan aman' : 'Google memprioritaskan website berprotokol HTTPS',
      status: hasSsl ? 'success' : 'warning',
      icon: <ShieldCheck size={15} />,
      fixSnippet: '# Aktifkan redirect 301 ke HTTPS pada web server (Nginx/Apache)',
    },
  ];

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'Semua' && item.category !== activeTab) return false;
    if (selectedFilter === 'Hanya Sukses' && item.status !== 'success') return false;
    if (selectedFilter === 'Perlu Perbaikan' && item.status === 'success') return false;
    return true;
  });

  return (
    <div className="dashboard-card upcoming-events-card">
      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">SEO Audit Checklist & Rekomendasi Solusi</h3>

        <div className="card-dropdown-wrapper">
          <button
            className="card-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            type="button"
          >
            <span>{selectedFilter}</span>
            <ChevronDown size={14} className={dropdownOpen ? 'rotate-180' : ''} />
          </button>

          {dropdownOpen && (
            <div className="card-dropdown-menu">
              {['Semua Audit', 'Hanya Sukses', 'Perlu Perbaikan'].map((opt) => (
                <div
                  key={opt}
                  className={`card-dropdown-item ${selectedFilter === opt ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedFilter(opt);
                    setDropdownOpen(false);
                  }}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="timeline-container">
        <div className="timeline-slots-header">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`timeline-slot-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
              type="button"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Audit Status Badges */}
        <div className="checklist-items-grid">
          {filteredItems.map((item) => (
            <div
              key={item.key}
              className={`checklist-badge-card ${item.status}`}
            >
              <div
                className={`checklist-icon ${
                  item.status === 'success' ? 'icon-green' : 'icon-yellow'
                }`}
              >
                {item.icon}
              </div>

              <div className="checklist-info">
                <span className="checklist-title">{item.title}</span>
                <span className="checklist-desc">{item.desc}</span>
              </div>

              {/* Status indicator & copy fix snippet button */}
              <div className="checklist-actions-col">
                {item.status === 'success' ? (
                  <CheckCircle2 size={16} className="text-green-600 status-icon" />
                ) : (
                  <AlertCircle size={16} className="text-amber-500 status-icon" />
                )}

                {item.fixSnippet && (
                  <button
                    type="button"
                    className="copy-snippet-btn"
                    title="Salin kode perbaikan"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyCode(item.key, item.fixSnippet);
                    }}
                  >
                    {copiedKey === item.key ? (
                      <span className="copied-text">
                        <Check size={11} /> Disalin
                      </span>
                    ) : (
                      <span className="copy-text">
                        <Copy size={11} /> Salin Kode
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
