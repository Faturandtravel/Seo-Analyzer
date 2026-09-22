import { useState } from 'react';
import { X, Search, Globe, AlertCircle } from 'lucide-react';
import axios from 'axios';
import type { AuditResult } from '../types';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuditComplete: (result: AuditResult) => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  onAuditComplete,
}) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<AuditResult | null>(null);
  const [modalTab, setModalTab] = useState<'summary' | 'raw'>('summary');

  if (!isOpen) return null;

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setCurrentResult(null);

    try {
      const response = await axios.get<AuditResult>(
        `http://localhost:8080/api/audit?url=${encodeURIComponent(url.trim())}`
      );
      setCurrentResult(response.data);
      onAuditComplete(response.data);
    } catch (err: any) {
      const errResult: AuditResult = {
        url,
        status_code: 0,
        response_time_ms: 0,
        title: '',
        description: '',
        h1_count: 0,
        error: err.response?.data?.error || 'Failed to connect to backend service at localhost:8080',
      };
      setCurrentResult(errResult);
      onAuditComplete(errResult);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vercel-modal-backdrop" onClick={onClose}>
      <div className="vercel-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="vercel-modal-header">
          <div className="vercel-modal-title-row">
            <div className="vercel-modal-icon-badge">
              <Globe size={16} />
            </div>
            <div>
              <h3 className="vercel-modal-title">Live Diagnostic Inspector</h3>
              <p className="vercel-modal-sub">Direct Go crawler engine execution (Port 8080)</p>
            </div>
          </div>
          <button type="button" className="vercel-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Input Form */}
        <div className="vercel-modal-search-box">
          <form onSubmit={handleAudit} className="vercel-modal-form">
            <div className="vercel-modal-input-group">
              <Search size={15} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Enter URL to audit (e.g. google.com, wikipedia.org)..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="vercel-modal-input font-sans"
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="vercel-modal-submit-btn"
            >
              {loading ? (
                <>
                  <span className="vercel-spinner-icon" />
                  <span>Auditing...</span>
                </>
              ) : (
                'Run Audit'
              )}
            </button>
          </form>

          {/* Preset links */}
          <div className="vercel-modal-presets">
            <span className="text-zinc-500 text-xs">Suggestions:</span>
            {['example.com', 'google.com', 'vercel.com', 'github.com'].map((item) => (
              <button
                key={item}
                type="button"
                className="vercel-modal-preset-btn"
                onClick={() => setUrl(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Results View if available */}
        {currentResult && (
          <div className="vercel-modal-results">
            {currentResult.error ? (
              <div className="vercel-modal-error-box">
                <AlertCircle size={16} className="text-rose-400" />
                <span>Error: {currentResult.error}</span>
              </div>
            ) : (
              <>
                <div className="vercel-modal-tabs">
                  <button
                    type="button"
                    className={`vercel-modal-tab-btn ${modalTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setModalTab('summary')}
                  >
                    Telemetry Summary
                  </button>
                  <button
                    type="button"
                    className={`vercel-modal-tab-btn ${modalTab === 'raw' ? 'active' : ''}`}
                    onClick={() => setModalTab('raw')}
                  >
                    Raw JSON Payload
                  </button>
                </div>

                {modalTab === 'summary' ? (
                  <div className="vercel-modal-summary-grid">
                    <div className="modal-stat-box">
                      <span className="stat-label">HTTP Status</span>
                      <span className="stat-val font-mono text-emerald-400">
                        {currentResult.status_code} OK
                      </span>
                    </div>
                    <div className="modal-stat-box">
                      <span className="stat-label">Response Time</span>
                      <span className="stat-val font-mono">{currentResult.response_time_ms} ms</span>
                    </div>
                    <div className="modal-stat-box">
                      <span className="stat-label">SSL Enforced</span>
                      <span className="stat-val font-mono">
                        {currentResult.has_ssl !== false ? 'Yes (HTTPS)' : 'No (HTTP)'}
                      </span>
                    </div>
                    <div className="modal-stat-box">
                      <span className="stat-label">H1 Count</span>
                      <span className="stat-val font-mono">{currentResult.h1_count}</span>
                    </div>
                    <div className="modal-stat-box full-width">
                      <span className="stat-label">Meta Title</span>
                      <span className="stat-text">{currentResult.title || '(Empty)'}</span>
                    </div>
                    <div className="modal-stat-box full-width">
                      <span className="stat-label">Meta Description</span>
                      <span className="stat-text">{currentResult.description || '(Empty)'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="vercel-modal-code-box">
                    <pre className="vercel-modal-json font-mono">
                      {JSON.stringify(currentResult, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="vercel-modal-footer">
          <button type="button" className="vercel-btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
