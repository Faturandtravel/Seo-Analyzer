import type { AuditResult } from '../types';

export interface StoredAuditItem {
  id: string;
  url: string;
  timestamp: number;
  score: number;
  result: AuditResult;
}

export const LATEST_AUDIT_KEY = 'seo_analyzer_latest_audit';
export const AUDIT_HISTORY_KEY = 'seo_analyzer_audit_history';

/**
 * Get the most recent audit result stored in localStorage
 */
export function getLatestStoredAudit(): StoredAuditItem | null {
  try {
    const raw = localStorage.getItem(LATEST_AUDIT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.result) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error('Failed to read latest audit from localStorage', err);
    return null;
  }
}

/**
 * Save an audit result to localStorage (both as latest and in history list)
 */
export function saveAuditToStorage(result: AuditResult, score: number): StoredAuditItem {
  const item: StoredAuditItem = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    url: result.url || 'unknown',
    timestamp: Date.now(),
    score,
    result,
  };

  try {
    // 1. Save as latest active audit
    localStorage.setItem(LATEST_AUDIT_KEY, JSON.stringify(item));

    // 2. Add to history list (max 30 entries)
    const history = getStoredAuditHistory();
    const cleanCurrent = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
    
    // Remove older duplicate entry for the same domain if exists
    const filtered = history.filter((h) => {
      const cleanH = (h.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
      return cleanH !== cleanCurrent;
    });

    const updated = [item, ...filtered].slice(0, 30);
    localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to write audit to localStorage', err);
  }

  return item;
}

/**
 * Get all stored audits from localStorage
 */
export function getStoredAuditHistory(): StoredAuditItem[] {
  try {
    const raw = localStorage.getItem(AUDIT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to read audit history from localStorage', err);
    return [];
  }
}

/**
 * Delete a single audit by id from localStorage
 */
export function deleteAuditFromStorage(id: string): StoredAuditItem[] {
  try {
    const history = getStoredAuditHistory();
    const updated = history.filter((item) => item.id !== id);
    localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(updated));

    // If active latest was deleted, point to next recent or remove
    const latest = getLatestStoredAudit();
    if (latest && latest.id === id) {
      if (updated.length > 0) {
        localStorage.setItem(LATEST_AUDIT_KEY, JSON.stringify(updated[0]));
      } else {
        localStorage.removeItem(LATEST_AUDIT_KEY);
      }
    }
    return updated;
  } catch (err) {
    console.error('Failed to delete audit from localStorage', err);
    return [];
  }
}

/**
 * Clear all audits from localStorage
 */
export function clearStoredAudits(): void {
  try {
    localStorage.removeItem(LATEST_AUDIT_KEY);
    localStorage.removeItem(AUDIT_HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear audits from localStorage', err);
  }
}

/**
 * Format timestamp into human readable relative time
 */
export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
