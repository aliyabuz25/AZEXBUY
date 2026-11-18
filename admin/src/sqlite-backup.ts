import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import BetterSqlite3 from 'better-sqlite3';
import AdmZip from 'adm-zip';
import { Database, DatabaseSchema } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_SQLITE_PATH = path.join(DATA_DIR, 'azexbuy_full_backup.sqlite');
const BACKUP_ZIP_PATH = path.join(DATA_DIR, 'azexbuy_full_backup.zip');

export interface TableSummary {
  name: string;
  rows: number;
  label?: string;
  db?: string;
}

export interface BackupFileItem {
  filename: string;
  filePath: string;
  sizeBytes: number;
  createdAt: string;
  type: 'zip' | 'sqlite' | 'db';
  isSafety: boolean;
}

export interface ZipBackupResult {
  filePath: string;
  filename: string;
  sizeBytes: number;
  tablesCount: number;
  totalRows: number;
  mediaFilesCount: number;
  mediaSizeBytes: number;
  exportedAt: string;
}

export interface ZipRestoreResult {
  success: boolean;
  message: string;
  totalRestoredTables: number;
  totalRestoredRows: number;
  totalRestoredMedia: number;
  restoredMediaBytes: number;
  restoredTables: TableSummary[];
  safetyBackupFile: string;
  backupTimestamp: string;
}

export interface BackupInfoResult {
  engine: string;
  version: string;
  format: string;
  tablesCount: number;
  totalRecords: number;
  fileSizeBytes: number;
  lastGenerated: string | null;
  tableBreakdown: TableSummary[];
  safetyBackupsCount: number;
  mediaFilesCount: number;
  mediaTotalSizeBytes: number;
  zipBackupExists: boolean;
  zipFileSizeBytes: number;
  lastZipGenerated: string | null;
  backupsList: BackupFileItem[];
}

export interface RestoreResult {
  success: boolean;
  message: string;
  totalRestoredTables: number;
  totalRestoredRows: number;
  restoredTables: TableSummary[];
  safetyBackupFile: string;
  backupTimestamp: string;
}

export class SqliteBackupManager {
  /**
   * Helper to ensure directories exist
   */
  private static ensureDirs(): void {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  /**
   * Exports full application state into a real SQLite binary database file (.sqlite)
   * Includes 100% of data: azexbuy.db (CMS, catalog, blog, services, team, contacts, rfqs),
   * octo.db (admin users, settings, logs), and store.json (site/seo/translations/media).
   */
  public static exportToSqlite(targetPath?: string): string {
    this.ensureDirs();
    const filePath = targetPath || BACKUP_SQLITE_PATH;

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('[SqliteBackup] Could not unlink existing backup file:', e);
      }
    }

    const outDb = new BetterSqlite3(filePath);
    outDb.pragma('journal_mode = OFF');
    outDb.pragma('synchronous = OFF');

    let totalTablesCount = 0;
    let totalRowsCount = 0;

    // ── 1. Create and populate system_metadata ──────────────────────────────
    outDb.exec(`
      CREATE TABLE IF NOT EXISTS system_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    const insertMeta = outDb.prepare('INSERT OR REPLACE INTO system_metadata (key, value) VALUES (?, ?)');
    insertMeta.run('app', 'AZEXBUY Enterprise Platform');
    insertMeta.run('engine', 'AZEXBUY Universal SQLite 3 Core');
    insertMeta.run('version', '2.4.3');
    insertMeta.run('exported_at', new Date().toISOString());
    insertMeta.run('format', 'SQLite 3 Standalone Full System Backup');
    totalTablesCount++;

    // ── 2. Dump azexbuy.db (all AZEXBUY tables) ──────────────────────────────
    const azDbPath = path.join(DATA_DIR, 'azexbuy.db');
    if (fs.existsSync(azDbPath)) {
      let azDb: BetterSqlite3.Database | null = null;
      try {
        azDb = new BetterSqlite3(azDbPath, { readonly: true });
        try { azDb.pragma('wal_checkpoint(PASSIVE)'); } catch {}

        const azTables = azDb.prepare(
          "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ).all() as { name: string; sql: string }[];

        for (const tbl of azTables) {
          if (!tbl.sql) continue;
          outDb.exec(tbl.sql);
          totalTablesCount++;

          const rows = azDb.prepare(`SELECT * FROM "${tbl.name}"`).all();
          if (rows.length > 0) {
            const cols = Object.keys(rows[0] as any);
            const colList = cols.map(c => `"${c}"`).join(', ');
            const placeholders = cols.map(() => '?').join(', ');
            const insertStmt = outDb.prepare(`INSERT INTO "${tbl.name}" (${colList}) VALUES (${placeholders})`);

            const insertMany = outDb.transaction((records: any[]) => {
              for (const r of records) {
                insertStmt.run(cols.map(c => r[c]));
              }
            });
            insertMany(rows);
            totalRowsCount += rows.length;
          }
        }

        // Copy indexes
        const azIndexes = azDb.prepare(
          "SELECT sql FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL"
        ).all() as { sql: string }[];
        for (const idx of azIndexes) {
          try { outDb.exec(idx.sql); } catch {}
        }
      } catch (err) {
        console.error('[SqliteBackup] Error copying azexbuy.db tables:', err);
      } finally {
        if (azDb) azDb.close();
      }
    }

    // ── 3. Dump octo.db (admin users, smtp, ai, email logs) ──────────────────
    const octoDbPath = path.join(DATA_DIR, 'octo.db');
    if (fs.existsSync(octoDbPath)) {
      let octoDb: BetterSqlite3.Database | null = null;
      try {
        octoDb = new BetterSqlite3(octoDbPath, { readonly: true });
        try { octoDb.pragma('wal_checkpoint(PASSIVE)'); } catch {}

        const octoTables = octoDb.prepare(
          "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ).all() as { name: string; sql: string }[];

        for (const tbl of octoTables) {
          if (!tbl.sql) continue;
          // Avoid overwriting if table name collided
          const existing = outDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tbl.name);
          if (existing) continue;

          outDb.exec(tbl.sql);
          totalTablesCount++;

          const rows = octoDb.prepare(`SELECT * FROM "${tbl.name}"`).all();
          if (rows.length > 0) {
            const cols = Object.keys(rows[0] as any);
            const colList = cols.map(c => `"${c}"`).join(', ');
            const placeholders = cols.map(() => '?').join(', ');
            const insertStmt = outDb.prepare(`INSERT INTO "${tbl.name}" (${colList}) VALUES (${placeholders})`);

            const insertMany = outDb.transaction((records: any[]) => {
              for (const r of records) {
                insertStmt.run(cols.map(c => r[c]));
              }
            });
            insertMany(rows);
            totalRowsCount += rows.length;
          }
        }
      } catch (err) {
        console.error('[SqliteBackup] Error copying octo.db tables:', err);
      } finally {
        if (octoDb) octoDb.close();
      }
    }

    // ── 4. Dump store.json state into relational tables ──────────────────────
    try {
      const state = Database.getFullState();

      outDb.exec(`
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

        CREATE TABLE IF NOT EXISTS system_setup (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          completed INTEGER,
          industry TEXT,
          setup_date TEXT
        );
      `);

      totalTablesCount += 7;

      if (state.site) {
        outDb.prepare('INSERT OR REPLACE INTO site_config (id, name, domain, type, endpoint) VALUES (1, ?, ?, ?, ?)')
          .run(state.site.name || '', state.site.domain || '', state.site.type || '', state.site.endpoint || '');
        totalRowsCount++;
      }

      if (state.seo) {
        outDb.prepare(`
          INSERT OR REPLACE INTO seo_config (
            id, title, description, canonical, keywords,
            robots_index, robots_follow, og_title, og_description, og_image,
            sitemap_url, last_updated
          ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
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
        totalRowsCount++;
      }

      if (Array.isArray(state.translations) && state.translations.length > 0) {
        const trIns = outDb.prepare('INSERT OR REPLACE INTO translations (key, module, type, az, tr, ru, en) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const trBatch = outDb.transaction((items: any[]) => {
          for (const item of items) {
            trIns.run(item.key, item.module || 'common', item.type || 'text', item.az || '', item.tr || '', item.ru || '', item.en || '');
          }
        });
        trBatch(state.translations);
        totalRowsCount += state.translations.length;
      }

