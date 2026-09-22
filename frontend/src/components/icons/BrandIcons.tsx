import React from 'react';

// Google 'G' 4-color icon
export const GoogleIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

// Slack 4-color icon
export const SlackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M6 15a2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2a2 2 0 0 1-2 2zm1 0a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-5z"
      fill="#E01E5A"
    />
    <path
      d="M9 6a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5z"
      fill="#36C5F0"
    />
    <path
      d="M18 9a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2V11a2 2 0 0 1 2-2zm-1 0a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5z"
      fill="#2EB67D"
    />
    <path
      d="M15 18a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-5z"
      fill="#ECB22E"
    />
  </svg>
);

// Gmail M-envelope 4-color icon
export const GmailIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"
      fill="#EA4335"
      opacity="0"
    />
    <path d="M2.5 7.5L12 13.5L21.5 7.5V17.5C21.5 18.6 20.6 19.5 19.5 19.5H4.5C3.4 19.5 2.5 18.6 2.5 17.5V7.5Z" fill="#EA4335" />
    <path d="M2.5 6.5C2.5 5.4 3.4 4.5 4.5 4.5H6.5L12 9L17.5 4.5H19.5C20.6 4.5 21.5 5.4 21.5 6.5V7.5L12 13.5L2.5 7.5V6.5Z" fill="#FBBC04" />
    <path d="M2.5 6.5V17.5C2.5 18.6 3.4 19.5 4.5 19.5H7.5V9.5L2.5 6.5Z" fill="#4285F4" />
    <path d="M21.5 6.5V17.5C21.5 18.6 20.6 19.5 19.5 19.5H16.5V9.5L21.5 6.5Z" fill="#34A853" />
  </svg>
);

// Status Code HTTP icon
export const StatusIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="3" width="20" height="18" rx="6" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
    <path d="M8 12L11 15L16 9" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Speed response time icon
export const SpeedIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 2" />
    <path d="M12 7V12L15 15" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

// Heading H1 Icon
export const HeadingIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="4" width="20" height="16" rx="5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.8" />
    <path d="M7 8V16M13 8V16M7 12H13" stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M17 11L18.5 9.5V16" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Image Alt Tag Icon
export const ImageIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.8" />
    <circle cx="8.5" cy="8.5" r="1.8" fill="#7e22ce" />
    <path d="M21 15L16 10L5 21" stroke="#9333ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Link Network Icon
export const LinkIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke="#0284c7"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke="#0369a1"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Circular leaf / orbit brand logo (matching top-left logo)
export const BrandLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <div
    className={`brand-logo-container ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#d8f5e3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1.5px solid #22c55e',
      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
      cursor: 'pointer',
    }}
  >
    <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="2.2" strokeDasharray="3 2" />
      <path
        d="M6 14C8 9 14 7 18 10C16 15 10 17 6 14Z"
        stroke="#15803d"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="16.5" y1="7.5" x2="7.5" y2="16.5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

// 3D Avatar component
export const UserAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 38, className = '' }) => (
  <div
    className={`user-avatar ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #a7f3d0 0%, #38bdf8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      border: '2px solid #ffffff',
      cursor: 'pointer',
    }}
  >
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#38BDF8" />
      <path d="M12 16C12 11 15 7 20 7C25 7 28 11 28 16C28 17 27 19 25 19H15C13 19 12 17 12 16Z" fill="#1E293B" />
      <circle cx="20" cy="21" r="7" fill="#FED7AA" />
      <path d="M15 13C17 11 22 11 24 13C23 15 16 15 15 13Z" fill="#0F172A" />
      <circle cx="17.5" cy="20.5" r="1" fill="#1E293B" />
      <circle cx="22.5" cy="20.5" r="1" fill="#1E293B" />
      <path d="M18.5 24C19.5 25 20.5 25 21.5 24" stroke="#EA580C" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M10 36C10 30 14 28 20 28C26 28 30 30 30 36V40H10V36Z" fill="#2563EB" />
      <path d="M18 28L20 31L22 28" fill="#FFFFFF" />
    </svg>
  </div>
);
