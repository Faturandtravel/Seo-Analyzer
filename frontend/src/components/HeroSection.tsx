import { useState, useEffect } from 'react';
import { Globe, ArrowRight, CheckCircle2, AlertCircle, Printer, History, Clock } from 'lucide-react';
import type { AuditResult } from '../types';

interface HeroSectionProps {
  lastUpdated?: string;
  onRunAudit: (url: string) => Promise<void>;
  speedScore?: number;
  loading: boolean;
  auditResult?: AuditResult | null;
}

export const HeroSection = ({
  lastUpdated = 'Updated 20 sec ago',
  onRunAudit,
  speedScore = 75,
  loading = false,
  auditResult,
}: HeroSectionProps) => {
  const [inputUrl, setInputUrl] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seo_audit_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save successful audits to history
  useEffect(() => {
    if (auditResult?.url && !auditResult.error) {
      const cleanUrl = auditResult.url.replace(/^https?:\/\//, '');
      setHistory((prev) => {
        const updated = [cleanUrl, ...prev.filter((u) => u !== cleanUrl)].slice(0, 5);
        try {
          localStorage.setItem('seo_audit_history', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
  }, [auditResult?.url, auditResult?.error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || loading) return;
    onRunAudit(inputUrl.trim());
  };

  const handleQuickPreset = (url: string) => {
    setInputUrl(url);
    onRunAudit(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <section className="hero-section">
      {/* Main Hero Header Row */}
      <div className="hero-top-row">
        {/* Left: Title & Subtitle */}
        <div className="hero-left">
          <div className="hero-badge-pill">
            <span className="live-pulse" />
            <span>SEO Engine Online</span>
          </div>
          <h1 className="hero-title">Your Personal Dashboard..!</h1>
          <p className="hero-subtitle">
            {auditResult && auditResult.url ? (
              <>
                Auditing: <span className="highlight-url">{auditResult.url}</span> • {lastUpdated}
              </>
            ) : (
              `Real-time On-Page & Performance Analyzer • ${lastUpdated}`
            )}
          </p>
        </div>

        {/* Right: Quick Performance Meter Badge & Export Button */}
        <div className="hero-right-actions">
          <button
            type="button"
            className="hero-export-btn"
            onClick={handlePrintReport}
            title="Download / Cetak Hasil Audit sebagai PDF"
          >
            <Printer size={15} />
            <span>Ekspor PDF</span>
          </button>

          <div className="hero-score-badge-card">
            <div className="score-badge-header">
              <span className="score-label">Speed & SEO Index</span>
              {auditResult?.error ? (
                <AlertCircle size={15} className="text-red-500" />
              ) : (
                <CheckCircle2 size={15} className="text-green-500" />
              )}
            </div>
            <div className="score-badge-val">
              <span className="score-big">{speedScore}</span>
              <span className="score-denom">/100</span>
            </div>
            <span className="score-state">
              {speedScore >= 80 ? 'Optimal Score' : speedScore >= 50 ? 'Fair Performance' : 'Needs Fix'}
            </span>
          </div>
        </div>
      </div>

      {/* Header Form: URL Analyzer Input Bar */}
      <div className="hero-form-container">
        <form onSubmit={handleSubmit} className="hero-audit-form">
          <div className="hero-input-group">
            <Globe size={18} className="hero-input-icon" />
            <input
              type="text"
              placeholder="Masukkan URL website (contoh: google.com, example.com, github.com)..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="hero-url-input"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !inputUrl.trim()}
            className="hero-audit-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <span>Audit Sekarang</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick URL Suggestions & Audit History */}
        <div className="hero-suggestions-row">
          <div className="hero-quick-chips">
            <span className="quick-label">Coba cepat:</span>
            {['example.com', 'google.com', 'wikipedia.org', 'github.com'].map((chip) => (
              <button
                key={chip}
                type="button"
                className="quick-chip-btn"
                onClick={() => handleQuickPreset(chip)}
                disabled={loading}
              >
                {chip}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <div className="hero-history-chips">
              <span className="history-label">
                <History size={12} /> Riwayat:
              </span>
              {history.map((hUrl) => (
                <button
                  key={hUrl}
                  type="button"
                  className="history-chip-btn"
                  onClick={() => handleQuickPreset(hUrl)}
                  disabled={loading}
                  title={`Audit ulang ${hUrl}`}
                >
                  <Clock size={10} />
                  <span>{hUrl}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
