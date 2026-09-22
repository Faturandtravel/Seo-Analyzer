import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ListFilter,
} from 'lucide-react';
import type { AuditResult } from '../types';

interface UpcomingEventsCardProps {
  auditResult?: AuditResult | null;
  onItemClick?: (title: string) => void;
}

export const UpcomingEventsCard = ({ auditResult }: UpcomingEventsCardProps) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Failed' | 'Passed'>('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyCode = (key: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasTitle = Boolean(auditResult?.title);
  const hasDesc = Boolean(auditResult?.description);
  const hasOptimalH1 = auditResult?.h1_count === 1;
  const hasCanonical = Boolean(auditResult?.canonical);
  const hasViewport = Boolean(auditResult?.has_viewport);
  const hasSsl = Boolean(auditResult?.has_ssl !== false);
  const hasOgImage = Boolean(auditResult?.og_image);
  const imagesMissingAlt = auditResult?.images_missing_alt || 0;
  const imagesTotal = auditResult?.images_total || 0;
  const imagesAllAlt = imagesTotal === 0 || imagesMissingAlt === 0;

  // Checklist items
  const items = [
    {
      key: 'title',
      category: 'On-Page',
      title: 'Meta Title Tag',
      desc: auditResult?.title
        ? `"${auditResult.title.slice(0, 50)}${auditResult.title.length > 50 ? '...' : ''}" (${auditResult.title.length} chars)`
        : 'Missing <title> tag in <head>',
      status: hasTitle ? 'passed' : 'warning',
      fixSnippet: '<title>Descriptive, Keyword-Rich Title (30-60 chars)</title>',
      rule: 'Search engines use titles to understand page topics and display them in search results.',
    },
    {
      key: 'desc',
      category: 'On-Page',
      title: 'Meta Description Tag',
      desc: auditResult?.description
        ? `"${auditResult.description.slice(0, 60)}..." (${auditResult.description.length} chars)`
        : 'Missing meta description tag in <head>',
      status: hasDesc ? 'passed' : 'warning',
      fixSnippet: '<meta name="description" content="Informative summary of the page for search snippets (50-160 chars).">',
      rule: 'High quality meta descriptions improve click-through rate (CTR) on search results.',
    },
    {
      key: 'h1',
      category: 'Structure',
      title: 'H1 Header Structure',
      desc: hasOptimalH1
        ? 'Single <h1> element correctly established as primary heading.'
        : `${auditResult?.h1_count ?? 0} <h1> tags found. Only 1 primary <h1> is recommended.`,
      status: hasOptimalH1 ? 'passed' : 'warning',
      fixSnippet: '<h1>Primary Page Subject Heading</h1>',
      rule: 'Having exactly one H1 per page establishes a clear topical hierarchy for web scrapers.',
    },
    {
      key: 'images',
      category: 'Media',
      title: 'Image Alt Attributes',
      desc: imagesAllAlt
        ? `All ${imagesTotal} detected images include descriptive alt tags.`
        : `${imagesMissingAlt} of ${imagesTotal} images are missing alt attributes.`,
      status: imagesAllAlt ? 'passed' : 'warning',
      fixSnippet: '<img src="/assets/photo.jpg" alt="Clear descriptive text for accessibility and search engines">',
      rule: 'Alt text is vital for visually impaired users and image search indexing.',
    },
    {
      key: 'ssl',
      category: 'Technical',
      title: 'TLS/HTTPS Encryption',
      desc: hasSsl
        ? 'Website is securely served through HTTPS protocol.'
        : 'Insecure HTTP protocol detected without SSL certificate.',
      status: hasSsl ? 'passed' : 'warning',
      fixSnippet: '# Enforce HTTPS redirect rule\n{\n  "redirects": [\n    { "source": "/(.*)", "destination": "https://$host/$1", "permanent": true }\n  ]\n}',
      rule: 'HTTPS is a confirmed Google ranking signal and prevents man-in-the-middle attacks.',
    },
    {
      key: 'canonical',
      category: 'Technical',
      title: 'Canonical URL Tag',
      desc: hasCanonical
        ? `Canonical specified: ${auditResult?.canonical}`
        : 'No rel="canonical" tag detected. Risk of duplicate content penalties.',
      status: hasCanonical ? 'passed' : 'warning',
      fixSnippet: '<link rel="canonical" href="https://example.com/canonical-path" />',
      rule: 'Tells search engines which URL is the master copy of a page.',
    },
    {
      key: 'viewport',
      category: 'Mobile',
      title: 'Viewport Meta Tag',
      desc: hasViewport
        ? 'Viewport meta tag is properly configured for mobile responsiveness.'
        : 'Missing viewport meta tag. Mobile rendering will be penalized.',
      status: hasViewport ? 'passed' : 'warning',
      fixSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      rule: 'Google indexes pages using mobile-first indexing; viewport tag is mandatory.',
    },
    {
      key: 'og_image',
      category: 'Social',
      title: 'OpenGraph Share Image',
      desc: hasOgImage
        ? 'og:image metadata tag is configured for rich social card sharing.'
        : 'Missing og:image tag. Links shared on Twitter/LinkedIn will display as plain text.',
      status: hasOgImage ? 'passed' : 'warning',
      fixSnippet: '<meta property="og:image" content="https://example.com/og-image.png">',
      rule: 'Social previews increase social engagement and referral traffic.',
    },
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeFilter === 'Passed' && item.status !== 'passed') return false;
    if (activeFilter === 'Failed' && item.status !== 'warning') return false;
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    return true;
  });

  const passedCount = items.filter((i) => i.status === 'passed').length;
  const warningCount = items.filter((i) => i.status === 'warning').length;

  return (
    <div className="vercel-card vercel-checks-card">
      {/* Header */}
      <div className="vercel-card-header">
        <div className="vercel-card-title-group">
          <div className="vercel-card-icon-tag">
            <ListFilter size={15} />
          </div>
          <div>
            <h3 className="vercel-card-title">Deployment & SEO Checks</h3>
            <p className="vercel-card-sub">Automated audit rule evaluations and verification checks</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="vercel-checks-filters">
          <button
            type="button"
            className={`vercel-filter-pill ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            className={`vercel-filter-pill ${activeFilter === 'Passed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Passed')}
          >
            <span className="dot-green" /> Passed ({passedCount})
          </button>
          <button
            type="button"
            className={`vercel-filter-pill ${activeFilter === 'Failed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Failed')}
          >
            <span className="dot-amber" /> Warnings ({warningCount})
          </button>
        </div>
      </div>

      {/* Category Sub-nav */}
      <div className="vercel-checks-category-strip">
        {['All', 'On-Page', 'Structure', 'Media', 'Technical', 'Mobile', 'Social'].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`vercel-category-tag ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Check Items List */}
      <div className="vercel-checks-list">
        {filteredItems.map((item) => {
          const isExpanded = expandedKey === item.key;
          const isPassed = item.status === 'passed';

          return (
            <div key={item.key} className={`vercel-check-item ${isPassed ? 'passed' : 'warning'}`}>
              <div
                className="vercel-check-item-header"
                onClick={() => setExpandedKey(isExpanded ? null : item.key)}
                role="button"
                tabIndex={0}
              >
                <div className="vercel-check-status-col">
                  {isPassed ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-400" />
                  )}
                </div>

                <div className="vercel-check-title-col">
                  <div className="vercel-check-title-row">
                    <span className="vercel-check-name">{item.title}</span>
                    <span className="vercel-check-cat-pill">{item.category}</span>
                  </div>
                  <p className="vercel-check-desc">{item.desc}</p>
                </div>

                <div className="vercel-check-action-col">
                  <span className="vercel-check-badge">
                    {isPassed ? 'Passed' : 'Needs Fix'}
                  </span>
                  <ChevronRight
                    size={15}
                    className={`vercel-chevron-icon ${isExpanded ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {/* Collapsible details & snippet */}
              {isExpanded && (
                <div className="vercel-check-expand-body">
                  <p className="vercel-rule-explanation">{item.rule}</p>
                  <div className="vercel-code-box">
                    <div className="vercel-code-header">
                      <span className="font-mono text-xs text-zinc-400">Recommended Fix Snippet</span>
                      <button
                        type="button"
                        className="vercel-copy-code-btn"
                        onClick={() => copyCode(item.key, item.fixSnippet)}
                        title="Copy code snippet"
                      >
                        {copiedKey === item.key ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="vercel-code-snippet font-mono">{item.fixSnippet}</pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