      if (Array.isArray(state.records) && state.records.length > 0) {
        const recIns = outDb.prepare('INSERT OR REPLACE INTO content_records (id, title, source, author, date, status) VALUES (?, ?, ?, ?, ?, ?)');
        const recBatch = outDb.transaction((items: any[]) => {
          for (const r of items) recIns.run(r.id, r.title, r.source || '', r.author || '', r.date || '', r.status || 'published');
        });
        recBatch(state.records);
        totalRowsCount += state.records.length;
      }

      if (Array.isArray(state.media) && state.media.length > 0) {
        const mIns = outDb.prepare('INSERT OR REPLACE INTO media_items (id, filename, original_name, mime_type, size, url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
        const mBatch = outDb.transaction((items: any[]) => {
          for (const m of items) mIns.run(m.id, m.filename, m.originalName || m.filename, m.mimeType || '', m.size || 0, m.url || '', m.createdAt || '');
        });
        mBatch(state.media);
        totalRowsCount += state.media.length;
      }

      if (state.uploadConfig) {
        outDb.prepare('INSERT OR REPLACE INTO upload_config (id, max_file_size_mb, allowed_mime_types, upload_dir) VALUES (1, ?, ?, ?)')
          .run(state.uploadConfig.maxFileSizeMB || 15, state.uploadConfig.allowedMimeTypes || '', state.uploadConfig.uploadDir || 'uploads');
        totalRowsCount++;
      }

      if (state.setup) {
        outDb.prepare('INSERT OR REPLACE INTO system_setup (id, completed, industry, setup_date) VALUES (1, ?, ?, ?)')
          .run(state.setup.completed ? 1 : 0, state.setup.industry || '', state.setup.setupDate || '');
        totalRowsCount++;
      }
    } catch (err) {
      console.error('[SqliteBackup] Error writing store.json state to backup:', err);
    }

    insertMeta.run('tables_count', String(totalTablesCount));
    insertMeta.run('total_records', String(totalRowsCount));

