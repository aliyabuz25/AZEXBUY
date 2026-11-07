import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'store.json');

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
  module?: string;
  type?: 'text' | 'rich';
  az: string;
  tr: string;
  ru: string;
  en: string;
}

export interface ContentRecord {
  id: string;
  title: string;
  source: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'synced';
}

export interface MulterConfig {
  maxFileSizeMB: number;
  allowedMimeTypes: string;
  uploadDir: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface AdminUser {
  username?: string;
  fullName: string;
  email: string;
  role: string;
  password?: string;
}

export interface SetupConfig {
  completed: boolean;
  industry?: string;
  setupDate?: string;
}

export interface DatabaseSchema {
  site: SiteConfig;
  seo: SeoConfig;
  translations: TranslationItem[];
  records: ContentRecord[];
  media: MediaItem[];
  uploadConfig: MulterConfig;
  admin: AdminUser;
  setup: SetupConfig;
  version?: string;
}

export class Database {
  private static readData(): DatabaseSchema {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    } catch (err) {
      console.error('Error reading store.json, returning empty structure', err);
      return {
        site: {
          name: 'Production Storefront',
          domain: 'https://mystore.az',
          type: 'Next.js + Headless Engine',
          endpoint: 'https://api.mystore.az/v1'
        },
        seo: {} as any,
        translations: [],
        records: [],
        media: [],
        uploadConfig: {
          maxFileSizeMB: 15,
          allowedMimeTypes: 'image/jpeg,image/png,image/webp,image/svg+xml,application/pdf',
          uploadDir: 'uploads'
        },
        admin: {
          fullName: 'Super Admin',
          email: 'admin@nexus.az',
          role: 'Baş İnzibatçı'
        },
        setup: {
          completed: false
        }
      };
    }
  }

  private static writeData(data: DatabaseSchema): void {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
  }

  public static getFullState(): DatabaseSchema {
    return this.readData();
  }

  public static getVersion(): string {
    const data = this.readData();
    return data.version || '2.4.0';
  }

  public static setVersion(version: string): string {
    const data = this.readData();
    data.version = version;
    this.writeData(data);
    return version;
  }

  public static restoreFullState(data: DatabaseSchema): void {
    this.writeData(data);
  }

  public static getSiteConfig(): SiteConfig {
    return this.readData().site;
  }

  public static updateSiteConfig(update: Partial<SiteConfig>): SiteConfig {
    const data = this.readData();
    data.site = {
      ...data.site,
      ...update
    };
    this.writeData(data);
    return data.site;
  }

  public static getSeo(): SeoConfig {
    return this.readData().seo;
  }

  public static updateSeo(update: Partial<SeoConfig>): SeoConfig {
    const data = this.readData();
    data.seo = {
      ...data.seo,
      ...update,
      lastUpdated: new Date().toISOString()
    };
    this.writeData(data);
    return data.seo;
  }

  public static getTranslations(): TranslationItem[] {
    return this.readData().translations;
  }

  public static updateTranslation(key: string, values: Partial<Omit<TranslationItem, 'key'>>): TranslationItem {
    const data = this.readData();
    const idx = data.translations.findIndex(t => t.key === key);
    if (idx !== -1) {
      data.translations[idx] = { ...data.translations[idx], ...values };
      this.writeData(data);
      return data.translations[idx];
    } else {
      const newItem: TranslationItem = {
        key,
        module: values.module || 'common',
        type: values.type || 'text',
        az: values.az || '',
        tr: values.tr || '',
        ru: values.ru || '',
        en: values.en || ''
      };
      data.translations.unshift(newItem);
      this.writeData(data);
      return newItem;
    }
  }

  public static deleteTranslation(key: string): boolean {
    const data = this.readData();
    const idx = data.translations.findIndex(t => t.key === key);
    if (idx === -1) return false;
    data.translations.splice(idx, 1);
    this.writeData(data);
    return true;
  }

  public static getRecords(): ContentRecord[] {
    return this.readData().records;
  }

  public static addRecord(record: Omit<ContentRecord, 'id'>): ContentRecord {
    const data = this.readData();
    const newRecord: ContentRecord = {
      ...record,
      id: `REC-${Math.floor(1000 + Math.random() * 9000)}`
    };
    data.records.unshift(newRecord);
    this.writeData(data);
    return newRecord;
  }

  public static getMedia(): MediaItem[] {
    const data = this.readData();
    return data.media || [];
  }

  public static addMedia(item: Omit<MediaItem, 'id' | 'createdAt'>): MediaItem {
    const data = this.readData();
    if (!data.media) data.media = [];
    const newMedia: MediaItem = {
      ...item,
      id: `MED-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    data.media.unshift(newMedia);
    this.writeData(data);
    return newMedia;
  }

  public static deleteMedia(id: string): MediaItem | null {
    const data = this.readData();
    if (!data.media) return null;
    const idx = data.media.findIndex(m => m.id === id);
    if (idx === -1) return null;
    const removed = data.media.splice(idx, 1)[0];
    this.writeData(data);
    return removed;
  }

  public static getUploadConfig(): MulterConfig {
    const data = this.readData();
    return data.uploadConfig || {
      maxFileSizeMB: 15,
      allowedMimeTypes: 'image/jpeg,image/png,image/webp,image/svg+xml,application/pdf',
      uploadDir: 'uploads'
    };
  }

  public static updateUploadConfig(update: Partial<MulterConfig>): MulterConfig {
    const data = this.readData();
    data.uploadConfig = {
      ...this.getUploadConfig(),
      ...update
    };
    this.writeData(data);
    return data.uploadConfig;
  }

  public static getAdmin(): AdminUser {
    const data = this.readData();
    const admin = data.admin || {
      username: 'admin',
      fullName: 'Super Admin',
      email: 'admin@octotech.az',
      role: 'Baş İnzibatçı',
      password: 'admin'
    };
    if (!admin.username) admin.username = 'admin';
    if (!admin.password) admin.password = 'admin';
    return admin;
  }

  public static updateAdmin(update: Partial<AdminUser>): AdminUser {
    const data = this.readData();
    data.admin = {
      ...this.getAdmin(),
      ...update
    };
    this.writeData(data);
    return data.admin;
  }

  public static getSetup(): SetupConfig {
    const data = this.readData();
    return data.setup || { completed: false };
  }

  public static completeSetup(payload: {
    site?: Partial<SiteConfig>;
    admin?: Partial<AdminUser>;
    uploadConfig?: Partial<MulterConfig>;
    industry?: string;
  }) {
    const data = this.readData();
    if (payload.site) {
      data.site = {
        ...data.site,
        ...payload.site
      };
      if (payload.site.domain && data.seo) {
        data.seo.canonical = payload.site.domain;
      }
    }
    if (payload.admin) {
      data.admin = {
        ...this.getAdmin(),
        ...payload.admin
      };
    }
    if (payload.uploadConfig) {
      data.uploadConfig = {
        ...this.getUploadConfig(),
        ...payload.uploadConfig
      };
    }
    data.setup = {
      completed: true,
      industry: payload.industry || 'E-commerce & Storefront',
      setupDate: new Date().toISOString()
    };
    this.writeData(data);
    return {
      site: data.site,
      admin: data.admin,
      uploadConfig: data.uploadConfig,
      setup: data.setup
    };
  }

  public static resetSetup(): SetupConfig {
    const data = this.readData();
    data.setup = { completed: false };
    this.writeData(data);
    return data.setup;
  }
}
