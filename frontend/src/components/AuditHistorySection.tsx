import React, { useState, useEffect } from 'react';
import {
  Database,
  Trash2,
  RotateCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  getStoredAuditHistory,
  deleteAuditFromStorage,
  clearStoredAudits,
  formatTimeAgo,
  type StoredAuditItem,
} from '../utils/storage';

interface AuditHistorySectionProps {
  currentUrl?: string;
  onSelectAudit: (item: StoredAuditItem) => void;
  onReAudit: (url: string) => void;
}

export const AuditHistorySection: React.FC<AuditHistorySectionProps> = ({
  currentUrl,
  onSelectAudit,
  onReAudit,
}) => {
  const [history, setHistory] = useState<StoredAuditItem[]>([]);

  const refreshHistory = () => {
    setHistory(getStoredAuditHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, [currentUrl]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteAuditFromStorage(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Hapus semua riwayat audit dari localStorage?')) {
      clearStoredAudits();
      setHistory([]);
    }
  };

  const cleanCurrent = (currentUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

  return (
    <div className="vercel-card mt-6">
      <div className="vercel-card-header flex justify-between items-center">
        <div className="vercel-card-title-group">
          <div className="vercel-card-icon-tag">
            <Database size={15} />
          </div>
          <div>
            <h3 className="vercel-card-title">Saved Audit Results (Local Storage)</h3>
            <p className="vercel-card-sub">
              Hasil audit tersimpan di penyimpanan lokal browser Anda ({history.length} item)
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="vercel-btn-secondary text-xs text-rose-400 hover:text-rose-300 border-rose-900/30"
            onClick={handleClearAll}
            title="Clear all stored audits"
          >
            <Trash2 size={13} />
            <span>Hapus Semua</span>
          </button>
        )}
      </div>

      <div className="p-4">
        {history.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            <Database size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada hasil audit yang tersimpan di Local Storage.</p>
            <p className="text-xs text-zinc-600 mt-1">
              Jalankan audit URL baru untuk menyimpannya secara otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => {
              const itemDomain = (item.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
              const isActive = itemDomain.toLowerCase() === cleanCurrent;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-zinc-900/90 border-zinc-600 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start md:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        item.score >= 80
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : item.score >= 50
                          ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {item.score}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100 text-sm truncate">
                          {itemDomain}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                            Sedang Aktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock size={11} className="text-zinc-500" />
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        <span>•</span>
                        <span>
                          {item.result?.status_code ? `${item.result.status_code} OK` : 'No Status'}
                        </span>
                        <span>•</span>
                        <span>
                          {item.result?.response_time_ms ? `${item.result.response_time_ms}ms` : '0ms'}
                        </span>
                        {item.result?.title && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px] text-zinc-500" title={item.result.title}>
                              {item.result.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-800">
                    <button
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded font-medium transition-colors flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-200 cursor-default'
                          : 'bg-zinc-100 text-zinc-900 hover:bg-white'
                      }`}
                      onClick={() => onSelectAudit(item)}
                      disabled={isActive}
                      title="Tampilkan hasil audit ini di dashboard"
                    >
                      <span>{isActive ? 'Aktif' : 'Buka'}</span>
                      {!isActive && <ArrowUpRight size={12} />}
                    </button>

                    <button
                      type="button"
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
                      onClick={() => onReAudit(itemDomain)}
                      title="Audit ulang URL ini ke server backend"
                    >
                      <RotateCw size={13} />
                    </button>

                    <button
                      type="button"
                      className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-colors"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Hapus dari Local Storage"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
