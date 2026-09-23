import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Smartphone,
  Link2,
} from 'lucide-react';
import { ScoreRing } from './components/ScoreRing';
import { CheckItem } from './components/CheckItem';
import { AIReport } from './components/AIReport';
import { ChatPane } from './components/ChatPane';
import { DetailTab } from './components/DetailTab';
import type { AuditResult, AuditAIReport } from '../types';
import { calculateSeoScore } from '../utils/seoCalculator';
import {
  generateAuditReport,
  getDeepSeekApiKey,
  setDeepSeekApiKey,
  DEEPSEEK_MODEL,
} from '../services/deepseekService';

type Tab = 'overview' | 'ai' | 'detail' | 'chat' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Skor', icon: <LayoutDashboard size={14} /> },
  { id: 'ai', label: 'AI', icon: <Sparkles size={14} /> },
  { id: 'detail', label: 'Detail', icon: <FileText size={14} /> },
  { id: 'chat', label: 'Chat', icon: <MessageSquare size={14} /> },
  { id: 'settings', label: 'API', icon: <Settings size={14} /> },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [score, setScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [report, setReport] = useState<AuditAIReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Settings state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize API key input
  useEffect(() => {
    setApiKeyInput(getDeepSeekApiKey());
  }, []);

  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAudit(null);
    setReport(null);

    try {
      // Get the active tab
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!activeTab?.id) {
        throw new Error('Tidak ada tab aktif yang ditemukan.');
      }

      // Check if we can inject into this tab
      const url = activeTab.url ?? '';
      if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) {
        throw new Error('Extension tidak bisa menganalisis halaman Chrome internal. Buka website biasa terlebih dahulu.');
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(activeTab.id, { type: 'GET_SEO_DATA' });

      if (!response || response.type === 'SEO_DATA_ERROR') {
        throw new Error(response?.error ?? 'Gagal mendapatkan data SEO dari halaman.');
      }

      const data: AuditResult = response.data;
      const calculatedScore = calculateSeoScore(data);
      data.score = calculatedScore;

      setAudit(data);
      setScore(calculatedScore);
      setIsAnalyzing(false);

      // Auto-generate AI report
      setIsGeneratingReport(true);
      const aiReport = await generateAuditReport(data);
      aiReport.score = calculatedScore;
      setReport(aiReport);
      setIsGeneratingReport(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.';
      setAnalyzeError(msg);
      setIsAnalyzing(false);
    }
  }, []);

  // Auto-run on mount
  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  const handleRefreshReport = async () => {
    if (!audit) return;
    setIsGeneratingReport(true);
    const aiReport = await generateAuditReport(audit, Boolean(getDeepSeekApiKey()));
    aiReport.score = score;
    setReport(aiReport);
    setIsGeneratingReport(false);
  };

  const handleSaveApiKey = () => {
    setDeepSeekApiKey(apiKeyInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    // Regenerate report with new key
    if (audit) handleRefreshReport();
  };

  const hostname = audit?.url ? (() => {
    try { return new URL(audit.url).hostname; } catch { return audit.url; }
  })() : '';

  return (
    <div className="ext-root">
      {/* Header */}
      <header className="ext-header">
        <div className="ext-header-brand">
          <div className="ext-logo">
            <Sparkles size={14} />
          </div>
          <span className="ext-brand-name">SEO Analyzer AI</span>
        </div>
        {audit && (
          <div className="ext-header-url" title={audit.url}>
            <span className="ext-url-dot" />
            <span className="ext-url-text">{hostname}</span>
            <a href={audit.url} target="_blank" rel="noopener noreferrer" className="ext-url-link">
              <ExternalLink size={10} />
            </a>
          </div>
        )}
        <button
          className="ext-refresh-btn"
          onClick={runAnalysis}
          disabled={isAnalyzing}
          title="Analisis ulang halaman ini"
        >
          <RefreshCw size={13} className={isAnalyzing ? 'spin-icon' : ''} />
        </button>
      </header>

      {/* Tab Bar */}
      <nav className="ext-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`ext-tab ${tab === t.id ? 'ext-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.id === 'ai' && report && (report.criticalCount > 0) && (
              <span className="ext-tab-badge">{report.criticalCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="ext-content">
        {/* Loading State */}
        {isAnalyzing && (
          <div className="ext-loading">
            <div className="ext-loading-ring">
              <div className="ext-loading-spinner" />
            </div>
            <p className="ext-loading-text">Menganalisis halaman...</p>
            <p className="ext-loading-sub">Membaca DOM, meta tags, dan struktur SEO</p>
          </div>
        )}

        {/* Error State */}
        {!isAnalyzing && analyzeError && (
          <div className="ext-error">
            <AlertCircle size={32} style={{ color: '#ef4444', marginBottom: 12 }} />
            <p className="ext-error-title">Analisis Gagal</p>
            <p className="ext-error-msg">{analyzeError}</p>
            <button className="ext-retry-btn" onClick={runAnalysis}>
              <RefreshCw size={13} /> Coba Lagi
            </button>
          </div>
        )}

        {/* Main Content */}
        {!isAnalyzing && audit && !analyzeError && (
          <>
            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
              <div className="tab-overview">
                {/* Score Hero */}
                <div className="overview-hero">
                  <ScoreRing score={score} size={130} />
                  <div className="overview-hero-info">
                    <p className="overview-title">{audit.title || '(Tanpa Judul)'}</p>
                    <p className="overview-url">{hostname}</p>
                    <div className="overview-quick-badges">
                      <span className={`quick-badge ${audit.has_ssl ? 'ok' : 'fail'}`}>
                        <Shield size={9} />
                        {audit.has_ssl ? 'HTTPS' : 'HTTP'}
                      </span>
                      <span className={`quick-badge ${audit.has_viewport ? 'ok' : 'fail'}`}>
                        <Smartphone size={9} />
                        {audit.has_viewport ? 'Mobile OK' : 'No Viewport'}
                      </span>
                      <span className="quick-badge info">
                        <Link2 size={9} />
                        {audit.internal_links} internal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Check Items */}
                <div className="overview-checks">
                  <CheckItem
                    label="Meta Title"
                    value={audit.title ? `${audit.title.length} karakter` : 'Tidak ada'}
                    status={
                      !audit.title
                        ? 'critical'
                        : audit.title.length >= 30 && audit.title.length <= 60
                        ? 'passed'
                        : 'warning'
                    }
                  />
                  <CheckItem
                    label="Meta Description"
                    value={audit.description ? `${audit.description.length} karakter` : 'Tidak ada'}
                    status={
                      !audit.description
                        ? 'critical'
                        : audit.description.length >= 50 && audit.description.length <= 160
                        ? 'passed'
                        : 'warning'
                    }
                  />
                  <CheckItem
                    label="H1 Tag"
                    value={audit.h1_count === 0 ? 'Tidak ada' : audit.h1_count > 1 ? `${audit.h1_count} H1` : '1 H1 ✓'}
                    status={audit.h1_count === 1 ? 'passed' : audit.h1_count === 0 ? 'critical' : 'warning'}
                  />
                  <CheckItem
                    label="Canonical"
                    value={audit.canonical ? 'Ada' : 'Tidak ada'}
                    status={audit.canonical ? 'passed' : 'warning'}
                  />
                  <CheckItem
                    label="Alt Gambar"
                    value={
                      audit.images_total === 0
                        ? 'Tidak ada gambar'
                        : audit.images_missing_alt === 0
                        ? `${audit.images_total} OK`
                        : `${audit.images_missing_alt}/${audit.images_total} kosong`
                    }
                    status={
                      audit.images_total === 0 || audit.images_missing_alt === 0
                        ? 'passed'
                        : audit.images_missing_alt > audit.images_total / 2
                        ? 'critical'
                        : 'warning'
                    }
                  />
                  <CheckItem
                    label="Open Graph"
                    value={audit.og_title && audit.og_image ? 'Lengkap' : 'Tidak lengkap'}
                    status={audit.og_title && audit.og_image ? 'passed' : 'warning'}
                  />
                </div>

                {/* Quick Wins from AI */}
                {report?.quickWins && report.quickWins.length > 0 && (
                  <div className="overview-quick-wins">
                    <div className="qw-header">
                      <Sparkles size={11} />
                      <span>AI Quick Wins</span>
                    </div>
                    {report.quickWins.map((win, i) => (
                      <div key={i} className="qw-item">
                        <span className="qw-num">0{i + 1}.</span>
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AI REPORT TAB */}
            {tab === 'ai' && (
              <AIReport
                report={report}
                isGenerating={isGeneratingReport}
                onRefresh={handleRefreshReport}
              />
            )}

            {/* DETAIL TAB */}
            {tab === 'detail' && <DetailTab audit={audit} />}

            {/* CHAT TAB */}
            {tab === 'chat' && <ChatPane auditResult={audit} />}

            {/* SETTINGS TAB */}
            {tab === 'settings' && (
              <div className="settings-pane">
                <div className="settings-section">
                  <h4 className="settings-title">
                    <Sparkles size={14} style={{ color: '#60a5fa' }} />
                    Konfigurasi DeepSeek AI
                  </h4>
                  <p className="settings-desc">
                    Pasang API key DeepSeek untuk analisis AI yang lebih mendalam dan chat copilot
                    dengan konteks penuh.
                  </p>

                  <div className="settings-field">
                    <label className="settings-label">DeepSeek API Key</label>
                    <div className="settings-input-row">
                      <input
                        type={showKey ? 'text' : 'password'}
                        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        className="settings-input"
                      />
                      <button
                        className="settings-eye-btn"
                        onClick={() => setShowKey((v) => !v)}
                        title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    <span className="settings-hint">
                      Tersimpan aman di browser local storage. Model:{' '}
                      <code>{DEEPSEEK_MODEL}</code>
                    </span>
                  </div>

                  <div className="settings-actions">
                    <button
                      className="settings-clear-btn"
                      onClick={() => {
                        setApiKeyInput('');
                        setDeepSeekApiKey('');
                      }}
                    >
                      Hapus Key
                    </button>
                    <button className="settings-save-btn" onClick={handleSaveApiKey}>
                      {saveSuccess ? '✓ Tersimpan!' : 'Simpan & Terapkan'}
                    </button>
                  </div>
                </div>

                <div className="settings-info-box">
                  <p className="settings-info-title">Tanpa API Key</p>
                  <p className="settings-info-desc">
                    Extension tetap berfungsi penuh dengan SEO Heuristik Engine bawaan — tidak perlu
                    API key untuk analisis teknis dan rekomendasi dasar.
                  </p>
                </div>

                <div className="settings-section">
                  <h4 className="settings-title">ℹ️ Tentang Extension</h4>
                  <div className="settings-about">
                    <div className="about-row">
                      <span>Versi</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="about-row">
                      <span>Engine</span>
                      <span>Chrome Extension MV3</span>
                    </div>
                    <div className="about-row">
                      <span>Analisis</span>
                      <span>Real-time DOM Reader</span>
                    </div>
                    <div className="about-row">
                      <span>AI</span>
                      <span>{getDeepSeekApiKey() ? `DeepSeek (${DEEPSEEK_MODEL})` : 'Heuristik Engine'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
