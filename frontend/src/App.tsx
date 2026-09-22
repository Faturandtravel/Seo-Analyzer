import { useState, useEffect } from 'react';
import axios from 'axios';
import { HeroSection } from './components/HeroSection';
import { MetricCards } from './components/MetricCards';
import { AnalysisMeetingChart } from './components/AnalysisMeetingChart';
import { DailyProgressCard } from './components/DailyProgressCard';
import { UpcomingEventsCard } from './components/UpcomingEventsCard';
import { AIAssistantCard } from './components/AIAssistantCard';
import { AuditModal } from './components/AuditModal';
import type { AuditResult } from './types';
import { calculateSeoScore } from './utils/seoCalculator';
import './index.css';

export default function App() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Updated 20 sec ago');
  const [speedScore, setSpeedScore] = useState(85);

  // Default initial audit data
  const [auditResult, setAuditResult] = useState<AuditResult | null>({
    url: 'https://example.com',
    status_code: 200,
    response_time_ms: 134,
    title: 'Example Domain',
    description: 'Example Domain for illustrative examples in documents.',
    h1_count: 1,
  });

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

      if (!result.error) {
        const score = calculateSeoScore(result);
        setSpeedScore(score);
      } else {
        setSpeedScore(25);
      }
    } catch (err: any) {
      const errResult: AuditResult = {
        url: targetUrl,
        status_code: 0,
        response_time_ms: 0,
        title: '',
        description: '',
        h1_count: 0,
        error: err.response?.data?.error || 'Gagal terhubung ke backend Go di localhost:8080',
      };
      setAuditResult(errResult);
      setSpeedScore(20);
      setLastUpdated('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  // Run an initial audit on startup for example.com
  useEffect(() => {
    handleRunAudit('example.com');
  }, []);

  return (
    <div className="dashboard-app-container">
      <div className="dashboard-inner-wrapper">
        {/* Top Header: Hero Section with Title, Status & Audit URL Form */}
        <HeroSection
          lastUpdated={lastUpdated}
          onRunAudit={handleRunAudit}
          speedScore={speedScore}
          loading={loading}
          auditResult={auditResult}
        />

        {/* Error notification if audit failed */}
        {auditResult?.error && (
          <div className="audit-global-error-banner">
            <strong>Audit Gagal:</strong> {auditResult.error}
          </div>
        )}

        {/* 4 Metric Cards Row (Connected directly to SEO Analyzer findings) */}
        <MetricCards
          auditResult={auditResult}
          onCardClick={() => setIsAuditModalOpen(true)}
        />

        {/* Main Dashboard Grid */}
        <div className="dashboard-main-grid">
          {/* Left / Center Area */}
          <div className="dashboard-left-content">
            {/* Row of Analysis & SEO Latency + Overall SEO Health */}
            <div className="analysis-progress-row">
              <AnalysisMeetingChart auditResult={auditResult} />
              <DailyProgressCard
                progress={speedScore}
                statusLabel={speedScore >= 80 ? 'Optimal SEO' : speedScore >= 50 ? 'Fair SEO' : 'Needs Fix'}
                onViewScoreChange={() => setIsAuditModalOpen(true)}
              />
            </div>

            {/* SEO Checklist & Actions */}
            <UpcomingEventsCard
              auditResult={auditResult}
              onItemClick={(name) => {
                alert(`Detail: ${name}`);
              }}
            />
          </div>

          {/* Right Column: SEO AI Assistant */}
          <div className="dashboard-right-content">
            <AIAssistantCard auditResult={auditResult} />
          </div>
        </div>
      </div>

      {/* Optional full modal for deep inspection */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onAuditComplete={(result) => {
          setAuditResult(result);
          setLastUpdated('Updated just now');
          const score = calculateSeoScore(result);
          setSpeedScore(score);
        }}
      />
    </div>
  );
}