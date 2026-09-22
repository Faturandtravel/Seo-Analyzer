package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

// Struktur data lengkap untuk respons JSON ke React
type AuditResponse struct {
	URL              string `json:"url"`
	StatusCode       int    `json:"status_code"`
	ResponseTime     int64  `json:"response_time_ms"`
	Title            string `json:"title"`
	Description      string `json:"description"`
	H1Count          int    `json:"h1_count"`
	H2Count          int    `json:"h2_count"`
	H3Count          int    `json:"h3_count"`
	Canonical        string `json:"canonical"`
	Robots           string `json:"robots"`
	ImagesTotal      int    `json:"images_total"`
	ImagesMissingAlt int    `json:"images_missing_alt"`
	InternalLinks    int    `json:"internal_links"`
	ExternalLinks    int    `json:"external_links"`
	OGTitle          string `json:"og_title"`
	OGDescription    string `json:"og_description"`
	OGImage          string `json:"og_image"`
	HasViewport      bool   `json:"has_viewport"`
	HasSsl           bool   `json:"has_ssl"`
	PageSizeBytes    int64  `json:"page_size_bytes"`
	WordCount        int    `json:"word_count"`
	Error            string `json:"error,omitempty"`
}

// Handler untuk memproses audit
func handleAudit(w http.ResponseWriter, r *http.Request) {
	// Set Header CORS agar React bisa mengakses API ini
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// Ambil parameter URL dari query string: /api/audit?url=https://...
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, `{"error": "Parameter URL dibutuhkan"}`, http.StatusBadRequest)
		return
	}

	if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
		targetURL = "https://" + targetURL
	}

	parsedTarget, err := url.Parse(targetURL)
	if err != nil {
		json.NewEncoder(w).Encode(AuditResponse{
			URL:   targetURL,
			Error: fmt.Sprintf("Format URL tidak valid: %v", err),
		})
		return
	}

	// Mulai mengukur durasi request
	start := time.Now()

	client := http.Client{
		Timeout: 12 * time.Second,
	}

	req, err := http.NewRequest("GET", targetURL, nil)
	if err != nil {
		json.NewEncoder(w).Encode(AuditResponse{
			URL:   targetURL,
			Error: fmt.Sprintf("Gagal membuat HTTP request: %v", err),
		})
		return
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; SEOAnalyzerBot/1.0; +http://localhost)")

	resp, err := client.Do(req)
	if err != nil {
		json.NewEncoder(w).Encode(AuditResponse{
			URL:   targetURL,
			Error: fmt.Sprintf("Gagal mengakses URL: %v", err),
		})
		return
	}
	defer resp.Body.Close()

	responseTime := time.Since(start).Milliseconds()

	// Baca seluruh response body untuk menghitung ukuran payload
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		json.NewEncoder(w).Encode(AuditResponse{
			URL:   targetURL,
			Error: "Gagal membaca konten payload halaman",
		})
		return
	}

	// Parse HTML menggunakan goquery
	doc, err := goquery.NewDocumentFromReader(bytes.NewReader(bodyBytes))
	if err != nil {
		json.NewEncoder(w).Encode(AuditResponse{
			URL:   targetURL,
			Error: "Gagal membaca konten HTML",
		})
		return
	}

	// 1. Ambil data Title & Meta Description
	title := strings.TrimSpace(doc.Find("title").Text())
	description, _ := doc.Find("meta[name='description']").Attr("content")

	// 2. Heading Hierarchy
	h1Count := doc.Find("h1").Length()
	h2Count := doc.Find("h2").Length()
	h3Count := doc.Find("h3").Length()

	// 3. Canonical Tag & Meta Robots
	canonical, _ := doc.Find("link[rel='canonical']").Attr("href")
	robots, _ := doc.Find("meta[name='robots']").Attr("content")

	// 4. Open Graph Social Tags
	ogTitle, _ := doc.Find("meta[property='og:title']").Attr("content")
	ogDescription, _ := doc.Find("meta[property='og:description']").Attr("content")
	ogImage, _ := doc.Find("meta[property='og:image']").Attr("content")

	// 5. Mobile Viewport Check
	_, hasViewport := doc.Find("meta[name='viewport']").Attr("content")

	// 6. Image Alt Tags Analysis
	imagesTotal := 0
	imagesMissingAlt := 0
	doc.Find("img").Each(func(i int, s *goquery.Selection) {
		imagesTotal++
		alt, exists := s.Attr("alt")
		if !exists || strings.TrimSpace(alt) == "" {
			imagesMissingAlt++
		}
	})

	// 7. Link Analysis (Internal vs External)
	internalLinks := 0
	externalLinks := 0
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" || strings.HasPrefix(href, "#") || strings.HasPrefix(href, "javascript:") {
			return
		}

		linkUrl, err := url.Parse(href)
		if err != nil {
			return
		}

		if linkUrl.Host == "" || linkUrl.Host == parsedTarget.Host {
			internalLinks++
		} else {
			externalLinks++
		}
	})

	// 8. Word Count
	bodyText := doc.Find("body").Text()
	words := strings.Fields(bodyText)
	wordCount := len(words)

	// 9. SSL check
	hasSsl := resp.TLS != nil || strings.HasPrefix(resp.Request.URL.String(), "https://")

	// Kirim respons JSON lengkap ke React
	result := AuditResponse{
		URL:              targetURL,
		StatusCode:       resp.StatusCode,
		ResponseTime:     responseTime,
		Title:            title,
		Description:      strings.TrimSpace(description),
		H1Count:          h1Count,
		H2Count:          h2Count,
		H3Count:          h3Count,
		Canonical:        strings.TrimSpace(canonical),
		Robots:           strings.TrimSpace(robots),
		ImagesTotal:      imagesTotal,
		ImagesMissingAlt: imagesMissingAlt,
		InternalLinks:    internalLinks,
		ExternalLinks:    externalLinks,
		OGTitle:          strings.TrimSpace(ogTitle),
		OGDescription:    strings.TrimSpace(ogDescription),
		OGImage:          strings.TrimSpace(ogImage),
		HasViewport:      hasViewport,
		HasSsl:           hasSsl,
		PageSizeBytes:    int64(len(bodyBytes)),
		WordCount:        wordCount,
	}

	json.NewEncoder(w).Encode(result)
}

func main() {
	http.HandleFunc("/api/audit", handleAudit)

	fmt.Println("Backend Go berjalan di http://localhost:8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Error: %v\n", err)
	}
}
