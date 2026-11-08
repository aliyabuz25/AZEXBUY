export type UiLanguage = 'az' | 'tr' | 'ru' | 'en';

export interface TabItem {
  id: string;
  title: string;
  icon: string;
  closable: boolean;
}

export interface SiteConfig {
  name: string;
  domain: string;
  type: string;
  endpoint: string;
}

export interface SeoConfig {
  title: string;
  description: string;
  canonical: string;
  keywords: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  sitemapUrl: string;
  lastUpdated: string;
}

export interface TranslationItem {
  key: string;
  module: string;
  type: 'text' | 'rich';
  az: string;
  tr: string;
  ru: string;
  en: string;
}

export interface RecordItem {
  id: string;
  title: string;
  source: string;
  author: string;
  date: string;
  status: 'published' | 'synced' | 'draft';
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface MulterConfig {
  maxFileSizeMB: number;
  allowedMimeTypes: string;
  uploadDir: string;
}

export interface AdminUser {
  username?: string;
  fullName: string;
  email: string;
  role: string;
}

export interface SetupStatus {
  completed: boolean;
  completedAt?: string;
}

export function toText(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(x => toText(x)).filter(Boolean).join(', ');
    }
    const loc = val.AZ || val.EN || val.TR || val.RU || val.AR || val.ES;
    if (loc) return typeof loc === 'string' ? loc : toText(loc);
    for (const k of Object.keys(val)) {
      if (typeof val[k] === 'string' && val[k].trim()) return val[k];
    }
    return fallback;
  }
  return String(val);
}

