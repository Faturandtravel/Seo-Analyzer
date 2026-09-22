import { useState } from 'react';
import { ChevronDown, ExternalLink, Globe, Share2, Image as ImageIcon } from 'lucide-react';
import type { AuditResult } from '../types';

interface AnalysisMeetingChartProps {
  auditResult?: AuditResult | null;
}

export const AnalysisMeetingChart = ({ auditResult }: AnalysisMeetingChartProps) => {
  const [selectedRange, setSelectedRange] = useState('Live Audit');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'serp' | 'social'>('serp');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const responseTime = auditResult?.response_time_ms || 134;
  const h1Count = auditResult ? auditResult.h1_count : 1;

  // Histogram data
  const monthData = [
    { month: 'Jan', isHighlight: true, bars: [50, 75, 95, 85, 70] },
    { month: 'Feb', isHighlight: false, bars: [20, 25, 30, 28, 22] },
    { month: 'Mar', isHighlight: false, bars: [35, 40, 38, 45, 30] },
    { month: 'Apr', isHighlight: false, bars: [25, 30, 28, 35, 26] },
    { month: 'May', isHighlight: false, bars: [40, 35, 45, 42, 38] },
    { month: 'Jun', isHighlight: false, bars: [30, 28, 35, 32, 29] },
    { month: 'Jul', isHighlight: false, bars: [35, 38, 40, 36, 32] },
    { month: 'Aug', isHighlight: true, bars: [60, 80, 92, 88, 75] },
    { month: 'Sep', isHighlight: false, bars: [28, 32, 30, 35, 27] },
    { month: 'Oct', isHighlight: false, bars: [35, 42, 38, 45, 33] },
    { month: 'Nov', isHighlight: false, bars: [30, 35, 32, 38, 29] },
    { month: 'Dec', isHighlight: false, bars: [25, 28, 30, 26, 22] },
  ];

  return (
    <div className="dashboard-card analysis-card">
      {/* Card Header */}
      <div className="card-header">
        <h3 className="card-title">SEO Latency & On-Page Analysis</h3>

        <div className="card-dropdown-wrapper">
          <button
            className="card-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span>{selectedRange}</span>
            <ChevronDown size={14} className={dropdownOpen ? 'rotate-180' : ''} />
          </button>

          {dropdownOpen && (
            <div className="card-dropdown-menu">
              {['Live Audit', 'Hourly Avg', 'Daily Report', 'Weekly History'].map((opt) => (
                <div
                  key={opt}
                  className={`card-dropdown-item ${selectedRange === opt ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedRange(opt);
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

      {/* Floating Insight Callouts with pointer curves */}
      <div className="analysis-chart-viewport">
        {/* Callout 1: Response Time (above Jan) */}
        <div className="chart-callout callout-left">
          <span className="callout-label">Response Latency</span>
          <span className="callout-value">{responseTime} ms</span>
        </div>

        {/* Callout 2: H1 Count (above Aug) */}
        <div className="chart-callout callout-right">
          <span className="callout-label">H1 Elements</span>
          <span className="callout-value">{h1Count} Tags</span>
        </div>

        {/* SVG with curved pointer lines and bars */}
        <svg
          viewBox="0 0 600 180"
          className="analysis-chart-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="greenBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>

            <linearGradient id="highlightArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.18)" />
              <stop offset="100%" stopColor="rgba(34, 197, 94, 0.02)" />
            </linearGradient>
          </defs>

          {/* Curved Pointer Line for Left Callout */}
          <path
            d="M 85 22 C 55 22, 42 55, 42 95"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <circle cx="85" cy="22" r="3" fill="#22c55e" />

          {/* Curved Pointer Line for Right Callout */}
          <path
            d="M 225 22 C 200 22, 175 55, 175 95"
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.5"
          />
          <circle cx="225" cy="22" r="3" fill="#22c55e" />

          {/* Render Highlight Area Boxes for Jan and Aug */}
          <rect x="18" y="75" width="38" height="95" fill="url(#highlightArea)" rx="4" />
          <rect x="155" y="75" width="38" height="95" fill="url(#highlightArea)" rx="4" />

          {/* Render Month Groups of Bars */}
          {monthData.map((m, mIdx) => {
            const groupWidth = 46;
            const startX = 18 + mIdx * (groupWidth + 2);

            return (
              <g key={m.month} className="month-bars-group">
                {m.bars.map((barVal, bIdx) => {
                  const barW = 2.4;
                  const barX = startX + bIdx * (barW + 4);
                  const barH = (barVal / 100) * 85;
                  const barY = 170 - barH;

                  return (
                    <rect
                      key={bIdx}
                      x={barX}
                      y={barY}
                      width={barW}
                      height={barH}
                      rx={1.2}
                      fill={m.isHighlight ? 'url(#greenBarGradient)' : '#d1d5db'}
                      className="histogram-bar"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Baseline */}
          <line x1="10" y1="170" x2="590" y2="170" stroke="#f1f5f9" strokeWidth="1" />
        </svg>

        {/* X Axis Month Labels */}
        <div className="chart-x-axis">
          {months.map((m, idx) => (
            <span
              key={m}
              className={`x-axis-label ${idx === 0 || idx === 7 ? 'highlight' : ''}`}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Preview Section: Google SERP vs Social Card Preview */}
      {auditResult && (
        <div className="serp-preview-box">
          <div className="serp-tabs-bar">
            <button
              type="button"
              className={`serp-tab-btn ${previewTab === 'serp' ? 'active' : ''}`}
              onClick={() => setPreviewTab('serp')}
            >
              <Globe size={13} />
              <span>Google SERP Preview</span>
            </button>
            <button
              type="button"
              className={`serp-tab-btn ${previewTab === 'social' ? 'active' : ''}`}
              onClick={() => setPreviewTab('social')}
            >
              <Share2 size={13} />
              <span>Social Media (Open Graph)</span>
            </button>
          </div>

          {previewTab === 'serp' ? (
            <div className="serp-tab-content">
              <div className="serp-badge-row">
                <span className="serp-tag">Google Search Result</span>
                {auditResult.url && (
                  <span className="serp-url-text">
                    {auditResult.url} <ExternalLink size={11} />
                  </span>
                )}
              </div>
              <div className="serp-title-text">
                {auditResult.title || 'Untitled Document (Tag <title> tidak ditemukan)'}
              </div>
              <div className="serp-desc-text">
                {auditResult.description || 'Tidak ada meta description yang terdeteksi di halaman ini.'}
              </div>
            </div>
          ) : (
            <div className="social-card-content">
              {auditResult.og_image ? (
                <div className="social-og-preview">
                  <img
                    src={auditResult.og_image}
                    alt="Open Graph Preview"
                    className="social-og-img"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="social-og-meta">
                    <span className="social-og-domain">{auditResult.url ? new URL(auditResult.url).hostname : 'domain.com'}</span>
                    <span className="social-og-title">{auditResult.og_title || auditResult.title || 'No Title'}</span>
                    <span className="social-og-desc">{auditResult.og_description || auditResult.description || 'No Description'}</span>
                  </div>
                </div>
              ) : (
                <div className="social-og-missing">
                  <ImageIcon size={24} className="text-amber-500" />
                  <div>
                    <strong>Tag og:image Tidak Ditemukan</strong>
                    <p>Saat link dibagikan di WhatsApp/Twitter/Facebook, tidak ada gambar thumbnail yang muncul.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
