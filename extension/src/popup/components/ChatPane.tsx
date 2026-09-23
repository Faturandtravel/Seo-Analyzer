import React, { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Trash2 } from 'lucide-react';
import type { AuditResult, ChatMessage } from '../../types';
import { askDeepSeekCopilot, getDeepSeekApiKey } from '../../services/deepseekService';

interface ChatPaneProps {
  auditResult: AuditResult | null;
}

const QUICK_PROMPTS = [
  'Cara capai skor 100/100',
  'Perbaiki Meta Tags',
  'Optimalkan TTFB & performa',
  'Solusi H1 & alt gambar',
];

export const ChatPane: React.FC<ChatPaneProps> = ({ auditResult }) => {
  const hasApiKey = Boolean(getDeepSeekApiKey());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: hasApiKey
        ? 'Halo! Saya AI SEO Copilot dengan DeepSeek. Tanyakan strategi perbaikan SEO halaman ini!'
        : 'Halo! Saya AI SEO Copilot. Mode lokal aktif — tambahkan DeepSeek API key di Settings untuk analisis lebih mendalam. Tanyakan seputar SEO halaman ini!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    if (!text) setInput('');
    setIsTyping(true);

    try {
      const reply = await askDeepSeekCopilot(msg, auditResult, messages);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'ai', text: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Maaf, terjadi kendala. Coba lagi atau periksa konfigurasi DeepSeek API key.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-pane">
      {/* Quick Prompts */}
      <div className="chat-quick-prompts">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            className="chat-prompt-chip"
            onClick={() => handleSend(p)}
            disabled={isTyping}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg chat-msg--${msg.sender}`}>
            <div className="chat-avatar">
              {msg.sender === 'user' ? (
                <div className="avatar-user">U</div>
              ) : (
                <div className="avatar-ai">AI</div>
              )}
            </div>
            <div className="chat-bubble">
              <p className="chat-text">{msg.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-msg chat-msg--ai">
            <div className="chat-avatar">
              <div className="avatar-ai">AI</div>
            </div>
            <div className="chat-bubble chat-bubble--typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="chat-input-row">
          <button
            className="chat-clear-btn"
            onClick={() =>
              setMessages([
                {
                  id: Date.now().toString(),
                  sender: 'ai',
                  text: 'Chat dibersihkan. Ada pertanyaan lain seputar SEO?',
                },
              ])
            }
            title="Hapus riwayat"
          >
            <Trash2 size={13} />
          </button>
          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              className="chat-input"
              type="text"
              placeholder="Tanyakan strategi SEO..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!input.trim() || isTyping}
            >
              <CornerDownLeft size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
