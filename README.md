# SEO Analyzer

A fast, lightweight, and modern full-stack SEO audit tool built with **Go** and **React + TypeScript + Vite**. It crawls target web pages, extracts on-page SEO signals, calculates an overall SEO health score, and displays actionable recommendations in an interactive dashboard.

---

## Features

### Comprehensive On-Page Audit

- **Meta & Header Tags**: Checks document `<title>`, `<meta name="description">`, `<meta name="robots">`, and canonical URLs (`<link rel="canonical">`).
- **Heading Structure**: Tracks hierarchy and usage of `<h1>`, `<h2>`, and `<h3>` tags.
- **Image & Media Optimization**: Scans all `<img>` tags and flags images missing descriptive `alt` attributes.
- **Link Architecture**: Counts and categorizes internal links vs. external outbound links.
- **Open Graph (OG) Tags**: Inspects social sharing readiness via `og:title`, `og:description`, and `og:image`.
- **Content & Payload**: Measures page word count, overall HTML response payload size (bytes), and HTTP status codes.
- **Technical & Security Audit**: Detects SSL/HTTPS enforcement, mobile responsiveness (`viewport` meta tag), and server response latency (ms).

### Modern Interactive Dashboard

- **Live URL Analyzer**: Run live audits on any website directly from the top search bar.
- **Health Score Meter**: Dynamically calculated SEO health score (0–100) reflecting meta validity, headings, mobile tags, and performance.
- **Metric Cards & Breakdown**: Quick-glance cards showing response time, SSL status, image alt issues, and link ratios.
- **Actionable SEO Checklist**: Categorized task items highlighting critical issues and quick wins.
- **AI SEO Assistant**: Contextual recommendations and tips based on crawl results.
- **Deep Inspection Modal**: Detailed view for granular inspection of audit parameters.

---

## Tech Stack

### Backend

- **Language**: [Go (Golang)](https://go.dev/)
- **HTML Parser**: [goquery](https://github.com/PuerkitoBio/goquery)
- **HTTP Server**: Go standard library `net/http` with CORS support

### Frontend

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Modern, responsive Vanilla CSS with glassmorphism aesthetics

---

## Project Structure

```text
seo-analyzer/
├── backend/
│   ├── go.mod
│   ├── go.sum
│   └── main.go         # Go server, scraper, and /api/audit endpoint
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── components/ # Dashboard components (Hero, Metrics, AI Assistant, etc.)
│       ├── types/      # TypeScript interfaces for audit results
│       ├── utils/      # SEO scoring algorithms and helper functions
│       ├── App.tsx     # Main application layout and state management
│       └── index.css   # Global dashboard styling & design system
└── README.md
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- **Go** (version 1.20 or later)
- **Node.js** (version 18 or later) & **npm**

---

### 1. Run the Backend (Go)

Navigate to the `backend` directory and start the server:

```bash
cd backend
go run main.go
```

The Go server will start and listen on:

```
http://localhost:8080
```

#### Available Endpoint

`GET /api/audit?url=<target_url>`

**Example Request:**

```bash
curl "http://localhost:8080/api/audit?url=https://example.com"
```

**Example JSON Response:**

```json
{
  "url": "https://example.com",
  "status_code": 200,
  "response_time_ms": 142,
  "title": "Example Domain",
  "description": "Example Domain for illustrative examples in documents.",
  "h1_count": 1,
  "h2_count": 0,
  "h3_count": 0,
  "canonical": "",
  "robots": "",
  "images_total": 0,
  "images_missing_alt": 0,
  "internal_links": 1,
  "external_links": 0,
  "og_title": "",
  "og_description": "",
  "og_image": "",
  "has_viewport": true,
  "has_ssl": true,
  "page_size_bytes": 1256,
  "word_count": 67
}
```

---

### 2. Run the Frontend (React + Vite)

Open a new terminal window, navigate to the `frontend` directory, install dependencies, and start the development server:

```bash
cd frontend
npm install
npm run dev
```

Vite will serve the application (typically at `http://localhost:5173`). Open the URL in your browser to start auditing pages!

---

## Build for Production

### Frontend Production Build

To create an optimized production build for the frontend:

```bash
cd frontend
npm run build
```

The compiled static assets will be output to `frontend/dist/`.

### Backend Binary Build

To compile the Go backend into a standalone binary:

```bash
cd backend
go build -o seo-analyzer-server main.go
./seo-analyzer-server
```

---

## License

This project is licensed under the MIT License - feel free to use and adapt it for your own projects.
