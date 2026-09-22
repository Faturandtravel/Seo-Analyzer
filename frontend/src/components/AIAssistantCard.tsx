import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Send, Trash2, Zap, Tag, CheckCircle2 } from 'lucide-react';
import { UserAvatar, BrandLogo } from './icons/BrandIcons';
import type { ChatMessage, AuditResult } from '../types';
import { getSeoRecommendations } from '../utils/seoCalculator';

interface AIAssistantCardProps {
  auditResult?: AuditResult | null;
}

export const AIAssistantCard = ({ auditResult }: AIAssistantCardProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'user',
      text: 'Hey, apa insight SEO dari website ini?',
    },
    {
      id: '2',
      sender: 'ai',
      text: 'Hasil Audit SEO',
      actionText: '✨',
    },
    {
      id: '3',
      sender: 'user',
      text: 'Bagaimana status HTTP dan kecepatan responnya?',
    },
    {
      id: '4',
      sender: 'ai',
      text: "Server respon 134ms dengan HTTP 200 OK!",
      actionText: '✨',
    },
    {
      id: '5',
      sender: 'user',
      text: 'Bisa tolong buatkan ringkasan rekomendasi optimasinya?🤗',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Topik: Rekomendasi SEO');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When auditResult updates, send a proactive AI insight message
  useEffect(() => {
    if (auditResult && !auditResult.error) {
      const recs = getSeoRecommendations(auditResult);
      const topAdvice = recs[0] || 'Semua indikator SEO dasar terpenuhi dengan baik!';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `Audit baru selesai untuk ${auditResult.url}: ${topAdvice}`,
          actionText: '✨',
        },
      ]);
    }
  }, [auditResult]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = 'Data SEO telah dianalisis! Pastikan meta description terisi dan gunakan tepat 1 tag H1.';
      const lower = userText.toLowerCase();

      if (lower.includes('h1') || lower.includes('heading')) {
        reply = auditResult
          ? `Website ini memiliki ${auditResult.h1_count} tag <h1>. Rekomendasi SEO terbaik adalah 1 tag H1 per halaman.`
          : 'Gunakan tepat satu tag <h1> sebagai judul utama halaman untuk hierarki konten yang jelas bagi Google bot.';
      } else if (lower.includes('speed') || lower.includes('kecepatan') || lower.includes('latency')) {
        reply = auditResult
          ? `Waktu respon server adalah ${auditResult.response_time_ms}ms. Response di bawah 300ms dinilai sangat baik oleh Google Core Web Vitals!`
          : 'Response time di bawah 300ms memberikan skor optimal untuk Core Web Vitals.';
      } else if (lower.includes('meta') || lower.includes('title') || lower.includes('deskripsi')) {
        reply = auditResult?.title
          ? `Judul saat ini: "${auditResult.title}" (${auditResult.title.length} karakter). Idealnya antara 30-60 karakter.`
          : 'Tambahkan tag <title> dan <meta name="description"> agar tautan website tampil menarik di hasil pencarian Google.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: reply,
          actionText: '✨',
        },
      ]);
      setIsTyping(false);
    }, 850);
  };

  const handleSelectDropdownTopic = (topic: string, promptText?: string) => {
    setSelectedTopic(topic);
    setDropdownOpen(false);

    if (topic === 'Bersihkan Chat') {
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Riwayat percakapan telah dibersihkan. Ada yang bisa saya bantu terkait analisis SEO?',
          actionText: '✨',
        },
      ]);
      return;
    }

    if (promptText) {
      // Simulate user prompt and AI response
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: promptText,
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        let reply = '';
        if (topic.includes('Latensi')) {
          reply = `Server ${auditResult?.url || 'website'} merespon dalam ${auditResult?.response_time_ms || 134}ms (HTTP ${auditResult?.status_code || 200}). Latensi ini ${(auditResult?.response_time_ms || 134) < 300 ? 'sangat responsif' : 'perlu optimasi caching'}.`;
        } else if (topic.includes('Heading')) {
          reply = `Ditemukan ${auditResult?.h1_count ?? 1} tag H1. Judul halaman saat ini "${auditResult?.title || '(tidak ada)'}". Deskripsi: "${auditResult?.description || '(kosong)'}".`;
        } else {
          const recs = auditResult ? getSeoRecommendations(auditResult) : [];
          reply = recs.length > 0 ? recs.join(' • ') : 'Semua kriteria On-Page dasar dalam kondisi sehat!';
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: reply,
            actionText: '✨',
          },
        ]);
        setIsTyping(false);
      }, 700);
    }
  };

  return (
    <div className="dashboard-card ai-assistant-card">
      {/* Header with Title and Vertical Dropdown */}
      <div className="card-header">
        <div className="card-title-group">
          <h3 className="card-title">SEO AI Assistant</h3>
        </div>

        {/* Vertical Dropdown for Chat options & topics */}
        <div className="chat-dropdown-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="chat-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="Pilih Topik Chat"
          >
            <span className="chat-dropdown-label">{selectedTopic}</span>
            <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="chat-vertical-dropdown-menu">
              <div
                className="chat-dropdown-item"
                onClick={() =>
                  handleSelectDropdownTopic('Topik: Rekomendasi SEO', 'Apa saja rekomendasi optimasi SEO utama untuk website ini?')
                }
              >
                <Sparkles size={14} className="dropdown-item-icon text-green-500" />
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">Rekomendasi Utama</span>
                  <span className="dropdown-item-sub">Insight perbaikan On-Page</span>
                </div>
              </div>

              <div
                className="chat-dropdown-item"
                onClick={() =>
                  handleSelectDropdownTopic('Topik: Analisis Latensi', 'Bagaimana status kecepatan server dan Core Web Vitals?')
                }
              >
                <Zap size={14} className="dropdown-item-icon text-blue-500" />
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">Kecepatan & Latensi</span>
                  <span className="dropdown-item-sub">Evaluasi response time ms</span>
                </div>
              </div>

              <div
                className="chat-dropdown-item"
                onClick={() =>
                  handleSelectDropdownTopic('Topik: Heading & Meta', 'Bagaimana struktur tag H1 dan meta tags website?')
                }
              >
                <Tag size={14} className="dropdown-item-icon text-amber-500" />
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">Struktur H1 & Meta</span>
                  <span className="dropdown-item-sub">Periksa judul, deskripsi & H1</span>
                </div>
              </div>

              <div
                className="chat-dropdown-item"
                onClick={() =>
                  handleSelectDropdownTopic('Topik: Skor Keseluruhan', 'Berikan rangkuman evaluasi audit SEO secara lengkap.')
                }
              >
                <CheckCircle2 size={14} className="dropdown-item-icon text-emerald-600" />
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">Evaluasi Lengkap</span>
                  <span className="dropdown-item-sub">Rangkuman skor kesehatan SEO</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <div
                className="chat-dropdown-item danger"
                onClick={() => handleSelectDropdownTopic('Bersihkan Chat')}
              >
                <Trash2 size={14} className="dropdown-item-icon text-red-500" />
                <div className="dropdown-item-text">
                  <span className="dropdown-item-title">Bersihkan Chat</span>
                  <span className="dropdown-item-sub">Reset riwayat percakapan</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Thread (Fills the entire available card height with scroll) */}
      <div className="chat-thread-container">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="chat-row user-row">
                <div className="chat-bubble user-bubble">
                  {msg.text}
                </div>
                <UserAvatar size={26} className="chat-avatar" />
              </div>
            );
          }

          return (
            <div key={msg.id} className="chat-row ai-row">
              <div className="ai-icon-mark">
                <BrandLogo size={22} />
              </div>
              <div className="chat-bubble ai-bubble">
                <span>{msg.text}</span>
                {msg.actionText && <span className="ai-sparkle-badge">{msg.actionText}</span>}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="chat-row ai-row">
            <div className="ai-icon-mark">
              <BrandLogo size={22} />
            </div>
            <div className="chat-bubble ai-bubble typing-indicator">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Bottom Chat Prompt / Input Form */}
      <form onSubmit={handleSendMessage} className="chat-input-wrapper">
        <div className="chat-input-left-icon">
          <BrandLogo size={20} />
        </div>
        <input
          type="text"
          placeholder="Tanya rekomendasi SEO atau cara optimasi..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="chat-input-field"
        />
        <button type="submit" className="chat-send-btn" title="Kirim pesan">
          {inputVal.trim() ? <Send size={15} /> : <Sparkles size={16} />}
        </button>
      </form>
    </div>
  );
};
