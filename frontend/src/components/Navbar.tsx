import React, { useState } from 'react';
import {Bell, ExternalLink, Command, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  auditUrl?: string;
  speedScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  auditUrl,
  speedScore = 85,
}) => {
  const [teamDropdownOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'audits', label: 'Deployments & Audits' },
    { id: 'speed', label: 'Speed Insights' },
    { id: 'checks', label: 'Checks & Logs' },
    { id: 'ai', label: 'AI Copilot' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="vercel-navbar">
      {/* Upper Bar */}
      <div className="vercel-navbar-top">
        <div className="vercel-navbar-left">
          {/* SEO Analyzer Logo */}
          <div className="vercel-logo-container" title="SEO Analyzer Dashboard">
            <svg
              className="vercel-triangle-svg"
              width="22"
              height="19"
              viewBox="0 0 76 65"
              fill="currentColor"
            >
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
          </div>

          {/* Team / Workspace Selector */}
          <div className="vercel-workspace-dropdown">

            {teamDropdownOpen && (
              <div className="vercel-menu-dropdown">
                <div className="vercel-menu-header">Personal Account</div>
                <div className="vercel-menu-item active">
                  <div className="vercel-team-avatar sm">F</div>
                  <span>faturandtravel</span>
                  <span className="vercel-check-mark">✓</span>
                </div>
                <div className="vercel-menu-divider" />
                <div className="vercel-menu-item">
                  <span>+ Create Team</span>
                </div>
              </div>
            )}
          </div>

          <span className="vercel-nav-separator">/</span>

          {/* Project Breadcrumb */}
          <div className="vercel-project-pill">
            <span className="vercel-project-name">seo-analyzer</span>
          </div>

          {/* Production Environment Badge */}
          <div className="vercel-env-badge" title="Targeting live environment">
            <span className="vercel-status-dot ready" />
            <span>Production</span>
          </div>
        </div>

        {/* Upper Bar Right Actions */}
        <div className="vercel-navbar-right">
          <div className="vercel-search-shortcut" title="Command Menu (⌘K)">
            <Command size={13} />
            <span>K</span>
          </div>

          <a
            href="https://vercel.com/docs"
            target="_blank"
            rel="noreferrer"
            className="vercel-nav-link"
          >
            Feedback
          </a>

          <a
            href="https://vercel.com/changelog"
            target="_blank"
            rel="noreferrer"
            className="vercel-nav-link"
          >
            Changelog
          </a>

          <a
            href="https://vercel.com/help"
            target="_blank"
            rel="noreferrer"
            className="vercel-nav-link"
          >
            Help
          </a>

          <button
            type="button"
            className="vercel-icon-btn"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="vercel-notification-dot" />
          </button>

          <div className="vercel-user-avatar" title="faturandtravel">
            <span>F</span>
          </div>
        </div>
      </div>

      {/* Lower Sub-Navigation Tabs */}
      <div className="vercel-navbar-tabs-container">
        <nav className="vercel-nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`vercel-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.id === 'speed' && (
                <span className={`vercel-tab-badge ${speedScore >= 80 ? 'good' : 'fair'}`}>
                  {speedScore}
                </span>
              )}
              {tab.id === 'ai' && (
                <span className="vercel-tab-badge-ai">
                  <Sparkles size={10} />
                  v0
                </span>
              )}
            </button>
          ))}
        </nav>

        {auditUrl && (
          <div className="vercel-quick-inspect-url">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="vercel-target-domain">{auditUrl.replace(/^https?:\/\//, '')}</span>
            <a
              href={auditUrl.startsWith('http') ? auditUrl : `https://${auditUrl}`}
              target="_blank"
              rel="noreferrer"
              className="vercel-domain-external-link"
              title="Visit inspected website"
            >
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
