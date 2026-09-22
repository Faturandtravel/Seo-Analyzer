import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MetricCards } from './components/MetricCards';
import { AnalysisMeetingChart } from './components/AnalysisMeetingChart';
import { DailyProgressCard } from './components/DailyProgressCard';
import { UpcomingEventsCard } from './components/UpcomingEventsCard';
import { AIAssistantCard } from './components/AIAssistantCard';
import { AuditModal } from './components/AuditModal';
import { AuditHistorySection } from './components/AuditHistorySection';
import type { AuditResult } from './types';
import { calculateSeoScore } from './utils/seoCalculator';
import {
  getLatestStoredAudit,
  saveAuditToStorage,
  formatTimeAgo,
  LATEST_AUDIT_KEY,
  type StoredAuditItem,
} from './utils/storage';
import { AlertCircle, Sliders } from 'lucide-react';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load latest stored audit from localStorage if available
  const initialStored = getLatestStoredAudit();

  const [lastUpdated, setLastUpdated] = useState(
    initialStored
      ? `Saved ${formatTimeAgo(initialStored.timestamp)}`
      : 'Updated 20s ago'
  );
  const [speedScore, setSpeedScore] = useState(initialStored?.score ?? 85);

  // Initial audit data from localStorage or fallback defaults
  const [auditResult, setAuditResult] = useState<AuditResult | null>(
    initialStored?.result || {
      url: 'https://example.com',
      status_code: 200,
      response_time_ms: 134,
      title: 'Example Domain',
      description: 'Example Domain for illustrative examples in documents.',
      h1_count: 1,
      h2_count: 0,
      has_ssl: true,
      has_viewport: true,
      images_total: 2,
      images_missing_alt: 0,
      canonical: 'https://example.com/',
    }
  );

  // Run SEO audit via Go backend
  const handleRunAudit = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get<AuditResult>(
        `http://localhost:8080/api/audit?url=${encodeURIComponent(targetUrl.trim())}`
      );

      const result = response.data;
      setAuditResult(result);
      setLastUpdated('Updated just now');

      const score = !result.error ? calculateSeoScore(result) : 25;
      setSpeedScore(score);

      // Save to localStorage
      saveAuditToStorage(result, score);
    } catch (err: any) {
      const errResult: AuditResult = {
        url: targetUrl,
        status_code: 0,
        response_time_ms: 0,
        title: '',
        description: '',
        h1_count: 0,
        error: err.response?.data?.error || 'Failed to connect to backend service at localhost:8080',
      };
      setAuditResult(errResult);
      setSpeedScore(20);
      setLastUpdated('Failed to fetch');
      // Also save error result state to localStorage so user doesn't lose context
      saveAuditToStorage(errResult, 20);
    } finally {
      setLoading(false);
    }
  };

  // Switch to an audit item loaded from localStorage
  const handleSelectStoredAudit = (item: StoredAuditItem) => {
    setAuditResult(item.result);
    setSpeedScore(item.score);
    setLastUpdated(`Saved ${formatTimeAgo(item.timestamp)}`);
    try {
      localStorage.setItem(LATEST_AUDIT_KEY, JSON.stringify(item));
    } catch {
      // ignore
    }
  };

  // Run initial audit on mount ONLY if localStorage has no previous audits
  useEffect(() => {
    const saved = getLatestStoredAudit();
    if (!saved) {
      handleRunAudit('example.com');
    }
  }, []);

  return (
    <div className="vercel-app-root">
      {/* Vercel Header & Sub-Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        auditUrl={auditResult?.url}
        speedScore={speedScore}
      />

      <main className="vercel-main-container">
        {/* Global Error Banner if backend fails */}
        {auditResult?.error && (
          <div className="vercel-error-banner">
            <AlertCircle size={16} className="text-rose-400" />
            <div className="vercel-error-text">
              <strong>Audit Engine Notice:</strong> {auditResult.error}
            </div>
          </div>
        )}

        {/* Tab 1: Overview (Main Vercel Dashboard View) */}
        {activeTab === 'overview' && (
          <div className="vercel-tab-view">
            {/* Production Deployment Hero Card & Audit Bar */}
            <HeroSection
              lastUpdated={lastUpdated}
              onRunAudit={handleRunAudit}
              speedScore={speedScore}
              loading={loading}
              auditResult={auditResult}
              onSelectStoredAudit={handleSelectStoredAudit}
            />

            {/* 4 Metric Cards */}
            <MetricCards
              auditResult={auditResult}
              onCardClick={() => setIsAuditModalOpen(true)}
            />

            {/* Main Content 2-Column Grid */}
            <div className="vercel-dashboard-grid">
              {/* Left Column */}
              <div className="vercel-grid-left">
                <div className="vercel-two-cards-row">
                  <AnalysisMeetingChart auditResult={auditResult} />
                  <DailyProgressCard
                    progress={speedScore}
                    statusLabel={speedScore >= 80 ? 'Optimal SEO' : speedScore >= 50 ? 'Fair SEO' : 'Needs Fix'}
                    onViewScoreChange={() => setIsAuditModalOpen(true)}
                  />
                </div>

                <UpcomingEventsCard auditResult={auditResult} />
              </div>

              {/* Right Column */}
              <div className="vercel-grid-right">
                <AIAssistantCard auditResult={auditResult} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Deployments & Audits */}
        {activeTab === 'audits' && (
          <div className="vercel-tab-view">
            <HeroSection
              lastUpdated={lastUpdated}
              onRunAudit={handleRunAudit}
              speedScore={speedScore}
              loading={loading}
              auditResult={auditResult}
              onSelectStoredAudit={handleSelectStoredAudit}
            />
            <AuditHistorySection
              currentUrl={auditResult?.url}
              onSelectAudit={(item) => {
                handleSelectStoredAudit(item);
                setActiveTab('overview');
              }}
              onReAudit={(url) => {
                handleRunAudit(url);
                setActiveTab('overview');
              }}
            />
            <div className="mt-6">
              <UpcomingEventsCard auditResult={auditResult} />
            </div>
          </div>
        )}

        {/* Tab 3: Speed Insights */}
        {activeTab === 'speed' && (
          <div className="vercel-tab-view">
            <MetricCards
              auditResult={auditResult}
              onCardClick={() => setIsAuditModalOpen(true)}
            />
            <div className="vercel-two-cards-row mt-4">
              <AnalysisMeetingChart auditResult={auditResult} />
              <DailyProgressCard
                progress={speedScore}
                statusLabel={speedScore >= 80 ? 'Optimal SEO' : speedScore >= 50 ? 'Fair SEO' : 'Needs Fix'}
                onViewScoreChange={() => setIsAuditModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Checks & Logs */}
        {activeTab === 'checks' && (
          <div className="vercel-tab-view">
            <UpcomingEventsCard auditResult={auditResult} />
          </div>
        )}

        {/* Tab 5: AI Copilot */}
        {activeTab === 'ai' && (
          <div className="vercel-tab-view vercel-ai-section-container">
            <AIAssistantCard auditResult={auditResult} isFullTab={true} />
          </div>
        )}

        {/* Tab 6: Settings */}
        {activeTab === 'settings' && (
          <div className="vercel-tab-view vercel-settings-view">
            <div className="vercel-card">
              <div className="vercel-card-header">
                <div className="vercel-card-title-group">
                  <div className="vercel-card-icon-tag">
                    <Sliders size={15} />
                  </div>
                  <div>
                    <h3 className="vercel-card-title">Project Settings</h3>
                    <p className="vercel-card-sub">Crawler and audit configuration for seo-analyzer</p>
                  </div>
                </div>
              </div>
              <div className="vercel-settings-body">
                <div className="vercel-settings-row">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">Crawler Backend API URL</h4>
                    <p className="text-xs text-zinc-400">Default endpoint used to fetch HTML and headers</p>
                  </div>
                  <input
                    type="text"
                    defaultValue="http://localhost:8080/api/audit"
                    className="vercel-settings-input font-mono"
                    readOnly
                  />
                </div>
                <div className="vercel-settings-row">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-100">Crawler User-Agent</h4>
                    <p className="text-xs text-zinc-400">Identifies the bot to target servers</p>
                  </div>
                  <input
                    type="text"
                    defaultValue="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
                    className="vercel-settings-input font-mono"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="vercel-footer">
        <div className="vercel-footer-content">
          <div className="vercel-footer-brand">
            <svg
              className="vercel-triangle-svg"
              width="16"
              height="14"
              viewBox="0 0 76 65"
              fill="currentColor"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            <span>seo-analyzer</span>
          </div>
        </div>
      </footer>

      {/* Raw Inspector Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onAuditComplete={(result) => {
          setAuditResult(result);
          setLastUpdated('Updated just now');
          const score = !result.error ? calculateSeoScore(result) : 25;
          setSpeedScore(score);
          saveAuditToStorage(result, score);
        }}
      />
    </div>
  );
}