    outDb.close();
    return filePath;
  }

  /**
   * Creates automated pre-restore safety backups of current databases
   */
  public static createSafetyBackup(): string {
    this.ensureDirs();
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const safetyAzPath = path.join(BACKUPS_DIR, `safety_azexbuy_${ts}.db`);
    const safetyOctoPath = path.join(BACKUPS_DIR, `safety_octo_${ts}.db`);
    const safetyStorePath = path.join(BACKUPS_DIR, `safety_store_${ts}.json`);

    try {
      const azDbPath = path.join(DATA_DIR, 'azexbuy.db');
      if (fs.existsSync(azDbPath)) fs.copyFileSync(azDbPath, safetyAzPath);

      const octoDbPath = path.join(DATA_DIR, 'octo.db');
      if (fs.existsSync(octoDbPath)) fs.copyFileSync(octoDbPath, safetyOctoPath);

      const storePath = path.join(DATA_DIR, 'store.json');
      if (fs.existsSync(storePath)) fs.copyFileSync(storePath, safetyStorePath);

      // Prune old backups, keep last 10
      const allFiles = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.startsWith('safety_'))
        .map(f => ({ name: f, path: path.join(BACKUPS_DIR, f), time: fs.statSync(path.join(BACKUPS_DIR, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);

      if (allFiles.length > 30) {
        for (const old of allFiles.slice(30)) {
          try { fs.unlinkSync(old.path); } catch {}
        }
      }
    } catch (e) {
      console.warn('[SqliteBackup] Safety backup warning:', e);
    }

    return `safety_azexbuy_${ts}.db`;
  }

  /**
   * Restores state from an uploaded or existing SQLite database file (.sqlite / .db)
   * Safely restores azexbuy.db, octo.db, and store.json with transactional integrity
   */
  public static restoreFromSqlite(
    sqliteFilePath: string,
    activeDbs?: {
      azexbuyDb?: BetterSqlite3.Database;
      mainDb?: BetterSqlite3.Database;
      azRedis?: any;
      azDel?: (key: string) => Promise<void>;
    }
  ): RestoreResult {
    if (!fs.existsSync(sqliteFilePath)) {
      throw new Error('SQLite backup faylı tapılmadı');
    }

    let backupDb: BetterSqlite3.Database;
    try {
      backupDb = new BetterSqlite3(sqliteFilePath, { readonly: true });
    } catch (e: any) {
      throw new Error('Seçilmiş fayl etibarlı SQLite bazası deyil: ' + e.message);
    }

    let backupTables: { name: string; sql: string }[] = [];
    try {
      backupTables = backupDb.prepare(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      ).all() as { name: string; sql: string }[];
    } catch (e: any) {
      backupDb.close();
      throw new Error('SQLite cədvəlləri oxunarkən xəta: ' + e.message);
    }

    if (backupTables.length === 0) {
      backupDb.close();
      throw new Error('Etibarsız SQLite backup faylı: Faylda heç bir cədvəl tapılmadı.');
    }

    // ── Pre-restore Safety Backup Snapshot ──────────────────────────────────
    const safetyFile = this.createSafetyBackup();

    const restoredTables: TableSummary[] = [];
    let totalRestoredRows = 0;

    // Read metadata if present
    let backupTimestamp = new Date().toISOString();
    try {
      const metaRow = backupDb.prepare("SELECT value FROM system_metadata WHERE key='exported_at'").get() as any;
      if (metaRow?.value) backupTimestamp = metaRow.value;
    } catch {}

    // Determine target database connections
    let azDb = activeDbs?.azexbuyDb;
    let localAzDb = false;
    if (!azDb) {
      azDb = new BetterSqlite3(path.join(DATA_DIR, 'azexbuy.db'));
      localAzDb = true;
    }

    let mainDb = activeDbs?.mainDb;
    let localMainDb = false;
    if (!mainDb) {
      mainDb = new BetterSqlite3(path.join(DATA_DIR, 'octo.db'));
      localMainDb = true;
    }

    const azexbuyTableNames = [
      'azexbuy_kv',
      'azexbuy_categories',
      'azexbuy_products',
      'azexbuy_articles',
      'azexbuy_services',
      'azexbuy_service_applications',
      'azexbuy_team_members',
      'azexbuy_contacts',
      'azexbuy_rfqs',
      'azexbuy_producers',
      // legacy aliases if backup came from earlier schema
      'products',
      'categories',
      'articles',
      'services',
      'service_applications',
      'rfqs',
      'producers'
    ];

    const octoTableNames = [
      'admin_users',
      'smtp_settings',
      'ai_settings',
      'email_logs'
    ];

    const storeJsonTableNames = [
      'site_config',
      'seo_config',
      'translations',
      'content_records',
      'media_items',
      'upload_config',
      'admin_user',
      'system_setup'
    ];

    try {
      azDb.pragma('foreign_keys = OFF');
      mainDb.pragma('foreign_keys = OFF');

      // Sort tables so parent tables (like categories) are restored before child tables (products)
      const tableOrder = [
        'azexbuy_kv',
        'azexbuy_categories',
        'azexbuy_products',
        'azexbuy_services',
        'azexbuy_articles',
        'azexbuy_team_members',
        'azexbuy_contacts',
        'azexbuy_rfqs',
        'azexbuy_producers',
        'azexbuy_service_applications'
      ];

      const sortedBackupTables = [...backupTables].sort((a, b) => {
        const idxA = tableOrder.indexOf(a.name);
        const idxB = tableOrder.indexOf(b.name);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      // ── Process azexbuy tables ────────────────────────────────────────────
      for (const t of sortedBackupTables) {
        const tName = t.name;
        const isAzexbuy = tName.startsWith('azexbuy_') || azexbuyTableNames.includes(tName);
        if (!isAzexbuy) continue;

        let targetName = tName;
        // Map legacy aliases
        if (tName === 'products') targetName = 'azexbuy_products';
        else if (tName === 'categories') targetName = 'azexbuy_categories';
        else if (tName === 'articles') targetName = 'azexbuy_articles';
        else if (tName === 'services') targetName = 'azexbuy_services';
        else if (tName === 'service_applications') targetName = 'azexbuy_service_applications';
        else if (tName === 'rfqs') targetName = 'azexbuy_rfqs';
        else if (tName === 'producers') targetName = 'azexbuy_producers';

        // Check if table exists in azDb; if not, create it
        const exists = azDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(targetName);
        if (!exists && t.sql) {
          const createSql = tName === targetName ? t.sql : t.sql.replace(new RegExp(`\\b${tName}\\b`, 'g'), targetName);
          azDb.exec(createSql);
        }

        const rows = backupDb.prepare(`SELECT * FROM "${tName}"`).all();
        const targetCols = (azDb.prepare(`PRAGMA table_info("${targetName}")`).all() as any[]).map(c => c.name);

        const restoreAzBatch = azDb.transaction(() => {
          azDb.prepare(`DELETE FROM "${targetName}"`).run();
          if (rows.length > 0) {
            const rowCols = Object.keys(rows[0] as any);
            const commonCols = rowCols.filter(c => targetCols.includes(c));
            if (commonCols.length > 0) {
              const colList = commonCols.map(c => `"${c}"`).join(', ');
              const qList = commonCols.map(() => '?').join(', ');
              const ins = azDb.prepare(`INSERT INTO "${targetName}" (${colList}) VALUES (${qList})`);
              for (const r of rows) {
                ins.run(commonCols.map(c => (r as any)[c]));
              }
            }
          }
        });

        restoreAzBatch();
        restoredTables.push({ name: targetName, rows: rows.length, label: 'AZEXBUY Baza', db: 'azexbuy.db' });
        totalRestoredRows += rows.length;
      }

      // ── Process octo.db tables (admin_users, settings, logs) ───────────────
      for (const t of backupTables) {
        const tName = t.name;
        if (!octoTableNames.includes(tName)) continue;

        const exists = mainDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tName);
        if (!exists && t.sql) mainDb.exec(t.sql);

        const rows = backupDb.prepare(`SELECT * FROM "${tName}"`).all();
        const targetCols = (mainDb.prepare(`PRAGMA table_info("${tName}")`).all() as any[]).map(c => c.name);

        const restoreOctoBatch = mainDb.transaction(() => {
          if (tName === 'admin_users') {
            // Keep at least one super admin safe if backup had 0 users
            if (rows.length > 0) {
              mainDb.prepare('DELETE FROM admin_users').run();
            }
          } else {
            mainDb.prepare(`DELETE FROM "${tName}"`).run();
          }

          if (rows.length > 0) {
            const rowCols = Object.keys(rows[0] as any);
            const commonCols = rowCols.filter(c => targetCols.includes(c));
            if (commonCols.length > 0) {
              const colList = commonCols.map(c => `"${c}"`).join(', ');
              const qList = commonCols.map(() => '?').join(', ');
              const ins = mainDb.prepare(`INSERT INTO "${tName}" (${colList}) VALUES (${qList})`);
              for (const r of rows) {
                ins.run(commonCols.map(c => (r as any)[c]));
              }
            }
          }
        });

        restoreOctoBatch();
        restoredTables.push({ name: tName, rows: rows.length, label: 'İnzibatçı & Sistem', db: 'octo.db' });
        totalRestoredRows += rows.length;
      }

      // ── Process store.json state ──────────────────────────────────────────
      const hasStoreJsonTables = backupTables.some(t => storeJsonTableNames.includes(t.name));
      if (hasStoreJsonTables) {
        try {
          const currentFullState = Database.getFullState();

          // Site config
          let site = currentFullState.site;
          try {
            const row: any = backupDb.prepare('SELECT * FROM site_config WHERE id = 1').get();
            if (row) site = { name: row.name, domain: row.domain, type: row.type, endpoint: row.endpoint };
          } catch {}

          // SEO config
          let seo = currentFullState.seo;
          try {
            const row: any = backupDb.prepare('SELECT * FROM seo_config WHERE id = 1').get();
            if (row) {
              seo = {
                title: row.title,
                description: row.description,
                canonical: row.canonical,
                keywords: row.keywords,
                robotsIndex: Boolean(row.robots_index),
                robotsFollow: Boolean(row.robots_follow),
                ogTitle: row.og_title,
                ogDescription: row.og_description,
                ogImage: row.og_image,
                sitemapUrl: row.sitemap_url,
                lastUpdated: row.last_updated || new Date().toISOString()
              };
            }
          } catch {}

          // Translations
          let translations = currentFullState.translations || [];
          try {
            const rows: any[] = backupDb.prepare('SELECT * FROM translations').all();
            if (rows.length > 0) {
              translations = rows.map(r => ({
                key: r.key,
                module: r.module,
                type: r.type,
                az: r.az,
                tr: r.tr,
                ru: r.ru,
                en: r.en
              }));
            }
          } catch {}

          // Records
          let records = currentFullState.records || [];
          try {
            const rows: any[] = backupDb.prepare('SELECT * FROM content_records').all();
            if (rows.length > 0) {
              records = rows.map(r => ({
                id: r.id,
                title: r.title,
                source: r.source,
                author: r.author,
                date: r.date,
                status: r.status
              }));
            }
          } catch {}

          // Media
          let media = currentFullState.media || [];
          try {
            const rows: any[] = backupDb.prepare('SELECT * FROM media_items').all();
            if (rows.length > 0) {
              media = rows.map(r => ({
                id: r.id,
                filename: r.filename,
                originalName: r.original_name,
                mimeType: r.mime_type,
                size: r.size,
                url: r.url,
                createdAt: r.created_at
              }));
            }
          } catch {}

          // Upload config
          let uploadConfig = currentFullState.uploadConfig;
          try {
            const row: any = backupDb.prepare('SELECT * FROM upload_config WHERE id = 1').get();
            if (row) {
              uploadConfig = {
                maxFileSizeMB: row.max_file_size_mb,
                allowedMimeTypes: row.allowed_mime_types,
                uploadDir: row.upload_dir
              };
            }
          } catch {}

          // Setup
          let setup = currentFullState.setup;
          try {
            const row: any = backupDb.prepare('SELECT * FROM system_setup WHERE id = 1').get();
            if (row) {
              setup = {
                completed: Boolean(row.completed),
                industry: row.industry,
                setupDate: row.setup_date
              };
            }
          } catch {}

          const restoredState: DatabaseSchema = {
            site,
            seo,
            translations,
            records,
            media,
            uploadConfig,
            admin: currentFullState.admin,
            setup
          };

          Database.restoreFullState(restoredState);
          restoredTables.push({ name: 'store.json', rows: translations.length + records.length + media.length, label: 'Sistem Parametrləri', db: 'store.json' });
        } catch (err) {
          console.warn('[SqliteBackup] store.json restore warning:', err);
        }
      }

      // Re-enable foreign keys
      try { azDb.pragma('foreign_keys = ON'); } catch {}
      try { mainDb.pragma('foreign_keys = ON'); } catch {}

      // Checkpoint WAL
      try { azDb.pragma('wal_checkpoint(TRUNCATE)'); } catch {}
      try { mainDb.pragma('wal_checkpoint(TRUNCATE)'); } catch {}

      // Invalidate Redis caches
      if (activeDbs?.azRedis) {
        try {
          activeDbs.azRedis.flushdb().catch(() => {});
        } catch {}
      }
      if (activeDbs?.azDel) {
        const keys = [
          'azexbuy:localization',
          'azexbuy:content',
          'azexbuy:categories',
          'azexbuy:products',
          'azexbuy:services',
          'azexbuy:team',
          'azexbuy:stats'
        ];
        for (const k of keys) {
          try { activeDbs.azDel(k).catch(() => {}); } catch {}
        }
      }
    } finally {
      backupDb.close();
      if (localAzDb && azDb) azDb.close();
      if (localMainDb && mainDb) mainDb.close();
    }

    return {
      success: true,
      message: `Məlumat bazası SQLite nüsxəsindən tam və uğurla bərpa edildi (${restoredTables.length} cədvəl, ${totalRestoredRows} sətir).`,
      totalRestoredTables: restoredTables.length,
      totalRestoredRows,
      restoredTables,
      safetyBackupFile: safetyFile,
      backupTimestamp
    };
  }

  /**
   * Returns rich SQLite backup and database statistics
   */
  public static getBackupInfo(): BackupInfoResult {
    this.ensureDirs();
    let fileSizeBytes = 0;
    let lastGenerated: string | null = null;

    if (fs.existsSync(BACKUP_SQLITE_PATH)) {
      try {
        const stat = fs.statSync(BACKUP_SQLITE_PATH);
        fileSizeBytes = stat.size;
        lastGenerated = stat.mtime.toISOString();
      } catch {}
    }

    const tableBreakdown: TableSummary[] = [];
    let totalRecords = 0;

    // 1. Scan azexbuy.db
    const azDbPath = path.join(DATA_DIR, 'azexbuy.db');
    if (fs.existsSync(azDbPath)) {
      try {
        const azDb = new BetterSqlite3(azDbPath, { readonly: true });
        const tables = azDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
        for (const t of tables) {
          try {
            const count = (azDb.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get() as any)?.c || 0;
            totalRecords += count;
            tableBreakdown.push({
              name: t.name,
              rows: count,
              label: this.getTableFriendlyLabel(t.name),
              db: 'azexbuy.db'
            });
          } catch {}
        }
        azDb.close();
      } catch {}
    }

    // 2. Scan octo.db
    const octoDbPath = path.join(DATA_DIR, 'octo.db');
    if (fs.existsSync(octoDbPath)) {
      try {
        const octoDb = new BetterSqlite3(octoDbPath, { readonly: true });
        const tables = octoDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
        for (const t of tables) {
          try {
            const count = (octoDb.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get() as any)?.c || 0;
            totalRecords += count;
            tableBreakdown.push({
              name: t.name,
              rows: count,
              label: this.getTableFriendlyLabel(t.name),
              db: 'octo.db'
            });
          } catch {}
        }
        octoDb.close();
      } catch {}
    }

    // 3. Scan store.json
    try {
      const state = Database.getFullState();
      const storeRows =
        1 + // site
        1 + // seo
        (state.translations?.length || 0) +
        (state.records?.length || 0) +
        (state.media?.length || 0) +
        1 + // uploadConfig
        1 + // admin
        1;  // setup
      totalRecords += storeRows;
      tableBreakdown.push({
        name: 'store.json',
        rows: storeRows,
        label: 'Sistem Parametrləri & Tərcümələr',
        db: 'store.json'
      });
    } catch {}

    // Count safety backups
    let safetyBackupsCount = 0;
    if (fs.existsSync(BACKUPS_DIR)) {
      try {
        safetyBackupsCount = fs.readdirSync(BACKUPS_DIR).filter(f => f.startsWith('safety_')).length;
      } catch {}
    }

    // Total disk size of active DB files
    let liveDbSizeBytes = 0;
    try {
      if (fs.existsSync(azDbPath)) liveDbSizeBytes += fs.statSync(azDbPath).size;
      if (fs.existsSync(octoDbPath)) liveDbSizeBytes += fs.statSync(octoDbPath).size;
      const storePath = path.join(DATA_DIR, 'store.json');
      if (fs.existsSync(storePath)) liveDbSizeBytes += fs.statSync(storePath).size;
    } catch {}

    const mediaStats = this.getMediaStats();
    let zipBackupExists = false;
    let zipFileSizeBytes = 0;
    let lastZipGenerated: string | null = null;
    if (fs.existsSync(BACKUP_ZIP_PATH)) {
      try {
        const zStat = fs.statSync(BACKUP_ZIP_PATH);
        zipBackupExists = true;
        zipFileSizeBytes = zStat.size;
        lastZipGenerated = zStat.mtime.toISOString();
      } catch {}
    }

    const backupsList = this.listBackups();

    return {
      engine: 'SQLite 3 & Universal ZIP Engine',
      version: '2.4.3',
      format: '.zip (Tam Baza + Şəkillər) & .sqlite',
      tablesCount: tableBreakdown.length,
      totalRecords,
      fileSizeBytes: fileSizeBytes || liveDbSizeBytes,
      lastGenerated,
      tableBreakdown,
      safetyBackupsCount,
      mediaFilesCount: mediaStats.totalFiles,
      mediaTotalSizeBytes: mediaStats.totalBytes,
      zipBackupExists,
      zipFileSizeBytes,
      lastZipGenerated,
      backupsList
    };
  }

  /**
   * Returns media files count and total size in uploads directory
   */
  public static getMediaStats(): { totalFiles: number; totalBytes: number } {
    const uploadsDir = path.join(ROOT_DIR, 'uploads');
    let totalFiles = 0;
    let totalBytes = 0;

    const scan = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const list = fs.readdirSync(dir);
      for (const item of list) {
        if (item === '.DS_Store' || item === 'temp') continue;
        const p = path.join(dir, item);
        try {
          const stat = fs.statSync(p);
          if (stat.isDirectory()) {
            scan(p);
          } else {
            totalFiles++;
            totalBytes += stat.size;
          }
        } catch {}
      }
    };

    scan(uploadsDir);
    return { totalFiles, totalBytes };
  }

  /**
   * Lists all existing backup files (both ZIP and SQLite)
   */
  public static listBackups(): BackupFileItem[] {
    this.ensureDirs();
    const result: BackupFileItem[] = [];

    // Check BACKUPS_DIR
    if (fs.existsSync(BACKUPS_DIR)) {
      try {
        const files = fs.readdirSync(BACKUPS_DIR);
        for (const f of files) {
          if (f.startsWith('.')) continue;
          const ext = path.extname(f).toLowerCase();
          if (!['.zip', '.sqlite', '.db'].includes(ext)) continue;
          const p = path.join(BACKUPS_DIR, f);
          try {
            const stat = fs.statSync(p);
            result.push({
              filename: f,
              filePath: p,
              sizeBytes: stat.size,
              createdAt: stat.mtime.toISOString(),
              type: ext === '.zip' ? 'zip' : (ext === '.sqlite' ? 'sqlite' : 'db'),
              isSafety: f.startsWith('safety_')
            });
          } catch {}
        }
      } catch {}
    }

    // Check default backup files in DATA_DIR
    if (fs.existsSync(BACKUP_ZIP_PATH)) {
      try {
        const stat = fs.statSync(BACKUP_ZIP_PATH);
        result.push({
          filename: 'azexbuy_full_backup.zip',
          filePath: BACKUP_ZIP_PATH,
          sizeBytes: stat.size,
          createdAt: stat.mtime.toISOString(),
          type: 'zip',
          isSafety: false
        });
      } catch {}
    }
    if (fs.existsSync(BACKUP_SQLITE_PATH)) {
      try {
        const stat = fs.statSync(BACKUP_SQLITE_PATH);
        result.push({
          filename: 'azexbuy_full_backup.sqlite',
          filePath: BACKUP_SQLITE_PATH,
          sizeBytes: stat.size,
          createdAt: stat.mtime.toISOString(),
          type: 'sqlite',
          isSafety: false
        });
      } catch {}
    }

    // Deduplicate by filename and sort newest first
    const seen = new Set<string>();
    const unique = result.filter(item => {
      if (seen.has(item.filename)) return false;
      seen.add(item.filename);
      return true;
    });

    return unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Exports full application state AND all media/images into a complete ZIP archive
   */
  public static exportToZip(targetZipPath?: string): ZipBackupResult {
    this.ensureDirs();
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toISOString().slice(11, 19).replace(/:/g, '-');
    const filename = `azexbuy_full_backup_${dateStr}_${timeStr}.zip`;
    const outZipPath = targetZipPath || path.join(BACKUPS_DIR, filename);

    // 1. Export unified SQLite file
    const tempSqlitePath = path.join(BACKUPS_DIR, `temp_full_${Date.now()}.sqlite`);
    this.exportToSqlite(tempSqlitePath);

    const zip = new AdmZip();

    // 2. Add the unified SQLite DB file
    zip.addLocalFile(tempSqlitePath, '', 'azexbuy_full_backup.sqlite');

    // 3. Add direct copies of active database files if they exist
    const azDbPath = path.join(DATA_DIR, 'azexbuy.db');
    if (fs.existsSync(azDbPath)) {
      try {
        const azDb = new BetterSqlite3(azDbPath, { readonly: true });
        try { azDb.pragma('wal_checkpoint(PASSIVE)'); } catch {}
        azDb.close();
      } catch {}
      zip.addLocalFile(azDbPath, 'data', 'azexbuy.db');
    }

    const octoDbPath = path.join(DATA_DIR, 'octo.db');
    if (fs.existsSync(octoDbPath)) {
      try {
        const octoDb = new BetterSqlite3(octoDbPath, { readonly: true });
        try { octoDb.pragma('wal_checkpoint(PASSIVE)'); } catch {}
        octoDb.close();
      } catch {}
      zip.addLocalFile(octoDbPath, 'data', 'octo.db');
    }

    const storePath = path.join(DATA_DIR, 'store.json');
    if (fs.existsSync(storePath)) {
      zip.addLocalFile(storePath, 'data', 'store.json');
    }

    // 4. Generate structured JSON dump of all tables for transparency
    const jsonDump: Record<string, any[]> = {};
    let totalRows = 0;
    const tableSummaries: TableSummary[] = [];

    if (fs.existsSync(azDbPath)) {
      try {
        const azDb = new BetterSqlite3(azDbPath, { readonly: true });
        const tables = azDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
        for (const t of tables) {
          const rows = azDb.prepare(`SELECT * FROM "${t.name}"`).all();
          jsonDump[t.name] = rows;
          totalRows += rows.length;
          tableSummaries.push({
            name: t.name,
            rows: rows.length,
            label: this.getTableFriendlyLabel(t.name),
            db: 'azexbuy.db'
          });
        }
        azDb.close();
      } catch (e) {
        console.warn('[SqliteBackup] azDb JSON dump warning:', e);
      }
    }

    if (fs.existsSync(octoDbPath)) {
      try {
        const octoDb = new BetterSqlite3(octoDbPath, { readonly: true });
        const tables = octoDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
        for (const t of tables) {
          const rows = octoDb.prepare(`SELECT * FROM "${t.name}"`).all();
          // Mask sensitive passwords in JSON dump
          if (t.name === 'admin_users') {
            jsonDump[t.name] = rows.map((u: any) => ({ ...u, password: '[PROTECTED_HASH]' }));
          } else if (t.name === 'smtp_settings') {
            jsonDump[t.name] = rows.map((s: any) => ({ ...s, password: s.password ? '••••••••' : '' }));
          } else {
            jsonDump[t.name] = rows;
          }
          totalRows += rows.length;
          tableSummaries.push({
            name: t.name,
            rows: rows.length,
            label: this.getTableFriendlyLabel(t.name),
            db: 'octo.db'
          });
        }
        octoDb.close();
      } catch (e) {
        console.warn('[SqliteBackup] octoDb JSON dump warning:', e);
      }
    }

    zip.addFile('data/azexbuy_export.json', Buffer.from(JSON.stringify(jsonDump, null, 2), 'utf-8'));

    // 5. Add all uploaded media files from UPLOADS_DIR
    const uploadsDir = path.join(ROOT_DIR, 'uploads');
    let mediaFilesCount = 0;
    let mediaSizeBytes = 0;
    const mediaFileList: { path: string; size: number }[] = [];

    const addFilesRecursively = (dir: string, zipSubdir: string) => {
      if (!fs.existsSync(dir)) return;
      const list = fs.readdirSync(dir);
      for (const item of list) {
        if (item === '.DS_Store' || item === 'temp') continue;
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addFilesRecursively(fullPath, `${zipSubdir}/${item}`);
        } else {
          zip.addLocalFile(fullPath, zipSubdir, item);
          mediaFilesCount++;
          mediaSizeBytes += stat.size;
          mediaFileList.push({ path: `${zipSubdir}/${item}`, size: stat.size });
        }
      }
    };

    addFilesRecursively(uploadsDir, 'uploads');

    // 6. Add public branding if exists
    const workspaceDir = path.resolve(ROOT_DIR, '..');
    const publicDir = path.join(workspaceDir, 'public');
    if (fs.existsSync(publicDir)) {
      try {
        const pubFiles = fs.readdirSync(publicDir);
        for (const f of pubFiles) {
          if (f.startsWith('logo') || f.startsWith('favicon')) {
            const fullPath = path.join(publicDir, f);
            const stat = fs.statSync(fullPath);
            if (!stat.isDirectory()) {
              zip.addLocalFile(fullPath, 'public_branding', f);
            }
          }
        }
      } catch {}
    }

    // 7. Generate and add manifest.json
    const manifest = {
      app: 'AZEXBUY Enterprise Platform',
      engine: 'AZEXBUY Universal ZIP Backup Engine',
      version: '2.4.3',
      type: 'full_system_zip',
      format: 'ZIP (Databases, CMS Content & Media)',
      exportedAt: new Date().toISOString(),
      database: {
        tablesCount: tableSummaries.length,
        totalRows,
        tables: tableSummaries
      },
      media: {
        totalFiles: mediaFilesCount,
        totalSizeBytes: mediaSizeBytes,
        files: mediaFileList
      }
    };
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));

    // 8. Write ZIP to file
    zip.writeZip(outZipPath);

    // Also update current azexbuy_full_backup.zip link
    try {
      fs.copyFileSync(outZipPath, BACKUP_ZIP_PATH);
    } catch {}

    // Clean temp sqlite
    try {
      if (fs.existsSync(tempSqlitePath)) fs.unlinkSync(tempSqlitePath);
    } catch {}

    const finalStat = fs.statSync(outZipPath);

    return {
      filePath: outZipPath,
      filename,
      sizeBytes: finalStat.size,
      tablesCount: tableSummaries.length,
      totalRows,
      mediaFilesCount,
      mediaSizeBytes,
      exportedAt: manifest.exportedAt
    };
  }

  /**
   * Restores full state (databases, CMS content, and uploaded images) from a ZIP backup archive
   */
  public static restoreFromZip(
    zipFilePath: string,
    activeDbs?: {
      azexbuyDb?: BetterSqlite3.Database;
      mainDb?: BetterSqlite3.Database;
      azRedis?: any;
      azDel?: (key: string) => Promise<void>;
    }
  ): ZipRestoreResult {
    if (!fs.existsSync(zipFilePath)) {
      throw new Error('ZIP backup faylı tapılmadı');
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(zipFilePath);
    } catch (e: any) {
      throw new Error('Etibarsız və ya zədələnmiş ZIP faylı: ' + e.message);
    }

    const entries = zip.getEntries();
    if (entries.length === 0) {
      throw new Error('ZIP arxivi boşdur (heç bir fayl tapılmadı).');
    }

    // 1. Create automated pre-restore safety backup of current state
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const safetyZipFilename = `safety_full_backup_before_restore_${ts}.zip`;
    const safetyZipPath = path.join(BACKUPS_DIR, safetyZipFilename);
    try {
      this.exportToZip(safetyZipPath);
    } catch (e) {
      console.warn('[SqliteBackup] Could not create pre-restore safety zip, creating safety sqlite instead:', e);
      this.createSafetyBackup();
    }

    // Read manifest if available
    let manifest: any = null;
    const manifestEntry = entries.find(e => e.entryName === 'manifest.json');
    if (manifestEntry) {
      try {
        manifest = JSON.parse(manifestEntry.getData().toString('utf-8'));
      } catch {}
    }

    // 2. Restore Databases
    let sqliteEntry = entries.find(e => 
      !e.isDirectory && (
        e.entryName === 'azexbuy_full_backup.sqlite' ||
        e.entryName === 'data/azexbuy_full_backup.sqlite' ||
        e.name.endsWith('.sqlite')
      )
    );

    let restoreSqliteResult: RestoreResult = {
      success: true,
      message: 'OK',
      totalRestoredTables: 0,
      totalRestoredRows: 0,
      restoredTables: [],
      safetyBackupFile: safetyZipFilename,
      backupTimestamp: manifest?.exportedAt || new Date().toISOString()
    };

    if (sqliteEntry) {
      const tempSqliteRestorePath = path.join(BACKUPS_DIR, `temp_restore_${Date.now()}.sqlite`);
      fs.writeFileSync(tempSqliteRestorePath, sqliteEntry.getData());
      try {
        restoreSqliteResult = this.restoreFromSqlite(tempSqliteRestorePath, activeDbs);
      } finally {
        try { if (fs.existsSync(tempSqliteRestorePath)) fs.unlinkSync(tempSqliteRestorePath); } catch {}
      }
    } else {
      // Check if azexbuy.db is present in data/
      const azDbEntry = entries.find(e => !e.isDirectory && (e.entryName === 'data/azexbuy.db' || e.name === 'azexbuy.db'));
      if (azDbEntry) {
        const tempAzPath = path.join(BACKUPS_DIR, `temp_az_${Date.now()}.db`);
        fs.writeFileSync(tempAzPath, azDbEntry.getData());
        try {
          restoreSqliteResult = this.restoreFromSqlite(tempAzPath, activeDbs);
        } finally {
          try { if (fs.existsSync(tempAzPath)) fs.unlinkSync(tempAzPath); } catch {}
        }
      }
    }

    // 3. Restore Media and Uploads
    let restoredMediaCount = 0;
    let restoredMediaBytes = 0;
    const workspaceDir = path.resolve(ROOT_DIR, '..');
    const publicDir = path.join(workspaceDir, 'public');

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const normalized = path.normalize(entry.entryName).replace(/^(\.\.(\/|\\|$))+/, '');

      if (normalized.startsWith('uploads/') || normalized.startsWith('uploads\\')) {
        const destPath = path.join(ROOT_DIR, normalized);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
        restoredMediaCount++;
        restoredMediaBytes += entry.header.size;
      } else if (normalized.startsWith('public_branding/') || normalized.startsWith('public_branding\\')) {
        const fileName = path.basename(normalized);
        const destPath = path.join(publicDir, fileName);
        if (fs.existsSync(publicDir)) {
          fs.writeFileSync(destPath, entry.getData());
        }
      }
    }

    // 4. Invalidate Caches
    if (activeDbs?.azDel) {
      const keys = [
        'azexbuy:localization',
        'azexbuy:content',
        'azexbuy:categories',
        'azexbuy:products',
        'azexbuy:services',
        'azexbuy:team',
        'azexbuy:stats',
        'azexbuy:rfqs',
        'azexbuy:producers'
      ];
      for (const k of keys) {
        try { activeDbs.azDel(k).catch(() => {}); } catch {}
      }
    }

    return {
      success: true,
      message: `Bütün sayt məzmunu (${restoreSqliteResult.totalRestoredTables} cədvəl, ${restoreSqliteResult.totalRestoredRows} sətir) və ${restoredMediaCount} media faylı ZIP arxivindən tam və uğurla bərpa edildi!`,
      totalRestoredTables: restoreSqliteResult.totalRestoredTables,
      totalRestoredRows: restoreSqliteResult.totalRestoredRows,
      totalRestoredMedia: restoredMediaCount,
      restoredMediaBytes,
      restoredTables: restoreSqliteResult.restoredTables,
      safetyBackupFile: safetyZipFilename,
      backupTimestamp: manifest?.exportedAt || restoreSqliteResult.backupTimestamp || new Date().toISOString()
    };
  }

  private static getTableFriendlyLabel(name: string): string {
    const map: Record<string, string> = {
      azexbuy_kv: 'CMS & Məzmun Dəyərləri',
      azexbuy_products: 'Məhsul Kataloqu',
      azexbuy_categories: 'Məhsul Kateqoriyaları',
      azexbuy_articles: 'Bloq & Məqalələr',
      azexbuy_services: 'İxrac Xidmətləri',
      azexbuy_service_applications: 'Xidmət Müraciətləri',
      azexbuy_team_members: 'Komanda Üzvləri',
      azexbuy_contacts: 'Əlaqə Müraciətləri',
      azexbuy_rfqs: 'Alıcı RFQ Sorğuları',
      azexbuy_producers: 'İstehsalçı Qeydiyyatları',
      admin_users: 'İnzibatçı İstifadəçiləri',
      smtp_settings: 'SMTP Poçt Parametrləri',
      ai_settings: 'AI / LLM Parametrləri',
      email_logs: 'E-poçt Göndəriş Tarixçəsi',
      active_session: 'Aktiv İnzibatçı Sessiyası'
    };
    return map[name] || name;
  }
}
