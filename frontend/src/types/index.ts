export interface AuditResult {
  url: string;
  status_code: number;
  response_time_ms: number;
  title: string;
  description: string;
  h1_count: number;
  h2_count?: number;
  h3_count?: number;
  canonical?: string;
  robots?: string;
  images_total?: number;
  images_missing_alt?: number;
  internal_links?: number;
  external_links?: number;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  has_viewport?: boolean;
  has_ssl?: boolean;
  page_size_bytes?: number;
  word_count?: number;
  error?: string;
  score?: number;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  subtext: string;
  progressPercent: number;
  platform: 'google' | 'slack' | 'gmail' | 'speed' | 'heading' | 'status' | 'image' | 'link';
  tooltip?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
  actionText?: string;
}

export interface EventSchedule {
  id: string;
  title: string;
  time: string;
  type: string;
  active?: boolean;
}
