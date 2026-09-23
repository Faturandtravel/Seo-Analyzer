/**
 * Content Script — DOM Analyzer
 * Runs in the context of every web page.
 * Listens for a message from the popup to extract SEO data from the live DOM.
 */

import type { AuditResult, ExtensionMessage } from '../types';

function analyzeDom(): AuditResult {
  const url = window.location.href;
  const startTime = performance.now();

  // 1. Title
  const title = document.title?.trim() ?? '';

  // 2. Meta description
  const descEl = document.querySelector<HTMLMetaElement>("meta[name='description']");
  const description = descEl?.content?.trim() ?? '';

  // 3. Headings
  const h1_count = document.querySelectorAll('h1').length;
  const h2_count = document.querySelectorAll('h2').length;
  const h3_count = document.querySelectorAll('h3').length;

  // 4. Canonical
  const canonicalEl = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
  const canonical = canonicalEl?.href?.trim() ?? '';

  // 5. Robots meta
  const robotsEl = document.querySelector<HTMLMetaElement>("meta[name='robots']");
  const robots = robotsEl?.content?.trim() ?? '';

  // 6. Open Graph
  const ogTitle = document.querySelector<HTMLMetaElement>("meta[property='og:title']")?.content?.trim() ?? '';
  const ogDescription = document.querySelector<HTMLMetaElement>("meta[property='og:description']")?.content?.trim() ?? '';
  const ogImage = document.querySelector<HTMLMetaElement>("meta[property='og:image']")?.content?.trim() ?? '';

  // 7. Viewport
  const viewportEl = document.querySelector<HTMLMetaElement>("meta[name='viewport']");
  const has_viewport = Boolean(viewportEl?.content);

  // 8. SSL
  const has_ssl = window.location.protocol === 'https:';

  // 9. Images & alt
  const images = Array.from(document.querySelectorAll<HTMLImageElement>('img'));
  const images_total = images.length;
  const images_missing_alt = images.filter(
    (img) => !img.getAttribute('alt') || img.getAttribute('alt')!.trim() === ''
  ).length;

  // 10. Links (internal vs external)
  const host = window.location.hostname;
  let internal_links = 0;
  let external_links = 0;
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === host || linkUrl.hostname === '') {
        internal_links++;
      } else {
        external_links++;
      }
    } catch {
      internal_links++;
    }
  });

  // 11. Word count
  const bodyText = document.body?.innerText ?? '';
  const word_count = bodyText.split(/\s+/).filter(Boolean).length;

  // 12. Page size (approximation from HTML string)
  const page_size_bytes = new TextEncoder().encode(document.documentElement.outerHTML).length;

  // 13. Favicon
  const faviconEl =
    document.querySelector<HTMLLinkElement>("link[rel~='icon']") ||
    document.querySelector<HTMLLinkElement>("link[rel='shortcut icon']");
  const favicon = faviconEl?.href ?? `${window.location.origin}/favicon.ico`;

  const response_time_ms = Math.round(performance.now() - startTime);

  return {
    url,
    title,
    description,
    h1_count,
    h2_count,
    h3_count,
    canonical,
    robots,
    images_total,
    images_missing_alt,
    internal_links,
    external_links,
    og_title: ogTitle,
    og_description: ogDescription,
    og_image: ogImage,
    has_viewport,
    has_ssl,
    word_count,
    page_size_bytes,
    response_time_ms,
    status_code: 200, // content scripts only run on reachable pages
    favicon,
  };
}

// Listen for message from popup
chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  if (message.type === 'GET_SEO_DATA') {
    try {
      const data = analyzeDom();
      sendResponse({ type: 'SEO_DATA_RESULT', data });
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Unknown error during DOM analysis';
      sendResponse({ type: 'SEO_DATA_ERROR', error });
    }
  }
  return true; // keep channel open for async
});
