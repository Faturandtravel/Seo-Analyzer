export interface AuditResult {
  url: string;
  title: string;
  description: string;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  canonical: string;
  robots: string;
  images_total: number;
  images_missing_alt: number;
  internal_links: number;
  external_links: number;
  og_title: string;
  og_description: string;
  og_image: string;
  has_viewport: boolean;
  has_ssl: boolean;
  word_count: number;
  page_size_bytes: number;
  response_time_ms: number;
  status_code: number;
  error?: string;
  score?: number;
  favicon?: string;
}

export interface RecommendationItem {
  id: string;
  priority: 'critical' | 'warning' | 'info' | 'passed';
  category: 'On-Page' | 'Performance' | 'Technical' | 'Social' | 'Content';
  title: string;
  description: string;
  impact: string;
  actionSnippet?: string;
  reasoning?: string;
}

export interface AuditAIReport {
  url: string;
  score: number;
  modelName: string;
  generatedAt: string;
  executiveSummary: string;
  criticalCount: number;
  warningCount: number;
  passedCount: number;
  recommendations: RecommendationItem[];
  quickWins: string[];
  isDeepSeekConnected: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
}

export type ExtensionMessage =
  | { type: 'GET_SEO_DATA' }
  | { type: 'SEO_DATA_RESULT'; data: AuditResult }
  | { type: 'SEO_DATA_ERROR'; error: string };
