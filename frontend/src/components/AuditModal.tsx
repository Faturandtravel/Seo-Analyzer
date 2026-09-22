import { useState } from 'react';
import { X, Search, Globe, CheckCircle2, AlertCircle, Clock, Hash } from 'lucide-react';
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
        error: err.response?.data?.error || 'Gagal terhubung ke backend Go di localhost:8080',
      };
      setCurrentResult(errResult);
      onAuditComplete(errResult);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUrl = (quickUrl: string) => {
    setUrl(quickUrl);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Globe size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="modal-title">Live Website SEO & Performance Audit</h2>
              <p className="modal-subtitle">Direct audit via Go Backend Engine (port 8080)</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAudit} className="modal-form">
          <div className="url-input-container">
            <Search size={18} className="url-input-icon" />
            <input
              type="text"
              placeholder="Enter URL to audit (e.g. google.com, example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="audit-submit-btn"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Auditing...</span>
                </>
              ) : (
                'Run Audit'
              )}
            </button>
          </div>

          <div className="quick-suggestions">
            <span className="quick-label">Try quick:</span>
            {['example.com', 'google.com', 'wikipedia.org'].map((item) => (
              <button
                type="button"
                key={item}
                className="quick-chip"
                onClick={() => handleQuickUrl(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </form>

        {/* Audit Results View */}
        {currentResult && (
          <div className="audit-result-view">
            {currentResult.error ? (
              <div className="audit-error-card">
                <AlertCircle size={20} className="text-red-500" />
                <div>
                  <strong>Audit Error:</strong>
                  <p>{currentResult.error}</p>
                </div>
              </div>
            ) : (
              <div className="audit-success-box">
                <div className="audit-domain-header">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <span className="audit-domain-url">{currentResult.url}</span>
                  <span className="status-badge status-ok">HTTP {currentResult.status_code}</span>
                </div>

                <div className="audit-metrics-strip">
                  <div className="metric-chip">
                    <Clock size={16} />
                    <span>Response Time: <strong>{currentResult.response_time_ms} ms</strong></span>
                  </div>
                  <div className="metric-chip">
                    <Hash size={16} />
                    <span>H1 Tags: <strong>{currentResult.h1_count}</strong></span>
                  </div>
                </div>

                <div className="audit-details-section">
                  <div className="detail-item">
                    <span className="detail-label">Meta Title:</span>
                    <span className="detail-val">{currentResult.title || '(No title found)'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Meta Description:</span>
                    <span className="detail-val">{currentResult.description || '(No meta description found)'}</span>
                  </div>
                </div>

                <div className="modal-applied-banner">
                  ✓ Dashboard metrics have been updated with this live audit result!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
