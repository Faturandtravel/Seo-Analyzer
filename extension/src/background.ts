/**
 * Background Service Worker
 * Handles coordination between popup and content scripts.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SEO Analyzer AI] Extension installed.');
});

// Keep service worker alive on message
chrome.runtime.onMessage.addListener(() => {
  return true;
});
