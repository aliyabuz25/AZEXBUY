import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { Database, DatabaseSchema } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.join(__dirname, '..', 'data');
const BACKUP_SQLITE_PATH = path.join(BACKUP_DIR, 'octotech_full_backup.sqlite');

export class SqliteBackupManager {
  /**
   * Exports full application state into a real SQLite binary database file (.sqlite)
   */
  public static exportToSqlite(targetPath?: string): string {
    const filePath = targetPath || BACKUP_SQLITE_PATH;
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore if open
      }
    }

    const state = Database.getFullState();
    const db = new DatabaseSync(filePath);

    // 1. Create Schema
    db.exec(`
      CREATE TABLE IF NOT EXISTS system_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS site_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT,
        domain TEXT,
        type TEXT,
        endpoint TEXT
      );

      CREATE TABLE IF NOT EXISTS seo_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        title TEXT,
        description TEXT,
        canonical TEXT,
        keywords TEXT,
        robots_index INTEGER,
        robots_follow INTEGER,
        og_title TEXT,
        og_description TEXT,
        og_image TEXT,
        sitemap_url TEXT,
        last_updated TEXT
      );

      CREATE TABLE IF NOT EXISTS translations (
        key TEXT PRIMARY KEY,
        module TEXT,
        type TEXT,
        az TEXT,
        tr TEXT,
        ru TEXT,
        en TEXT
      );

      CREATE TABLE IF NOT EXISTS content_records (
        id TEXT PRIMARY KEY,
        title TEXT,
        source TEXT,
        author TEXT,
        date TEXT,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS media_items (
        id TEXT PRIMARY KEY,
        filename TEXT,
        original_name TEXT,
        mime_type TEXT,
        size INTEGER,
        url TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS upload_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        max_file_size_mb INTEGER,
        allowed_mime_types TEXT,
        upload_dir TEXT
      );

      CREATE TABLE IF NOT EXISTS admin_user (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        full_name TEXT,
        email TEXT,
        role TEXT,
        password TEXT
      );

      CREATE TABLE IF NOT EXISTS system_setup (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        completed INTEGER,
        industry TEXT,
        setup_date TEXT
      );
    `);

    // 2. Insert Metadata
    const insertMeta = db.prepare('INSERT INTO system_metadata (key, value) VALUES (?, ?)');
    insertMeta.run('engine', 'Octotech LL. Admin Core');
    insertMeta.run('version', '2.4.0');
    insertMeta.run('exported_at', new Date().toISOString());
    insertMeta.run('format', 'SQLite 3 Standalone Full Backup');

    // 3. Insert Site Config
    if (state.site) {
      const stmt = db.prepare(`
        INSERT INTO site_config (id, name, domain, type, endpoint) 
        VALUES (1, ?, ?, ?, ?)
      `);
      stmt.run(state.site.name || '', state.site.domain || '', state.site.type || '', state.site.endpoint || '');
    }

    // 4. Insert SEO Config
    if (state.seo) {
      const stmt = db.prepare(`
        INSERT INTO seo_config (
          id, title, description, canonical, keywords,
          robots_index, robots_follow, og_title, og_description, og_image,
          sitemap_url, last_updated
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        state.seo.title || '',
        state.seo.description || '',
        state.seo.canonical || '',
        state.seo.keywords || '',
        state.seo.robotsIndex ? 1 : 0,
        state.seo.robotsFollow ? 1 : 0,
        state.seo.ogTitle || '',
        state.seo.ogDescription || '',
        state.seo.ogImage || '',
        state.seo.sitemapUrl || '',
        state.seo.lastUpdated || new Date().toISOString()
      );
    }

    // 5. Insert Translations
    if (Array.isArray(state.translations)) {
      const stmt = db.prepare(`
        INSERT INTO translations (key, module, type, az, tr, ru, en)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of state.translations) {
        stmt.run(
          item.key,
          item.module || 'common',
          item.type || 'text',
          item.az || '',
          item.tr || '',
          item.ru || '',
          item.en || ''
        );
      }
    }

    // 6. Insert Content Records
    if (Array.isArray(state.records)) {
      const stmt = db.prepare(`
        INSERT INTO content_records (id, title, source, author, date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const rec of state.records) {
        stmt.run(rec.id, rec.title, rec.source || '', rec.author || '', rec.date || '', rec.status || 'published');
      }
    }

    // 7. Insert Media Items
    if (Array.isArray(state.media)) {
      const stmt = db.prepare(`
        INSERT INTO media_items (id, filename, original_name, mime_type, size, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of state.media) {
        stmt.run(m.id, m.filename, m.originalName || m.filename, m.mimeType || '', m.size || 0, m.url || '', m.createdAt || '');
      }
    }

    // 8. Insert Upload Config
    if (state.uploadConfig) {
      const stmt = db.prepare(`
        INSERT INTO upload_config (id, max_file_size_mb, allowed_mime_types, upload_dir)
        VALUES (1, ?, ?, ?)
      `);
      stmt.run(
        state.uploadConfig.maxFileSizeMB || 15,
        state.uploadConfig.allowedMimeTypes || '',
        state.uploadConfig.uploadDir || 'uploads'
      );
    }

    // 9. Insert Admin User
    if (state.admin) {
      const stmt = db.prepare(`
        INSERT INTO admin_user (id, full_name, email, role, password)
        VALUES (1, ?, ?, ?, ?)
      `);
      stmt.run(state.admin.fullName || '', state.admin.email || '', state.admin.role || '', state.admin.password || '');
    }

    // 10. Insert Setup
    if (state.setup) {
      const stmt = db.prepare(`
        INSERT INTO system_setup (id, completed, industry, setup_date)
        VALUES (1, ?, ?, ?)
      `);
      stmt.run(state.setup.completed ? 1 : 0, state.setup.industry || '', state.setup.setupDate || '');
    }

    // Close SQLite database cleanly
    db.close();

    return filePath;
  }

  /**
   * Restores state from an uploaded or existing SQLite database file (.sqlite)
   */
  public static restoreFromSqlite(sqliteFilePath: string): DatabaseSchema {
    if (!fs.existsSync(sqliteFilePath)) {
      throw new Error('SQLite backup faylı tapılmadı');
    }

    const db = new DatabaseSync(sqliteFilePath);

    // Read Site Config
    let site = Database.getSiteConfig();
    try {
      const siteRow: any = db.prepare('SELECT * FROM site_config WHERE id = 1').get();
      if (siteRow) {
        site = {
          name: siteRow.name,
          domain: siteRow.domain,
          type: siteRow.type,
          endpoint: siteRow.endpoint
        };
      }
    } catch (e) {
      console.warn('site_config table read error:', e);
    }

    // Read SEO Config
    let seo = Database.getSeo();
    try {
      const seoRow: any = db.prepare('SELECT * FROM seo_config WHERE id = 1').get();
      if (seoRow) {
        seo = {
          title: seoRow.title,
          description: seoRow.description,
          canonical: seoRow.canonical,
          keywords: seoRow.keywords,
          robotsIndex: Boolean(seoRow.robots_index),
          robotsFollow: Boolean(seoRow.robots_follow),
          ogTitle: seoRow.og_title,
          ogDescription: seoRow.og_description,
          ogImage: seoRow.og_image,
          sitemapUrl: seoRow.sitemap_url,
          lastUpdated: seoRow.last_updated || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('seo_config table read error:', e);
    }

    // Read Translations
    let translations: any[] = [];
    try {
      const rows: any[] = db.prepare('SELECT * FROM translations').all();
      translations = rows.map(r => ({
        key: r.key,
        module: r.module,
        type: r.type,
        az: r.az,
        tr: r.tr,
        ru: r.ru,
        en: r.en
      }));
    } catch (e) {
      console.warn('translations table read error:', e);
      translations = Database.getTranslations();
    }

    // Read Records
    let records: any[] = [];
    try {
      const rows: any[] = db.prepare('SELECT * FROM content_records').all();
      records = rows.map(r => ({
        id: r.id,
        title: r.title,
        source: r.source,
        author: r.author,
        date: r.date,
        status: r.status
      }));
    } catch (e) {
      console.warn('content_records table read error:', e);
      records = Database.getRecords();
    }

    // Read Media
    let media: any[] = [];
    try {
      const rows: any[] = db.prepare('SELECT * FROM media_items').all();
      media = rows.map(r => ({
        id: r.id,
        filename: r.filename,
        originalName: r.original_name,
        mimeType: r.mime_type,
        size: r.size,
        url: r.url,
        createdAt: r.created_at
      }));
    } catch (e) {
      console.warn('media_items table read error:', e);
      media = Database.getMedia();
    }

    // Read Upload Config
    let uploadConfig = Database.getUploadConfig();
    try {
      const row: any = db.prepare('SELECT * FROM upload_config WHERE id = 1').get();
      if (row) {
        uploadConfig = {
          maxFileSizeMB: row.max_file_size_mb,
          allowedMimeTypes: row.allowed_mime_types,
          uploadDir: row.upload_dir
        };
      }
    } catch (e) {
      console.warn('upload_config table read error:', e);
    }

    // Read Admin
    let admin = Database.getAdmin();
    try {
      const row: any = db.prepare('SELECT * FROM admin_user WHERE id = 1').get();
      if (row) {
        admin = {
          fullName: row.full_name,
          email: row.email,
          role: row.role,
          password: row.password
        };
      }
    } catch (e) {
      console.warn('admin_user table read error:', e);
    }

    // Read Setup
    let setup = Database.getSetup();
    try {
      const row: any = db.prepare('SELECT * FROM system_setup WHERE id = 1').get();
      if (row) {
        setup = {
          completed: Boolean(row.completed),
          industry: row.industry,
          setupDate: row.setup_date
        };
      }
    } catch (e) {
      console.warn('system_setup table read error:', e);
    }

    db.close();

    const restoredState: DatabaseSchema = {
      site,
      seo,
      translations,
      records,
      media,
      uploadConfig,
      admin,
      setup
    };

    Database.restoreFullState(restoredState);
    return restoredState;
  }

  /**
   * Returns SQLite backup statistics
   */
  public static getBackupInfo(): {
    engine: string;
    version: string;
    format: string;
    tablesCount: number;
    totalRecords: number;
    fileSizeBytes: number;
    lastGenerated: string | null;
  } {
    const state = Database.getFullState();
    let fileSizeBytes = 0;
    let lastGenerated: string | null = null;

    if (fs.existsSync(BACKUP_SQLITE_PATH)) {
      const stat = fs.statSync(BACKUP_SQLITE_PATH);
      fileSizeBytes = stat.size;
      lastGenerated = stat.mtime.toISOString();
    }

    const totalRecords =
      1 + // site
      1 + // seo
      (state.translations?.length || 0) +
      (state.records?.length || 0) +
      (state.media?.length || 0) +
      1 + // uploadConfig
      1 + // admin
      1; // setup

    return {
      engine: 'SQLite 3 (node:sqlite)',
      version: '2.4.0',
      format: '.sqlite (Binary Relational Database)',
      tablesCount: 9,
      totalRecords,
      fileSizeBytes,
      lastGenerated
    };
  }
}
