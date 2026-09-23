# SEO Analyzer AI — Browser Extension

A fast, zero-dependency **Chrome/Edge browser extension** that instantly audits any web page for SEO health and provides AI-powered recommendations — all directly from your browser toolbar. No server needed.

---

## Features

### Real-Time DOM Analysis

When the extension is opened, the **Content Script** reads the DOM of the active page directly without making any requests to an external server:

- **Meta & Header Tags**: Checks `<title>`, `<meta name="description">`, `<meta name="robots">`, and canonical URLs (`<link rel="canonical">`).
- **Heading Structure**: Tracks hierarchy and usage of `<h1>`, `<h2>`, and `<h3>` tags.
- **Image & Media Optimization**: Scans all `<img>` tags and flags images missing descriptive `alt` attributes.
- **Link Architecture**: Counts and categorizes internal vs. external outbound links.
- **Open Graph (OG) Tags**: Inspects social sharing readiness via `og:title`, `og:description`, and `og:image`.
- **Content & Payload**: Measures page word count and HTML payload size (bytes).
- **Technical & Security Audit**: Detects SSL/HTTPS enforcement and mobile `viewport` meta tag.

### Animated Score Overview

- **Animated score ring** (0–100) with color grading: A+ / A / B / C / D / F
- Quick-glance badges: HTTPS, Mobile, Internal links
- 6-item SEO checklist displayed immediately when the popup opens

### AI Recommendations (Auto-Generate)

- Recommendation report **generated automatically** every time the popup is opened
- Prioritized recommendations: **Critical** → **Optimization** → **Passed**
- Ready-to-use code snippets that can be copied instantly
- Filter by priority category
- Supports **DeepSeek API** for in-depth analysis (optional)

### AI Chat Copilot

- Contextual chat based on active page data
- Quick prompt suggestions
- Local mode (heuristic) without an API key, or DeepSeek API if configured

---

## Tech Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| **Platform**     | Chrome Extension — Manifest V3                      |
| **UI Framework** | React 18 + TypeScript                               |
| **Build Tool**   | Vite 6 (multi-entry: popup + content + background)  |
| **Icons**        | Lucide React                                        |
| **Styling**      | Vanilla CSS — Dark Glassmorphism                    |
| **AI Engine**    | Built-in local heuristic / DeepSeek API (optional)  |
| **DOM Reader**   | Chrome Extension Content Script API                 |

> **No backend server.** DOM analysis is performed directly in the browser by the Content Script — completely replacing the need for a Go server.

---

## Architecture

```
Click extension icon
       ↓
Content Script (content.js)
reads the active page DOM directly
       ↓
seoCalculator.ts
calculates SEO score (0-100) locally
       ↓
deepseekService.ts
generates recommendations (local heuristic or DeepSeek API)
       ↓
React Popup UI
displays results in < 1 second
```

---

## Project Structure

```text
seo-analyzer/
└── extension/                      ← All extension code
    ├── manifest.json               ← Chrome Extension Manifest V3
    ├── popup.html                  ← Popup UI entry point
    ├── vite.config.ts              ← Multi-entry build config
    ├── package.json
    ├── icons/                      ← Extension icons (16, 48, 128px)
    ├── dist/                       ← Build output (load into Chrome)
    │   ├── manifest.json
    │   ├── popup.html
    │   ├── popup.js
    │   ├── content.js
    │   ├── background.js
    │   ├── assets/
    │   └── icons/
    └── src/
        ├── popup/                  ← React Popup App
        │   ├── App.tsx             ← Main shell (tabs, state, chrome.tabs API)
        │   ├── main.tsx
        │   └── components/
        │       ├── ScoreRing.tsx   ← Animated SVG score ring
        │       ├── CheckItem.tsx   ← Individual SEO check row
        │       ├── AIReport.tsx    ← AI recommendation panel
        │       ├── ChatPane.tsx    ← DeepSeek chat UI
        │       └── DetailTab.tsx   ← Full metrics detail view
        ├── content/
        │   └── content.ts          ← DOM analyzer (runs in page context)
        ├── background.ts           ← Service worker (MV3)
        ├── services/
        │   └── deepseekService.ts  ← AI report generator + chat
        ├── utils/
        │   └── seoCalculator.ts    ← SEO scoring algorithm
        ├── types/
        │   └── index.ts            ← TypeScript interfaces
        └── styles/
            └── index.css           ← Premium dark UI styles
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Chrome** or **Edge** browser

### 1. Install Dependencies

```bash
cd extension
npm install
```

### 2. Build Extension

```bash
npm run build
```

The output will be available in `extension/dist/`.

### 3. Load into Chrome / Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **"Developer mode"** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the folder: `extension/dist/`

### 4. Use the Extension

1. Open any website in your browser
2. Click the **SEO Analyzer AI** icon in the toolbar
3. The extension **instantly analyzes** the page — no input required!

---

## Development (Watch Mode)

```bash
cd extension
npm run dev
```

Vite will watch for file changes and automatically rebuild. After rebuilding, reload the extension at `chrome://extensions` by clicking the **↺ refresh** button on the extension card.

---

## AI Configuration (Optional)

The extension works fully **without an API key** using the built-in SEO Heuristic Engine.

For deeper AI analysis with **DeepSeek**:

1. Click the extension icon → **API** tab
2. Enter your DeepSeek API key (`sk-...`)
3. Click **Save & Apply**

Get your API key at: [platform.deepseek.com](https://platform.deepseek.com)

---

## Popup Tabs

| Tab        | Function                                              |
| ---------- | ----------------------------------------------------- |
| **Score**  | Animated score ring, quick checks, AI quick wins      |
| **AI**     | Prioritized recommendation report + code snippets     |
| **Detail** | Full table of all SEO metrics                         |
| **Chat**   | AI copilot based on page context                      |
| **API**    | DeepSeek API key configuration                        |

---

## License

This project is licensed under the MIT License — feel free to use and adapt it for your own projects.
