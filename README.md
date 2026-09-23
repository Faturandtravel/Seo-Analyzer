# SEO Analyzer AI — Browser Extension

A fast, zero-dependency **Chrome/Edge browser extension** that instantly audits any web page for SEO health and provides AI-powered recommendations — all directly from your browser toolbar. No server needed.

---

## Features

### Real-Time DOM Analysis

Ketika extension dibuka, **Content Script** langsung membaca DOM halaman aktif tanpa perlu request ke server eksternal:

- **Meta & Header Tags**: Checks `<title>`, `<meta name="description">`, `<meta name="robots">`, and canonical URLs (`<link rel="canonical">`).
- **Heading Structure**: Tracks hierarchy and usage of `<h1>`, `<h2>`, and `<h3>` tags.
- **Image & Media Optimization**: Scans all `<img>` tags and flags images missing descriptive `alt` attributes.
- **Link Architecture**: Counts and categorizes internal vs. external outbound links.
- **Open Graph (OG) Tags**: Inspects social sharing readiness via `og:title`, `og:description`, and `og:image`.
- **Content & Payload**: Measures page word count and HTML payload size (bytes).
- **Technical & Security Audit**: Detects SSL/HTTPS enforcement and mobile `viewport` meta tag.

### Animated Score Overview

- **Animated score ring** (0–100) dengan color grading: A+ / A / B / C / D / F
- Quick-glance badges: HTTPS, Mobile, Internal links
- 6-item SEO checklist langsung saat popup dibuka

### AI Recommendations (Auto-Generate)

- Laporan rekomendasi **dibuat otomatis** setiap kali popup dibuka
- Rekomendasi prioritized: **Kritis** → **Optimasi** → **Lulus**
- Code snippet siap pakai yang bisa langsung di-copy
- Filter per kategori prioritas
- Support **DeepSeek API** untuk analisis mendalam (opsional)

### AI Chat Copilot

- Chat kontekstual berbasis data halaman aktif
- Quick prompt suggestions
- Mode lokal (heuristik) tanpa API key, atau DeepSeek API jika dikonfigurasi

---

## Tech Stack

| Layer            | Teknologi                                          |
| ---------------- | -------------------------------------------------- |
| **Platform**     | Chrome Extension — Manifest V3                     |
| **UI Framework** | React 18 + TypeScript                              |
| **Build Tool**   | Vite 6 (multi-entry: popup + content + background) |
| **Icons**        | Lucide React                                       |
| **Styling**      | Vanilla CSS — Dark Glassmorphism                   |
| **AI Engine**    | Heuristik lokal bawaan / DeepSeek API (opsional)   |
| **DOM Reader**   | Chrome Extension Content Script API                |

> **Tidak ada backend server.** Analisis DOM dilakukan langsung di browser oleh Content Script — menggantikan kebutuhan server Go sepenuhnya.

---

## Arsitektur

```
Klik ikon extension
       ↓
Content Script (content.js)
membaca DOM halaman aktif secara langsung
       ↓
seoCalculator.ts
menghitung skor SEO (0-100) secara lokal
       ↓
deepseekService.ts
generate rekomendasi (heuristik lokal atau DeepSeek API)
       ↓
React Popup UI
menampilkan hasil dalam < 1 detik
```

---

## Project Structure

```text
seo-analyzer/
└── extension/                      ← Seluruh kode extension
    ├── manifest.json               ← Chrome Extension Manifest V3
    ├── popup.html                  ← Popup UI entry point
    ├── vite.config.ts              ← Multi-entry build config
    ├── package.json
    ├── icons/                      ← Extension icons (16, 48, 128px)
    ├── dist/                       ← Build output (load ke Chrome)
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

- **Node.js** 18+ dan **npm**
- **Chrome** atau **Edge** browser

### 1. Install Dependencies

```bash
cd extension
npm install
```

### 2. Build Extension

```bash
npm run build
```

Output akan tersedia di `extension/dist/`.

### 3. Load ke Chrome / Edge

1. Buka `chrome://extensions` (atau `edge://extensions`)
2. Aktifkan **"Developer mode"** (toggle pojok kanan atas)
3. Klik **"Load unpacked"**
4. Pilih folder: `extension/dist/`

### 4. Gunakan Extension

1. Buka website apapun di browser
2. Klik ikon **SEO Analyzer AI** di toolbar
3. Extension **langsung menganalisis** halaman — tidak perlu input apapun!

---

## Development (Watch Mode)

```bash
cd extension
npm run dev
```

Vite akan memonitor perubahan file dan otomatis rebuild. Setelah rebuild, reload extension di `chrome://extensions` dengan klik tombol **↺ refresh** pada card extension.

---

## Konfigurasi AI (Opsional)

Extension berfungsi penuh **tanpa API key** menggunakan SEO Heuristik Engine bawaan.

Untuk analisis AI yang lebih mendalam dengan **DeepSeek**:

1. Klik ikon extension → Tab **API**
2. Masukkan DeepSeek API key (`sk-...`)
3. Klik **Simpan & Terapkan**

Dapatkan API key di: [platform.deepseek.com](https://platform.deepseek.com)

---

## Popup Tabs

| Tab        | Fungsi                                          |
| ---------- | ----------------------------------------------- |
| **Skor**   | Score ring animasi, quick checks, AI quick wins |
| **AI**     | Laporan rekomendasi prioritized + code snippets |
| **Detail** | Tabel lengkap semua metrik SEO                  |
| **Chat**   | AI copilot berbasis konteks halaman             |
| **API**    | Konfigurasi DeepSeek API key                    |

---

## License

This project is licensed under the MIT License — feel free to use and adapt it for your own projects.
