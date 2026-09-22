import { useState, useEffect } from 'react';
import {
  Globe,
  ArrowRight,
  ExternalLink,
  Printer,
  History,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
  GitBranch,
} from 'lucide-react';
import type { AuditResult } from '../types';
import {
  getStoredAuditHistory,
  type StoredAuditItem,
} from '../utils/storage';

interface HeroSectionProps {
  lastUpdated?: string;
  onRunAudit: (url: string) => Promise<void>;
  speedScore?: number;
  loading: boolean;
  auditResult?: AuditResult | null;
  onSelectStoredAudit?: (item: StoredAuditItem) => void;
}

export const HeroSection = ({
  lastUpdated = 'Updated 20 sec ago',
  onRunAudit,
  speedScore = 75,
  loading = false,
  auditResult,
  onSelectStoredAudit,
}: HeroSectionProps) => {
  const [inputUrl, setInputUrl] = useState('');
  const [storedHistory, setStoredHistory] = useState<StoredAuditItem[]>([]);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync stored history on mount and when auditResult changes
  useEffect(() => {
    const list = getStoredAuditHistory();
    setStoredHistory(list);
  }, [auditResult?.url, auditResult?.score]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || loading) return;
    onRunAudit(inputUrl.trim());
  };

  const handleQuickPreset = (url: string) => {
    setInputUrl(url);
    // Check if this URL already exists in localStorage history
    const clean = url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    const existing = storedHistory.find(
      (h) => (h.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase() === clean
    );
    if (existing && onSelectStoredAudit) {
      onSelectStoredAudit(existing);
    } else {
      onRunAudit(url);
    }
  };

  const handleCopyDomain = () => {
    if (!auditResult?.url) return;
    navigator.clipboard.writeText(auditResult.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const targetDomain = auditResult?.url
    ? auditResult.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'example.com';

  const fullTargetUrl = auditResult?.url
    ? (auditResult.url.startsWith('http') ? auditResult.url : `https://${auditResult.url}`)
    : 'https://example.com';

  const isHealthy = !auditResult?.error && (auditResult?.status_code === 200 || !auditResult?.status_code);

  return (
    <section className="vercel-hero-section">
      {/* Top Banner: Production Deployment Headline */}
      <div className="vercel-deployment-header">
        <div className="vercel-deployment-title-area">
          <div className="vercel-badge-group">
            <span className="vercel-tag-badge">Production Deployment</span>
            <span className="vercel-audit-pulse-badge">
              <span className={`vercel-status-dot ${isHealthy ? 'ready' : 'error'}`} />
              <span>{isHealthy ? 'Active Target' : 'Audit Issue'}</span>
            </span>
          </div>
          <h1 className="vercel-main-heading">Production Audit & Diagnostics</h1>
          <p className="vercel-sub-heading">
            Live SEO analysis, Web Vitals performance, and search crawler readiness for{' '}
            <span className="vercel-inline-code">{targetDomain}</span>.
          </p>
        </div>

        <div className="vercel-hero-cta-group">
          <button
            type="button"
            className="vercel-btn-secondary"
            onClick={() => onRunAudit(targetDomain)}
            disabled={loading}
            title="Re-run audit on current URL"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Re-Audit</span>
          </button>

          <button
            type="button"
            className="vercel-btn-secondary"
            onClick={() => window.print()}
            title="Export report as PDF"
          >
            <Printer size={14} />
            <span>Export Report</span>
          </button>

          <a
            href={fullTargetUrl}
            target="_blank"
            rel="noreferrer"
            className="vercel-btn-primary"
            title="Visit target website"
          >
            <span>Visit Site</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Vercel Production Deployment Card (Mockup Preview + Metadata Table) */}
      <div className="vercel-deployment-card">
        {/* Left: Interactive Preview Frame */}
        <div className="vercel-preview-pane">
          <div className="vercel-browser-bar">
            <div className="vercel-browser-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="vercel-browser-url-pill">
              <Globe size={12} className="text-zinc-500" />
              <span className="vercel-preview-url-text">{targetDomain}</span>
            </div>
            <a
              href={fullTargetUrl}
              target="_blank"
              rel="noreferrer"
              className="vercel-preview-external"
            >
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="vercel-preview-content">
            <div className="vercel-preview-inner-card">
              <div className="vercel-preview-meta-header">
                <span className="vercel-preview-tag">
                  {auditResult?.status_code ? `${auditResult.status_code} OK` : '200 OK'}
                </span>
                <span className="vercel-preview-time">
                  {auditResult?.response_time_ms ? `${auditResult.response_time_ms} ms` : '134 ms'}
                </span>
              </div>
              <h4 className="vercel-preview-page-title">
                {auditResult?.title || 'Example Website Page Title'}
              </h4>
              <p className="vercel-preview-page-desc">
                {auditResult?.description ||
                  'Page meta description detected by search engines for search result snippets and indexing.'}
              </p>
              <div className="vercel-preview-footer-chips">
                <span className="chip">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  {auditResult?.h1_count ?? 1} H1 Tag
                </span>
                <span className="chip">
                  {auditResult?.has_ssl !== false ? 'SSL Encrypted' : 'Non-SSL'}
                </span>
                <span className="chip">
                  {auditResult?.has_viewport !== false ? 'Mobile Ready' : 'No Viewport'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Deployment Details List (Identical to Vercel Project Info) */}
        <div className="vercel-details-pane">
          <div className="vercel-detail-row">
            <span className="vercel-detail-label">Deployment</span>
            <div className="vercel-detail-val font-mono">
              <span>dpl_{targetDomain.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}_audit</span>
            </div>
          </div>

          <div className="vercel-detail-row">
            <span className="vercel-detail-label">Domains</span>
            <div className="vercel-detail-val">
              <a
                href={fullTargetUrl}
                target="_blank"
                rel="noreferrer"
                className="vercel-domain-link"
              >
                <span>{targetDomain}</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                className="vercel-mini-copy-btn"
                onClick={handleCopyDomain}
                title="Copy domain URL"
              >
                {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          <div className="vercel-detail-row">
            <span className="vercel-detail-label">Status</span>
            <div className="vercel-detail-val">
              <span className="vercel-status-pill">
                <span className={`vercel-status-dot ${isHealthy ? 'ready' : 'error'}`} />
                <span>{isHealthy ? 'Ready' : 'Failed'}</span>
              </span>
              <span className="vercel-latency-tag">
                {auditResult?.response_time_ms ? `${auditResult.response_time_ms}ms` : '134ms'}
              </span>
            </div>
          </div>

          <div className="vercel-detail-row">
            <span className="vercel-detail-label">Created</span>
            <div className="vercel-detail-val text-zinc-400 font-mono text-xs">
              <span>{lastUpdated}</span>
            </div>
          </div>

          <div className="vercel-detail-row">
            <span className="vercel-detail-label">Source</span>
            <div className="vercel-detail-val">
              <span className="vercel-git-badge">
                <GitBranch size={12} />
                <span>main</span>
              </span>
              <span className="vercel-commit-hash">audit-crawler-v2</span>
            </div>
          </div>

          <div className="vercel-detail-row">
            <span className="vercel-detail-label">Performance</span>
            <div className="vercel-detail-val">
              <div className="vercel-score-pill">
                <span className="score-number">{speedScore}</span>
                <span className="score-max">/100</span>
                <span className="score-text">
                  {speedScore >= 80 ? 'Optimal' : speedScore >= 50 ? 'Fair' : 'Poor'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Audit URL Input Bar (Styled like Vercel Project Importer / CLI) */}
      <div className="vercel-search-bar-wrapper">
        <form onSubmit={handleSubmit} className="vercel-search-form">
          <div className="vercel-input-icon-prefix">
            <Globe size={16} />
          </div>
          <input
            type="text"
            placeholder="Enter website URL to audit (e.g., example.com, google.com, wikipedia.org)..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="vercel-search-input"
            disabled={loading}
          />
          <div className="vercel-input-suffix-group">
            <span className="vercel-kbd-shortcut">↵ Enter</span>
            <button
              type="submit"
              disabled={loading || !inputUrl.trim()}
              className="vercel-submit-audit-btn"
            >
              {loading ? (
                <>
                  <span className="vercel-spinner-icon" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <span>Run Audit</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Chips for Quick presets & history */}
        <div className="vercel-presets-bar">
          <div className="vercel-preset-group">
            <span className="vercel-preset-label">Quick check:</span>
            {['example.com', 'google.com', 'github.com', 'wikipedia.org'].map((chip) => (
              <button
                key={chip}
                type="button"
                className="vercel-preset-chip"
                onClick={() => handleQuickPreset(chip)}
                disabled={loading}
              >
                {chip}
              </button>
            ))}
          </div>

          {storedHistory.length > 0 && (
            <div className="vercel-history-group">
              <span className="vercel-preset-label">
                <History size={11} /> Saved Audits:
              </span>
              {storedHistory.slice(0, 6).map((item) => {
                const domain = (item.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="vercel-history-chip group"
                    onClick={() => {
                      if (onSelectStoredAudit) {
                        onSelectStoredAudit(item);
                      } else {
                        handleQuickPreset(domain);
                      }
                    }}
                    disabled={loading}
                    title={`Score ${item.score}/100 - Buka hasil audit ${domain}`}
                  >
                    <Clock size={10} />
                    <span>{domain}</span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                      {item.score}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
