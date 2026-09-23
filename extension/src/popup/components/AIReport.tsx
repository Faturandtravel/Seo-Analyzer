import React, { useState } from 'react';
import {
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AuditAIReport, RecommendationItem } from '../../types';

interface AIReportProps {
  report: AuditAIReport | null;
  isGenerating: boolean;
  onRefresh: () => void;
}

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === 'critical') return <XCircle size={12} style={{ color: '#ef4444' }} />;
  if (priority === 'warning') return <AlertTriangle size={12} style={{ color: '#f59e0b' }} />;
  if (priority === 'passed') return <CheckCircle2 size={12} style={{ color: '#10b981' }} />;
  return null;
};

const RecCard: React.FC<{ rec: RecommendationItem }> = ({ rec }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rec.actionSnippet) {
      navigator.clipboard.writeText(rec.actionSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rec-card rec-card--${rec.priority}`}>
      <button className="rec-card-header" onClick={() => setExpanded((v) => !v)}>
        <div className="rec-card-header-left">
          <PriorityIcon priority={rec.priority} />
          <span className="rec-card-title">{rec.title}</span>
        </div>
        <div className="rec-card-header-right">
          <span className={`rec-badge rec-badge--${rec.priority}`}>
            {rec.priority === 'critical'
              ? 'Kritis'
              : rec.priority === 'warning'
              ? 'Optimalkan'
              : rec.priority === 'passed'
              ? 'Lulus'
              : 'Info'}
          </span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </div>
      </button>

      {expanded && (
        <div className="rec-card-body">
          <p className="rec-card-desc">{rec.description}</p>

          {rec.actionSnippet && (
            <div className="rec-snippet-box">
              <div className="rec-snippet-header">
                <span>Solusi Kode</span>
                <button className="rec-copy-btn" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check size={10} style={{ color: '#10b981' }} />
                      <span style={{ color: '#10b981' }}>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="rec-snippet-code">{rec.actionSnippet}</pre>
            </div>
          )}

          {rec.reasoning && (
            <div className="rec-reasoning">
              <span className="rec-reasoning-label">💡 Analisis AI:</span>
              <span>{rec.reasoning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const AIReport: React.FC<AIReportProps> = ({ report, isGenerating, onRefresh }) => {
  const [filter, setFilter] = useState<string>('all');

  if (isGenerating) {
    return (
      <div className="report-loading">
        <div className="report-loading-icon">
          <RotateCw size={22} className="spin-icon" style={{ color: '#60a5fa' }} />
        </div>
        <p className="report-loading-text">AI sedang menganalisis halaman...</p>
        <p className="report-loading-sub">Menyusun rekomendasi berdasarkan data SEO real-time</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-empty">
        <p>Belum ada laporan. Tunggu analisis selesai.</p>
      </div>
    );
  }

  const filtered = (report.recommendations ?? []).filter((r) => {
    if (filter === 'all') return true;
    return r.priority === filter;
  });

  return (
    <div className="ai-report-container">
      {/* Summary Banner */}
      <div className="report-summary">
        <div className="report-summary-top">
          <div className="report-summary-badges">
            {report.criticalCount > 0 && (
              <span className="summary-badge summary-badge--critical">
                🚨 {report.criticalCount} Kritis
              </span>
            )}
            {report.warningCount > 0 && (
              <span className="summary-badge summary-badge--warning">
                ⚠️ {report.warningCount} Optimalkan
              </span>
            )}
            <span className="summary-badge summary-badge--passed">
              ✅ {report.passedCount} Lulus
            </span>
          </div>
          <button className="report-refresh-btn" onClick={onRefresh} title="Regenerasi laporan">
            <RotateCw size={11} />
          </button>
        </div>
        <p className="report-summary-text">{report.executiveSummary}</p>

        {report.quickWins.length > 0 && (
          <div className="report-quick-wins">
            <div className="quick-wins-label">
              <Zap size={10} style={{ color: '#f59e0b' }} />
              <span>Quick Wins</span>
            </div>
            {report.quickWins.map((win, i) => (
              <div key={i} className="quick-win-item">
                <span className="quick-win-num">0{i + 1}.</span>
                <span>{win}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="report-filter-bar">
        {[
          { key: 'all', label: `Semua (${report.recommendations.length})` },
          ...(report.criticalCount > 0 ? [{ key: 'critical', label: `🚨 Kritis (${report.criticalCount})` }] : []),
          ...(report.warningCount > 0 ? [{ key: 'warning', label: `⚠️ Optimasi (${report.warningCount})` }] : []),
          { key: 'passed', label: `✅ Lulus (${report.passedCount})` },
        ].map((f) => (
          <button
            key={f.key}
            className={`filter-chip ${filter === f.key ? 'filter-chip--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="rec-list">
        {filtered.map((rec) => (
          <RecCard key={rec.id} rec={rec} />
        ))}
        {filtered.length === 0 && (
          <p className="rec-empty-text">Tidak ada item dalam kategori ini.</p>
        )}
      </div>

      {/* Footer */}
      <div className="report-footer">
        <span>{report.modelName}</span>
        <span>·</span>
        <span>{report.generatedAt}</span>
      </div>
    </div>
  );
};
