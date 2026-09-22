import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCw,
  Copy,
  Check,
  Settings2,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Info,
  CornerDownLeft,
  Trash2,
  Zap,
} from 'lucide-react';
import type { AuditResult, ChatMessage } from '../types';
import {
  generateAuditReport,
  askDeepSeekCopilot,
  getDeepSeekApiKey,
  setDeepSeekApiKey,
  DEEPSEEK_MODEL,
  type AuditAIReport,
} from '../services/deepseekService';

interface AIAssistantCardProps {
  auditResult?: AuditResult | null;
  isFullTab?: boolean;
}

export const AIAssistantCard = ({ auditResult, isFullTab = false }: AIAssistantCardProps) => {
  // Mode: 'report' (Laporan Rekomendasi) or 'chat' (Konsultasi DeepSeek)
  const [activeMode, setActiveMode] = useState<'report' | 'chat'>('report');

  // Report state
  const [report, setReport] = useState<AuditAIReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [isReportCopied, setIsReportCopied] = useState(false);

  // DeepSeek Config Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Halo! Saya asisten SEO AI berbasis DeepSeek. Saya telah menyiapkan laporan rekomendasi audit lengkap di tab sebelah. Anda juga bisa menanyakan strategi teknis perbaikan di sini!',
      actionText: '▲',
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi API Key
  useEffect(() => {
    const key = getDeepSeekApiKey();
    setApiKeyInput(key);
    setHasApiKey(Boolean(key));
  }, []);

  // Update laporan ketika auditResult berubah
  useEffect(() => {
    let isCancelled = false;

    const buildReport = async () => {
      setIsGeneratingReport(true);
      try {
        const result = await generateAuditReport(auditResult);
        if (!isCancelled) {
          setReport(result);
        }
      } catch (err) {
        console.error('Error generating AI audit report:', err);
      } finally {
        if (!isCancelled) {
          setIsGeneratingReport(false);
        }
      }
    };

    buildReport();

    return () => {
      isCancelled = true;
    };
  }, [auditResult]);

  // Scroll chat saat pesan baru masuk
  useEffect(() => {
    if (activeMode === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeMode]);

  // Handle refresh laporan
  const handleRefreshReport = async () => {
    setIsGeneratingReport(true);
    try {
      const result = await generateAuditReport(auditResult, true);
      setReport(result);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Salin Kode Snippet
  const handleCopySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Salin Laporan Lengkap ke Markdown
  const handleCopyFullReport = () => {
    if (!report) return;

    const markdownText = `# Laporan Rekomendasi SEO - DeepSeek Engine
URL Target: ${report.url || 'N/A'}
Skor Kesehatan: ${report.score}/100
Waktu Generate: ${report.generatedAt}
Model: ${report.modelName}

## Ringkasan Eksekutif
${report.executiveSummary}

## Prioritas Masalah
- Isu Kritis: ${report.criticalCount}
- Peringatan: ${report.warningCount}
- Parameter Optimal: ${report.passedCount}

## Quick Wins (Perbaikan Cepat)
${report.quickWins.map((w, i) => `${i + 1}. ${w}`).join('\n')}

## Daftar Rekomendasi Lengkap
${report.recommendations
  .map(
    (r, i) => `### ${i + 1}. [${r.priority.toUpperCase()}] ${r.title}
- Kategori: ${r.category}
- Estimasi Dampak: ${r.impact}
- Penjelasan: ${r.description}
${r.reasoning ? `- Analisis AI: ${r.reasoning}` : ''}
${r.actionSnippet ? `\n\`\`\`html\n${r.actionSnippet}\n\`\`\`\n` : ''}`
  )
  .join('\n\n')}

---
Dianalisis secara otomatis oleh SEO Analyzer & DeepSeek Engine.`;

    navigator.clipboard.writeText(markdownText);
    setIsReportCopied(true);
    setTimeout(() => setIsReportCopied(false), 2500);
  };

  // Simpan Pengaturan DeepSeek
  const handleSaveConfig = () => {
    setDeepSeekApiKey(apiKeyInput);
    setHasApiKey(Boolean(apiKeyInput.trim()));
    setIsConfigOpen(false);

    // Refresh report dengan konfigurasi baru
    handleRefreshReport();
  };

  // Kirim Pesan Chat
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    try {
      const reply = await askDeepSeekCopilot(text, auditResult, messages);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          actionText: '▲',
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Maaf, terjadi kendala saat memproses respons. Silakan coba lagi atau periksa konfigurasi DeepSeek.',
          actionText: '▲',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Filter recommendations
  const filteredRecs = (report?.recommendations || []).filter((item) => {
    if (filterPriority === 'all') return true;
    return item.priority === filterPriority;
  });

  const promptSuggestions = isFullTab
    ? [
        'Cara capai skor 100/100',
        'Rekomendasi perbaiki Meta Title & Deskripsi',
        'Solusi TTFB lambat & performa',
        'Struktur heading H1 terbaik',
        'Optimasi tag alt gambar',
        'Template Open Graph & Schema',
      ]
    : [
        'Cara capai 100/100',
        'Solusi Meta Tags',
        'Optimalkan TTFB',
        'Perbaiki H1 & Alt',
      ];

  return (
    <div className={`vercel-card vercel-ai-copilot-card ${isFullTab ? 'is-full-tab' : ''}`}>
      {/* Header */}
      <div className="vercel-card-header">
        <div className="vercel-card-title-group">
          <div className="vercel-card-icon-tag vercel-ai-tag">
            <Sparkles size={14} className="text-cyan-400" />
          </div>
          <div>
            <div className="vercel-ai-title-row">
              <h3 className="vercel-card-title">Laporan Rekomendasi AI</h3>
              <span
                className="vercel-ai-version-badge"
                title={hasApiKey ? 'DeepSeek API Terhubung' : 'Disiapkan untuk DeepSeek API (Siap Pakai)'}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: hasApiKey ? '#10b981' : '#38bdf8',
                    marginRight: 4,
                  }}
                />
                DeepSeek ({DEEPSEEK_MODEL})
              </span>

              {auditResult?.url && (
                <div className="vercel-ai-target-pill">
                  <span className="vercel-ai-target-dot" />
                  <span>{auditResult.url.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
            </div>
            <p className="vercel-card-sub">Audit cerdas & rencana aksi perbaikan otomatis</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="vercel-ai-actions-row">
          <button
            type="button"
            className="vercel-icon-action-btn"
            onClick={() => setIsConfigOpen(true)}
            title="Konfigurasi API DeepSeek"
          >
            <Settings2 size={14} />
          </button>
          <button
            type="button"
            className={`vercel-icon-action-btn ${isGeneratingReport ? 'vercel-ai-pulse' : ''}`}
            onClick={handleRefreshReport}
            title="Analisis ulang / Regenerate Laporan"
            disabled={isGeneratingReport || !auditResult}
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Mode Navigation Bar (Laporan Rekomendasi vs DeepSeek Chat) */}
      <div className="vercel-ai-mode-nav">
        <div className="vercel-ai-mode-tabs">
          <button
            type="button"
            className={`vercel-ai-mode-btn ${activeMode === 'report' ? 'active' : ''}`}
            onClick={() => setActiveMode('report')}
          >
            <FileText size={13} />
            <span>Laporan Rekomendasi</span>
            {report && (
              <span className="text-[10px] font-mono opacity-80 ml-0.5">
                ({report.recommendations.length})
              </span>
            )}
          </button>
          <button
            type="button"
            className={`vercel-ai-mode-btn ${activeMode === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveMode('chat')}
          >
            <MessageSquare size={13} />
            <span>Konsultasi DeepSeek</span>
          </button>
        </div>

        {activeMode === 'report' && report && report.recommendations.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="vercel-ai-btn-sm"
              onClick={handleCopyFullReport}
              title="Salin laporan lengkap dalam format Markdown"
            >
              {isReportCopied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Salin Laporan</span>
                </>
              )}
            </button>
          </div>
        )}

        {activeMode === 'chat' && (
          <button
            type="button"
            className="vercel-ai-btn-sm"
            onClick={() =>
              setMessages([
                {
                  id: Date.now().toString(),
                  sender: 'ai',
                  text: 'Riwayat percakapan dibersihkan. Ada hal lain seputar SEO yang ingin Anda tanyakan?',
                  actionText: '▲',
                },
              ])
            }
            title="Hapus riwayat chat"
          >
            <Trash2 size={12} />
            <span>Hapus</span>
          </button>
        )}
      </div>

      {/* TAB 1: LAPORAN REKOMENDASI AUDIT */}
      {activeMode === 'report' && (
        <div className="vercel-ai-report-body">
          {!auditResult ? (
            <div className="vercel-ai-empty-state">
              <div className="vercel-ai-empty-icon">
                <Sparkles size={20} />
              </div>
              <h4 className="vercel-ai-empty-title">Siap Membuat Laporan Rekomendasi</h4>
              <p className="vercel-ai-empty-desc">
                Masukkan URL situs di atas dan jalankan audit untuk menghasilkan laporan rekomendasi SEO terstruktur dari DeepSeek.
              </p>
            </div>
          ) : isGeneratingReport ? (
            <div className="vercel-ai-empty-state">
              <div className="vercel-ai-empty-icon vercel-ai-pulse">
                <RotateCw size={20} className="animate-spin text-cyan-400" />
              </div>
              <h4 className="vercel-ai-empty-title">Menyusun Laporan Rekomendasi...</h4>
              <p className="vercel-ai-empty-desc">
                DeepSeek Engine sedang menganalisis status teknis, hierarki konten, performa TTFB, dan metadata.
              </p>
            </div>
          ) : report ? (
            <>
              {/* Executive Summary Banner */}
              <div className="vercel-ai-summary-banner">
                <div className="vercel-ai-summary-top">
                  <div className="vercel-ai-summary-title">
                    <Zap size={14} className="text-amber-400" />
                    <span>Ringkasan Eksekutif Audit</span>
                  </div>
                  <div className="vercel-ai-summary-stats">
                    {report.criticalCount > 0 && (
                      <span className="vercel-ai-stat-badge critical">
                        🚨 {report.criticalCount} Kritis
                      </span>
                    )}
                    {report.warningCount > 0 && (
                      <span className="vercel-ai-stat-badge warning">
                        ⚠️ {report.warningCount} Optimasi
                      </span>
                    )}
                    <span className="vercel-ai-stat-badge passed">
                      ✅ {report.passedCount} Optimal
                    </span>
                    <span className="vercel-ai-stat-badge" style={{ background: '#1c1c1c', color: '#a1a1aa' }}>
                      ⚡ {auditResult.response_time_ms}ms TTFB
                    </span>
                  </div>
                </div>

                <p className="vercel-ai-summary-text">{report.executiveSummary}</p>

                {report.quickWins.length > 0 && (
                  <div className="vercel-ai-quick-wins">
                    <div className="vercel-ai-quick-wins-label">
                      <Sparkles size={11} />
                      <span>Rencana Aksi Cepat (Quick Wins)</span>
                    </div>
                    {report.quickWins.map((win, idx) => (
                      <div key={idx} className="vercel-ai-quick-win-item">
                        <span className="text-emerald-400 font-mono text-[11px] font-bold">
                          0{idx + 1}.
                        </span>
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Filters */}
              <div className="vercel-ai-filter-bar">
                <button
                  type="button"
                  className={`vercel-ai-filter-chip ${filterPriority === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterPriority('all')}
                >
                  Semua ({report.recommendations.length})
                </button>
                {report.criticalCount > 0 && (
                  <button
                    type="button"
                    className={`vercel-ai-filter-chip ${filterPriority === 'critical' ? 'active' : ''}`}
                    onClick={() => setFilterPriority('critical')}
                  >
                    🚨 Kritis ({report.criticalCount})
                  </button>
                )}
                {report.warningCount > 0 && (
                  <button
                    type="button"
                    className={`vercel-ai-filter-chip ${filterPriority === 'warning' ? 'active' : ''}`}
                    onClick={() => setFilterPriority('warning')}
                  >
                    ⚠️ Peningkatan ({report.warningCount})
                  </button>
                )}
                <button
                  type="button"
                  className={`vercel-ai-filter-chip ${filterPriority === 'passed' ? 'active' : ''}`}
                  onClick={() => setFilterPriority('passed')}
                >
                  ✅ Lulus ({report.passedCount})
                </button>
              </div>

              {/* Recommendation Cards List */}
              <div className="vercel-ai-rec-list">
                {filteredRecs.map((rec) => (
                  <div key={rec.id} className={`vercel-ai-rec-card priority-${rec.priority}`}>
                    <div className="vercel-ai-rec-header">
                      <div className="vercel-ai-rec-title-group">
                        <div className="vercel-ai-rec-meta">
                          <span className={`vercel-ai-priority-badge ${rec.priority}`}>
                            {rec.priority === 'critical'
                              ? 'Prioritas Kritis'
                              : rec.priority === 'warning'
                              ? 'Perlu Optimasi'
                              : rec.priority === 'passed'
                              ? 'Lulus Audit'
                              : 'Info'}
                          </span>
                          <span className="vercel-ai-category-badge">{rec.category}</span>
                          <span className="vercel-ai-impact-badge">{rec.impact}</span>
                        </div>
                        <h4 className="vercel-ai-rec-title">{rec.title}</h4>
                      </div>

                      {rec.priority === 'critical' && (
                        <AlertTriangle size={15} className="text-red-400 shrink-0 mt-1" />
                      )}
                      {rec.priority === 'warning' && (
                        <Info size={15} className="text-amber-400 shrink-0 mt-1" />
                      )}
                      {rec.priority === 'passed' && (
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="vercel-ai-rec-desc">{rec.description}</p>

                    {/* Action Code Snippet */}
                    {rec.actionSnippet && (
                      <div className="vercel-ai-snippet-box">
                        <div className="vercel-ai-snippet-header">
                          <span>Contoh Implementasi / Solusi Kode</span>
                          <button
                            type="button"
                            className="vercel-ai-snippet-copy-btn"
                            onClick={() => handleCopySnippet(rec.id, rec.actionSnippet!)}
                          >
                            {copiedSnippetId === rec.id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Salin Kode</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="vercel-ai-snippet-content">{rec.actionSnippet}</pre>
                      </div>
                    )}

                    {/* Reasoning callout */}
                    {rec.reasoning && (
                      <div className="vercel-ai-reasoning-callout">
                        <Sparkles size={12} className="vercel-ai-reasoning-icon text-blue-400" />
                        <div>
                          <strong className="text-blue-300 font-medium">Analisis Dampak: </strong>
                          <span>{rec.reasoning}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* DeepSeek Readiness Footer Card */}
              <div className="vercel-ai-deepseek-banner">
                <div className="vercel-ai-deepseek-banner-text">
                  <Sparkles size={13} className="text-cyan-400 shrink-0" />
                  <span>
                    {hasApiKey
                      ? `Terhubung ke API DeepSeek (${DEEPSEEK_MODEL})`
                      : `Komponen disiapkan untuk DeepSeek (${DEEPSEEK_MODEL}). API Key opsional dapat dipasang kapan saja.`}
                  </span>
                </div>
                <button
                  type="button"
                  className="vercel-ai-deepseek-banner-btn"
                  onClick={() => setIsConfigOpen(true)}
                >
                  {hasApiKey ? 'Ubah Kunci' : 'Hubungkan DeepSeek'}
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: CHAT DENGAN DEEPSEEK COPILOT */}
      {activeMode === 'chat' && (
        <>
          {/* Quick Prompt Suggestions */}
          <div className="vercel-ai-quick-prompts">
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="vercel-prompt-chip"
                onClick={() => handleSendMessage(prompt)}
                disabled={isTyping}
              >
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="vercel-ai-chat-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`vercel-chat-msg ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}
              >
                <div className="vercel-msg-avatar">
                  {msg.sender === 'user' ? (
                    <div className="user-icon-avatar">You</div>
                  ) : (
                    <div className="ai-icon-avatar" style={{ background: '#0070f3', color: '#fff' }}>
                      DS
                    </div>
                  )}
                </div>
                <div className="vercel-msg-bubble">
                  <div className="vercel-msg-content font-sans">{msg.text}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="vercel-chat-msg ai-msg">
                <div className="vercel-msg-avatar">
                  <div className="ai-icon-avatar" style={{ background: '#0070f3', color: '#fff' }}>
                    DS
                  </div>
                </div>
                <div className="vercel-msg-bubble typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="vercel-ai-input-wrapper">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="vercel-ai-form"
            >
              <input
                type="text"
                placeholder={
                  isFullTab
                    ? 'Tanyakan DeepSeek strategi perbaikan SEO, Core Web Vitals, atau metadata...'
                    : 'Tanya DeepSeek seputar SEO website ini...'
                }
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="vercel-ai-input font-sans"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="vercel-ai-send-btn"
                title="Kirim pesan"
              >
                <CornerDownLeft size={14} />
              </button>
            </form>
            {isFullTab && (
              <div className="vercel-ai-footer-note">
                DeepSeek Engine siap dengan konteks audit real-time. Tekan <kbd>Enter ↵</kbd> untuk mengirim.
              </div>
            )}
          </div>
        </>
      )}

      {/* DEEPSEEK CONFIG MODAL */}
      {isConfigOpen && (
        <div className="vercel-ai-modal-overlay" onClick={() => setIsConfigOpen(false)}>
          <div className="vercel-ai-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vercel-ai-modal-header">
              <div className="vercel-ai-modal-title">
                <Sparkles size={16} className="text-cyan-400" />
                <span>Pengaturan DeepSeek AI Engine</span>
              </div>
              <button
                type="button"
                className="vercel-icon-action-btn"
                onClick={() => setIsConfigOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="vercel-ai-modal-note">
              Komponen ini telah disiapkan penuh untuk arsitektur <strong>DeepSeek</strong>. Anda bisa menggunakan mesin rekomendasi lokal bawaan tanpa API Key, atau memasukkan API Key resmi DeepSeek kapan pun Anda siap.
            </div>

            <div className="vercel-ai-modal-form-group">
              <label className="vercel-ai-modal-label">DeepSeek API Key (Opsional)</label>
              <input
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="vercel-ai-modal-input"
              />
              <span className="text-[11px] text-zinc-500">
                Tersimpan aman di Local Storage browser Anda atau melalui variabel <code>VITE_DEEPSEEK_API_KEY</code>.
              </span>
            </div>

            <div className="vercel-ai-modal-form-group">
              <label className="vercel-ai-modal-label">Model DeepSeek</label>
              <div className="text-xs text-zinc-300 font-mono bg-zinc-950 px-3 py-2 rounded border border-zinc-800 flex items-center justify-between">
                <span>{DEEPSEEK_MODEL} (DeepSeek-V3)</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-sans font-medium">
                  Model Default
                </span>
              </div>
            </div>

            <div className="vercel-ai-modal-footer">
              <button
                type="button"
                className="vercel-ai-btn-sm"
                onClick={() => {
                  setApiKeyInput('');
                  setDeepSeekApiKey('');
                  setHasApiKey(false);
                  setIsConfigOpen(false);
                }}
              >
                Hapus Kunci
              </button>
              <button
                type="button"
                className="vercel-ai-btn-sm primary"
                onClick={handleSaveConfig}
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
