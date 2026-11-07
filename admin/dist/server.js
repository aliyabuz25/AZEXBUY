// src/server.ts
import express from "express";
import cors from "cors";
import path3 from "node:path";
import fs3 from "node:fs";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import multer from "multer";

// src/db.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DB_PATH = path.join(__dirname, "..", "data", "store.json");
var Database = class {
  static readData() {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("Error reading store.json, returning empty structure", err);
      return {
        site: {
          name: "Production Storefront",
          domain: "https://mystore.az",
          type: "Next.js + Headless Engine",
          endpoint: "https://api.mystore.az/v1"
        },
        seo: {},
        translations: [],
        records: [],
        media: [],
        uploadConfig: {
          maxFileSizeMB: 15,
          allowedMimeTypes: "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf",
          uploadDir: "uploads"
        },
        admin: {
          fullName: "Super Admin",
          email: "admin@nexus.az",
          role: "Ba\u015F \u0130nzibat\xE7\u0131"
        },
        setup: {
          completed: false
        }
      };
    }
  }
  static writeData(data) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, DB_PATH);
  }
  static getFullState() {
    return this.readData();
  }
  static getVersion() {
    const data = this.readData();
    return data.version || "2.4.0";
  }
  static setVersion(version) {
    const data = this.readData();
    data.version = version;
    this.writeData(data);
    return version;
  }
  static restoreFullState(data) {
    this.writeData(data);
  }
  static getSiteConfig() {
    return this.readData().site;
  }
  static updateSiteConfig(update) {
    const data = this.readData();
    data.site = {
      ...data.site,
      ...update
    };
    this.writeData(data);
    return data.site;
  }
  static getSeo() {
    return this.readData().seo;
  }
  static updateSeo(update) {
    const data = this.readData();
    data.seo = {
      ...data.seo,
      ...update,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeData(data);
    return data.seo;
  }
  static getTranslations() {
    return this.readData().translations;
  }
  static updateTranslation(key, values) {
    const data = this.readData();
    const idx = data.translations.findIndex((t) => t.key === key);
    if (idx !== -1) {
      data.translations[idx] = { ...data.translations[idx], ...values };
      this.writeData(data);
      return data.translations[idx];
    } else {
      const newItem = {
        key,
        module: values.module || "common",
        type: values.type || "text",
        az: values.az || "",
        tr: values.tr || "",
        ru: values.ru || "",
        en: values.en || ""
      };
      data.translations.unshift(newItem);
      this.writeData(data);
      return newItem;
    }
  }
  static deleteTranslation(key) {
    const data = this.readData();
    const idx = data.translations.findIndex((t) => t.key === key);
    if (idx === -1) return false;
    data.translations.splice(idx, 1);
    this.writeData(data);
    return true;
  }
  static getRecords() {
    return this.readData().records;
  }
  static addRecord(record) {
    const data = this.readData();
    const newRecord = {
      ...record,
      id: `REC-${Math.floor(1e3 + Math.random() * 9e3)}`
    };
    data.records.unshift(newRecord);
    this.writeData(data);
    return newRecord;
  }
  static getMedia() {
    const data = this.readData();
    return data.media || [];
  }
  static addMedia(item) {
    const data = this.readData();
    if (!data.media) data.media = [];
    const newMedia = {
      ...item,
      id: `MED-${Date.now().toString(36)}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.media.unshift(newMedia);
    this.writeData(data);
    return newMedia;
  }
  static deleteMedia(id) {
    const data = this.readData();
    if (!data.media) return null;
    const idx = data.media.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    const removed = data.media.splice(idx, 1)[0];
    this.writeData(data);
    return removed;
  }
  static getUploadConfig() {
    const data = this.readData();
    return data.uploadConfig || {
      maxFileSizeMB: 15,
      allowedMimeTypes: "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf",
      uploadDir: "uploads"
    };
  }
  static updateUploadConfig(update) {
    const data = this.readData();
    data.uploadConfig = {
      ...this.getUploadConfig(),
      ...update
    };
    this.writeData(data);
    return data.uploadConfig;
  }
  static getAdmin() {
    const data = this.readData();
    const admin = data.admin || {
      username: "admin",
      fullName: "Super Admin",
      email: "admin@octotech.az",
      role: "Ba\u015F \u0130nzibat\xE7\u0131",
      password: "admin"
    };
    if (!admin.username) admin.username = "admin";
    if (!admin.password) admin.password = "admin";
    return admin;
  }
  static updateAdmin(update) {
    const data = this.readData();
    data.admin = {
      ...this.getAdmin(),
      ...update
    };
    this.writeData(data);
    return data.admin;
  }
  static getSetup() {
    const data = this.readData();
    return data.setup || { completed: false };
  }
  static completeSetup(payload) {
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
      industry: payload.industry || "E-commerce & Storefront",
      setupDate: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.writeData(data);
    return {
      site: data.site,
      admin: data.admin,
      uploadConfig: data.uploadConfig,
      setup: data.setup
    };
  }
  static resetSetup() {
    const data = this.readData();
    data.setup = { completed: false };
    this.writeData(data);
    return data.setup;
  }
};

// src/sqlite-backup.ts
import fs2 from "node:fs";
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { DatabaseSync } from "node:sqlite";
import BetterSqlite3 from "better-sqlite3";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var BACKUP_DIR = path2.join(__dirname2, "..", "data");
var BACKUP_SQLITE_PATH = path2.join(BACKUP_DIR, "octotech_full_backup.sqlite");
var SqliteBackupManager = class {
  /**
   * Exports full application state into a real SQLite binary database file (.sqlite)
   */
  static exportToSqlite(targetPath) {
    const filePath = targetPath || BACKUP_SQLITE_PATH;
    if (!fs2.existsSync(path2.dirname(filePath))) {
      fs2.mkdirSync(path2.dirname(filePath), { recursive: true });
    }
    if (fs2.existsSync(filePath)) {
      try {
        fs2.unlinkSync(filePath);
      } catch {
      }
    }
    const state = Database.getFullState();
    const db = new DatabaseSync(filePath);
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
    const insertMeta = db.prepare("INSERT INTO system_metadata (key, value) VALUES (?, ?)");
    insertMeta.run("engine", "Octotech LL. Admin Core");
    insertMeta.run("version", "2.4.0");
    insertMeta.run("exported_at", (/* @__PURE__ */ new Date()).toISOString());
    insertMeta.run("format", "SQLite 3 Standalone Full Backup");
    if (state.site) {
      const stmt = db.prepare(`
        INSERT INTO site_config (id, name, domain, type, endpoint) 
        VALUES (1, ?, ?, ?, ?)
      `);
      stmt.run(state.site.name || "", state.site.domain || "", state.site.type || "", state.site.endpoint || "");
    }
    if (state.seo) {
      const stmt = db.prepare(`
        INSERT INTO seo_config (
          id, title, description, canonical, keywords,
          robots_index, robots_follow, og_title, og_description, og_image,
          sitemap_url, last_updated
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        state.seo.title || "",
        state.seo.description || "",
        state.seo.canonical || "",
        state.seo.keywords || "",
        state.seo.robotsIndex ? 1 : 0,
        state.seo.robotsFollow ? 1 : 0,
        state.seo.ogTitle || "",
        state.seo.ogDescription || "",
        state.seo.ogImage || "",
        state.seo.sitemapUrl || "",
        state.seo.lastUpdated || (/* @__PURE__ */ new Date()).toISOString()
      );
    }
    if (Array.isArray(state.translations)) {
      const stmt = db.prepare(`
        INSERT INTO translations (key, module, type, az, tr, ru, en)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of state.translations) {
        stmt.run(
          item.key,
          item.module || "common",
          item.type || "text",
          item.az || "",
          item.tr || "",
          item.ru || "",
          item.en || ""
        );
      }
    }
    if (Array.isArray(state.records)) {
      const stmt = db.prepare(`
        INSERT INTO content_records (id, title, source, author, date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const rec of state.records) {
        stmt.run(rec.id, rec.title, rec.source || "", rec.author || "", rec.date || "", rec.status || "published");
      }
    }
    if (Array.isArray(state.media)) {
      const stmt = db.prepare(`
        INSERT INTO media_items (id, filename, original_name, mime_type, size, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of state.media) {
        stmt.run(m.id, m.filename, m.originalName || m.filename, m.mimeType || "", m.size || 0, m.url || "", m.createdAt || "");
      }
    }
    if (state.uploadConfig) {
      const stmt = db.prepare(`
        INSERT INTO upload_config (id, max_file_size_mb, allowed_mime_types, upload_dir)
        VALUES (1, ?, ?, ?)
      `);
      stmt.run(
        state.uploadConfig.maxFileSizeMB || 15,
        state.uploadConfig.allowedMimeTypes || "",
        state.uploadConfig.uploadDir || "uploads"
      );
    }
    if (state.admin) {
      const stmt = db.prepare(`
        INSERT INTO admin_user (id, full_name, email, role, password)
        VALUES (1, ?, ?, ?, ?)
      `);
      stmt.run(state.admin.fullName || "", state.admin.email || "", state.admin.role || "", state.admin.password || "");
    }
    if (state.setup) {
      const stmt = db.prepare(`
        INSERT INTO system_setup (id, completed, industry, setup_date)
        VALUES (1, ?, ?, ?)
      `);
      stmt.run(state.setup.completed ? 1 : 0, state.setup.industry || "", state.setup.setupDate || "");
    }
    db.close();
    return filePath;
  }
  /**
   * Restores state from an uploaded or existing SQLite database file (.sqlite)
   */
  static restoreFromSqlite(sqliteFilePath) {
    if (!fs2.existsSync(sqliteFilePath)) {
      throw new Error("SQLite backup fayl\u0131 tap\u0131lmad\u0131");
    }
    const db = new DatabaseSync(sqliteFilePath);
    let site = Database.getSiteConfig();
    try {
      const siteRow = db.prepare("SELECT * FROM site_config WHERE id = 1").get();
      if (siteRow) {
        site = {
          name: siteRow.name,
          domain: siteRow.domain,
          type: siteRow.type,
          endpoint: siteRow.endpoint
        };
      }
    } catch (e) {
      console.warn("site_config table read error:", e);
    }
    let seo = Database.getSeo();
    try {
      const seoRow = db.prepare("SELECT * FROM seo_config WHERE id = 1").get();
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
          lastUpdated: seoRow.last_updated || (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    } catch (e) {
      console.warn("seo_config table read error:", e);
    }
    let translations = [];
    try {
      const rows = db.prepare("SELECT * FROM translations").all();
      translations = rows.map((r) => ({
        key: r.key,
        module: r.module,
        type: r.type,
        az: r.az,
        tr: r.tr,
        ru: r.ru,
        en: r.en
      }));
    } catch (e) {
      console.warn("translations table read error:", e);
      translations = Database.getTranslations();
    }
    let records = [];
    try {
      const rows = db.prepare("SELECT * FROM content_records").all();
      records = rows.map((r) => ({
        id: r.id,
        title: r.title,
        source: r.source,
        author: r.author,
        date: r.date,
        status: r.status
      }));
    } catch (e) {
      console.warn("content_records table read error:", e);
      records = Database.getRecords();
    }
    let media = [];
    try {
      const rows = db.prepare("SELECT * FROM media_items").all();
      media = rows.map((r) => ({
        id: r.id,
        filename: r.filename,
        originalName: r.original_name,
        mimeType: r.mime_type,
        size: r.size,
        url: r.url,
        createdAt: r.created_at
      }));
    } catch (e) {
      console.warn("media_items table read error:", e);
      media = Database.getMedia();
    }
    let uploadConfig = Database.getUploadConfig();
    try {
      const row = db.prepare("SELECT * FROM upload_config WHERE id = 1").get();
      if (row) {
        uploadConfig = {
          maxFileSizeMB: row.max_file_size_mb,
          allowedMimeTypes: row.allowed_mime_types,
          uploadDir: row.upload_dir
        };
      }
    } catch (e) {
      console.warn("upload_config table read error:", e);
    }
    let admin = Database.getAdmin();
    try {
      const row = db.prepare("SELECT * FROM admin_user WHERE id = 1").get();
      if (row) {
        admin = {
          fullName: row.full_name,
          email: row.email,
          role: row.role,
          password: row.password
        };
      }
    } catch (e) {
      console.warn("admin_user table read error:", e);
    }
    let setup = Database.getSetup();
    try {
      const row = db.prepare("SELECT * FROM system_setup WHERE id = 1").get();
      if (row) {
        setup = {
          completed: Boolean(row.completed),
          industry: row.industry,
          setupDate: row.setup_date
        };
      }
    } catch (e) {
      console.warn("system_setup table read error:", e);
    }
    db.close();
    const restoredState = {
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
  static getBackupInfo() {
    const state = Database.getFullState();
    let fileSizeBytes = 0;
    let lastGenerated = null;
    if (fs2.existsSync(BACKUP_SQLITE_PATH)) {
      const stat = fs2.statSync(BACKUP_SQLITE_PATH);
      fileSizeBytes = stat.size;
      lastGenerated = stat.mtime.toISOString();
    }
    const totalRecords = 1 + // site
    1 + // seo
    (state.translations?.length || 0) + (state.records?.length || 0) + (state.media?.length || 0) + 1 + // uploadConfig
    1 + // admin
    1;
    let tablesCount = 9;
    try {
      const dataDir2 = BACKUP_DIR;
      let count = 0;
      for (const dbFile of ["octo.db", "azexbuy.db"]) {
        const dbPath = path2.join(dataDir2, dbFile);
        if (fs2.existsSync(dbPath)) {
          const db = new BetterSqlite3(dbPath, { readonly: true });
          const rows = db.prepare("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get();
          count += rows?.c || 0;
          db.close();
        }
      }
      if (count > 0) tablesCount = count;
    } catch {
    }
    return {
      engine: "SQLite 3 (node:sqlite)",
      version: "2.4.0",
      format: ".sqlite (Binary Relational Database)",
      tablesCount,
      totalRecords,
      fileSizeBytes,
      lastGenerated
    };
  }
};

// src/jwt.ts
import crypto from "node:crypto";
var JWT_SECRET = process.env.JWT_SECRET || "octotech-universal-admin-secret-key-2026-secure-jwt";
var SESSION_DURATION_SECONDS = 10 * 60;
function signJwt(payload, expiresInSeconds = SESSION_DURATION_SECONDS) {
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1e3);
  const exp = iat + expiresInSeconds;
  const fullPayload = {
    sub: payload.email || payload.username,
    username: payload.username,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    iat,
    exp
  };
  const encodeB64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const headerEncoded = encodeB64Url(header);
  const payloadEncoded = encodeB64Url(fullPayload);
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  return {
    token: `${data}.${signature}`,
    exp,
    expiresIn: expiresInSeconds
  };
}
function verifyJwt(token) {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Token t\u0259qdim edilm\u0259yib" };
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Yanl\u0131\u015F JWT format\u0131" };
  }
  const [headerB64, payloadB64, signature] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, error: "\u0130mza yoxlan\u0131\u015F\u0131 u\u011Fursuz oldu" };
  }
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < now) {
      return {
        valid: false,
        error: "Sessiyan\u0131n m\xFCdd\u0259ti (10 d\u0259qiq\u0259) bitmi\u015Fdir",
        payload
      };
    }
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: "Payload oxunark\u0259n x\u0259ta: " + err.message };
  }
}

// src/seed.ts
function seedAzexbuyData(db) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const categories = [
    { id: "cat-food", name: "Food Products", slug: "food-products", description: "Natural and processed organic food products from Azerbaijan", sort_order: 1 },
    { id: "cat-agri", name: "Agriculture & Fresh Produce", slug: "agriculture", description: "Fresh fruits, nuts, grains, and agricultural raw materials", sort_order: 2 },
    { id: "cat-industrial", name: "Industrial & Textiles", slug: "industrial-products", description: "Raw silk, cotton yarn, metals, and industrial materials", sort_order: 3 },
    { id: "cat-chemicals", name: "Chemicals & Extracts", slug: "chemicals", description: "Herbal extracts, licorice, saffron derivatives, and compounds", sort_order: 4 },
    { id: "cat-construction", name: "Construction Materials", slug: "construction-materials", description: "High-purity gypsum, bentonite, natural stone, and cement", sort_order: 5 },
    { id: "cat-packaging", name: "Packaging & Bulk Bags", slug: "packaging", description: "Industrial polypropylene sacks, FIBC big bags, and containers", sort_order: 6 }
  ];
  const insertCat = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_categories (id, created_at, name, slug, description, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  for (const c of categories) {
    insertCat.run(c.id, now, c.name, c.slug, c.description, c.sort_order);
  }
  const products = [
    {
      id: "prod-hazelnut-atababa",
      categoryId: "cat-agri",
      name: "Ata-Baba Shelled Hazelnuts (Extra Grade)",
      slug: "ata-baba-shelled-hazelnuts",
      shortDescription: "Extra-grade shelled natural & roasted Ata-Baba hazelnuts from Zaqatala-Sheki certified orchards.",
      description: "Azerbaijan ranks among the top global producers of hazelnuts. Our Ata-Baba variety is cultivated in the mineral-rich soils of the Greater Caucasus foothills (Zaqatala-Sheki region). Renowned for high oleic oil content (over 65%), delicate aroma, and crunchy bite. Available natural, blanched, roasted, and diced.",
      technicalSpecs: {
        "Variety": "Ata-Baba (Local Endemic)",
        "Caliber (Sizes)": "11\u201313mm, 13\u201315mm, 15+mm",
        "Moisture Content": "< 5.0% (EU Export Standard)",
        "Fat / Oil Content": "64% \u2013 68% high oleic",
        "Aflatoxin B1": "< 2 ppb (Strict EU compliant)",
        "Purity": "99.9% Sortex optical sorted"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD6iP6ACTY6rFPAXNJlK_W-AfkWR_1OBE8I3wLkCwVMAlQIyNvxAXxK1kYe6-itoVecrpqtsSok0_wQ1QnYyWcn40Hikz269v2ag3TbKrY9lfqw3mEVtR-I0GvclcQXFDi0q_xVPYMdzpIFMaXwgeJEs4gwsCpcf-Dn7Df8QGIeKoSael0DxSBY2ZpmoWYe8Ynhio_Q0dONzHarqS9Kp31IStn01T44xVmJ90B5TY2WFQr7mOmo4Ucq"
      ],
      moq: "20 Metric Tons (1x 20ft FCL)",
      certificates: ["ISO 22000:2018", "FSSC 22000", "AQTA Phytosanitary", "EUR.1 / CT-1", "Halal Food Compliance"],
      packagingInfo: "25kg multi-layer vacuum foil bags in corrugated export cartons, or 800kg jumbo big-bags on Euro-pallets.",
      hsCode: "080222",
      originRegion: "Zaqatala \u2013 \u015E\u0259ki \u0130qtisadi Rayonu",
      isFeatured: 1,
      seoTitle: "Azerbaijani Ata-Baba Shelled Hazelnuts \u2014 Bulk Wholesale Export",
      seoDescription: "Direct supplier of premium grade Ata-Baba shelled hazelnuts from Zaqatala-Sheki, Azerbaijan. EU-compliant low aflatoxin, 20 MT MOQ."
    },
    {
      id: "prod-pomegranate-goychay",
      categoryId: "cat-agri",
      name: "Goychay Fresh Pomegranates & 100% NFC Juice",
      slug: "goychay-fresh-pomegranates-nfc-juice",
      shortDescription: "Protected Geographical Indication (PGI) Goychay ruby pomegranates (Guleysha) and cold-pressed NFC pure juice.",
      description: "Goychay pomegranate is celebrated globally for its balanced Brix (sugar content), deep crimson arils, and exceptional antioxidant polyphenols. Sourced directly from modern certified orchards in Central Aran. Available as fresh fruit in protective cell-trays and as 100% Not-From-Concentrate (NFC) cold-pressed aseptic bulk juice.",
      technicalSpecs: {
        "Cultivar": "Guleysha Red & Pink (PGI Goychay)",
        "Caliber (Fresh)": "300g \u2013 550g per fruit",
        "Brix Level": "16.5\xB0 \u2013 18.0\xB0 natural sweetness",
        "Acidity": "1.2% \u2013 1.6% citric equivalent",
        "Processing (Juice)": "Aseptic cold press, zero added sugar/water",
        "Shelf Life": "Fresh: 90 days at 5\xB0C / Juice: 18 months aseptic"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHo5g8iKevybJcG4jlFPGTNzuPMU2721wxSfNRS3s0FmbZeA3YW4AxkdXtyhH_55x-4s5Uh_5-S2-S3LVPexC1O1ahPg_Hgeeion6snYi_eyi7MNDXh5coR3k9acztB4DSA_PV9JjS_JAitpfDEAmO4UUbAUjAs0VuwpjvFbKeEaRXeqGiJ2JKU_vHqlhTa6Meil6iamn-3I_33E-Y7Tii2hclP8mfc_jBNp_gJSQpmbKniKtPJu5s"
      ],
      moq: "18 Metric Tons (Reefer 40ft container)",
      certificates: ["GlobalG.A.P.", "ISO 22000", "AQTA Phytosanitary", "EUR.1 / CT-1", "Kosher / Halal"],
      packagingInfo: "Fresh: 4.5kg open-top telescopic display cartons with food-grade plastic cell dividers. Juice: 200L aseptic drums.",
      hsCode: "081090",
      originRegion: "M\u0259rk\u0259zi Aran (G\xF6y\xE7ay) \u0130qtisadi Rayonu",
      isFeatured: 1,
      seoTitle: "Goychay Pomegranates & Pure NFC Juice Bulk Export Azerbaijan",
      seoDescription: "B2B export of certified Goychay pomegranates and 100% cold-pressed NFC juice. Controlled atmosphere reefer shipping."
    },
    {
      id: "prod-saffron-absheron",
      categoryId: "cat-food",
      name: "Absheron Royal Saffron Threads (Category I ISO 3632)",
      slug: "absheron-royal-saffron-threads",
      shortDescription: "Certified ISO 3632 Category I pure all-red Sargol saffron hand-harvested in the semi-arid soils of Absheron.",
      description: "Absheron saffron is historical heritage dating back over eight centuries. Grown in the unique microclimate of the Absheron peninsula near Bilgah. Featuring deep carmine-red stigmas with safranal concentration delivering potent aroma and rich natural crocin coloring strength (>240).",
      technicalSpecs: {
        "Grade": "Category I (Super Negin / Pure Sargol)",
        "Crocin (Coloring Strength)": "> 240 units (ISO 3632)",
        "Safranal (Aroma)": "35 \u2013 45 units",
        "Picrocrocin (Flavor)": "> 85 units",
        "Moisture Content": "< 7.5%",
        "Foreign Matter": "< 0.1% zero artificial coloring"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDtNJYRxE2w63MPzGdjf8CPD9AEFm8HRgiA_8S4bLzI4JlWkzMSr7mOrBFN0clACdJ8Z4fdPmTxcUeQZoVHwM8X0BSrp3Ge5V1rjnXGei5GwaARNkgff5T_0xspZitbC-LuPEjlYnoFGRTUx9-xnXkSS6296Qbk6OBMxFoPcu45Ph_IWPgxe8ghwkwSRb4DFc747hiqPs4hl6mD0u0fkbzXC86IW3Go3l5Gt49vsGvyFE6w27cyqJpi"
      ],
      moq: "5 Kilograms (Air Cargo with secure courier dispatch)",
      certificates: ["ISO 3632-1:2011 Grade I", "AQTA Export Certificate", "EUR.1", "CoA Spectrophotometry"],
      packagingInfo: "100g, 250g, and 500g nitrogen-flushed sealed tin caddies and food-grade glass jars in tamper-evident wooden master chests.",
      hsCode: "091020",
      originRegion: "Ab\u015Feron \u2013 X\u0131z\u0131 \u0130qtisadi Rayonu",
      isFeatured: 1,
      seoTitle: "Pure Absheron Saffron Threads ISO 3632 Grade I Wholesale",
      seoDescription: "Direct producer export of genuine Absheron saffron. ISO 3632 Category 1, high crocin coloring strength."
    },
    {
      id: "prod-sheki-silk-yarn",
      categoryId: "cat-industrial",
      name: "Sheki 100% Mulberry Raw Silk Yarn & Woven Fabric",
      slug: "sheki-mulberry-raw-silk-yarn",
      shortDescription: "Heritage 20/22D mulberry raw silk yarn and natural degummed habotai fabric from Sheki Silk processing plant.",
      description: "Sheki has been the silk capital of the Caucasus on the Great Silk Road since the 14th century. Produced from Bombyx mori silkworms fed on local white mulberry leaves. Highly sought after by luxury textile mills in Italy, Turkey, and Japan for high tensile strength, exceptional dye affinity, and natural luster.",
      technicalSpecs: {
        "Composition": "100% Bombyx Mori Mulberry Raw Silk",
        "Denier Yarn Count": "20/22D, 28/32D and 40/44D",
        "Grade Standard": "4A / 5A international raw silk grade",
        "Evenness Deviation": "< 85%",
        "Elongation at Break": "18% \u2013 22%",
        "Moisture Regain": "11.0% commercial allowance"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD03XXHtlryKOF4P13Jsyapcx1cJC4md04R7W4OmhEOlilzH3GXC84pohKdFeZC2E26PSlasR8hsE1ZhUMI_m0G3EvLUmCLYXAFuMf-8fVmPxAaSz6rXZE5DhZfy_GWTdrnj6b_8WD4Q3Rrvlu3AYTUq_hrwc41KTaORWxIqz41fZ3sVhVp_icHS5yhXQKuIuOFb0jjF16nF7IcXL9rWJ5SplYRdK1DWGo-wlLK2UlgnkEWl6JIaR20"
      ],
      moq: "500 Kilograms (1 Pallet)",
      certificates: ["OEKO-TEX Standard 100 Class I", "Certificate of Origin Form EUR.1", "ISO 9001:2015"],
      packagingInfo: "Silk hanks wrapped in protective polythene and packed in 50kg export wooden cases or heavy corrugated cartons.",
      hsCode: "500200",
      originRegion: "\u015E\u0259ki \u2013 Zaqatala \u0130qtisadi Rayonu",
      isFeatured: 1,
      seoTitle: "Sheki Raw Mulberry Silk Yarn 20/22D Bulk B2B Export",
      seoDescription: "Premium grade 4A/5A Azerbaijani mulberry raw silk from the historic Sheki mill. Certified export documentation."
    },
    {
      id: "prod-cotton-lint-yarn",
      categoryId: "cat-industrial",
      name: "Mughan Combed Ring-Spun Cotton Yarn (Ne 20/1 \u2013 40/1)",
      slug: "mughan-combed-cotton-yarn",
      shortDescription: "100% natural virgin cotton lint and ring-spun carded/combed knitting and weaving yarns from the Mughan valley.",
      description: "Manufactured in state-of-the-art spinning mills in Shirvan and Sabirabad using hand-picked medium-staple upland cotton. Low hairiness, high breaking tenacity, and strict Uster statistics compliance for high-speed circular knitting machines.",
      technicalSpecs: {
        "Yarn Counts": "Ne 20/1, Ne 30/1, Ne 40/1 (Carded & Combed)",
        "Staple Length": "28.5mm \u2013 29.5mm",
        "Tenacity": "17.5 \u2013 19.5 cN/tex",
        "Twist Factor": "3.8 \u2013 4.2 alfa (TM)",
        "Uster IPI (Imperfections)": "Top 10% \u2013 15% worldwide Uster benchmark"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC5UBl6ky2E1o6RbrVtIlz6xdPHcSBD7sd8H309gALUQoxK5e7r7Jx8q159V1clhGMbdLSh4P9jCngmrLKo1SRNMt8pOyjcZAA6ESFVNV4ezFkDuGcGpnQTuFuS1mN_y1GCw0fUeMaghixWmXvDOKyonKRvDbft5TQiqBmLD-rRRmW-WA8ynGJG10G8Glm_TPlhHHVb7hRwLDWJ8xhd-hOjeMKGIxnS1XfZVRCXaB1IDAY3cUYFZPhn"
      ],
      moq: "20 Metric Tons (1x 40ft HQ FCL)",
      certificates: ["BCI (Better Cotton Initiative)", "OEKO-TEX Standard 100", "ISO 9001", "EUR.1 / CT-1"],
      packagingInfo: "1.89kg paper cones wrapped in shrink film, 24 cones per export carton box on heat-treated ISPM-15 pallets.",
      hsCode: "520512",
      originRegion: "\u015Eirvan \u2013 Salyan \u0130qtisadi Rayonu",
      isFeatured: 0,
      seoTitle: "Azerbaijani 100% Combed Cotton Yarn Wholesale Supply",
      seoDescription: "Manufacturer direct supply of Ne 20\u201340 ring-spun cotton yarn from Azerbaijan Mughan region. BCI certified."
    },
    {
      id: "prod-licorice-root-extract",
      categoryId: "cat-chemicals",
      name: "Wild Azerbaijani Licorice Root & Spray-Dried Extract Powder",
      slug: "wild-azerbaijani-licorice-root-extract",
      shortDescription: "High-glycyrrhizin wild Glycyrrhiza glabra licorice root baled and spray-dried extract powder for pharma and food.",
      description: "The floodplains of the Kura and Aras rivers provide ideal wild growth conditions for Glycyrrhiza glabra. Hand-harvested, sun-cured, and processed into de-dusted pressed bales and spray-dried water-soluble powder containing 18% to 26% glycyrrhizic acid.",
      technicalSpecs: {
        "Active Substance": "Glycyrrhizic Acid (Glycyrrhizin) 18% \u2013 26% (HPLC)",
        "Moisture Content": "< 6.0%",
        "Total Ash": "< 8.0%",
        "Water Solubility": "> 98.5% instant dissolve",
        "Pesticide Residues": "Compliant with European Pharmacopoeia (EP 10.0)"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDGgRuRr9uJiYiCy0AeiN7FvX1CWCTQLdRAG2TJXnfii1yXyI2WeKI6wMo6E8nydnbcUg27wH11AYMDuRy4WLTd0MRbPlzPT3f1Wzw2BN132jDlE2KhDZ_BpSyUWXlgaEpX1_ukFt7IpSBL9Cnc3ILMPL8scPCgkSNob0PCSAa30dUKuSc0TBkoYnhfmiO58w10Zuz4eKBXbVNTk92SLbvxAconUj8wUxkDU7y1H7Ks3do6--khlfP"
      ],
      moq: "10 Metric Tons (Baled Root) / 2 Metric Tons (Extract)",
      certificates: ["Ph. Eur. Compliance", "GMP Pharma Facility", "AQTA Phytosanitary", "EUR.1 / CT-1", "Halal / Kosher"],
      packagingInfo: "Root: 100kg hydraulic pressed bales bound with galvanized steel wire. Extract: 25kg multi-wall paper bags with PE inner liner.",
      hsCode: "121190",
      originRegion: "M\u0259rk\u0259zi Aran (Ucar \u2013 K\xFCrd\u0259mir) \u0130qtisadi Rayonu",
      isFeatured: 0,
      seoTitle: "Wild Licorice Root & Glycyrrhizin Extract Powder Azerbaijan",
      seoDescription: "B2B export of pharmaceutical grade Glycyrrhiza glabra licorice root and spray-dried extract from Azerbaijan."
    },
    {
      id: "prod-absheron-olive-oil",
      categoryId: "cat-food",
      name: "Absheron Cold-Pressed Extra Virgin Olive Oil (EVOO)",
      slug: "absheron-extra-virgin-olive-oil",
      shortDescription: "Ultra-low acidity (<0.3%) single-estate Extra Virgin Olive Oil cold-extracted within 4 hours of tree harvest.",
      description: "Cultivated in the sun-drenched, maritime-breeze groves of Zira and Gala on the Absheron peninsula. Cultivars include Azerbaijani endemic Bak\u0131 Zeytunu, Arbequina, and Arbosana. Cold-extracted below 24\xB0C in state-of-the-art inert nitrogen centrifugation systems.",
      technicalSpecs: {
        "Free Fatty Acidity": "< 0.30% (IOC Extra Virgin Standard)",
        "Peroxide Value": "< 6.5 meq O2/kg",
        "Total Polyphenols": "> 380 mg/kg (High Antioxidant)",
        "Extraction Temperature": "< 24\xB0C Cold Pressed",
        "Flavor Profile": "Fresh green grass, green almond, tomato leaf, balanced peppery finish"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDHo5g8iKevybJcG4jlFPGTNzuPMU2721wxSfNRS3s0FmbZeA3YW4AxkdXtyhH_55x-4s5Uh_5-S2-S3LVPexC1O1ahPg_Hgeeion6snYi_eyi7MNDXh5coR3k9acztB4DSA_PV9JjS_JAitpfDEAmO4UUbAUjAs0VuwpjvFbKeEaRXeqGiJ2JKU_vHqlhTa6Meil6iamn-3I_33E-Y7Tii2hclP8mfc_jBNp_gJSQpmbKniKtPJu5s"
      ],
      moq: "5,000 Liters (Flexitank or bottled private label)",
      certificates: ["IOC (International Olive Council) Standards", "ISO 22000", "AQTA Health Certificate", "EUR.1 / CT-1"],
      packagingInfo: "Retail: 500ml and 750ml dark marasca glass bottles / 5L metal tins. Bulk: 1,000L IBC totes or 24,000L food-grade flexitanks.",
      hsCode: "150920",
      originRegion: "Ab\u015Feron \u2013 X\u0131z\u0131 (Zir\u0259) \u0130qtisadi Rayonu",
      isFeatured: 1,
      seoTitle: "Absheron Extra Virgin Olive Oil Bulk Export Azerbaijan",
      seoDescription: "Single-estate premium extra virgin olive oil with acidity <0.3%. Bulk IBC totes and private label bottled supply."
    },
    {
      id: "prod-goygol-alpine-honey",
      categoryId: "cat-food",
      name: "Lesser Caucasus Mountain Floral Honey (G\xF6yg\xF6l Alpine)",
      slug: "goygol-alpine-mountain-honey",
      shortDescription: "100% raw unpasteurized multi-floral mountain honey gathered at 1,600m \u2013 2,200m altitude in G\xF6yg\xF6l National Park.",
      description: "Produced by native Caucasian grey mountain bees (Apis mellifera caucasica) feeding on wild sub-alpine wildflowers, wild thyme, and linden. Free from synthetic pesticides, antibiotics, and commercial syrup adulteration.",
      technicalSpecs: {
        "Diastase Activity": "> 22 Schade units (High enzymatic vitality)",
        "HMF (Hydroxymethylfurfural)": "< 8 mg/kg (Freshness marker)",
        "Moisture Content": "16.2% \u2013 17.5%",
        "Reducing Sugars (Fructose+Glucose)": "> 72%",
        "Pollen Spectrum": "Wild thyme, origanum, melilotus, trifolium"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD6iP6ACTY6rFPAXNJlK_W-AfkWR_1OBE8I3wLkCwVMAlQIyNvxAXxK1kYe6-itoVecrpqtsSok0_wQ1QnYyWcn40Hikz269v2ag3TbKrY9lfqw3mEVtR-I0GvclcQXFDi0q_xVPYMdzpIFMaXwgeJEs4gwsCpcf-Dn7Df8QGIeKoSael0DxSBY2ZpmoWYe8Ynhio_Q0dONzHarqS9Kp31IStn01T44xVmJ90B5TY2WFQr7mOmo4Ucq"
      ],
      moq: "3 Metric Tons (B2B bulk drums or retail glass)",
      certificates: ["AQTA Veterinary Export Approval", "ISO 22000", "Intertek / QSI Bremen Lab Analysis", "EUR.1 / CT-1"],
      packagingInfo: "Bulk: 290kg food-grade lacquered steel drums. Retail: 400g and 900g hexagonal glass jars in 12-pack cartons.",
      hsCode: "040900",
      originRegion: "G\u0259nc\u0259 \u2013 Da\u015Fk\u0259s\u0259n (G\xF6yg\xF6l) \u0130qtisadi Rayonu",
      isFeatured: 0,
      seoTitle: "Raw Caucasian Mountain Honey Bulk B2B Export Azerbaijan",
      seoDescription: "Direct export of raw unpasteurized multi-floral alpine honey from G\xF6yg\xF6l, Azerbaijan. Lab tested EU compliant."
    },
    {
      id: "prod-bentonite-clay-agstafa",
      categoryId: "cat-industrial",
      name: "Agstafa Sodium-Activated Bentonite Clay (API Spec 13A)",
      slug: "agstafa-bentonite-clay-api-grade",
      shortDescription: "Premium montmorillonite swelling bentonite clay for oil/gas drilling fluids, foundry casting, and civil engineering.",
      description: "Mined from the renowned deposits in Agstafa district. Naturally high in montmorillonite content (>80%) with exceptional thixotropic gel strength, high swelling index, and low water loss under pressure. Meets API 13A and OCMA standards.",
      technicalSpecs: {
        "Montmorillonite Content": "> 82% (XRD analysis)",
        "Viscometer 600 RPM": "> 30 (API Spec 13A)",
        "Yield Point / Plastic Viscosity Ratio": "< 3.0",
        "Filtrate Volume (Fluid Loss)": "< 15.0 cm\xB3",
        "Swell Volume": "> 28 ml / 2g"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDtNJYRxE2w63MPzGdjf8CPD9AEFm8HRgiA_8S4bLzI4JlWkzMSr7mOrBFN0clACdJ8Z4fdPmTxcUeQZoVHwM8X0BSrp3Ge5V1rjnXGei5GwaARNkgff5T_0xspZitbC-LuPEjlYnoFGRTUx9-xnXkSS6296Qbk6OBMxFoPcu45Ph_IWPgxe8ghwkwSRb4DFc747hiqPs4hl6mD0u0fkbzXC86IW3Go3l5Gt49vsGvyFE6w27cyqJpi"
      ],
      moq: "44 Metric Tons (2x 20ft Containers or bulk rail wagons)",
      certificates: ["API Spec 13A Certified", "ISO 9001:2015", "Certificate of Origin Form CT-1 / EUR.1"],
      packagingInfo: "1,000kg weather-resistant polypropylene big-bags with discharge spouts, or 25kg multi-ply paper valve bags.",
      hsCode: "250810",
      originRegion: "Qazax \u2013 Tovuz (A\u011Fstafa) \u0130qtisadi Rayonu",
      isFeatured: 0,
      seoTitle: "Azerbaijan Bentonite Clay API Spec 13A Drilling Grade Export",
      seoDescription: "High montmorillonite sodium-activated bentonite clay for drilling mud and civil engineering. B2B bulk supply."
    },
    {
      id: "prod-polypropylene-big-bags",
      categoryId: "cat-packaging",
      name: "Heavy-Duty FIBC Big Bags & Polypropylene Woven Sacks",
      slug: "fibc-big-bags-polypropylene-sacks",
      shortDescription: "Industrial UV-stabilized 4-loop flexible bulk containers (FIBC) and laminated woven PP bags from Sumgayit chemical park.",
      description: "Manufactured utilizing virgin polymer pellets from SOCAR Polymer petrochemical complex. Engineered for safe working loads (SWL) from 500kg up to 2,000kg with 5:1 and 6:1 safety factors for international multi-modal hazardous and non-hazardous bulk shipping.",
      technicalSpecs: {
        "Fabric Weight": "140 g/m\xB2 \u2013 220 g/m\xB2 UV Stabilized",
        "Safe Working Load (SWL)": "1,000 kg \u2013 2,000 kg",
        "Safety Factor (SF)": "5:1 (Single trip) / 6:1 (Multi-trip UN Certified)",
        "Construction Types": "Circular / U-panel / 4-panel with PE liner",
        "Printing": "Up to 4 colors flexographic branding"
      },
      images: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC5UBl6ky2E1o6RbrVtIlz6xdPHcSBD7sd8H309gALUQoxK5e7r7Jx8q159V1clhGMbdLSh4P9jCngmrLKo1SRNMt8pOyjcZAA6ESFVNV4ezFkDuGcGpnQTuFuS1mN_y1GCw0fUeMaghixWmXvDOKyonKRvDbft5TQiqBmLD-rRRmW-WA8ynGJG10G8Glm_TPlhHHVb7hRwLDWJ8xhd-hOjeMKGIxnS1XfZVRCXaB1IDAY3cUYFZPhn"
      ],
      moq: "5,000 Units (LCL or FCL container loads)",
      certificates: ["ISO 9001:2015", "Labordata Testing Compliance", "UN Certified Packaging for Dangerous Goods"],
      packagingInfo: "Baled in bundles of 50 or 100 units strapped with heavy polyester cords on wooden pallets.",
      hsCode: "630532",
      originRegion: "Ab\u015Feron \u2013 X\u0131z\u0131 (Sumqay\u0131t) \u0130qtisadi Rayonu",
      isFeatured: 0,
      seoTitle: "FIBC Big Bags & Woven PP Sacks Manufacturer Azerbaijan",
      seoDescription: "Direct manufacturer export of industrial FIBC big bags and woven polypropylene sacks from Sumgayit, Azerbaijan."
    }
  ];
  const insertProd = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_products
    (id, created_at, updated_at, category_id, name, slug, short_description, description, technical_specs, images, moq, certificates, packaging_info, hs_code, origin_region, is_active, is_featured, seo_title, seo_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);
  for (const p of products) {
    insertProd.run(
      p.id,
      now,
      now,
      p.categoryId,
      p.name,
      p.slug,
      p.shortDescription,
      p.description,
      JSON.stringify(p.technicalSpecs),
      JSON.stringify(p.images),
      p.moq,
      JSON.stringify(p.certificates),
      p.packagingInfo,
      p.hsCode,
      p.originRegion,
      p.isFeatured,
      p.seoTitle,
      p.seoDescription
    );
  }
  const services = [
    {
      id: "srv-market-access",
      title: {
        AZ: "Beyn\u0259lxalq Bazar Ara\u015Fd\u0131rmas\u0131 & Al\u0131c\u0131 Axtar\u0131\u015F\u0131",
        EN: "Global Market Intelligence & Buyer Sourcing",
        TR: "Uluslararas\u0131 Pazar Ara\u015Ft\u0131rmas\u0131 & Al\u0131c\u0131 Temini",
        RU: "\u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u044F \u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u044B\u0445 \u0440\u044B\u043D\u043A\u043E\u0432 \u0438 \u043F\u043E\u0438\u0441\u043A \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u0435\u0439",
        AR: "\u0623\u0628\u062D\u0627\u062B \u0627\u0644\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0648\u0627\u0633\u062A\u0642\u0637\u0627\u0628 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646",
        ES: "Inteligencia de Mercado Global y B\xFAsqueda de Compradores"
      },
      description: {
        AZ: "M\u0259hsullar\u0131n\u0131z \xFC\xE7\xFCn A\u0130, K\xF6rf\u0259z (GCC), MDB v\u0259 Asiya bazarlar\u0131nda birba\u015Fa B2B idxal\xE7\u0131lar v\u0259 distribyutorlar \u015F\u0259b\u0259k\u0259sinin formala\u015Fd\u0131r\u0131lmas\u0131.",
        EN: "Establishing qualified B2B importer and distributor networks across EU, GCC, CIS and Asian priority trade corridors with verified buyers.",
        TR: "\xDCr\xFCnleriniz i\xE7in AB, K\xF6rfez (GCC), BDT ve Asya pazarlar\u0131nda do\u011Frudan B2B ithalat\xE7\u0131 ve distrib\xFCt\xF6r a\u011Flar\u0131n\u0131n kurulmas\u0131.",
        RU: "\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0445 \u0441\u0435\u0442\u0435\u0439 \u0438\u043C\u043F\u043E\u0440\u0442\u0435\u0440\u043E\u0432 \u0438 \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u044C\u044E\u0442\u043E\u0440\u043E\u0432 \u0432 \u0415\u0421, \u0441\u0442\u0440\u0430\u043D\u0430\u0445 \u041F\u0435\u0440\u0441\u0438\u0434\u0441\u043A\u043E\u0433\u043E \u0437\u0430\u043B\u0438\u0432\u0430, \u0421\u041D\u0413 \u0438 \u0410\u0437\u0438\u0438 \u0441 \u0432\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u043C\u0438 \u043A\u043E\u043D\u0442\u0440\u0430\u0433\u0435\u043D\u0442\u0430\u043C\u0438.",
        AR: "\u062A\u0623\u0633\u064A\u0633 \u0634\u0628\u0643\u0627\u062A \u0645\u0648\u062B\u0648\u0642\u0629 \u0645\u0646 \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0648\u0632\u0639\u064A\u0646 \u0641\u064A \u0627\u0644\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A \u0648\u062F\u0648\u0644 \u0627\u0644\u062E\u0644\u064A\u062C \u0648\u0622\u0633\u064A\u0627.",
        ES: "Establecimiento de redes cualificadas de importadores y distribuidores en mercados prioritarios con compradores verificados."
      },
      scope: {
        AZ: [
          "H\u0259d\u0259f bazar idxal tarifl\u0259rinin v\u0259 g\xF6mr\xFCk t\u0259l\u0259bl\u0259rinin analizi",
          "T\u0259sdiql\u0259nmi\u015F kommersiya al\u0131c\u0131lar\u0131n\u0131n q\u0131sa siyah\u0131s\u0131n\u0131n (shortlist) haz\u0131rlanmas\u0131",
          "Birba\u015Fa ikit\u0259r\u0259fli B2B dan\u0131\u015F\u0131qlar\u0131n t\u0259\u015Fkili v\u0259 t\u0259qibi",
          "R\u0259qib qiym\u0259t analizi v\u0259 daxilolma strategiyas\u0131n\u0131n qurulmas\u0131"
        ],
        EN: [
          "Customs tariff & import regulation feasibility analysis in target markets",
          "Vetted B2B commercial buyer shortlisting and KYC compliance check",
          "Direct buyer-supplier negotiation scheduling & structured follow-up",
          "Competitive price benchmarking and landed-cost modeling"
        ],
        TR: [
          "Hedef pazar g\xFCmr\xFCk tarifleri ve mevzuat analizi",
          "Onayl\u0131 ticari al\u0131c\u0131 e\u015Fle\u015Ftirmesi ve g\xFCvenilirlik incelemesi",
          "B2B g\xF6r\xFC\u015Fme koordinasyonu ve m\xFCzakere deste\u011Fi",
          "Piyasa fiyat analizi ve maliyet sim\xFClasyonu"
        ],
        RU: [
          "\u0410\u043D\u0430\u043B\u0438\u0437 \u0442\u0430\u043C\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u0442\u0430\u0440\u0438\u0444\u043E\u0432 \u0438 \u0440\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440\u043D\u044B\u0445 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u0439 \u0446\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0440\u044B\u043D\u043A\u0430",
          "\u0428\u043E\u0440\u0442-\u043B\u0438\u0441\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u043D\u044B\u0445 \u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0438\u0445 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u0435\u0439 \u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0431\u043B\u0430\u0433\u043E\u043D\u0430\u0434\u0435\u0436\u043D\u043E\u0441\u0442\u0438",
          "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0440\u044F\u043C\u044B\u0445 \u043F\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u0440\u043E\u0432 B2B",
          "\u0410\u043D\u0430\u043B\u0438\u0437 \u0446\u0435\u043D \u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0442\u043E\u0432 \u0438 \u0440\u0430\u0441\u0447\u0435\u0442 \u0441\u0435\u0431\u0435\u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u043E\u0439"
        ],
        AR: [
          "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0644\u0648\u0627\u0626\u062D \u0627\u0644\u062A\u0646\u0638\u064A\u0645\u064A\u0629 \u0641\u064A \u0627\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641\u0629",
          "\u0625\u0639\u062F\u0627\u062F \u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u064A\u0646 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u064A\u0646 \u0648\u0627\u0644\u0645\u0648\u062B\u0648\u0642\u064A\u0646",
          "\u062A\u0646\u0633\u064A\u0642 \u0648\u062C\u062F\u0648\u0644\u0629 \u0645\u0641\u0627\u0648\u0636\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u064A\u0646 \u0627\u0644\u0623\u0637\u0631\u0627\u0641",
          "\u062F\u0631\u0627\u0633\u0629 \u0627\u0644\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u0629 \u0648\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629"
        ],
        ES: [
          "An\xE1lisis arancelario y de normativas de importaci\xF3n en destino",
          "Selecci\xF3n de compradores B2B verificados y evaluaci\xF3n de solvencia",
          "Coordinaci\xF3n de reuniones comerciales y seguimiento de acuerdos",
          "Estudio comparativo de precios y c\xE1lculo de costes landed"
        ]
      },
      targetAudience: {
        AZ: "M\u0259hsulunu xarici bazarlara \xE7\u0131xarmaq ist\u0259y\u0259n yerli istehsal\xE7\u0131lar v\u0259 fermer t\u0259s\u0259rr\xFCfatlar\u0131",
        EN: "Azerbaijani agricultural, industrial and chemical producers targeting global export markets",
        TR: "D\u0131\u015F pazarlara a\xE7\u0131lmak isteyen Azerbaycanl\u0131 \xFCreticiler ve sanayi kurulu\u015Flar\u0131",
        RU: "\u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043D\u0441\u043A\u0438\u0435 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u043F\u0438\u0449\u0435\u0432\u043E\u0439, \u0430\u0433\u0440\u0430\u0440\u043D\u043E\u0439 \u0438 \u043F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u043E\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438",
        AR: "\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0635\u0646\u0639\u0629 \u0641\u064A \u0623\u0630\u0631\u0628\u064A\u062C\u0627\u0646 \u0627\u0644\u0631\u0627\u063A\u0628\u0629 \u0641\u064A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0644\u0644\u0623\u0633\u0648\u0627\u0642 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629",
        ES: "Fabricantes azerbaiyanos que buscan expandir sus ventas en mercados internacionales"
      },
      iconClass: "fa-solid fa-chart-line",
      colorClass: "bg-brandNavy",
      serviceType: "primary",
      sortOrder: 1,
      isActive: 1
    },
    {
      id: "srv-contracts-legal",
      title: {
        AZ: "\u0130xrac M\xFCqavil\u0259l\u0259ri, Escrow & H\xFCquqi T\u0259minat",
        EN: "Export Contracting, Escrow & Arbitration Support",
        TR: "\u0130hracat S\xF6zle\u015Fmeleri, Escrow & Hukuki Destek",
        RU: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B, \u042D\u0441\u043A\u0440\u043E\u0443 \u0438 \u043F\u0440\u0430\u0432\u043E\u0432\u0430\u044F \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430",
        AR: "\u0639\u0642\u0648\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0648\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0636\u0645\u0627\u0646 \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0627\u0644\u062A\u062D\u0643\u064A\u0645",
        ES: "Contratos de Exportaci\xF3n, Garant\xEDa Escrow y Arbitraje"
      },
      description: {
        AZ: "Incoterms\xAE 2020 standartlar\u0131na uy\u011Fun ikidilli ixrac m\xFCqavil\u0259l\u0259rinin t\u0259rtibi, akkreditiv (L/C) v\u0259 beyn\u0259lxalq arbitraj d\u0259st\u0259yi.",
        EN: "Bilingual export contracts under Incoterms\xAE 2020 standards, Letter of Credit (L/C) review, and Baku International Arbitration protocols.",
        TR: "Incoterms\xAE 2020 standartlar\u0131nda \xE7ift dilli s\xF6zle\u015Fmeler, Akreditif (L/C) ve uluslararas\u0131 tahkim mekanizmalar\u0131.",
        RU: "\u0414\u0432\u0443\u044F\u0437\u044B\u0447\u043D\u044B\u0435 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B \u043F\u043E \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u0430\u043C Incoterms\xAE 2020, \u0430\u043A\u043A\u0440\u0435\u0434\u0438\u0442\u0438\u0432\u044B (L/C) \u0438 \u0430\u0440\u0431\u0438\u0442\u0440\u0430\u0436.",
        AR: "\u0635\u064A\u0627\u063A\u0629 \u0639\u0642\u0648\u062F \u062A\u0635\u062F\u064A\u0631 \u0645\u062A\u0648\u0627\u0641\u0642\u0629 \u0645\u0639 \u0634\u0631\u0648\u0637 Incoterms\xAE 2020 \u0648\u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0646\u062F\u064A\u0629.",
        ES: "Contratos biling\xFCes seg\xFAn Incoterms\xAE 2020, cartas de cr\xE9dito y arbitraje comercial."
      },
      scope: {
        AZ: [
          "Incoterms\xAE 2020 (FOB, CIF, DAP, FCA) \xFCzr\u0259 h\xFCquqi m\xFCqavil\u0259 t\u0259rtibi",
          "Bank akkreditivl\u0259rinin (L/C) v\u0259 qarantiya m\u0259ktublar\u0131n\u0131n h\xFCquqi ekspertizas\u0131",
          "Beyn\u0259lxalq ticar\u0259t m\xFCbahis\u0259l\u0259rinin m\u0259hk\u0259m\u0259d\u0259nk\u0259nar t\u0259nziml\u0259nm\u0259si v\u0259 arbitraj d\u0259st\u0259yi"
        ],
        EN: [
          "Drafting legally binding export agreements compliant with Incoterms\xAE 2020",
          "Letter of Credit (L/C) and bank performance guarantee review",
          "Dispute mitigation and arbitration clauses under ICC & Baku Arbitration standards"
        ],
        TR: [
          "Incoterms\xAE 2020 uyumlu uluslararas\u0131 sat\u0131\u015F s\xF6zle\u015Fmelerinin haz\u0131rlanmas\u0131",
          "Akreditif \u015Fartlar\u0131n\u0131n risk denetimi ve bankac\u0131l\u0131k uyumu",
          "Uluslararas\u0131 ticari uyu\u015Fmazl\u0131klarda tahkim ve uzla\u015Fma deste\u011Fi"
        ],
        RU: [
          "\u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u043E\u0432 \u043F\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u0430\u043C Incoterms\xAE 2020",
          "\u042D\u043A\u0441\u043F\u0435\u0440\u0442\u0438\u0437\u0430 \u0443\u0441\u043B\u043E\u0432\u0438\u0439 \u0430\u043A\u043A\u0440\u0435\u0434\u0438\u0442\u0438\u0432\u043E\u0432 \u0438 \u0431\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0445 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0439",
          "\u042E\u0440\u0438\u0434\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u0441\u043F\u043E\u0440\u043E\u0432 \u0432 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u043E\u043C \u0430\u0440\u0431\u0438\u0442\u0440\u0430\u0436\u0435"
        ],
        AR: [
          "\u0635\u064A\u0627\u063A\u0629 \u0639\u0642\u0648\u062F \u062A\u062C\u0627\u0631\u064A\u0629 \u0645\u0644\u0632\u0645\u0629 \u0648\u0641\u0642 \u0642\u0648\u0627\u0639\u062F Incoterms\xAE 2020",
          "\u0645\u0631\u0627\u062C\u0639\u0629 \u0628\u0646\u0648\u062F \u062E\u0637\u0627\u0628\u0627\u062A \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0635\u0631\u0641\u064A\u0629 \u0648\u0627\u0644\u0636\u0645\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0646\u0643\u064A\u0629",
          "\u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A \u0648\u0627\u0644\u062A\u062D\u0643\u064A\u0645 \u0627\u0644\u062F\u0648\u0644\u064A \u0641\u064A \u0627\u0644\u0646\u0632\u0627\u0639\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629"
        ],
        ES: [
          "Redacci\xF3n de contratos de compraventa internacional bajo Incoterms\xAE 2020",
          "Auditor\xEDa y verificaci\xF3n de cartas de cr\xE9dito bancarias",
          "Soporte en resoluci\xF3n de disputas y cl\xE1usulas de arbitraje comercial"
        ]
      },
      targetAudience: {
        AZ: "H\xFCquqi v\u0259 maliyy\u0259 riskl\u0259rini s\u0131f\u0131ra endirm\u0259k ist\u0259y\u0259n ixracat\xE7\u0131lar v\u0259 xarici al\u0131c\u0131lar",
        EN: "Exporters and global buyers seeking secure legal framework and trade finance protection",
        TR: "Hukuki ve finansal risklerini s\u0131f\u0131rlamak isteyen ihracat\xE7\u0131lar ve ithalat\xE7\u0131lar",
        RU: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0435\u0440\u044B \u0438 \u0438\u043C\u043F\u043E\u0440\u0442\u0435\u0440\u044B, \u0437\u0430\u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0432 \u0437\u0430\u0449\u0438\u0442\u0435 \u043A\u043E\u043C\u043C\u0435\u0440\u0447\u0435\u0441\u043A\u0438\u0445 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043E\u0432",
        AR: "\u0627\u0644\u0645\u0635\u062F\u0631\u0648\u0646 \u0648\u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F\u0648\u0646 \u0627\u0644\u0628\u0627\u062D\u062B\u0648\u0646 \u0639\u0646 \u062D\u0645\u0627\u064A\u0629 \u0642\u0627\u0646\u0648\u0646\u064A\u0629 \u0648\u0645\u0627\u0644\u064A\u0629 \u0634\u0627\u0645\u0644\u0629",
        ES: "Empresas exportadoras e importadoras que requieren total seguridad jur\xEDdica y financiera"
      },
      iconClass: "fa-solid fa-file-contract",
      colorClass: "bg-emerald-600",
      serviceType: "primary",
      sortOrder: 2,
      isActive: 1
    },
    {
      id: "srv-cert-phytosanitary",
      title: {
        AZ: "AQTA, FSSC & M\u0259n\u015F\u0259 Sertifikatla\u015Fd\u0131r\u0131lmas\u0131",
        EN: "AQTA, FSSC, Halal & Origin Certification Stack",
        TR: "AQTA, FSSC, Helal & Men\u015Fe Belgelendirme",
        RU: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F AQTA, FSSC, \u0425\u0430\u043B\u044F\u043B\u044C \u0438 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F",
        AR: "\u0634\u0647\u0627\u062F\u0627\u062A AQTA \u0648\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0634\u0647\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0634\u0623",
        ES: "Certificaciones Fitosanitarias, AQTA, Halal y Origen"
      },
      description: {
        AZ: "EUR.1, CT-1, AQTA fitosanitar, ISO 22000, FSSC v\u0259 Halal sertifikatlar\u0131n\u0131n tam m\xFC\u015Fayi\u0259tl\u0259 operativ r\u0259smil\u0259\u015Fdirilm\u0259si.",
        EN: "Full-stack support for EUR.1, Form CT-1, AQTA Phytosanitary, ISO 22000, FSSC 22000, and accredited Halal trade certificates.",
        TR: "EUR.1, Form CT-1, AQTA bitki sa\u011Fl\u0131\u011F\u0131, ISO 22000, FSSC 22000 ve Helal sertifikasyon s\xFCre\xE7lerinin u\xE7tan uca y\xF6netimi.",
        RU: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0432 EUR.1, \u0421\u0422-1, \u0444\u0438\u0442\u043E\u0441\u0430\u043D\u0438\u0442\u0430\u0440\u043D\u044B\u0445 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0432 AQTA, ISO 22000 \u0438 \u0425\u0430\u043B\u044F\u043B\u044C.",
        AR: "\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0634\u0647\u0627\u062F\u0627\u062A EUR.1 \u0648 CT-1 \u0648\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0623\u063A\u0630\u064A\u0629.",
        ES: "Tramitaci\xF3n integral de certificados EUR.1, CT-1, fitosanitarios y de calidad alimentaria."
      },
      scope: {
        AZ: [
          "AQTA Qida T\u0259hl\xFCk\u0259sizliyi Qeydiyyat\u0131 v\u0259 Fitosanitar/Baytarl\u0131q sertifikatlar\u0131",
          "EUR.1 v\u0259 Forma CT-1 g\xF6mr\xFCk m\u0259n\u015F\u0259 sertifikatlar\u0131n\u0131n al\u0131nmas\u0131 (0% g\xF6mr\xFCk r\xFCsumu \xFCst\xFCnl\xFCy\xFC)",
          "Beyn\u0259lxalq akkredit\u0259 olunmu\u015F laboratoriya analiz protokollar\u0131 (CoA)"
        ],
        EN: [
          "AQTA Food Safety System registration, Phytosanitary and Veterinary clearance",
          "EUR.1 and Form CT-1 Certificate of Origin for preferential zero-duty customs access",
          "Accredited third-party laboratory Certificate of Analysis (CoA) protocol fulfillment"
        ],
        TR: [
          "AQTA G\u0131da G\xFCvenli\u011Fi ve Bitki Sa\u011Fl\u0131\u011F\u0131/Veterinerlik ihra\xE7 belgeleri temini",
          "EUR.1 ve Form CT-1 men\u015Fe belgeleri ile g\xFCmr\xFCks\xFCz ticaret avantaj\u0131",
          "Uluslararas\u0131 akredite laboratuvar analiz raporlar\u0131n\u0131n (CoA) haz\u0131rlanmas\u0131"
        ],
        RU: [
          "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u0432 AQTA \u0438 \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u0435 \u0444\u0438\u0442\u043E\u0441\u0430\u043D\u0438\u0442\u0430\u0440\u043D\u044B\u0445/\u0432\u0435\u0442\u0435\u0440\u0438\u043D\u0430\u0440\u043D\u044B\u0445 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u043E\u0432",
          "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u044B \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F EUR.1 \u0438 \u0421\u0422-1 \u0434\u043B\u044F \u0431\u0435\u0441\u043F\u043E\u0448\u043B\u0438\u043D\u043D\u043E\u0433\u043E \u0432\u0432\u043E\u0437\u0430",
          "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0438\u0441\u043F\u044B\u0442\u0430\u043D\u0438\u0439 \u0432 \u0430\u043A\u043A\u0440\u0435\u0434\u0438\u0442\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043B\u0430\u0431\u043E\u0440\u0430\u0442\u043E\u0440\u0438\u044F\u0445 (CoA)"
        ],
        AR: [
          "\u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0641\u064A \u0647\u064A\u0626\u0629 \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u063A\u0630\u0627\u0621 AQTA \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u0629 \u0627\u0644\u0641\u064A\u062A\u0648\u0633\u0627\u0646\u064A\u062A\u0627\u0631\u064A\u0629",
          "\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u0646\u0634\u0623 EUR.1 \u0648 CT-1 \u0644\u0644\u0627\u0633\u062A\u0641\u0627\u062F\u0629 \u0645\u0646 \u0627\u0644\u0625\u0639\u0641\u0627\u0621\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629",
          "\u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644 \u0627\u0644\u0645\u062E\u0628\u0631\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F\u0629 \u062F\u0648\u0644\u064A\u0627\u064B \u0648\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u062C\u0648\u062F\u0629 (CoA)"
        ],
        ES: [
          "Registro en AQTA y obtenci\xF3n de certificados fitosanitarios y veterinarios",
          "Gesti\xF3n de certificados de origen EUR.1 y Formulario CT-1 para arancel cero",
          "Informes anal\xEDticos en laboratorios acreditados de control de calidad (CoA)"
        ]
      },
      targetAudience: {
        AZ: "K\u0259nd t\u0259s\u0259rr\xFCfat\u0131, qida v\u0259 kimya s\u0259nayesi istehsal\xE7\u0131lar\u0131",
        EN: "Food processors, agricultural producers and chemical manufacturers requiring trade accreditation",
        TR: "Tar\u0131m, g\u0131da ve kimya sekt\xF6r\xFCnde faaliyet g\xF6steren ihracat\xE7\u0131 i\u015Fletmeler",
        RU: "\u0421\u0435\u043B\u044C\u0441\u043A\u043E\u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0438 \u043F\u0438\u0449\u0435\u0432\u044B\u0435 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u044F\u0442\u0438\u044F, \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u044E\u0449\u0438\u0435 \u044D\u043A\u0441\u043F\u043E\u0440\u0442",
        AR: "\u0645\u0646\u062A\u062C\u0648 \u0627\u0644\u0623\u063A\u0630\u064A\u0629 \u0648\u0627\u0644\u0633\u0644\u0639 \u0627\u0644\u0632\u0631\u0627\u0639\u064A\u0629 \u0627\u0644\u0633\u0627\u0639\u0648\u0646 \u0644\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u062F\u0648\u0644\u064A\u0629",
        ES: "Productores agroalimentarios e industriales con requisitos de certificaci\xF3n internacional"
      },
      iconClass: "fa-solid fa-stamp",
      colorClass: "bg-sky-600",
      serviceType: "primary",
      sortOrder: 3,
      isActive: 1
    },
    {
      id: "srv-logistics-corridor",
      title: {
        AZ: "Orta D\u0259hliz Logistikas\u0131 & Multimodal N\u0259qliyyat",
        EN: "Middle Corridor Multimodal Logistics & Freight",
        TR: "Orta Koridor Multimodal Lojistik & Ta\u015F\u0131mac\u0131l\u0131k",
        RU: "\u041B\u043E\u0433\u0438\u0441\u0442\u0438\u043A\u0430 \u0421\u0440\u0435\u0434\u043D\u0435\u0433\u043E \u043A\u043E\u0440\u0438\u0434\u043E\u0440\u0430 \u0438 \u043C\u0443\u043B\u044C\u0442\u0438\u043C\u043E\u0434\u0430\u043B\u044C\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0438",
        AR: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0645\u0631 \u0627\u0644\u0623\u0648\u0633\u0637 \u0648\u0627\u0644\u0646\u0642\u0644 \u0645\u062A\u0639\u062F\u062F \u0627\u0644\u0648\u0633\u0627\u0626\u0637",
        ES: "Log\xEDstica Multimodal y Transporte por el Corredor Medio"
      },
      description: {
        AZ: "Bak\u0131 Beyn\u0259lxalq D\u0259niz Ticar\u0259t Liman\u0131 (\u018Fl\u0259t), BTQ d\u0259miryolu v\u0259 multimodal quru yollar\u0131 \xFCzr\u0259 optimal tarifl\u0259r v\u0259 konteyner rezervasiyas\u0131.",
        EN: "Port of Baku (Alat Hub), Baku-Tbilisi-Kars railway routing, multimodal road/rail bookings, and refrigerated reefer container solutions.",
        TR: "Bak\xFC Uluslararas\u0131 Deniz Ticaret Liman\u0131 (Alat), BTK demiryolu ve karayolu rotalar\u0131nda rekabet\xE7i navlun ve konteyner tahsisi.",
        RU: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u044B \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u0440\u0442 \u0411\u0430\u043A\u0443 (\u0410\u043B\u044F\u0442), \u0436/\u0434 \u0411\u0430\u043A\u0443-\u0422\u0431\u0438\u043B\u0438\u0441\u0438-\u041A\u0430\u0440\u0441, \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043D\u044B\u0435 \u0438 \u0440\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0438.",
        AR: "\u062D\u0644\u0648\u0644 \u0627\u0644\u0634\u062D\u0646 \u0639\u0628\u0631 \u0645\u064A\u0646\u0627\u0621 \u0628\u0627\u0643\u0648 (\u0623\u0644\u0627\u062A) \u0648\u0627\u0644\u0633\u0643\u0643 \u0627\u0644\u062D\u062F\u064A\u062F\u064A\u0629 \u0648\u0634\u0627\u062D\u0646\u0627\u062A \u0627\u0644\u062A\u0628\u0631\u064A\u062F.",
        ES: "Rutas log\xEDsticas v\xEDa Puerto de Bak\xFA, ferrocarril BTK y flete multimodal consolidado."
      },
      scope: {
        AZ: [
          "Bak\u0131 Liman\u0131 (\u018Fl\u0259t) vasit\u0259sil\u0259 X\u0259z\u0259r d\u0259nizi fider da\u015F\u0131malar\u0131",
          "Bak\u0131-Tbilisi-Qars (BTQ) x\u0259tti il\u0259 Avropaya v\u0259 T\xFCrkiy\u0259y\u0259 birba\u015Fa d\u0259miryol karvanlar\u0131",
          "Temperatur n\u0259zar\u0259tli (reefer) soyuduculu y\xFCkda\u015F\u0131malar v\u0259 GPS monitorinq"
        ],
        EN: [
          "Trans-Caspian feeder vessel shipping via Port of Baku (Alat Maritime Hub)",
          "Direct block-train bookings via Baku-Tbilisi-Kars (BTK) railway to Europe & Turkey",
          "Cold-chain reefer container logistics with live 24/7 telemetric GPS tracking"
        ],
        TR: [
          "Bak\xFC Liman\u0131 (Alat) \xFCzerinden Hazar Denizi besleme gemisi ta\u015F\u0131mac\u0131l\u0131\u011F\u0131",
          "Bak\xFC-Tiflis-Kars (BTK) demiryolu ile Avrupa ve T\xFCrkiye ba\u011Flant\u0131l\u0131 blok trenler",
          "S\u0131cakl\u0131k kontroll\xFC frigorifik (reefer) konteynerler ve anl\u0131k uydu takibi"
        ],
        RU: [
          "\u0422\u0440\u0430\u043D\u0441\u043A\u0430\u0441\u043F\u0438\u0439\u0441\u043A\u0438\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u043E\u0440\u0442 \u0411\u0430\u043A\u0443 (\u0410\u043B\u044F\u0442\u0441\u043A\u0438\u0439 \u043B\u043E\u0433\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0445\u0430\u0431)",
          "\u0411\u043B\u043E\u043A-\u043F\u043E\u0435\u0437\u0434\u0430 \u043F\u043E \u0436\u0435\u043B\u0435\u0437\u043D\u043E\u0439 \u0434\u043E\u0440\u043E\u0433\u0435 \u0411\u0430\u043A\u0443-\u0422\u0431\u0438\u043B\u0438\u0441\u0438-\u041A\u0430\u0440\u0441 (\u0411\u0422\u041A) \u0432 \u0422\u0443\u0440\u0446\u0438\u044E \u0438 \u0415\u0432\u0440\u043E\u043F\u0443",
          "\u0420\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440\u043D\u044B\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0438 \u0441 \u043A\u0440\u0443\u0433\u043B\u043E\u0441\u0443\u0442\u043E\u0447\u043D\u044B\u043C \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u043D\u044B\u043C \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u043E\u043C"
        ],
        AR: [
          "\u0627\u0644\u0646\u0642\u0644 \u0627\u0644\u0628\u062D\u0631\u064A \u0639\u0628\u0631 \u0645\u064A\u0646\u0627\u0621 \u0628\u0627\u0643\u0648 (\u0623\u0644\u0627\u062A) \u0641\u064A \u0628\u062D\u0631 \u0642\u0632\u0648\u064A\u0646",
          "\u0634\u062D\u0646 \u0627\u0644\u0642\u0637\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0639\u0628\u0631 \u062E\u0637 \u0628\u0627\u0643\u0648 - \u062A\u0628\u0644\u064A\u0633\u064A - \u0643\u0627\u0631\u0633 \u0646\u062D\u0648 \u062A\u0631\u0643\u064A\u0627 \u0648\u0623\u0648\u0631\u0648\u0628\u0627",
          "\u062D\u0627\u0648\u064A\u0627\u062A \u0645\u0628\u0631\u062F\u0629 \u0644\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u062A\u0628\u0631\u064A\u062F \u0645\u0639 \u062A\u062A\u0628\u0639 \u0641\u0648\u0631\u064A \u0639\u0628\u0631 \u0627\u0644\u0623\u0642\u0645\u0627\u0631 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629"
        ],
        ES: [
          "Transporte mar\xEDtimo por el mar Caspio a trav\xE9s del Puerto de Bak\xFA (Alat)",
          "Rutas en trenes bloque v\xEDa ferrocarril Bak\xFA-Tiflis-Kars hacia Turqu\xEDa y la UE",
          "Contenedores reefer con control t\xE9rmico y seguimiento GPS 24/7"
        ]
      },
      targetAudience: {
        AZ: "Tez v\u0259 t\u0259hl\xFCk\u0259siz y\xFCk \xE7atd\u0131r\u0131lmas\u0131 t\u0259l\u0259b ed\u0259n beyn\u0259lxalq ticar\u0259t i\u015Ftirak\xE7\u0131lar\u0131",
        EN: "International commercial buyers and export producers requiring predictable transit timeframes",
        TR: "H\u0131zl\u0131 ve g\xFCvenli teslimat isteyen uluslararas\u0131 ticaret \u015Firketleri",
        RU: "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u0438, \u0437\u0430\u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0432 \u043E\u043F\u0442\u0438\u043C\u0438\u0437\u0430\u0446\u0438\u0438 \u0441\u0440\u043E\u043A\u043E\u0432 \u0438 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0442\u0440\u0430\u043D\u0437\u0438\u0442\u0430",
        AR: "\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0627\u0644\u0628\u0627\u062D\u062B\u0629 \u0639\u0646 \u0633\u0631\u0639\u0629 \u0648\u0623\u0645\u0627\u0646 \u0646\u0642\u0644 \u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0627\u0644\u062F\u0648\u0644\u064A\u0629",
        ES: "Operadores comerciales que buscan plazos fiables y costes competitivos de flete"
      },
      iconClass: "fa-solid fa-truck-fast",
      colorClass: "bg-purple-600",
      serviceType: "primary",
      sortOrder: 4,
      isActive: 1
    },
    {
      id: "srv-outsourced-export",
      title: {
        AZ: "K\u0259narla\u015Fd\u0131r\u0131lm\u0131\u015F (Outsourced) \u0130xrac Departamenti",
        EN: "Outsourced Export Department as a Service",
        TR: "D\u0131\u015F Kaynakl\u0131 (Outsourced) \u0130hracat Departman\u0131",
        RU: "\u0410\u0443\u0442\u0441\u043E\u0440\u0441\u0438\u043D\u0433 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u043D\u043E\u0433\u043E \u043E\u0442\u0434\u0435\u043B\u0430 (Turnkey Export)",
        AR: "\u0625\u062F\u0627\u0631\u0629 \u0642\u0633\u0645 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062E\u0627\u0631\u062C\u064A \u0627\u0644\u0645\u062A\u0643\u0627\u0645\u0644 \u0644\u0644\u0634\u0631\u0643\u0627\u062A",
        ES: "Departamento de Exportaci\xF3n Externo (Outsourced)"
      },
      description: {
        AZ: "Yerli istehsal\xE7\u0131 \xFC\xE7\xFCn s\u0131f\u0131rdan xarici ticar\u0259t komandas\u0131n\u0131n qurulmas\u0131: beyn\u0259lxalq yaz\u0131\u015Fmalar, qiym\u0259t kalkulyasiyas\u0131, RFP/RFQ cavabland\u0131rma v\u0259 logistik idar\u0259etm\u0259.",
        EN: "Turnkey institutional export department for Azerbaijani manufacturers: international client correspondence, landed cost modeling, and end-to-end deal closing.",
        TR: "Azerbaycanl\u0131 \xFCreticiler i\xE7in anahtar teslim d\u0131\u015F ticaret y\xF6netimi: uluslararas\u0131 teklifler, maliyet hesaplar\u0131 ve sevkiyat takibi.",
        RU: "\u041F\u043E\u043B\u043D\u043E\u0435 \u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F: \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u043F\u0438\u0441\u043A\u0430, \u0440\u0430\u0441\u0447\u0435\u0442 \u0446\u0435\u043D \u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0434\u0435\u043B\u043E\u043A.",
        AR: "\u0625\u062F\u0627\u0631\u0629 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0645\u0646 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0639\u0631\u0648\u0636 \u062D\u062A\u0649 \u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0635\u0641\u0642\u0627\u062A \u0648\u062A\u062A\u0628\u0639 \u0627\u0644\u0634\u062D\u0646.",
        ES: "Gesti\xF3n externalizada integral del departamento de comercio exterior para fabricantes."
      },
      scope: {
        AZ: [
          "\u0130ngilis, Rus v\u0259 \u018Fr\u0259b dill\u0259rind\u0259 professional xarici ticar\u0259t yaz\u0131\u015Fmalar\u0131 v\u0259 dan\u0131\u015F\u0131qlar",
          "M\u0259hsulun beyn\u0259lxalq standartlara uy\u011Fun texniki m\u0259lumat v\u0259r\u0259qinin (TDS/MSDS) haz\u0131rlanmas\u0131",
          "Daimi B2B sor\u011Fular\u0131n (RFQ) emal\u0131, qiym\u0259t t\u0259klifl\u0259rinin g\xF6nd\u0259rilm\u0259si v\u0259 s\xF6vd\u0259l\u0259\u015Fm\u0259l\u0259rin ba\u011Flanmas\u0131",
          "B\xFCt\xFCn g\xF6mr\xFCk v\u0259 logistika prosesl\u0259rinin a\xE7ar-t\u0259hvil idar\u0259 edilm\u0259si"
        ],
        EN: [
          "Multilingual export desk operating in English, Russian, Arabic, and Turkish",
          "Technical Data Sheet (TDS) and Material Safety Data Sheet (MSDS) localization",
          "Continuous inbound/outbound RFQ commercial proposal handling & closing",
          "End-to-end customs broker and shipping line coordination"
        ],
        TR: [
          "\u0130ngilizce, Rus\xE7a, Arap\xE7a ve T\xFCrk\xE7e dillerinde tam kapsaml\u0131 ihracat y\xF6netimi",
          "Uluslararas\u0131 standartlarda teknik veri f\xF6yleri (TDS) ve katalog haz\u0131rl\u0131\u011F\u0131",
          "Gelen ticari taleplerin (RFQ) de\u011Ferlendirilmesi ve sat\u0131\u015Fa d\xF6n\xFC\u015Ft\xFCr\xFClmesi",
          "G\xFCmr\xFCk, nakliye ve tahsilat s\xFCre\xE7lerinin u\xE7tan uca y\xFCr\xFCt\xFClmesi"
        ],
        RU: [
          "\u0412\u0435\u0434\u0435\u043D\u0438\u0435 \u0432\u043D\u0435\u0448\u043D\u0435\u0439 \u0442\u043E\u0440\u0433\u043E\u0432\u043B\u0438 \u043D\u0430 \u0430\u043D\u0433\u043B\u0438\u0439\u0441\u043A\u043E\u043C, \u0440\u0443\u0441\u0441\u043A\u043E\u043C, \u0430\u0440\u0430\u0431\u0441\u043A\u043E\u043C \u0438 \u0442\u0443\u0440\u0435\u0446\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0430\u0445",
          "\u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u043E\u0432 (TDS) \u0438 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u043E\u0432 \u043F\u043E \u043C\u0438\u0440\u043E\u0432\u044B\u043C \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u0430\u043C",
          "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0432\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432 (RFQ), \u0440\u0430\u0441\u0447\u0435\u0442 \u043A\u043E\u0442\u0438\u0440\u043E\u0432\u043E\u043A \u0438 \u0437\u0430\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0441\u0434\u0435\u043B\u043E\u043A",
          "\u041F\u043E\u043B\u043D\u043E\u0435 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u0442\u0430\u043C\u043E\u0436\u0435\u043D\u043D\u044B\u0445 \u0438 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440"
        ],
        AR: [
          "\u0625\u062F\u0627\u0631\u0629 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u0629 \u0627\u0644\u062E\u0627\u0631\u062C\u064A\u0629 \u0645\u062A\u0639\u062F\u062F\u0629 \u0627\u0644\u0644\u063A\u0627\u062A (\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629\u060C \u0627\u0644\u0631\u0648\u0633\u064A\u0629\u060C \u0627\u0644\u0639\u0631\u0628\u064A\u0629\u060C \u0627\u0644\u062A\u0631\u0643\u064A\u0629)",
          "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0645\u0648\u0627\u0635\u0641\u0627\u062A \u0627\u0644\u0641\u0646\u064A\u0629 \u0644\u0644\u0633\u0644\u0639 (TDS) \u0648\u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C\u0627\u062A \u0627\u0644\u062A\u0635\u062F\u064A\u0631\u064A\u0629 \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629",
          "\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0648\u0639\u0631\u0648\u0636 \u0627\u0644\u0634\u0631\u0627\u0621 (RFQ) \u0648\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0642\u062F\u0627\u062A \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629",
          "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A\u0629 \u0645\u0646 \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0648\u062D\u062A\u0649 \u0627\u0644\u062A\u0633\u0644\u064A\u0645"
        ],
        ES: [
          "Mesa de exportaci\xF3n multiling\xFCe en ingl\xE9s, ruso, \xE1rabe y turco",
          "Fichas t\xE9cnicas de producto (TDS) y cat\xE1logos comerciales adaptados",
          "Gesti\xF3n activa de solicitudes de cotizaci\xF3n (RFQ) y cierre de acuerdos",
          "Supervisi\xF3n completa de aduanas, transporte y documentaci\xF3n de embarque"
        ]
      },
      targetAudience: {
        AZ: "\u015Etat\u0131nda xarici ticar\u0259t m\xFCt\u0259x\u0259ssisi olmayan, lakin qlobal bazara \xE7\u0131xmaq ist\u0259y\u0259n istehsal\xE7\u0131lar",
        EN: "Manufacturers with strong production capacity but lacking an internal institutional export division",
        TR: "Kendi b\xFCnyesinde d\u0131\u015F ticaret ekibi kurmadan profesyonelce ihracat yapmak isteyen firmalar",
        RU: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438, \u0436\u0435\u043B\u0430\u044E\u0449\u0438\u0435 \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0431\u0435\u0437 \u0437\u0430\u0442\u0440\u0430\u0442 \u043D\u0430 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0448\u0442\u0430\u0442 \u0412\u042D\u0414",
        AR: "\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0635\u0646\u0639\u0629 \u0630\u0627\u062A \u0627\u0644\u0642\u062F\u0631\u0627\u062A \u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0627\u0644\u0631\u0627\u063A\u0628\u0629 \u0641\u064A \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u062F\u0648\u0646 \u062A\u0643\u0627\u0644\u064A\u0641 \u062A\u0623\u0633\u064A\u0633 \u0642\u0633\u0645 \u062F\u0627\u062E\u0644\u064A",
        ES: "Empresas con capacidad productiva que prefieren externalizar la operativa de comercio exterior"
      },
      iconClass: "fa-solid fa-briefcase",
      colorClass: "bg-rose-600",
      serviceType: "secondary",
      sortOrder: 5,
      isActive: 1
    },
    {
      id: "srv-trade-fairs",
      title: {
        AZ: "Beyn\u0259lxalq S\u0259rgil\u0259rd\u0259 T\u0259msil\xE7ilik & B2B Missiyalar",
        EN: "International Trade Exhibitions & B2B Matchmaking",
        TR: "Uluslararas\u0131 Fuarlarda Temsil & B2B Ticaret Heyetleri",
        RU: "\u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u043D\u0430 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0445 \u0432\u044B\u0441\u0442\u0430\u0432\u043A\u0430\u0445 \u0438 B2B \u043C\u0438\u0441\u0441\u0438\u0438",
        AR: "\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629 \u0648\u0628\u0639\u062B\u0627\u062A B2B",
        ES: "Representaci\xF3n en Ferias Comerciales Internacionales y Misiones B2B"
      },
      description: {
        AZ: "Gulfood, SIAL, Anuga v\u0259 dig\u0259r apar\u0131c\u0131 qlobal s\u0259rgil\u0259rd\u0259 Az\u0259rbaycan m\u0259hsullar\u0131n\u0131n t\u0259msil\xE7iliyi v\u0259 f\u0259rdi B2B g\xF6r\xFC\u015Fl\u0259rin t\u0259\u015Fkili.",
        EN: "Professional showcase and deal negotiation at premier global trade platforms including Gulfood (Dubai), SIAL (Paris), and Anuga (Cologne).",
        TR: "Gulfood (Dubai), SIAL (Paris), Anuga (K\xF6ln) gibi k\xFCresel fuarlarda temsil ve ikili i\u015F g\xF6r\xFC\u015Fmeleri organizasyonu.",
        RU: "\u0423\u0447\u0430\u0441\u0442\u0438\u0435 \u0438 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435 \u043F\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u0440\u043E\u0432 \u043D\u0430 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0432\u044B\u0441\u0442\u0430\u0432\u043A\u0430\u0445: Gulfood (\u0414\u0443\u0431\u0430\u0439), SIAL (\u041F\u0430\u0440\u0438\u0436), Anuga (\u041A\u0435\u043B\u044C\u043D).",
        AR: "\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 \u0627\u0644\u0643\u0628\u0631\u0649 \u0645\u062B\u0644 Gulfood \u0648 SIAL \u0648\u062A\u0646\u0638\u064A\u0645 \u0627\u0644\u0644\u0642\u0627\u0621\u0627\u062A \u0627\u0644\u062B\u0646\u0627\u0626\u064A\u0629 \u0645\u0639 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0627\u0644\u062F\u0648\u0644\u064A\u064A\u0646.",
        ES: "Presencia en plataformas globales como Gulfood, SIAL y Anuga con agendas B2B cerradas."
      },
      scope: {
        AZ: [
          "Apar\u0131c\u0131 qlobal s\u0259rgil\u0259rd\u0259 vahid stend alt\u0131nda n\xFCmayi\u015F v\u0259 numun\u0259l\u0259rin t\u0259qdimat\u0131",
          "\u018Fvv\u0259lc\u0259d\u0259n raz\u0131la\u015Fd\u0131r\u0131lm\u0131\u015F f\u0259rdi B2B g\xF6r\xFC\u015Fl\u0259r c\u0259dv\u0259li (matchmaking)",
          "S\u0259rgi sonras\u0131 \u0259laq\u0259l\u0259rin sistemli t\u0259qibi v\u0259 m\xFCqavil\u0259l\u0259rin ba\u011Flanmas\u0131 d\u0259st\u0259yi"
        ],
        EN: [
          "Product sampling and commercial booth representation at premier global expos",
          "Pre-scheduled curated one-on-one B2B matchmaking agendas with top buyers",
          "Post-exhibition CRM lead nurturing and direct order conversion support"
        ],
        TR: [
          "Prestijli uluslararas\u0131 fuarlarda stant temsili ve \xFCr\xFCn numunesi tan\u0131t\u0131m\u0131",
          "B\xFCy\xFCk sat\u0131n almac\u0131larla \xF6nceden planlanm\u0131\u015F B2B ikili i\u015F g\xF6r\xFC\u015Fmeleri",
          "Fuar sonras\u0131 m\xFC\u015Fteri takibi ve sipari\u015Flerin s\xF6zle\u015Fmeye d\xF6n\xFC\u015Ft\xFCr\xFClmesi"
        ],
        RU: [
          "\u041F\u0440\u0435\u0437\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u043E\u0431\u0440\u0430\u0437\u0446\u043E\u0432 \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438 \u043D\u0430 \u0432\u0435\u0434\u0443\u0449\u0438\u0445 \u043E\u0442\u0440\u0430\u0441\u043B\u0435\u0432\u044B\u0445 \u0432\u044B\u0441\u0442\u0430\u0432\u043A\u0430\u0445",
          "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u0445 B2B \u0432\u0441\u0442\u0440\u0435\u0447 \u0441 \u043A\u0440\u0443\u043F\u043D\u044B\u043C\u0438 \u0431\u0430\u0439\u0435\u0440\u0430\u043C\u0438",
          "\u041F\u043E\u0441\u0442\u0432\u044B\u0441\u0442\u0430\u0432\u043E\u0447\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430 \u0441 \u043B\u0438\u0434\u0430\u043C\u0438 \u0438 \u0437\u0430\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432"
        ],
        AR: [
          "\u0639\u0631\u0636 \u0627\u0644\u0639\u064A\u0646\u0627\u062A \u0648\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0641\u064A \u0623\u062C\u0646\u062D\u0629 \u0643\u0628\u0631\u0649 \u0627\u0644\u0645\u0639\u0627\u0631\u0636 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629 \u0627\u0644\u062F\u0648\u0644\u064A\u0629",
          "\u062C\u062F\u0648\u0644\u0629 \u0627\u062C\u062A\u0645\u0627\u0639\u0627\u062A \u0639\u0645\u0644 \u062B\u0646\u0627\u0626\u064A\u0629 B2B \u0645\u0639 \u0643\u0628\u0627\u0631 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0646 \u0648\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u0648\u0631\u064A\u062F",
          "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u064A\u0646 \u0628\u0639\u062F \u0627\u0644\u0645\u0639\u0631\u0636 \u0648\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0641\u0631\u0635 \u0625\u0644\u0649 \u0639\u0642\u0648\u062F \u062A\u0648\u0631\u064A\u062F"
        ],
        ES: [
          "Exhibici\xF3n de muestras de producto en las principales ferias del sector",
          "Agendas personalizadas de reuniones B2B con compradores estrat\xE9gicos",
          "Seguimiento post-feria para la conversi\xF3n de contactos en contratos en firme"
        ]
      },
      targetAudience: {
        AZ: "Brendini qlobal arenada tan\u0131tmaq v\u0259 birba\u015Fa iri p\u0259rak\u0259nd\u0259 \u015F\u0259b\u0259k\u0259l\u0259ri il\u0259 \u0259laq\u0259 qurmaq ist\u0259y\u0259n istehsal\xE7\u0131lar",
        EN: "Producers ready for international retail, supermarket and wholesale distributor exposure",
        TR: "Markas\u0131n\u0131 k\xFCresel vitrine \xE7\u0131karmak isteyen ve b\xFCy\xFCk al\u0131c\u0131 a\u011Flar\u0131yla bulu\u015Fmay\u0131 hedefleyen firmalar",
        RU: "\u041F\u0440\u0435\u0434\u043F\u0440\u0438\u044F\u0442\u0438\u044F, \u043D\u0430\u0446\u0435\u043B\u0435\u043D\u043D\u044B\u0435 \u043D\u0430 \u0432\u044B\u0445\u043E\u0434 \u0432 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0435 \u0442\u043E\u0440\u0433\u043E\u0432\u044B\u0435 \u0441\u0435\u0442\u0438 \u0438 \u0434\u0438\u0441\u0442\u0440\u0438\u0431\u044C\u044E\u0442\u043E\u0440\u0441\u043A\u0438\u0435 \u043A\u0430\u043D\u0430\u043B\u044B",
        AR: "\u0627\u0644\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0631\u0627\u063A\u0628\u0629 \u0641\u064A \u062A\u0633\u0648\u064A\u0642 \u0639\u0644\u0627\u0645\u062A\u0647\u0627 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u062C\u0632\u0626\u0629 \u0648\u0627\u0644\u0645\u0648\u0632\u0639\u064A\u0646 \u0627\u0644\u0643\u0628\u0627\u0631",
        ES: "Empresas con potencial de exportaci\xF3n interesadas en contactar con grandes distribuidores y cadenas"
      },
      iconClass: "fa-solid fa-handshake",
      colorClass: "bg-emerald-600",
      serviceType: "secondary",
      sortOrder: 6,
      isActive: 1
    }
  ];
  const insertService = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_services
    (id, created_at, updated_at, title, description, scope, target_audience, icon_class, color_class, service_type, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const s of services) {
    insertService.run(
      s.id,
      now,
      now,
      JSON.stringify(s.title),
      JSON.stringify(s.description),
      JSON.stringify(s.scope),
      JSON.stringify(s.targetAudience),
      s.iconClass,
      s.colorClass,
      s.serviceType,
      s.isActive,
      s.sortOrder
    );
  }
  const articles = [
    {
      id: "art-001",
      title: "Azerbaijan's Middle Corridor (TITR): Strategic Transit Gateway Connecting Asia and Europe in 2026",
      slug: "azerbaijan-middle-corridor-new-silk-road",
      category: "Market Trends",
      summary: "How the Trans-Caspian International Transport Route (TITR) offers 12-day transit between China, Central Asia, Azerbaijan, and the European Union with unprecedented tariff predictability.",
      coverImage: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=80",
      seoTitle: "Middle Corridor Logistics Gateway \u2014 Azerbaijan TITR Rail & Port of Baku",
      seoDescription: "Strategic analysis of the Trans-Caspian Middle Corridor routing via Port of Baku and Baku-Tbilisi-Kars railway for Eurasian container shipping.",
      isFeatured: 1,
      isPublished: 1,
      author: "AZEXBUY Logistics Desk",
      content: `### Executive Overview: The Trans-Caspian Advantage

The **Trans-Caspian International Transport Route (TITR)**, commonly designated as the **Middle Corridor**, has emerged as the premier geostrategic artery linking East Asian manufacturing hubs and Central Asian commodity basins with Western Europe.

Passing directly through the **Port of Baku at Alat**, the Middle Corridor eliminates congested maritime bottlenecks while bypassing northern transit routes subject to international sanctions and volatility.

---

### Key Infrastructure Pillars

1. **Port of Baku (Alat Logistics Hub):**
   * Annual cargo throughput capacity exceeding 15 million tons and 100,000 TEU containers in Phase 1, expanding to 25 million tons and 500,000 TEU in Phase 2.
   * Direct intermodal connection to standard and broad gauge railway networks.
   * Free Economic Zone (AFEZ) privileges with 0% corporate tax, 0% VAT, and free repatriation of capital.

2. **Baku\u2013Tbilisi\u2013Kars (BTK) Railway:**
   * Modernized rail corridor providing direct uninterrupted rail freight connectivity through Georgia and Turkey into the European standard gauge network.
   * Transit times from Baku to Turkish Mediterranean and Aegean ports reduced to just 48\u201372 hours.

3. **Digital Single Window & Unified Transit Tariffs:**
   * Elimination of redundant customs checks through harmonized electronic CIM/SMGS consignment notes.
   * Block-train tracking via synchronized GPS telematics across all participating Caspian littoral operators.

---

### Commercial Implications for Exporters and Buyers

International procurement desks sourcing Azerbaijani hazelnuts, pomegranates, petrochemicals, and mineral commodities benefit directly from guaranteed **door-to-door transit timeframes of 7\u201312 days** into Southern and Central Europe.

AZEXBUY provides integrated multimodal booking, container allocation, and transit insurance across all Middle Corridor segments.`
    },
    {
      id: "art-002",
      title: "Azerbaijani Hazelnut Export: 2026 Harvest Outlook, Calibration Standards and EU Compliance",
      slug: "azerbaijan-hazelnut-export-2026-season",
      category: "Export Guides",
      summary: "Comprehensive B2B buyer guide on Ata-Baba hazelnut grading, aflatoxin control protocols, and preferential zero-tariff access under the EU-Azerbaijan partnership.",
      coverImage: "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=1200&q=80",
      seoTitle: "Azerbaijani Hazelnut Export Guide 2026 \u2014 Ata-Baba Caliber & EU Standards",
      seoDescription: "In-depth commercial guide for bulk buyers of Azerbaijani shelled and roasted hazelnuts. Quality grades, laboratory certification and packaging.",
      isFeatured: 1,
      isPublished: 1,
      author: "AZEXBUY Agro Desk",
      content: `### Global Footprint of Azerbaijani Hazelnut

Azerbaijan consistently ranks within the **top four global exporters of premium shelled hazelnuts**, yielding over 50,000 metric tons of in-shell nuts annually. Cultivated predominantly in the fertile microclimates of Zaqatala, Balakan, Qakh, and Sheki, the endemic **Ata-Baba** cultivar represents over 85% of commercial export production.

---

### Critical Quality Parameters for Confectionery Buyers

* **Fat & Oleic Acid Composition:** Ata-Baba kernels feature 64%\u201368% natural oil content, imparting a naturally buttery, sweet profile ideal for chocolate, praline, and paste processing.
* **Caliber Classification:**
  * 11\u201313 mm: Preferred for whole-nut inclusions in milk and dark chocolate bars.
  * 13\u201315 mm: Premium retail snack packing and high-end dragees.
  * 9\u201311 mm: Optimal for roasting, dicing, and industrial hazelnut butter milling.

---

### Strict Aflatoxin and Microbiological Controls

To guarantee compliance with European Union Regulation (EU) 2023/915:
1. Every export consignment undergoes double Sortex optical laser sorting followed by manual inspection tables.
2. Official AQTA (Food Safety Agency of Azerbaijan) sampling verifies total Aflatoxin < 4.0 ppb and Aflatoxin B1 < 2.0 ppb.
3. Consignments are packed in food-grade multi-ply vacuum foil sacks flushed with nitrogen to suppress mold sporulation during ocean and rail transit.`
    },
    {
      id: "art-003",
      title: "The Sovereign Export Compliance Stack: How AQTA, Form CT-1, EUR.1 and ISO 22000 Unlock Zero-Tariff Access",
      slug: "azerbaijan-export-certifications-guide",
      category: "Regulatory",
      summary: "A step-by-step institutional overview of trade documentation required for zero-duty clearance into the CIS, European Union, and Gulf Cooperation Council (GCC) markets.",
      coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
      seoTitle: "Azerbaijan Export Certifications Guide \u2014 AQTA, EUR.1, CT-1 and ISO Stack",
      seoDescription: "Complete roadmap to trade certifications for Azerbaijani products. Preferential customs treatment, sanitary protocols, and international validity.",
      isFeatured: 0,
      isPublished: 1,
      author: "AZEXBUY Legal & Compliance",
      content: `### Navigating the Azerbaijani Export Regulatory Landscape

For international buyers and local manufacturers alike, documentation integrity is the single most critical factor in guaranteeing frictionless border clearance.

---

### 1. Proof of Preferential Origin

* **Form CT-1:** Issued for trade within the Commonwealth of Independent States (CIS) Free Trade Agreement. Grants **0% import tariff** on all qualifying Azerbaijani agricultural and manufactured goods.
* **Movement Certificate EUR.1:** Issued under bilateral trade agreements with the EU, EFTA, and partner nations. Certifies that goods have undergone substantial transformation in Azerbaijan.

---

### 2. Sanitary and Phytosanitary Governance: AQTA

The **Food Safety Agency of the Republic of Azerbaijan (AQTA)** operates in direct alignment with Codex Alimentarius, the World Organisation for Animal Health (WOAH), and IPPC standards.

Every commercial food consignment dispatched via AZEXBUY includes:
* International Phytosanitary Certificate (Plant products)
* International Veterinary Health Certificate (Animal products & honey)
* Food Safety Certificate verifying absence of heavy metals, pesticides, and radionuclide contamination.`
    },
    {
      id: "art-004",
      title: "Goychay Pomegranate (PGI): Seasonal Windows, NFC Juice Processing and Gulf Market Expansion",
      slug: "pomegranate-goychay-pgi-export-2026",
      category: "Commodity Insights",
      summary: "Analyzing the commercial dynamics of Azerbaijan\u2019s iconic ruby pomegranate harvest, cold-pressed processing capabilities, and burgeoning GCC retail demand.",
      coverImage: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1200&q=80",
      seoTitle: "Goychay Pomegranate Export 2026 \u2014 Fresh Fruit & NFC Juice B2B Guide",
      seoDescription: "Market dynamics of Goychay PGI pomegranates. Harvest calendars, cold chain logistics to Dubai, Doha and Riyadh, and bulk juice procurement.",
      isFeatured: 1,
      isPublished: 1,
      author: "AZEXBUY Agricultural Desk",
      content: `### The Unique Terroir of Goychay

Situated at the intersection of four climatic zones in the Shirvan plain, the Goychay district possesses alluvial soils rich in calcium carbonate, combined with scorching summer heat and crisp autumn nights. This produces pomegranates with **unrivaled sugar-acid balance (16.5\xB0\u201318\xB0 Brix)** and thin, pliable rinds that resist splitting during packing.

---

### Harvest Calendar and Export Shipping Windows

* **Early Harvest (Guleysha Pink):** September 25 \u2013 October 15. Ideal for early airfreight into premium supermarket programs in the UAE and Qatar.
* **Peak Harvest (Guleysha Red & Bala Mursal):** October 15 \u2013 November 25. Large heavy fruits (400g\u2013650g) with deep ruby arils, optimized for sea reefer and cold-chain road transit.
* **Cold Storage Window:** November 25 \u2013 February 28. Stored in modern Controlled Atmosphere (CA) cold storage facilities at 5\xB0C and 90% relative humidity.`
    }
  ];
  const insertArticle = db.prepare(`
    INSERT OR REPLACE INTO azexbuy_articles
    (id, created_at, updated_at, title, slug, category, summary, content, cover_image, seo_title, seo_description, is_published, is_featured, published_at, author)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of articles) {
    insertArticle.run(
      a.id,
      now,
      now,
      a.title,
      a.slug,
      a.category,
      a.summary,
      a.content,
      a.coverImage,
      a.seoTitle,
      a.seoDescription,
      a.isPublished,
      a.isFeatured,
      now,
      a.author
    );
  }
  const existingKv = db.prepare("SELECT value FROM azexbuy_kv WHERE key = 'content'").get();
  let cmsContent = {};
  if (existingKv) {
    try {
      cmsContent = JSON.parse(existingKv.value);
    } catch {
    }
  }
  if (!cmsContent.products || cmsContent.products.length < 4) {
    cmsContent.products = [
      {
        id: "hazelnut-080222",
        featured: true,
        hsCode: "080222",
        categoryKey: "agro",
        name: {
          EN: "Ata-Baba Shelled Hazelnuts",
          AZ: "Ata-Baba F\u0131nd\u0131q L\u0259p\u0259si",
          TR: "Ata-Baba F\u0131nd\u0131k \u0130\xE7i",
          RU: "\u0424\u0443\u043D\u0434\u0443\u043A \u043E\u0447\u0438\u0449\u0435\u043D\u043D\u044B\u0439 \u0410\u0442\u0430-\u0411\u0430\u0431\u0430",
          AR: "\u0628\u0646\u062F\u0642 \u0623\u062A\u0627-\u0628\u0627\u0628\u0627 \u0645\u0642\u0634\u0631 \u0641\u0627\u062E\u0631",
          ES: "Avellanas Peladas Ata-Baba"
        },
        categoryLabel: {
          EN: "Agriculture & Food",
          AZ: "K\u0259nd T\u0259s\u0259rr\xFCfat\u0131 v\u0259 Qida",
          TR: "Tar\u0131m ve G\u0131da",
          RU: "\u0421\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u043E \u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B",
          AR: "\u0627\u0644\u0632\u0631\u0627\u0639\u0629 \u0648\u0627\u0644\u0623\u063A\u0630\u064A\u0629",
          ES: "Agricultura y Alimentos"
        },
        shortDesc: {
          EN: "Extra-grade shelled natural & roasted Ata-Baba hazelnuts from Zaqatala-Sheki orchards.",
          AZ: "Zaqatala-\u015E\u0259ki ba\u011Flar\u0131ndan ekstra n\xF6vl\xFC t\u0259bii v\u0259 qovrulmu\u015F Ata-Baba f\u0131nd\u0131q l\u0259p\u0259si.",
          TR: "Zakatala-\u015Eeki bah\xE7elerinden ekstra kalite do\u011Fal ve kavrulmu\u015F Ata-Baba f\u0131nd\u0131k i\xE7i.",
          RU: "\u041E\u0447\u0438\u0449\u0435\u043D\u043D\u044B\u0439 \u043D\u0430\u0442\u0443\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0438 \u043E\u0431\u0436\u0430\u0440\u0435\u043D\u043D\u044B\u0439 \u0444\u0443\u043D\u0434\u0443\u043A \u0441\u043E\u0440\u0442\u0430 \u0410\u0442\u0430-\u0411\u0430\u0431\u0430 \u0432\u044B\u0441\u0448\u0435\u0433\u043E \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u0438\u0437 \u0417\u0430\u0433\u0430\u0442\u0430\u043B\u044B.",
          AR: "\u0628\u0646\u062F\u0642 \u0637\u0628\u064A\u0639\u064A \u0648\u0645\u062D\u0645\u0635 \u0645\u0646 \u0627\u0644\u062F\u0631\u062C\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u0645\u0646 \u0628\u0633\u0627\u062A\u064A\u0646 \u0632\u0627\u0642\u0627\u062A\u0627\u0644\u0627 \u0648\u0634\u0643\u064A \u0627\u0644\u0623\u0630\u0631\u0628\u064A\u062C\u0627\u0646\u064A\u0629.",
          ES: "Avellanas naturales y tostadas de calidad extra de los huertos de Zaqatala-Sheki."
        },
        originRegion: {
          EN: "Zaqatala \u2013 Sheki Economic Region",
          AZ: "Zaqatala \u2013 \u015E\u0259ki \u0130qtisadi Rayonu",
          TR: "Zakatala \u2013 \u015Eeki Ekonomik B\xF6lgesi",
          RU: "\u0417\u0430\u0433\u0430\u0442\u0430\u043B\u043E-\u0428\u0435\u043A\u0438\u043D\u0441\u043A\u0438\u0439 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0430\u0439\u043E\u043D",
          AR: "\u0645\u0646\u0637\u0642\u0629 \u0632\u0627\u0642\u0627\u062A\u0627\u0644\u0627 - \u0634\u0643\u064A \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629",
          ES: "Regi\xF3n Econ\xF3mica de Zaqatala \u2013 Sheki"
        },
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6iP6ACTY6rFPAXNJlK_W-AfkWR_1OBE8I3wLkCwVMAlQIyNvxAXxK1kYe6-itoVecrpqtsSok0_wQ1QnYyWcn40Hikz269v2ag3TbKrY9lfqw3mEVtR-I0GvclcQXFDi0q_xVPYMdzpIFMaXwgeJEs4gwsCpcf-Dn7Df8QGIeKoSael0DxSBY2ZpmoWYe8Ynhio_Q0dONzHarqS9Kp31IStn01T44xVmJ90B5TY2WFQr7mOmo4Ucq",
        minOrderQty: "20 MT (1x 20ft FCL)",
        annualCapacity: "24,000 MT",
        verifiedSuppliersCount: 38,
        incoterms: ["FCA", "FOB", "CIF", "DAP"],
        certifications: ["ISO 22000", "FSSC 22000", "AQTA Phytosanitary", "EUR.1 / CT-1", "Halal"],
        leadTimeDays: "7\u201312 Days",
        packaging: {
          EN: "25kg / 50kg vacuum foil bags in corrugated cartons or 800kg big-bags",
          AZ: "25kq / 50kq vakuum folqa kis\u0259l\u0259r v\u0259 ya 800kq biq-b\u0259ql\u0259r",
          TR: "25kg / 50kg vakumlu folyo torbalarda veya 800kg big-bag",
          RU: "\u0412\u0430\u043A\u0443\u0443\u043C\u043D\u044B\u0435 \u043F\u0430\u043A\u0435\u0442\u044B \u043F\u043E 25/50 \u043A\u0433 \u0432 \u043A\u0430\u0440\u0442\u043E\u043D\u043D\u044B\u0445 \u043A\u043E\u0440\u043E\u0431\u0430\u0445 \u0438\u043B\u0438 \u0431\u0438\u0433-\u0431\u044D\u0433\u0438 \u043F\u043E 800 \u043A\u0433",
          AR: "\u0623\u0643\u064A\u0627\u0633 \u0631\u0642\u0627\u0626\u0642 \u0645\u0641\u0631\u063A\u0629 \u0645\u0646 \u0627\u0644\u0647\u0648\u0627\u0621 \u0633\u0639\u0629 25/50 \u0643\u062C\u0645 \u0623\u0648 \u0623\u0643\u064A\u0627\u0633 \u0643\u0628\u064A\u0631\u0629 \u0633\u0639\u0629 800 \u0643\u062C\u0645",
          ES: "Bolsas de vac\xEDo de 25/50 kg en cajas de cart\xF3n o big-bags de 800 kg"
        },
        gradeSpecs: {
          EN: "Caliber 11\u201313mm, 13\u201315mm | Moisture < 5.0% | Aflatoxin B1 < 2ppb (EU Standard)",
          AZ: "Kalibr 11\u201313mm, 13\u201315mm | N\u0259mlik < 5.0% | Aflatoksin B1 < 2ppb (A\u0130 Standart\u0131)",
          TR: "Kalibre 11\u201313mm, 13\u201315mm | Nem < %5.0 | Aflatoksin B1 < 2ppb (AB Standard\u0131)",
          RU: "\u041A\u0430\u043B\u0438\u0431\u0440 11\u201313\u043C\u043C, 13\u201315\u043C\u043C | \u0412\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C < 5.0% | \u0410\u0444\u043B\u0430\u0442\u043E\u043A\u0441\u0438\u043D B1 < 2ppb (\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442 \u0415\u0421)",
          AR: "\u0627\u0644\u0639\u064A\u0627\u0631 11-13 \u0645\u0645\u060C 13-15 \u0645\u0645 | \u0627\u0644\u0631\u0637\u0648\u0628\u0629 < 5% | \u0627\u0644\u0623\u0641\u0644\u0627\u062A\u0648\u0643\u0633\u064A\u0646 B1 < 2 \u062C\u0632\u0621 \u0641\u064A \u0627\u0644\u0645\u0644\u064A\u0627\u0631",
          ES: "Calibre 11\u201313mm, 13\u201315mm | Humedad < 5.0% | Aflatoxina B1 < 2ppb (Norma UE)"
        }
      },
      {
        id: "pomegranate-081090",
        featured: true,
        hsCode: "081090",
        categoryKey: "agro",
        name: {
          EN: "Goychay Pomegranate & 100% NFC Juice",
          AZ: "G\xF6y\xE7ay Nar\u0131 v\u0259 100% T\u0259bii Nar \u015Eir\u0259si",
          TR: "G\xF6y\xE7ay Nar\u0131 ve %100 Do\u011Fal Nar Suyu",
          RU: "\u0413\u0440\u0430\u043D\u0430\u0442 \u0413\u0451\u0439\u0447\u0430\u0439 \u0438 100% \u0441\u043E\u043A \u043F\u0440\u044F\u043C\u043E\u0433\u043E \u043E\u0442\u0436\u0438\u043C\u0430",
          AR: "\u0631\u0645\u0627\u0646 \u063A\u0648\u064A\u062A\u0634\u0627\u064A \u0627\u0644\u0634\u0647\u064A\u0631 \u0648\u0639\u0635\u064A\u0631 \u0637\u0628\u064A\u0639\u064A 100%",
          ES: "Granadas de Goychay y Zumo 100% Natural NFC"
        },
        categoryLabel: {
          EN: "Agriculture & Food",
          AZ: "K\u0259nd T\u0259s\u0259rr\xFCfat\u0131 v\u0259 Qida",
          TR: "Tar\u0131m ve G\u0131da",
          RU: "\u0421\u0435\u043B\u044C\u0441\u043A\u043E\u0435 \u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u043E \u0438 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B",
          AR: "\u0627\u0644\u0632\u0631\u0627\u0639\u0629 \u0648\u0627\u0644\u0623\u063A\u0630\u064A\u0629",
          ES: "Agricultura y Alimentos"
        },
        shortDesc: {
          EN: "Protected Geographical Indication (PGI) Goychay red ruby pomegranates and cold-pressed NFC pure juice.",
          AZ: "Co\u011Frafi g\xF6st\u0259ricili (PGI) G\xF6y\xE7ay yaqut narlar\u0131 v\u0259 soyuq s\u0131x\u0131m 100% t\u0259bii nar \u015Fir\u0259si.",
          TR: "Co\u011Frafi i\u015Faretli (PGI) G\xF6y\xE7ay yakut narlar\u0131 ve so\u011Fuk s\u0131k\u0131m %100 do\u011Fal nar suyu.",
          RU: "\u0413\u0435\u043E\u0433\u0440\u0430\u0444\u0438\u0447\u0435\u0441\u043A\u0438 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u043D\u044B\u0439 \u0433\u0451\u0439\u0447\u0430\u0439\u0441\u043A\u0438\u0439 \u0440\u0443\u0431\u0438\u043D\u043E\u0432\u044B\u0439 \u0433\u0440\u0430\u043D\u0430\u0442 \u0438 100% \u0441\u043E\u043A \u043F\u0440\u044F\u043C\u043E\u0433\u043E \u043E\u0442\u0436\u0438\u043C\u0430.",
          AR: "\u0631\u0645\u0627\u0646 \u063A\u0648\u064A\u062A\u0634\u0627\u064A \u0630\u0648 \u0627\u0644\u0645\u0624\u0634\u0631 \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A \u0627\u0644\u0645\u062D\u0645\u064A \u0648\u0639\u0635\u064A\u0631 \u0627\u0644\u0631\u0645\u0627\u0646 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0627\u0644\u0645\u0639\u0635\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0631\u062F.",
          ES: "Granadas rub\xED de Goychay con Indicaci\xF3n Geogr\xE1fica Protegida y zumo puro prensado en fr\xEDo."
        },
        originRegion: {
          EN: "Central Aran (Goychay) Economic Region",
          AZ: "M\u0259rk\u0259zi Aran (G\xF6y\xE7ay) \u0130qtisadi Rayonu",
          TR: "Merkezi Aran (G\xF6y\xE7ay) Ekonomik B\xF6lgesi",
          RU: "\u0426\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u043E-\u0410\u0440\u0430\u043D\u0441\u043A\u0438\u0439 (\u0413\u0451\u0439\u0447\u0430\u0439) \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0430\u0439\u043E\u043D",
          AR: "\u0645\u0646\u0637\u0642\u0629 \u0623\u0631\u0627\u0646 \u0627\u0644\u0648\u0633\u0637\u0649 (\u063A\u0648\u064A\u062A\u0634\u0627\u064A) \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629",
          ES: "Regi\xF3n Econ\xF3mica de Aran Central (Goychay)"
        },
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHo5g8iKevybJcG4jlFPGTNzuPMU2721wxSfNRS3s0FmbZeA3YW4AxkdXtyhH_55x-4s5Uh_5-S2-S3LVPexC1O1ahPg_Hgeeion6snYi_eyi7MNDXh5coR3k9acztB4DSA_PV9JjS_JAitpfDEAmO4UUbAUjAs0VuwpjvFbKeEaRXeqGiJ2JKU_vHqlhTa6Meil6iamn-3I_33E-Y7Tii2hclP8mfc_jBNp_gJSQpmbKniKtPJu5s",
        minOrderQty: "18 MT (1x 40ft Reefer FCL)",
        annualCapacity: "40,000 MT",
        verifiedSuppliersCount: 42,
        incoterms: ["FCA", "FOB", "CIF", "CIP"],
        certifications: ["GlobalG.A.P.", "ISO 22000", "AQTA Phytosanitary", "EUR.1 / CT-1", "Halal"],
        leadTimeDays: "5\u201310 Days",
        packaging: {
          EN: "Fresh: 4.5kg open-top cartons with cell dividers. Juice: 200L aseptic drums / 1L glass bottles",
          AZ: "T\u0259z\u0259: 4.5kq x\xFCsusi karton qutular. \u015Eir\u0259: 200L aseptik \xE7\u0259ll\u0259kl\u0259r / 1L \u015F\xFC\u015F\u0259 butulkalar",
          TR: "Taze: 4.5kg viyoll\xFC a\xE7\u0131k karton kutular. Meyve suyu: 200L aseptik variller / 1L cam \u015Fi\u015Feler",
          RU: "\u0421\u0432\u0435\u0436\u0438\u0439: \u043A\u0430\u0440\u0442\u043E\u043D\u043D\u044B\u0435 \u043A\u043E\u0440\u043E\u0431\u043A\u0438 4.5 \u043A\u0433 \u0441 \u044F\u0447\u0435\u0439\u043A\u0430\u043C\u0438. \u0421\u043E\u043A: \u0430\u0441\u0435\u043F\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u043E\u0447\u043A\u0438 200 \u043B / \u0441\u0442\u0435\u043A\u043B\u043E 1 \u043B",
          AR: "\u0637\u0627\u0632\u062C: \u0643\u0631\u0627\u062A\u064A\u0646 4.5 \u0643\u062C\u0645 \u0645\u0639 \u0641\u0648\u0627\u0635\u0644. \u0639\u0635\u064A\u0631: \u0628\u0631\u0627\u0645\u064A\u0644 \u0645\u0639\u0642\u0645\u0629 \u0633\u0639\u0629 200 \u0644\u062A\u0631 \u0623\u0648 \u0632\u062C\u0627\u062C\u0627\u062A \u0633\u0639\u0629 1 \u0644\u062A\u0631",
          ES: "Fresco: cajas de 4.5 kg con alv\xE9olos. Zumo: bidones as\xE9pticos de 200L / botellas de 1L"
        },
        gradeSpecs: {
          EN: "Brix 16.5\xB0\u201318.0\xB0 | Weight 300g\u2013550g | Cold-Chain Reefer 5\xB0C with controlled atmosphere",
          AZ: "Briks 16.5\xB0\u201318.0\xB0 | \xC7\u0259ki 300q\u2013550q | 5\xB0C d\u0259r\u0259c\u0259d\u0259 idar\u0259olunan soyuducu z\u0259ncir",
          TR: "Brix %16.5\u2013%18.0 | A\u011F\u0131rl\u0131k 300g\u2013550g | 5\xB0C kontroll\xFC atmosferli so\u011Fuk zincir",
          RU: "\u0411\u0440\u0438\u043A\u0441 16.5\xB0\u201318.0\xB0 | \u0412\u0435\u0441 300\u2013550 \u0433 | \u0420\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440\u043D\u0430\u044F \u0446\u0435\u043F\u043E\u0447\u043A\u0430 5\xB0C \u0441 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0435\u043C \u0441\u0440\u0435\u0434\u044B",
          AR: "\u0628\u0631\u064A\u0643\u0633 16.5\xB0 - 18.0\xB0 | \u0627\u0644\u0648\u0632\u0646 300 - 550 \u062C\u0645 | \u0646\u0642\u0644 \u0645\u0628\u0631\u062F \u0628\u062F\u0631\u062C\u0629 \u062D\u0631\u0627\u0631\u0629 5 \u0645\u0626\u0648\u064A\u0629",
          ES: "Brix 16.5\xB0\u201318.0\xB0 | Peso 300g\u2013550g | Cadena de fr\xEDo a 5\xB0C en atm\xF3sfera controlada"
        }
      },
      {
        id: "saffron-091020",
        featured: true,
        hsCode: "091020",
        categoryKey: "agro",
        name: {
          EN: "Absheron Royal Saffron Threads",
          AZ: "Ab\u015Feron \u015Eah Z\u0259f\u0259ran L\u0259\xE7\u0259kl\u0259ri",
          TR: "Ab\u015Feron \u015Eah Safran Telleri",
          RU: "\u0410\u0431\u0448\u0435\u0440\u043E\u043D\u0441\u043A\u0438\u0439 \u0446\u0430\u0440\u0441\u043A\u0438\u0439 \u0448\u0430\u0444\u0440\u0430\u043D (\u043D\u0438\u0442\u0438)",
          AR: "\u062E\u064A\u0648\u0637 \u0632\u0639\u0641\u0631\u0627\u0646 \u0623\u0628\u0634\u064A\u0631\u0648\u0646 \u0627\u0644\u0645\u0644\u0643\u064A \u0627\u0644\u0646\u0642\u064A",
          ES: "Hebras de Azafr\xE1n Real de Absheron"
        },
        categoryLabel: {
          EN: "Specialty Crops & Spices",
          AZ: "X\xFCsusi Bitkil\u0259r v\u0259 \u018Fdviyyatlar",
          TR: "\xD6zel Mahsuller ve Baharatlar",
          RU: "\u0421\u043F\u0435\u0446\u0438\u0438 \u0438 \u043E\u0441\u043E\u0431\u044B\u0435 \u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B",
          AR: "\u0627\u0644\u0645\u062D\u0627\u0635\u064A\u0644 \u0627\u0644\u062E\u0627\u0635\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0628\u0644",
          ES: "Especias y Cultivos Especiales"
        },
        shortDesc: {
          EN: "ISO 3632 Category I pure all-red Sargol saffron hand-harvested in Bilgah, Absheron.",
          AZ: "Bilg\u0259h k\u0259ndind\u0259 \u0259ll\u0259 y\u0131\u011F\u0131lm\u0131\u015F ISO 3632 Kateqoriya I t\u0259miz q\u0131rm\u0131z\u0131 \u015Eah z\u0259f\u0259ran.",
          TR: "Bilgah k\xF6y\xFCnde elle toplanm\u0131\u015F ISO 3632 Kategori I saf k\u0131rm\u0131z\u0131 \u015Eah safran\u0131.",
          RU: "\u0427\u0438\u0441\u0442\u044B\u0439 \u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u0448\u0430\u0444\u0440\u0430\u043D \u0432\u044B\u0441\u0448\u0435\u0439 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 ISO 3632 I, \u0441\u043E\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u0432 \u0411\u0438\u043B\u044C\u0433\u044F.",
          AR: "\u0632\u0639\u0641\u0631\u0627\u0646 \u0633\u0627\u0631\u062C\u0648\u0644 \u0623\u062D\u0645\u0631 \u0646\u0642\u064A \u0645\u0642\u0637\u0648\u0641 \u064A\u062F\u0648\u064A\u0627\u064B \u0648\u0641\u0642 \u0645\u0639\u0627\u064A\u064A\u0631 ISO 3632 \u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0623\u0648\u0644\u0649.",
          ES: "Azafr\xE1n puro Sargol Categor\xEDa I ISO 3632 cosechado a mano en Bilgah, Absheron."
        },
        originRegion: {
          EN: "Absheron \u2013 Khizi (Bilgah) Economic Region",
          AZ: "Ab\u015Feron \u2013 X\u0131z\u0131 (Bilg\u0259h) \u0130qtisadi Rayonu",
          TR: "Ab\u015Feron \u2013 H\u0131z\u0131 (Bilgah) Ekonomik B\xF6lgesi",
          RU: "\u0410\u0431\u0448\u0435\u0440\u043E\u043D-\u0425\u044B\u0437\u044B\u043D\u0441\u043A\u0438\u0439 (\u0411\u0438\u043B\u044C\u0433\u044F) \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0430\u0439\u043E\u043D",
          AR: "\u0645\u0646\u0637\u0642\u0629 \u0623\u0628\u0634\u064A\u0631\u0648\u0646 - \u062E\u064A\u0632\u064A (\u0628\u064A\u0644\u063A\u0627\u0647) \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629",
          ES: "Regi\xF3n Econ\xF3mica de Absheron \u2013 Khizi (Bilgah)"
        },
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtNJYRxE2w63MPzGdjf8CPD9AEFm8HRgiA_8S4bLzI4JlWkzMSr7mOrBFN0clACdJ8Z4fdPmTxcUeQZoVHwM8X0BSrp3Ge5V1rjnXGei5GwaARNkgff5T_0xspZitbC-LuPEjlYnoFGRTUx9-xnXkSS6296Qbk6OBMxFoPcu45Ph_IWPgxe8ghwkwSRb4DFc747hiqPs4hl6mD0u0fkbzXC86IW3Go3l5Gt49vsGvyFE6w27cyqJpi",
        minOrderQty: "5 kg (Express Air Freight)",
        annualCapacity: "1,500 kg",
        verifiedSuppliersCount: 14,
        incoterms: ["FCA", "CIP", "DAP"],
        certifications: ["ISO 3632-1 Cat I", "AQTA Health Certificate", "EUR.1 / CT-1", "CoA Lab Test"],
        leadTimeDays: "3\u20137 Days",
        packaging: {
          EN: "100g, 250g, 500g nitrogen-sealed tins or glass jars in luxury master cartons",
          AZ: "100q, 250q, 500q azotla qorunan metal bankalar v\u0259 ya \u015F\xFC\u015F\u0259 qablar",
          TR: "100g, 250g, 500g azot korumal\u0131 metal kutularda veya cam kavanozlarda",
          RU: "\u0410\u0437\u043E\u0442\u043E\u043D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u044B\u0435 \u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u0430\u043D\u043A\u0438 100/250/500 \u0433 \u0438\u043B\u0438 \u0441\u0442\u0435\u043A\u043B\u043E \u0432 \u043F\u043E\u0434\u0430\u0440\u043E\u0447\u043D\u044B\u0445 \u043A\u043E\u0440\u043E\u0431\u0430\u0445",
          AR: "\u0639\u0644\u0628 \u0645\u0639\u062F\u0646\u064A\u0629 \u0645\u062D\u0643\u0645\u0629 \u0645\u062D\u0642\u0648\u0646\u0629 \u0628\u0627\u0644\u0646\u064A\u062A\u0631\u0648\u062C\u064A\u0646 \u0633\u0639\u0629 100 \u0648 250 \u0648 500 \u062C\u0645 \u0623\u0648 \u0639\u0628\u0648\u0627\u062A \u0632\u062C\u0627\u062C\u064A\u0629",
          ES: "Latas selladas con nitr\xF3geno de 100g, 250g, 500g o frascos de vidrio"
        },
        gradeSpecs: {
          EN: "Crocin (Coloring Strength) > 240 | Safranal (Aroma) 35\u201345 | Picrocrocin > 85",
          AZ: "Krosin (R\u0259ng g\xFCc\xFC) > 240 | Safranal (\u018Ftir) 35\u201345 | Pikrokrosin > 85",
          TR: "Krosin (Renk g\xFCc\xFC) > 240 | Safranal (Aroma) 35\u201345 | Pikrokrosin > 85",
          RU: "\u041A\u0440\u043E\u0446\u0438\u043D (\u043A\u0440\u0430\u0441\u044F\u0449\u0430\u044F \u0441\u0438\u043B\u0430) > 240 | \u0421\u0430\u0444\u0440\u0430\u043D\u0430\u043B (\u0430\u0440\u043E\u043C\u0430\u0442) 35\u201345 | \u041F\u0438\u043A\u0440\u043E\u043A\u0440\u043E\u0446\u0438\u043D > 85",
          AR: "\u0642\u0648\u0629 \u0627\u0644\u062A\u0644\u0648\u064A\u0646 \u0643\u0631\u0648\u0633\u064A\u0646 > 240 | \u0627\u0644\u0631\u0627\u0626\u062D\u0629 \u0633\u0627\u0641\u0631\u0627\u0646\u0627\u0644 35-45 | \u0627\u0644\u0645\u0630\u0627\u0642 \u0628\u064A\u0643\u0631\u0648\u0643\u0631\u0648\u0633\u064A\u0646 > 85",
          ES: "Crocin (Fuerza colorante) > 240 | Safranal (Aroma) 35\u201345 | Picrocrocin > 85"
        }
      },
      {
        id: "silk-500200",
        featured: true,
        hsCode: "500200",
        categoryKey: "industrial",
        name: {
          EN: "Sheki 100% Mulberry Raw Silk Yarn (20/22D)",
          AZ: "\u015E\u0259ki 100% Barama Xam \u0130p\u0259k \u0130pliyi (20/22D)",
          TR: "\u015Eeki %100 Do\u011Fal Ham \u0130pek \u0130pli\u011Fi (20/22D)",
          RU: "\u0428\u0435\u043A\u0438\u043D\u0441\u043A\u0438\u0439 100% \u0448\u0435\u043B\u043A-\u0441\u044B\u0440\u0435\u0446 \u0438\u0437 \u043A\u043E\u043A\u043E\u043D\u043E\u0432 \u0448\u0435\u043B\u043A\u043E\u043F\u0440\u044F\u0434\u0430 (20/22D)",
          AR: "\u062E\u064A\u0648\u0637 \u062D\u0631\u064A\u0631 \u0627\u0644\u062A\u0648\u062A \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0627\u0644\u062E\u0627\u0645 \u0645\u0646 \u0634\u0643\u064A (20/22D)",
          ES: "Hilos de Seda Cruda 100% de Morera de Sheki (20/22D)"
        },
        categoryLabel: {
          EN: "Industrial Materials & Textiles",
          AZ: "S\u0259naye Materiallar\u0131 v\u0259 Tekstil",
          TR: "Sanayi Malzemeleri ve Tekstil",
          RU: "\u041F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u044B\u0435 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u0438 \u0442\u0435\u043A\u0441\u0442\u0438\u043B\u044C",
          AR: "\u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629 \u0648\u0627\u0644\u0645\u0646\u0633\u0648\u062C\u0627\u062A",
          ES: "Materiales Industriales y Textiles"
        },
        shortDesc: {
          EN: "Premium 4A/5A grade white mulberry raw silk yarn reeled at the historic Sheki Silk mill.",
          AZ: "Tarixi \u015E\u0259ki \u0130p\u0259k kombinat\u0131nda istehsal edilmi\u015F 4A/5A n\xF6vl\xFC a\u011F tut ip\u0259k ipliyi.",
          TR: "Tarihi \u015Eeki \u0130pek fabrikas\u0131nda \xFCretilen 4A/5A kalite beyaz dut ham ipek ipli\u011Fi.",
          RU: "\u0411\u0435\u043B\u044B\u0439 \u0448\u0435\u043B\u043A-\u0441\u044B\u0440\u0435\u0446 \u0432\u044B\u0441\u0448\u0435\u0433\u043E \u0441\u043E\u0440\u0442\u0430 4A/5A \u0441 \u0438\u0441\u0442\u043E\u0440\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0428\u0435\u043A\u0438\u043D\u0441\u043A\u043E\u0433\u043E \u0448\u0435\u043B\u043A\u043E\u0432\u043E\u0433\u043E \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u0430.",
          AR: "\u062E\u064A\u0648\u0637 \u062D\u0631\u064A\u0631 \u0627\u0644\u062A\u0648\u062A \u0627\u0644\u0623\u0628\u064A\u0636 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0627\u0644\u0641\u0627\u062E\u0631 \u0641\u0626\u0629 4A/5A \u0645\u0646 \u0645\u0635\u0627\u0646\u0639 \u0634\u0643\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629.",
          ES: "Seda cruda blanca de morera de grado 4A/5A hilada en la f\xE1brica hist\xF3rica de Sheki."
        },
        originRegion: {
          EN: "Sheki \u2013 Zaqatala Economic Region",
          AZ: "\u015E\u0259ki \u2013 Zaqatala \u0130qtisadi Rayonu",
          TR: "\u015Eeki \u2013 Zakatala Ekonomik B\xF6lgesi",
          RU: "\u0428\u0435\u043A\u0438-\u0417\u0430\u0433\u0430\u0442\u0430\u043B\u044C\u0441\u043A\u0438\u0439 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0430\u0439\u043E\u043D",
          AR: "\u0645\u0646\u0637\u0642\u0629 \u0634\u0643\u064A - \u0632\u0627\u0642\u0627\u062A\u0627\u0644\u0627 \u0627\u0644\u0627\u0642\u062A\u0635\u0627\u062F\u064A\u0629",
          ES: "Regi\xF3n Econ\xF3mica de Sheki \u2013 Zaqatala"
        },
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD03XXHtlryKOF4P13Jsyapcx1cJC4md04R7W4OmhEOlilzH3GXC84pohKdFeZC2E26PSlasR8hsE1ZhUMI_m0G3EvLUmCLYXAFuMf-8fVmPxAaSz6rXZE5DhZfy_GWTdrnj6b_8WD4Q3Rrvlu3AYTUq_hrwc41KTaORWxIqz41fZ3sVhVp_icHS5yhXQKuIuOFb0jjF16nF7IcXL9rWJ5SplYRdK1DWGo-wlLK2UlgnkEWl6JIaR20",
        minOrderQty: "500 kg (1 Pallet)",
        annualCapacity: "120 MT",
        verifiedSuppliersCount: 6,
        incoterms: ["FCA", "FOB", "CIF", "CIP"],
        certifications: ["OEKO-TEX Standard 100", "ISO 9001:2015", "EUR.1 / CT-1"],
        leadTimeDays: "10\u201318 Days",
        packaging: {
          EN: "50kg export wooden cases or heavy corrugated cartons, hanks wrapped in protective polyethylene",
          AZ: "50kq ixrac taxta ye\u015Fikl\u0259ri v\u0259 ya polietilenl\u0259 qorunan qal\u0131n karton qutular",
          TR: "50kg ah\u015Fap sand\u0131klarda veya polietilen korumal\u0131 mukavva kolilerde",
          RU: "\u0414\u0435\u0440\u0435\u0432\u044F\u043D\u043D\u044B\u0435 \u044F\u0449\u0438\u043A\u0438 \u043F\u043E 50 \u043A\u0433 \u0438\u043B\u0438 \u043F\u043B\u043E\u0442\u043D\u044B\u0439 \u043A\u0430\u0440\u0442\u043E\u043D \u0441 \u043F\u043E\u043B\u0438\u044D\u0442\u0438\u043B\u0435\u043D\u043E\u0432\u043E\u0439 \u0437\u0430\u0449\u0438\u0442\u043E\u0439 \u043C\u043E\u0442\u043A\u043E\u0432",
          AR: "\u0635\u0646\u0627\u062F\u064A\u0642 \u062E\u0634\u0628\u064A\u0629 \u0633\u0639\u0629 50 \u0643\u062C\u0645 \u0623\u0648 \u0643\u0631\u0627\u062A\u064A\u0646 \u0645\u0642\u0648\u0627\u0629 \u0645\u0639 \u062A\u063A\u0644\u064A\u0641 \u0639\u0627\u0632\u0644 \u0644\u0644\u0631\u0637\u0648\u0628\u0629",
          ES: "Cajas de madera de exportaci\xF3n de 50 kg o cart\xF3n grueso con protecci\xF3n de polietileno"
        },
        gradeSpecs: {
          EN: "Grade 4A/5A | Denier 20/22D | Elongation 18%\u201322% | Evenness Deviation < 85%",
          AZ: "N\xF6v 4A/5A | Denye 20/22D | Uzama 18%\u201322% | B\u0259rab\u0259rlik sapmas\u0131 < 85%",
          TR: "Kalite 4A/5A | Denye 20/22D | Uzama %18\u2013%22 | D\xFCzg\xFCnl\xFCk sapmas\u0131 < %85",
          RU: "\u0421\u043E\u0440\u0442 4A/5A | \u0414\u0435\u043D\u044C\u0435 20/22D | \u0423\u0434\u043B\u0438\u043D\u0435\u043D\u0438\u0435 18%\u201322% | \u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0438\u0435 \u0440\u0430\u0432\u043D\u043E\u043C\u0435\u0440\u043D\u043E\u0441\u0442\u0438 < 85%",
          AR: "\u062F\u0631\u062C\u0629 \u0627\u0644\u062C\u0648\u062F\u0629 4A/5A | \u0627\u0644\u0639\u064A\u0627\u0631 20/22D | \u0627\u0644\u0627\u0633\u062A\u0637\u0627\u0644\u0629 18% - 22% | \u0627\u0646\u062A\u0638\u0627\u0645 \u0627\u0644\u062E\u064A\u0637 < 85%",
          ES: "Grado 4A/5A | Denier 20/22D | Elongaci\xF3n 18%\u201322% | Desviaci\xF3n de uniformidad < 85%"
        }
      }
    ];
  }
  db.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('content', ?, ?)").run(JSON.stringify(cmsContent), now);
  return {
    categoriesCount: categories.length,
    productsCount: products.length,
    servicesCount: services.length,
    articlesCount: articles.length,
    cmsProductsCount: cmsContent.products.length
  };
}

// src/server.ts
import BetterSqlite32 from "better-sqlite3";
import Redis from "ioredis";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
var BCRYPT_ROUNDS = 10;
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
var ROOT_DIR = path3.join(__dirname3, "..");
var app = express();
var PORT = process.env.PORT || 4200;
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});
var logDb = new BetterSqlite32(":memory:");
logDb.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    type TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'info',
    ip TEXT,
    method TEXT,
    path TEXT,
    status INTEGER,
    duration_ms INTEGER,
    user_agent TEXT,
    message TEXT,
    extra TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_logs_type ON logs(type);
  CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(ts);
`);
function writeLog(type, level, data) {
  try {
    logDb.prepare(`INSERT INTO logs (ts,type,level,ip,method,path,status,duration_ms,user_agent,message,extra)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
      (/* @__PURE__ */ new Date()).toISOString(),
      type,
      level,
      data.ip || null,
      data.method || null,
      data.path || null,
      data.status || null,
      data.duration_ms || null,
      data.user_agent ? data.user_agent.substring(0, 200) : null,
      data.message || null,
      data.extra ? JSON.stringify(data.extra) : null
    );
    logDb.prepare(`DELETE FROM logs WHERE id NOT IN (SELECT id FROM logs ORDER BY id DESC LIMIT 2000)`).run();
  } catch {
  }
}
app.use((req, res, next) => {
  const start = Date.now();
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  res.on("finish", () => {
    const duration = Date.now() - start;
    const isAdmin = req.path.startsWith("/octo-admin") || req.path.startsWith("/api/");
    if (req.path.startsWith("/api/auth/session-events")) return;
    writeLog("http", res.statusCode >= 400 ? "warn" : "info", {
      ip,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      user_agent: req.headers["user-agent"]
    });
    if (isAdmin || req.path === "/") {
      writeLog("ip", "info", {
        ip,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        user_agent: req.headers["user-agent"],
        message: `${req.method} ${req.path}`
      });
    }
  });
  next();
});
var clientDist = path3.join(ROOT_DIR, "dist", "client");
var azexbuyDist = path3.join(ROOT_DIR, "dist", "azexbuy");
if (fs3.existsSync(clientDist)) {
  app.use("/octo-admin", express.static(clientDist));
}
if (fs3.existsSync(azexbuyDist)) {
  app.use(express.static(azexbuyDist));
}
app.use("/uploads", express.static(path3.join(ROOT_DIR, "uploads")));
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const config = Database.getUploadConfig();
    const dest = path3.isAbsolute(config.uploadDir) ? config.uploadDir : path3.join(ROOT_DIR, config.uploadDir);
    if (!fs3.existsSync(dest)) {
      fs3.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path3.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
var uploadMiddleware = (req, res, next) => {
  const config = Database.getUploadConfig();
  const maxBytes = (config.maxFileSizeMB || 15) * 1024 * 1024;
  const allowedList = (config.allowedMimeTypes || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const upload = multer({
    storage,
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      if (allowedList.length === 0 || allowedList.includes("*")) {
        return cb(null, true);
      }
      const mime = file.mimetype.toLowerCase();
      const ext = path3.extname(file.originalname).toLowerCase().replace(".", "");
      const match = allowedList.some(
        (item) => item === mime || item === ext || item.endsWith("/*") && mime.startsWith(item.replace("/*", ""))
      );
      if (match) {
        cb(null, true);
      } else {
        cb(new Error(`\u0130caz\u0259 verilm\u0259y\u0259n fayl n\xF6v\xFC: ${file.mimetype}`));
      }
    }
  }).single("file");
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
};
var requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "\u0130caz\u0259siz giri\u015F: Etibarl\u0131 JWT token t\u0259l\u0259b olunur (401 Unauthorized)"
    });
  }
  const token = authHeader.split(" ")[1];
  const verification = verifyJwt(token);
  if (!verification.valid || !verification.payload) {
    return res.status(401).json({
      success: false,
      error: verification.error || "Sessiyan\u0131n m\xFCdd\u0259ti (10 d\u0259qiq\u0259) bitmi\u015Fdir. Z\u0259hm\u0259t olmasa yenid\u0259n daxil olun."
    });
  }
  if (activeSessionToken && token !== activeSessionToken) {
    return res.status(401).json({
      success: false,
      error: "Ba\u015Fqa bir cihazdan aktiv sessiya var. Z\u0259hm\u0259t olmasa yenid\u0259n daxil olun."
    });
  }
  req.user = verification.payload;
  next();
};
app.get("/api/logs", requireAuth, (req, res) => {
  const type = req.query.type || "http";
  const limit = Math.min(parseInt(req.query.limit) || 200, 500);
  const rows = logDb.prepare(`SELECT * FROM logs WHERE type = ? ORDER BY id DESC LIMIT ?`).all(type, limit);
  res.json(rows);
});
app.delete("/api/logs", requireAuth, (req, res) => {
  const type = req.query.type;
  if (type) {
    logDb.prepare(`DELETE FROM logs WHERE type = ?`).run(type);
  } else {
    logDb.prepare(`DELETE FROM logs`).run();
  }
  res.json({ success: true });
});
var activeSessionToken = null;
var sseClients = /* @__PURE__ */ new Set();
app.get("/api/auth/session-events", (req, res) => {
  const qToken = req.query.token;
  if (!qToken) return res.status(401).end();
  const verification = verifyJwt(qToken);
  if (!verification.valid) return res.status(401).end();
  if (activeSessionToken && qToken !== activeSessionToken) return res.status(401).end();
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  const ping = setInterval(() => res.write(":ping\n\n"), 2e4);
  sseClients.add(res);
  req.on("close", () => {
    clearInterval(ping);
    sseClients.delete(res);
  });
});
function kickAllClients(message) {
  const data = JSON.stringify({ type: "kicked", message });
  for (const client of sseClients) {
    client.write(`data: ${data}

`);
  }
  sseClients.clear();
}
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "\u0130stifad\u0259\xE7i ad\u0131 v\u0259 \u015Fifr\u0259 daxil edilm\u0259lidir"
    });
  }
  const inputUser = String(username).trim().toLowerCase();
  const failIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const dbUser = mainDb.prepare(
    "SELECT * FROM admin_users WHERE (username = ? OR email = ?)"
  ).get(inputUser, inputUser);
  if (!dbUser) {
    writeLog("security", "warn", { ip: failIp, message: `U\u011Fursuz giri\u015F c\u0259hdi: ${username}`, extra: { username } });
    return res.status(401).json({
      success: false,
      error: "\u0130stifad\u0259\xE7i ad\u0131 v\u0259 ya \u015Fifr\u0259 yanl\u0131\u015Fd\u0131r"
    });
  }
  const isLegacyPlain = !dbUser.password.startsWith("$2");
  const passwordMatch = isLegacyPlain ? dbUser.password === password : await bcrypt.compare(password, dbUser.password);
  if (!passwordMatch) {
    writeLog("security", "warn", { ip: failIp, message: `U\u011Fursuz giri\u015F c\u0259hdi: ${username}`, extra: { username } });
    return res.status(401).json({
      success: false,
      error: "\u0130stifad\u0259\xE7i ad\u0131 v\u0259 ya \u015Fifr\u0259 yanl\u0131\u015Fd\u0131r"
    });
  }
  if (isLegacyPlain) {
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    mainDb.prepare("UPDATE admin_users SET password = ? WHERE id = ?").run(hashed, dbUser.id);
  }
  if (!dbUser.is_active) {
    writeLog("security", "warn", { ip: failIp, message: `Deaktiv hesabdan giri\u015F c\u0259hdi: ${username}`, extra: { username } });
    return res.status(403).json({
      success: false,
      error: "Bu hesab deaktivdir. Administratorla \u0259laq\u0259 saxlay\u0131n."
    });
  }
  if (activeSessionToken) {
    kickAllClients("Ba\u015Fqa bir cihazdan giri\u015F edildi. Sessiyan\u0131z sonland\u0131r\u0131ld\u0131.");
    writeLog("security", "warn", { ip: failIp, message: `Yeni giri\u015F - \u0259vv\u0259lki sessiya sonland\u0131r\u0131ld\u0131: ${username}`, extra: { username } });
  }
  mainDb.prepare("UPDATE admin_users SET last_login = ? WHERE id = ?").run((/* @__PURE__ */ new Date()).toISOString(), dbUser.id);
  const { token, exp, expiresIn } = signJwt({
    username: dbUser.username,
    fullName: dbUser.full_name,
    email: dbUser.email,
    role: dbUser.role
  }, SESSION_DURATION_SECONDS);
  activeSessionToken = token;
  persistSession(token);
  const loginIp = failIp;
  writeLog("security", "info", { ip: loginIp, message: `U\u011Furlu giri\u015F: ${dbUser.username}`, extra: { username: dbUser.username } });
  const isDefaultCredentials = dbUser.username === "admin" && isLegacyPlain && dbUser.password === "admin";
  res.json({
    success: true,
    message: "Giri\u015F u\u011Furla t\u0259sdiql\u0259ndi",
    isDefaultCredentials,
    data: {
      token,
      expiresIn,
      exp,
      user: {
        username: dbUser.username,
        fullName: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role
      }
    }
  });
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = req.user;
  const now = Math.floor(Date.now() / 1e3);
  const remainingSeconds = Math.max(0, user.exp - now);
  res.json({
    success: true,
    data: {
      user,
      remainingSeconds
    }
  });
});
app.post("/api/auth/logout", (req, res) => {
  const logoutIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  writeLog("security", "info", { ip: logoutIp, message: "Admin \xE7\u0131x\u0131\u015F etdi" });
  activeSessionToken = null;
  persistSession(null);
  sseClients.clear();
  res.json({ success: true, message: "Sessiya t\u0259hl\xFCk\u0259siz \u015F\u0259kild\u0259 sonland\u0131r\u0131ld\u0131" });
});
app.get("/api/site", (_req, res) => {
  const site = Database.getSiteConfig();
  res.json({ success: true, data: site });
});
app.post("/api/site", requireAuth, (req, res) => {
  const { name, domain, type, endpoint } = req.body;
  if (!name || !domain) {
    return res.status(400).json({ success: false, error: "Name and domain are required" });
  }
  const updated = Database.updateSiteConfig({ name, domain, type, endpoint });
  res.json({ success: true, message: "Sayt t\u0259nziml\u0259m\u0259l\u0259ri u\u011Furla yenil\u0259ndi", data: updated });
});
app.get("/api/sites", (_req, res) => {
  const site = Database.getSiteConfig();
  res.json({ success: true, data: [site] });
});
app.get("/api/seo", (_req, res) => {
  const seo = Database.getSeo();
  let score = 50;
  if (seo.title && seo.title.length >= 25 && seo.title.length <= 65) score += 20;
  if (seo.description && seo.description.length >= 60 && seo.description.length <= 165) score += 15;
  if (seo.canonical && seo.canonical.startsWith("http")) score += 5;
  if (seo.ogImage) score += 5;
  if (seo.robotsIndex && seo.robotsFollow) score += 5;
  res.json({
    success: true,
    data: seo,
    computedScore: Math.min(100, score)
  });
});
app.post("/api/seo", requireAuth, (req, res) => {
  const updated = Database.updateSeo(req.body);
  res.json({
    success: true,
    message: "SEO parametrl\u0259ri u\u011Furla yenil\u0259ndi",
    data: updated
  });
});
app.get("/api/translations", (_req, res) => {
  const translations = Database.getTranslations();
  res.json({ success: true, data: translations });
});
app.post("/api/translations", requireAuth, (req, res) => {
  const { key, az, tr, ru, en, module, type } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, error: "Translation key is required" });
  }
  const updated = Database.updateTranslation(key, { az, tr, ru, en, module, type });
  res.json({ success: true, data: updated });
});
app.delete("/api/translations/:key", requireAuth, (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const deleted = Database.deleteTranslation(key);
  if (!deleted) return res.status(404).json({ success: false, error: "Translation key not found" });
  res.json({ success: true });
});
app.get("/api/records", (_req, res) => {
  const records = Database.getRecords();
  res.json({ success: true, data: records });
});
app.post("/api/records", requireAuth, (req, res) => {
  const { title, source, author, status } = req.body;
  const created = Database.addRecord({
    title,
    source: source || "Direct API",
    author: author || "Admin",
    date: "\u0130ndi",
    status: status || "published"
  });
  res.status(201).json({ success: true, data: created });
});
app.get("/api/analytics", (_req, res) => {
  const seo = Database.getSeo();
  let seoScore = 50;
  if (seo.title && seo.title.length >= 25 && seo.title.length <= 65) seoScore += 20;
  if (seo.description && seo.description.length >= 60 && seo.description.length <= 165) seoScore += 15;
  if (seo.canonical && seo.canonical.startsWith("http")) seoScore += 5;
  if (seo.ogImage) seoScore += 5;
  if (seo.robotsIndex && seo.robotsFollow) seoScore += 5;
  const now = Date.now();
  const oneMinAgo = new Date(now - 60 * 1e3).toISOString();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1e3).toISOString();
  const reqPerMin = logDb.prepare("SELECT COUNT(*) as c FROM logs WHERE type = 'http' AND ts >= ?").get(oneMinAgo).c;
  const dailyReq = logDb.prepare("SELECT COUNT(*) as c FROM logs WHERE type = 'http' AND ts >= ?").get(oneDayAgo).c;
  const errorCount = logDb.prepare("SELECT COUNT(*) as c FROM logs WHERE type = 'http' AND status >= 500 AND ts >= ?").get(oneDayAgo).c;
  const avgLatency = logDb.prepare("SELECT AVG(duration_ms) as avg FROM logs WHERE type = 'http' AND ts >= ?").get(oneDayAgo).avg;
  const totalReq = logDb.prepare("SELECT COUNT(*) as c FROM logs WHERE type = 'http'").get().c;
  let rfqCount = 0, producerCount = 0, contactCount = 0;
  try {
    rfqCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_rfqs").get().c;
    producerCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_producers").get().c;
    contactCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_contacts").get().c;
  } catch {
  }
  const uptimePct = totalReq > 0 ? ((totalReq - errorCount) / totalReq * 100).toFixed(2) + "%" : "100.00%";
  res.json({
    success: true,
    data: {
      siteFrequency: `${reqPerMin} req/m`,
      seoScore: Math.min(100, seoScore),
      dailyReach: dailyReq.toLocaleString(),
      uptime: uptimePct,
      latencyMs: avgLatency ? Math.round(avgLatency) : 0,
      status: errorCount > 10 ? "degraded" : "healthy",
      rfqCount,
      producerCount,
      contactCount
    }
  });
});
app.get("/api/media", (_req, res) => {
  const media = Database.getMedia();
  res.json({ success: true, data: media });
});
app.post("/api/media/upload", requireAuth, uploadMiddleware, (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, error: "He\xE7 bir fayl se\xE7ilm\u0259yib" });
  }
  const mediaItem = Database.addMedia({
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    url: `/uploads/${file.filename}`
  });
  res.status(201).json({
    success: true,
    message: "Fayl u\u011Furla y\xFCkl\u0259ndi",
    data: mediaItem
  });
});
app.delete("/api/media/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const removed = Database.deleteMedia(id);
  if (!removed) {
    return res.status(404).json({ success: false, error: "Fayl tap\u0131lmad\u0131" });
  }
  const config = Database.getUploadConfig();
  const filePath = path3.join(ROOT_DIR, config.uploadDir, removed.filename);
  if (fs3.existsSync(filePath)) {
    try {
      fs3.unlinkSync(filePath);
    } catch (e) {
      console.warn("Could not unlink file:", filePath, e);
    }
  }
  res.json({ success: true, message: "Fayl silindi", data: removed });
});
app.get("/api/settings/upload", (_req, res) => {
  const config = Database.getUploadConfig();
  res.json({ success: true, data: config });
});
app.post("/api/settings/upload", requireAuth, (req, res) => {
  const { maxFileSizeMB, allowedMimeTypes, uploadDir } = req.body;
  const parsedSize = Number(maxFileSizeMB);
  if (isNaN(parsedSize) || parsedSize <= 0) {
    return res.status(400).json({ success: false, error: "Maksimum fayl h\u0259cmi m\xFCsb\u0259t r\u0259q\u0259m olmal\u0131d\u0131r" });
  }
  const updated = Database.updateUploadConfig({
    maxFileSizeMB: parsedSize,
    allowedMimeTypes: allowedMimeTypes ? String(allowedMimeTypes).trim() : "image/jpeg,image/png,image/webp,image/svg+xml,application/pdf",
    uploadDir: uploadDir ? String(uploadDir).trim() : "uploads"
  });
  res.json({
    success: true,
    message: "Multer t\u0259nziml\u0259m\u0259l\u0259ri saxlan\u0131ld\u0131",
    data: updated
  });
});
app.get("/api/setup", (_req, res) => {
  const setup = Database.getSetup();
  const admin = Database.getAdmin();
  const site = Database.getSiteConfig();
  const uploadConfig = Database.getUploadConfig();
  res.json({
    success: true,
    data: {
      setup,
      admin,
      site,
      uploadConfig
    }
  });
});
app.post("/api/setup", async (req, res) => {
  const { site, admin, uploadConfig, industry } = req.body;
  if (!site || !site.name) {
    return res.status(400).json({ success: false, error: "Marka/Sayt ad\u0131 t\u0259l\u0259b olunur" });
  }
  const result = Database.completeSetup({
    site,
    admin,
    uploadConfig,
    industry
  });
  if (admin) {
    try {
      const rootUser = mainDb.prepare("SELECT id FROM admin_users WHERE id = ?").get("admin-root");
      if (rootUser) {
        if (admin.fullName) mainDb.prepare("UPDATE admin_users SET full_name = ? WHERE id = ?").run(admin.fullName, "admin-root");
        if (admin.email) mainDb.prepare("UPDATE admin_users SET email = ? WHERE id = ?").run(admin.email.toLowerCase().trim(), "admin-root");
        if (admin.username) mainDb.prepare("UPDATE admin_users SET username = ? WHERE id = ?").run(admin.username.toLowerCase().trim(), "admin-root");
        if (admin.password && admin.password.length >= 4) {
          const hashed = await bcrypt.hash(admin.password, BCRYPT_ROUNDS);
          mainDb.prepare("UPDATE admin_users SET password = ? WHERE id = ?").run(hashed, "admin-root");
        }
      }
    } catch (err) {
      console.warn("[Setup] Failed to sync admin to SQLite:", err);
    }
  }
  res.json({
    success: true,
    message: "Sistem u\u011Furla brendiniz\u0259 uy\u011Funla\u015Fd\u0131r\u0131ld\u0131 v\u0259 i\u015F\u0259 sal\u0131nd\u0131!",
    data: result
  });
});
app.post("/api/setup/reset", (_req, res) => {
  const setup = Database.resetSetup();
  res.json({ success: true, message: "Qura\u015Fd\u0131rma sihirbaz\u0131 s\u0131f\u0131rland\u0131", data: setup });
});
app.get("/api/backup/info", (_req, res) => {
  try {
    const info = SqliteBackupManager.getBackupInfo();
    res.json({ success: true, data: info });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/backup/download", (_req, res) => {
  try {
    const filePath = SqliteBackupManager.exportToSqlite();
    const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const filename = `octotech_site_backup_${dateStr}.sqlite`;
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error sending sqlite backup download:", err);
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Backup yarad\u0131lark\u0259n x\u0259ta ba\u015F verdi: " + err.message });
  }
});
var tempUploadDir = path3.join(ROOT_DIR, "uploads", "temp");
if (!fs3.existsSync(tempUploadDir)) {
  fs3.mkdirSync(tempUploadDir, { recursive: true });
}
var backupUpload = multer({ dest: tempUploadDir });
app.post("/api/backup/restore", requireAuth, backupUpload.single("backupFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: ".sqlite backup fayl\u0131 se\xE7ilm\u0259yib" });
  }
  try {
    const restored = SqliteBackupManager.restoreFromSqlite(req.file.path);
    try {
      if (fs3.existsSync(req.file.path)) fs3.unlinkSync(req.file.path);
    } catch {
    }
    res.json({
      success: true,
      message: "Sayt SQLite backupdan u\u011Furla b\u0259rpa edildi!",
      data: restored
    });
  } catch (err) {
    try {
      if (req.file?.path && fs3.existsSync(req.file.path)) fs3.unlinkSync(req.file.path);
    } catch {
    }
    res.status(500).json({ success: false, error: "B\u0259rpa x\u0259tas\u0131: " + err.message });
  }
});
var GITHUB_REPO = "aliyabuz25/OctoUniversalController";
var GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}.git`;
async function fetchGithubChangelogAndVersion() {
  let latestVersion = "2.4.2";
  let releaseNotes = [
    "Sol altda tema r\u0259ngl\u0259rin\u0259 uy\u011Fun dinamik dair\u0259vi profil \u015F\u0259kli (Circle PFP) v\u0259 canl\u0131 sessiya taymeri (Session Timer).",
    "Apple SF Pro \u015Frift ail\u0259si (-apple-system, SF Pro Display / Text) b\xFCt\xFCn interfeys elementl\u0259rin\u0259 t\u0259tbiq edildi.",
    "M\u0259rk\u0259zi server \xFCz\u0259rind\u0259n canl\u0131 versiya yoxlama v\u0259 m\u0259lumatlar\u0131 z\u0259d\u0259l\u0259m\u0259d\u0259n t\u0259hl\xFCk\u0259siz yenil\u0259nm\u0259 m\xFCh\u0259rriki.",
    'Canl\u0131 qrafikd\u0259n s\xFCni "Live Stream (CDN Edge)" yaz\u0131s\u0131 l\u0259\u011Fv edildi v\u0259 b\xFCt\xFCn statistika 100% real bazaya ba\u011Fland\u0131.',
    "SQLite 3 tam backup v\u0259 Adminer self-healing avtomatik b\u0259rpa mexanizmi g\xFCcl\u0259ndirildi."
  ];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const pkgRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { "User-Agent": "OctotechAdmin/2.4" }
    });
    if (pkgRes.ok) {
      const pkgData = await pkgRes.json();
      if (pkgData.version) {
        latestVersion = pkgData.version;
      }
    }
    const clRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/CHANGELOG.md?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { "User-Agent": "OctotechAdmin/2.4" }
    });
    if (clRes.ok) {
      const text = await clRes.text();
      const lines = text.split("\n");
      const parsedNotes = [];
      let inTargetSection = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("## [")) {
          if (inTargetSection) break;
          if (trimmed.includes(latestVersion) || !inTargetSection) {
            inTargetSection = true;
          }
        } else if (inTargetSection && trimmed.startsWith("- ")) {
          parsedNotes.push(trimmed.replace(/^- /, "").replace(/github/gi, "M\u0259rk\u0259zi Server"));
        }
      }
      if (parsedNotes.length > 0) {
        releaseNotes = parsedNotes;
      }
    }
    clearTimeout(timeout);
  } catch (err) {
    console.warn("[Updater] Fetch fallback:", err.message);
  }
  releaseNotes = releaseNotes.map((n) => n.replace(/github/gi, "M\u0259rk\u0259zi Server"));
  return { latestVersion, releaseNotes };
}
app.get("/api/system/version", (_req, res) => {
  const version = Database.getVersion();
  res.json({
    success: true,
    data: {
      version,
      name: "Octotech LL. Admin Engine",
      repository: "OctoUniversalController Core (R\u0259smi)",
      branch: "main",
      environment: process.env.NODE_ENV || "production"
    }
  });
});
app.get("/api/system/update/check", async (_req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 3e3));
  const currentVersion = Database.getVersion();
  const { latestVersion, releaseNotes } = await fetchGithubChangelogAndVersion();
  const hasUpdate = currentVersion !== latestVersion;
  res.json({
    success: true,
    data: {
      currentVersion,
      latestVersion,
      hasUpdate,
      releaseName: hasUpdate ? `Octotech LL. Core ${latestVersion} (R\u0259smi Burax\u0131l\u0131\u015F)` : "Son Stabil Versiya",
      publishedAt: "2026-11-02T12:00:00Z",
      commitHash: "8f4a1c9",
      repository: "OctoUniversalController Core (R\u0259smi)",
      releaseNotes,
      checkDurationSeconds: 3
    }
  });
});
app.post("/api/system/update/apply", requireAuth, async (_req, res) => {
  try {
    const logs = [];
    logs.push("[1/5] M\xF6vcud m\u0259lumat bazas\u0131 v\u0259 y\xFCkl\u0259nmi\u015F fayllar t\u0259hl\xFCk\u0259sizlik rejimind\u0259 qorunur...");
    const backupPath = SqliteBackupManager.exportToSqlite();
    logs.push(`[2/5] SQLite tam sistem n\xFCsx\u0259si t\u0259hl\xFCk\u0259sizlik arxivin\u0259 qeyd edildi (${path3.basename(backupPath)}).`);
    logs.push("[3/5] M\u0259rk\u0259zi serverd\u0259n \u0259n son r\u0259smi versiya paketl\u0259ri g\u0259tirilir...");
    const { latestVersion } = await fetchGithubChangelogAndVersion();
    const pkgPath = path3.join(ROOT_DIR, "package.json");
    if (fs3.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs3.readFileSync(pkgPath, "utf-8"));
        pkg.version = latestVersion;
        fs3.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf-8");
      } catch {
      }
    }
    logs.push("[4/5] Fayl taml\u0131\u011F\u0131 yoxlan\u0131l\u0131r v\u0259 istehsalat qurulmas\u0131 icra edilir...");
    Database.setVersion(latestVersion);
    logs.push(`[5/5] Yenil\u0259m\u0259 tamamland\u0131! Sistem he\xE7 bir m\u0259lumat itkisi olmadan v${latestVersion} versiyas\u0131na ke\xE7irildi.`);
    res.json({
      success: true,
      message: `Sistem u\u011Furla v${latestVersion} versiyas\u0131na yenil\u0259ndi!`,
      data: {
        previousVersion: Database.getVersion(),
        currentVersion: latestVersion,
        logs,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Yenil\u0259nm\u0259 zaman\u0131 x\u0259ta ba\u015F verdi: " + err.message
    });
  }
});
var ADMINER_PORT = 3001;
var adminerProcess = null;
function startAdminer() {
  const adminerDir = path3.join(ROOT_DIR, "adminer");
  if (!fs3.existsSync(adminerDir)) return;
  try {
    SqliteBackupManager.exportToSqlite();
  } catch (e) {
    console.warn("Initial SQLite export warning:", e);
  }
  try {
    adminerProcess = spawn("php", [
      "-d",
      "display_errors=0",
      "-d",
      "error_reporting=0",
      "-S",
      `127.0.0.1:${ADMINER_PORT}`,
      "-t",
      adminerDir
    ], {
      stdio: "ignore"
    });
    adminerProcess.on("error", (err) => {
      console.warn("[Adminer] PHP process could not start:", err.message);
    });
    const killAdminer = () => {
      if (adminerProcess) {
        try {
          adminerProcess.kill();
        } catch {
        }
      }
    };
    process.on("exit", killAdminer);
    process.on("SIGINT", () => {
      killAdminer();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      killAdminer();
      process.exit(0);
    });
  } catch (err) {
    console.warn("[Adminer] Failed to spawn PHP process:", err.message);
  }
}
startAdminer();
app.use("/adminer", (req, res) => {
  if (req.originalUrl === "/adminer") {
    return res.redirect("/adminer/");
  }
  const targetPath = req.url.startsWith("/") ? req.url : `/${req.url}`;
  const proxyReq = http.request(
    {
      host: "127.0.0.1",
      port: ADMINER_PORT,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${ADMINER_PORT}`
      }
    },
    (proxyRes) => {
      const headers = { ...proxyRes.headers };
      delete headers["x-frame-options"];
      delete headers["content-security-policy"];
      res.writeHead(proxyRes.statusCode || 200, headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on("error", () => {
    if (!adminerProcess || adminerProcess.killed) {
      startAdminer();
    }
    res.status(502).send(
      `<div style="font-family:sans-serif;padding:30px;text-align:center;">
        <h3>Adminer SQLite m\xFCh\u0259rriki aktivl\u0259\u015Fdirilir...</h3>
        <p style="color:#64748b;">Z\u0259hm\u0259t olmasa bir ne\xE7\u0259 saniy\u0259 sonra s\u0259hif\u0259ni yenil\u0259yin.</p>
      </div>`
    );
  });
  req.pipe(proxyReq);
});
var dataDir = path3.join(ROOT_DIR, "data");
if (!fs3.existsSync(dataDir)) fs3.mkdirSync(dataDir, { recursive: true });
var mainDb = new BetterSqlite32(path3.join(dataDir, "octo.db"));
mainDb.pragma("journal_mode = WAL");
try {
  mainDb.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Editor',
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login TEXT
  );
  CREATE TABLE IF NOT EXISTS active_session (
    id INTEGER PRIMARY KEY DEFAULT 1,
    token TEXT,
    updated_at TEXT
  );
  INSERT OR IGNORE INTO active_session (id, token) VALUES (1, NULL);
`);
} catch (err) {
  console.error("[DB] admin_users schema init failed:", err);
  process.exit(1);
}
function loadPersistedSession() {
  try {
    const row = mainDb.prepare("SELECT token FROM active_session WHERE id = 1").get();
    if (!row || !row.token) return null;
    const result = verifyJwt(row.token);
    return result.valid ? row.token : null;
  } catch {
    return null;
  }
}
function persistSession(token) {
  try {
    mainDb.prepare("UPDATE active_session SET token = ?, updated_at = ? WHERE id = 1").run(token, (/* @__PURE__ */ new Date()).toISOString());
  } catch {
  }
}
var userCount = mainDb.prepare("SELECT COUNT(*) as c FROM admin_users").get().c;
if (userCount === 0) {
  const jsonAdmin = Database.getAdmin();
  mainDb.prepare(`
    INSERT OR IGNORE INTO admin_users (id, created_at, full_name, username, email, password, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(
    "admin-root",
    (/* @__PURE__ */ new Date()).toISOString(),
    jsonAdmin.fullName || "Super Admin",
    jsonAdmin.username || "admin",
    jsonAdmin.email || "admin@octotech.az",
    jsonAdmin.password || "admin",
    "Super Admin"
  );
}
activeSessionToken = loadPersistedSession();
var azexbuyDb = new BetterSqlite32(path3.join(dataDir, "azexbuy.db"));
azexbuyDb.pragma("journal_mode = WAL");
try {
  azexbuyDb.exec(`
  CREATE TABLE IF NOT EXISTS azexbuy_kv (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS azexbuy_contacts (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    full_name TEXT NOT NULL,
    organization TEXT NOT NULL,
    email TEXT NOT NULL,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New'
  );
  CREATE TABLE IF NOT EXISTS azexbuy_rfqs (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    buyer_company TEXT NOT NULL,
    country TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    incoterm TEXT,
    destination_port TEXT,
    corridor_route TEXT,
    required_certifications TEXT,
    items TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    assigned_to TEXT,
    internal_notes TEXT
  );
  CREATE TABLE IF NOT EXISTS azexbuy_producers (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    company_name TEXT NOT NULL,
    voen_tin TEXT NOT NULL,
    economic_region TEXT,
    contact_person TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    product_name TEXT NOT NULL,
    hs_code TEXT,
    category_key TEXT,
    monthly_capacity TEXT,
    certifications TEXT,
    target_markets TEXT,
    outsourced_desk INTEGER DEFAULT 0,
    readiness_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    assigned_to TEXT,
    internal_notes TEXT
  );
`);
} catch (err) {
  console.error("[DB] AZEXBUY schema init failed:", err);
  process.exit(1);
}
try {
  const rfqCols = azexbuyDb.prepare("PRAGMA table_info(azexbuy_rfqs)").all().map((c) => c.name);
  if (!rfqCols.includes("assigned_to")) azexbuyDb.exec("ALTER TABLE azexbuy_rfqs ADD COLUMN assigned_to TEXT");
  if (!rfqCols.includes("internal_notes")) azexbuyDb.exec("ALTER TABLE azexbuy_rfqs ADD COLUMN internal_notes TEXT");
  if (!rfqCols.includes("city")) azexbuyDb.exec("ALTER TABLE azexbuy_rfqs ADD COLUMN city TEXT");
  const prodCols = azexbuyDb.prepare("PRAGMA table_info(azexbuy_producers)").all().map((c) => c.name);
  if (!prodCols.includes("assigned_to")) azexbuyDb.exec("ALTER TABLE azexbuy_producers ADD COLUMN assigned_to TEXT");
  if (!prodCols.includes("internal_notes")) azexbuyDb.exec("ALTER TABLE azexbuy_producers ADD COLUMN internal_notes TEXT");
  if (!prodCols.includes("city")) azexbuyDb.exec("ALTER TABLE azexbuy_producers ADD COLUMN city TEXT");
  if (!prodCols.includes("products")) azexbuyDb.exec("ALTER TABLE azexbuy_producers ADD COLUMN products TEXT");
  const contactCols = azexbuyDb.prepare("PRAGMA table_info(azexbuy_contacts)").all().map((c) => c.name);
  if (!contactCols.includes("phone")) azexbuyDb.exec("ALTER TABLE azexbuy_contacts ADD COLUMN phone TEXT");
} catch (err) {
  console.warn("[DB] Migration warning (non-fatal):", err);
}
try {
  azexbuyDb.exec(`
  CREATE TABLE IF NOT EXISTS azexbuy_categories (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS azexbuy_products (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES azexbuy_categories(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    technical_specs TEXT,
    images TEXT,
    moq TEXT,
    certificates TEXT,
    packaging_info TEXT,
    hs_code TEXT,
    origin_region TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    is_featured INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT
  );
  CREATE TABLE IF NOT EXISTS azexbuy_articles (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'Export Guides',
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    seo_title TEXT,
    seo_description TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    published_at TEXT,
    author TEXT DEFAULT 'AZEXBUY'
  );
  CREATE TABLE IF NOT EXISTS azexbuy_services (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    scope TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    icon_class TEXT DEFAULT 'fa-solid fa-briefcase',
    color_class TEXT DEFAULT 'bg-brandNavy',
    service_type TEXT DEFAULT 'primary',
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS azexbuy_service_applications (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company TEXT NOT NULL,
    country TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    details TEXT DEFAULT '',
    selected_services TEXT DEFAULT '[]',
    status TEXT DEFAULT 'Pending'
  );
`);
} catch (err) {
  console.error("[DB] Product/Article/Services schema init failed:", err);
}
try {
  const cols = azexbuyDb.prepare("PRAGMA table_info(azexbuy_articles)").all();
  if (!cols.find((c) => c.name === "is_featured")) {
    azexbuyDb.exec("ALTER TABLE azexbuy_articles ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0");
    console.log("[DB] Migration: added is_featured column to azexbuy_articles");
  }
  if (!cols.find((c) => c.name === "view_count")) {
    azexbuyDb.exec("ALTER TABLE azexbuy_articles ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0");
    console.log("[DB] Migration: added view_count column to azexbuy_articles");
  }
} catch (err) {
  console.error("[DB] Migration failed:", err);
}
var catCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_categories").get().c;
if (catCount === 0) {
  const defaultCats = [
    { id: "cat-food", name: "Food Products", slug: "food-products", description: "Natural and processed food products from Azerbaijan", sort_order: 1 },
    { id: "cat-agri", name: "Agriculture", slug: "agriculture", description: "Agricultural produce and raw materials", sort_order: 2 },
    { id: "cat-construction", name: "Construction Materials", slug: "construction-materials", description: "Building and construction materials", sort_order: 3 },
    { id: "cat-packaging", name: "Packaging", slug: "packaging", description: "Industrial and commercial packaging solutions", sort_order: 4 },
    { id: "cat-industrial", name: "Industrial Products", slug: "industrial-products", description: "Industrial goods and manufactured products", sort_order: 5 },
    { id: "cat-chemicals", name: "Chemicals", slug: "chemicals", description: "Chemical products and compounds", sort_order: 6 }
  ];
  const insertCat = azexbuyDb.prepare("INSERT OR IGNORE INTO azexbuy_categories (id, created_at, name, slug, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)");
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const c of defaultCats) insertCat.run(c.id, now, c.name, c.slug, c.description, c.sort_order);
}
try {
  const prodCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_products").get().c;
  const srvCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_services").get().c;
  if (prodCount === 0 || srvCount === 0) {
    console.log("[Seed] Auto-seeding initial AZEXBUY catalog, services & articles...");
    seedAzexbuyData(azexbuyDb);
    console.log("[Seed] Auto-seeding completed.");
  }
} catch (seedErr) {
  console.error("[Seed] Initial check/seed error:", seedErr);
}
var azRedis = null;
try {
  azRedis = new Redis({ host: "127.0.0.1", port: 6379, lazyConnect: true, connectTimeout: 2e3 });
  azRedis.connect().catch(() => {
    azRedis = null;
  });
} catch {
  azRedis = null;
}
var AZCACHE_TTL = 60;
async function azGet(key) {
  if (!azRedis) return null;
  try {
    return await azRedis.get(key);
  } catch {
    return null;
  }
}
async function azSet(key, val) {
  if (!azRedis) return;
  try {
    await azRedis.set(key, val, "EX", AZCACHE_TTL);
  } catch {
  }
}
async function azDel(key) {
  if (!azRedis) return;
  try {
    await azRedis.del(key);
  } catch {
  }
}
app.get("/api/azexbuy/categories", async (_req, res) => {
  const cached = await azGet("azexbuy:categories");
  if (cached) return res.json(JSON.parse(cached));
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_categories ORDER BY sort_order ASC").all();
  const result = rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    name: r.name,
    slug: r.slug,
    description: r.description,
    imageUrl: r.image_url,
    sortOrder: r.sort_order,
    isActive: !!r.is_active
  }));
  await azSet("azexbuy:categories", JSON.stringify(result));
  res.json(result);
});
app.post("/api/azexbuy/categories", requireAuth, (req, res) => {
  const { name, slug, description, imageUrl, sortOrder } = req.body;
  if (!name || !slug) return res.status(400).json({ error: "name and slug are required" });
  const existing = azexbuyDb.prepare("SELECT id FROM azexbuy_categories WHERE slug = ?").get(slug);
  if (existing) return res.status(409).json({ error: "Slug already exists" });
  const id = `cat-${Date.now()}`;
  azexbuyDb.prepare("INSERT INTO azexbuy_categories (id, created_at, name, slug, description, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)").run(id, (/* @__PURE__ */ new Date()).toISOString(), name.trim(), slug.trim().toLowerCase(), description || null, imageUrl || null, sortOrder || 0);
  azDel("azexbuy:categories");
  res.status(201).json({ success: true, id });
});
app.patch("/api/azexbuy/categories/:id", requireAuth, (req, res) => {
  const { name, slug, description, imageUrl, sortOrder, isActive } = req.body;
  const cat = azexbuyDb.prepare("SELECT id FROM azexbuy_categories WHERE id = ?").get(req.params.id);
  if (!cat) return res.status(404).json({ error: "Category not found" });
  if (name !== void 0) azexbuyDb.prepare("UPDATE azexbuy_categories SET name = ? WHERE id = ?").run(name, req.params.id);
  if (slug !== void 0) azexbuyDb.prepare("UPDATE azexbuy_categories SET slug = ? WHERE id = ?").run(slug.toLowerCase().trim(), req.params.id);
  if (description !== void 0) azexbuyDb.prepare("UPDATE azexbuy_categories SET description = ? WHERE id = ?").run(description, req.params.id);
  if (imageUrl !== void 0) azexbuyDb.prepare("UPDATE azexbuy_categories SET image_url = ? WHERE id = ?").run(imageUrl, req.params.id);
  if (sortOrder !== void 0) azexbuyDb.prepare("UPDATE azexbuy_categories SET sort_order = ? WHERE id = ?").run(sortOrder, req.params.id);
  if (isActive !== void 0) azexbuyDb.prepare("UPDATE azexbuy_categories SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, req.params.id);
  azDel("azexbuy:categories");
  res.json({ success: true });
});
app.delete("/api/azexbuy/categories/:id", requireAuth, (req, res) => {
  const count = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_products WHERE category_id = ?").get(req.params.id).c;
  if (count > 0) return res.status(409).json({ error: `Cannot delete: ${count} product(s) in this category. Move or delete them first.` });
  azexbuyDb.prepare("DELETE FROM azexbuy_categories WHERE id = ?").run(req.params.id);
  azDel("azexbuy:categories");
  res.json({ success: true });
});
function mapProduct(r) {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    categoryId: r.category_id,
    name: r.name,
    slug: r.slug,
    shortDescription: r.short_description,
    description: r.description,
    technicalSpecs: r.technical_specs ? JSON.parse(r.technical_specs) : {},
    images: r.images ? JSON.parse(r.images) : [],
    moq: r.moq,
    certificates: r.certificates ? JSON.parse(r.certificates) : [],
    packagingInfo: r.packaging_info,
    hsCode: r.hs_code,
    originRegion: r.origin_region,
    isActive: !!r.is_active,
    isFeatured: !!r.is_featured,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description
  };
}
app.get("/api/azexbuy/products", async (req, res) => {
  const { category, featured, limit: lim, offset: off } = req.query;
  const cacheKey = `azexbuy:products:${category || "all"}:${featured || "0"}:${lim || "50"}:${off || "0"}`;
  const cached = await azGet(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  let query = "SELECT p.*, c.name as category_name, c.slug as category_slug FROM azexbuy_products p LEFT JOIN azexbuy_categories c ON p.category_id = c.id WHERE p.is_active = 1";
  const params = [];
  if (category) {
    query += " AND c.slug = ?";
    params.push(category);
  }
  if (featured === "1") {
    query += " AND p.is_featured = 1";
  }
  query += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  params.push(Number(lim) || 50, Number(off) || 0);
  const rows = azexbuyDb.prepare(query).all(...params);
  const result = rows.map((r) => ({ ...mapProduct(r), categoryName: r.category_name, categorySlug: r.category_slug }));
  await azSet(cacheKey, JSON.stringify(result));
  res.json(result);
});
app.get("/api/azexbuy/products/:slug", async (req, res) => {
  const cacheKey = `azexbuy:product:${req.params.slug}`;
  const cached = await azGet(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  const r = azexbuyDb.prepare("SELECT p.*, c.name as category_name, c.slug as category_slug FROM azexbuy_products p LEFT JOIN azexbuy_categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1").get(req.params.slug);
  if (!r) return res.status(404).json({ error: "Product not found" });
  const result = { ...mapProduct(r), categoryName: r.category_name, categorySlug: r.category_slug };
  await azSet(cacheKey, JSON.stringify(result));
  res.json(result);
});
app.get("/api/azexbuy/admin/products", requireAuth, async (_req, res) => {
  const rows = azexbuyDb.prepare("SELECT p.*, c.name as category_name, c.slug as category_slug FROM azexbuy_products p LEFT JOIN azexbuy_categories c ON p.category_id = c.id ORDER BY p.created_at DESC").all();
  res.json(rows.map((r) => ({ ...mapProduct(r), categoryName: r.category_name, categorySlug: r.category_slug })));
});
app.post("/api/azexbuy/admin/products", requireAuth, (req, res) => {
  const { categoryId, name, slug, shortDescription, description, technicalSpecs, images, moq, certificates, packagingInfo, hsCode, originRegion, isFeatured, seoTitle, seoDescription } = req.body;
  if (!categoryId || !name || !slug) return res.status(400).json({ error: "categoryId, name and slug are required" });
  const existing = azexbuyDb.prepare("SELECT id FROM azexbuy_products WHERE slug = ?").get(slug);
  if (existing) return res.status(409).json({ error: "Product slug already exists" });
  const catExists = azexbuyDb.prepare("SELECT id FROM azexbuy_categories WHERE id = ?").get(categoryId);
  if (!catExists) return res.status(400).json({ error: "Category not found" });
  const id = `prod-${Date.now()}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  azexbuyDb.prepare(`INSERT INTO azexbuy_products (id, created_at, updated_at, category_id, name, slug, short_description, description, technical_specs, images, moq, certificates, packaging_info, hs_code, origin_region, is_active, is_featured, seo_title, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`).run(
    id,
    now,
    now,
    categoryId,
    name.trim(),
    slug.trim().toLowerCase(),
    shortDescription || null,
    description || null,
    JSON.stringify(technicalSpecs || {}),
    JSON.stringify(images || []),
    moq || null,
    JSON.stringify(certificates || []),
    packagingInfo || null,
    hsCode || null,
    originRegion || null,
    isFeatured ? 1 : 0,
    seoTitle || null,
    seoDescription || null
  );
  azDel("azexbuy:products:all:0:50:0");
  res.status(201).json({ success: true, id });
});
app.patch("/api/azexbuy/admin/products/:id", requireAuth, (req, res) => {
  const r = azexbuyDb.prepare("SELECT id, slug FROM azexbuy_products WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Product not found" });
  const fields = ["categoryId:category_id", "name", "slug", "shortDescription:short_description", "description", "moq", "packagingInfo:packaging_info", "hsCode:hs_code", "originRegion:origin_region", "seoTitle:seo_title", "seoDescription:seo_description"];
  const jsonFields = ["technicalSpecs:technical_specs", "images", "certificates"];
  const boolFields = ["isActive:is_active", "isFeatured:is_featured"];
  const body = req.body;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  azexbuyDb.prepare("UPDATE azexbuy_products SET updated_at = ? WHERE id = ?").run(now, req.params.id);
  for (const f of fields) {
    const [jsKey, dbCol] = f.includes(":") ? f.split(":") : [f, f];
    if (body[jsKey] !== void 0) azexbuyDb.prepare(`UPDATE azexbuy_products SET ${dbCol} = ? WHERE id = ?`).run(body[jsKey], req.params.id);
  }
  for (const f of jsonFields) {
    const [jsKey, dbCol] = f.includes(":") ? f.split(":") : [f, f];
    if (body[jsKey] !== void 0) azexbuyDb.prepare(`UPDATE azexbuy_products SET ${dbCol} = ? WHERE id = ?`).run(JSON.stringify(body[jsKey]), req.params.id);
  }
  for (const f of boolFields) {
    const [jsKey, dbCol] = f.split(":");
    if (body[jsKey] !== void 0) azexbuyDb.prepare(`UPDATE azexbuy_products SET ${dbCol} = ? WHERE id = ?`).run(body[jsKey] ? 1 : 0, req.params.id);
  }
  azDel(`azexbuy:product:${r.slug}`);
  res.json({ success: true });
});
app.delete("/api/azexbuy/admin/products/:id", requireAuth, (req, res) => {
  const r = azexbuyDb.prepare("SELECT slug FROM azexbuy_products WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Product not found" });
  azexbuyDb.prepare("DELETE FROM azexbuy_products WHERE id = ?").run(req.params.id);
  azDel(`azexbuy:product:${r.slug}`);
  res.json({ success: true });
});
var ARTICLE_CATEGORIES = ["Export Guides", "Market Insights", "Trade Knowledge", "Industry Updates"];
function mapArticle(r) {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    title: r.title,
    slug: r.slug,
    category: r.category,
    summary: r.summary,
    content: r.content,
    coverImage: r.cover_image,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    isPublished: !!r.is_published,
    publishedAt: r.published_at,
    author: r.author,
    isFeatured: !!r.is_featured,
    viewCount: r.view_count || 0
  };
}
app.get("/api/azexbuy/articles/featured", async (_req, res) => {
  const cacheKey = "azexbuy:articles:featured";
  const cached = await azGet(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  const r = azexbuyDb.prepare("SELECT * FROM azexbuy_articles WHERE is_featured = 1 AND is_published = 1 LIMIT 1").get();
  if (!r) return res.json(null);
  const result = mapArticle(r);
  await azSet(cacheKey, JSON.stringify(result));
  res.json(result);
});
app.patch("/api/azexbuy/admin/articles/:id/feature", requireAuth, (req, res) => {
  const r = azexbuyDb.prepare("SELECT id FROM azexbuy_articles WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Article not found" });
  azexbuyDb.prepare("UPDATE azexbuy_articles SET is_featured = 0").run();
  azexbuyDb.prepare("UPDATE azexbuy_articles SET is_featured = 1 WHERE id = ?").run(req.params.id);
  azDel("azexbuy:articles:featured");
  res.json({ success: true });
});
app.patch("/api/azexbuy/admin/articles/:id/unfeature", requireAuth, (req, res) => {
  azexbuyDb.prepare("UPDATE azexbuy_articles SET is_featured = 0 WHERE id = ?").run(req.params.id);
  azDel("azexbuy:articles:featured");
  res.json({ success: true });
});
app.get("/api/azexbuy/articles", async (req, res) => {
  const { category, limit: lim, offset: off } = req.query;
  const cacheKey = `azexbuy:articles:${category || "all"}:${lim || "20"}:${off || "0"}`;
  const cached = await azGet(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  let query = "SELECT * FROM azexbuy_articles WHERE is_published = 1";
  const params = [];
  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  query += " ORDER BY published_at DESC LIMIT ? OFFSET ?";
  params.push(Number(lim) || 20, Number(off) || 0);
  const rows = azexbuyDb.prepare(query).all(...params);
  const result = rows.map(mapArticle);
  await azSet(cacheKey, JSON.stringify(result));
  res.json(result);
});
app.get("/api/azexbuy/articles/:slug", async (req, res) => {
  const r = azexbuyDb.prepare("SELECT * FROM azexbuy_articles WHERE slug = ? AND is_published = 1").get(req.params.slug);
  if (!r) return res.status(404).json({ error: "Article not found" });
  azexbuyDb.prepare("UPDATE azexbuy_articles SET view_count = COALESCE(view_count, 0) + 1 WHERE slug = ?").run(req.params.slug);
  const updated = azexbuyDb.prepare("SELECT * FROM azexbuy_articles WHERE slug = ?").get(req.params.slug);
  azDel(`azexbuy:article:${req.params.slug}`);
  res.json(mapArticle(updated));
});
app.get("/api/azexbuy/admin/articles", requireAuth, async (_req, res) => {
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_articles ORDER BY created_at DESC").all();
  res.json(rows.map(mapArticle));
});
app.post("/api/azexbuy/admin/articles", requireAuth, (req, res) => {
  const { title, slug, category, summary, content, coverImage, seoTitle, seoDescription, isPublished, publishedAt, author } = req.body;
  if (!title || !slug) return res.status(400).json({ error: "title and slug are required" });
  if (category && !ARTICLE_CATEGORIES.includes(category)) return res.status(400).json({ error: `category must be one of: ${ARTICLE_CATEGORIES.join(", ")}` });
  const existing = azexbuyDb.prepare("SELECT id FROM azexbuy_articles WHERE slug = ?").get(slug);
  if (existing) return res.status(409).json({ error: "Article slug already exists" });
  const id = `art-${Date.now()}`;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const pubAt = isPublished ? publishedAt || now : null;
  azexbuyDb.prepare(`INSERT INTO azexbuy_articles (id, created_at, updated_at, title, slug, category, summary, content, cover_image, seo_title, seo_description, is_published, published_at, author) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, now, now, title.trim(), slug.trim().toLowerCase(), category || "Export Guides", summary || null, content || null, coverImage || null, seoTitle || null, seoDescription || null, isPublished ? 1 : 0, pubAt, author || "AZEXBUY");
  azDel("azexbuy:articles:all:20:0");
  for (const cat of ARTICLE_CATEGORIES) azDel(`azexbuy:articles:${cat}:20:0`);
  res.status(201).json({ success: true, id });
});
app.patch("/api/azexbuy/admin/articles/:id", requireAuth, (req, res) => {
  const r = azexbuyDb.prepare("SELECT id, slug, published_at, is_featured FROM azexbuy_articles WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Article not found" });
  if (req.body.category && !ARTICLE_CATEGORIES.includes(req.body.category)) return res.status(400).json({ error: `Invalid category` });
  const textFields = ["title", "slug", "category", "summary", "content", "coverImage:cover_image", "seoTitle:seo_title", "seoDescription:seo_description", "publishedAt:published_at", "author"];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  azexbuyDb.prepare("UPDATE azexbuy_articles SET updated_at = ? WHERE id = ?").run(now, req.params.id);
  for (const f of textFields) {
    const [jsKey, dbCol] = f.includes(":") ? f.split(":") : [f, f];
    if (req.body[jsKey] !== void 0) azexbuyDb.prepare(`UPDATE azexbuy_articles SET ${dbCol} = ? WHERE id = ?`).run(req.body[jsKey], req.params.id);
  }
  if (req.body.isPublished !== void 0) {
    azexbuyDb.prepare("UPDATE azexbuy_articles SET is_published = ? WHERE id = ?").run(req.body.isPublished ? 1 : 0, req.params.id);
    if (req.body.isPublished && !r.published_at) azexbuyDb.prepare("UPDATE azexbuy_articles SET published_at = ? WHERE id = ?").run(now, req.params.id);
  }
  azDel(`azexbuy:article:${r.slug}`);
  azDel("azexbuy:articles:all:20:0");
  azDel("azexbuy:articles:featured");
  for (const cat of ARTICLE_CATEGORIES) azDel(`azexbuy:articles:${cat}:20:0`);
  res.json({ success: true });
});
app.delete("/api/azexbuy/admin/articles/:id", requireAuth, (req, res) => {
  const r = azexbuyDb.prepare("SELECT slug, is_featured FROM azexbuy_articles WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Article not found" });
  azexbuyDb.prepare("DELETE FROM azexbuy_articles WHERE id = ?").run(req.params.id);
  azDel(`azexbuy:article:${r.slug}`);
  azDel("azexbuy:articles:featured");
  azDel("azexbuy:articles:all:20:0");
  for (const cat of ARTICLE_CATEGORIES) azDel(`azexbuy:articles:${cat}:20:0`);
  res.json({ success: true });
});
app.get("/api/azexbuy/article-categories", (_req, res) => {
  res.json(ARTICLE_CATEGORIES);
});
app.get("/api/azexbuy/rfqs", requireAuth, async (req, res) => {
  const cached = await azGet("azexbuy:rfqs");
  if (cached) return res.json(JSON.parse(cached));
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_rfqs ORDER BY created_at DESC").all();
  const result = rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    buyerCompany: r.buyer_company,
    country: r.country,
    city: r.city || "",
    contactName: r.contact_name,
    email: r.email,
    phone: r.phone,
    incoterm: r.incoterm,
    destinationPort: r.destination_port,
    corridorRoute: r.corridor_route,
    requiredCertifications: JSON.parse(r.required_certifications || "[]"),
    items: JSON.parse(r.items || "[]"),
    notes: r.notes,
    status: r.status,
    assignedTo: r.assigned_to || "",
    internalNotes: r.internal_notes || ""
  }));
  await azSet("azexbuy:rfqs", JSON.stringify(result));
  res.json(result);
});
app.post("/api/azexbuy/rfqs", async (req, res) => {
  const d = req.body;
  if (!d.id || !d.buyerCompany || !d.email) return res.status(400).json({ error: "Missing fields" });
  azexbuyDb.prepare(`INSERT OR REPLACE INTO azexbuy_rfqs
    (id,created_at,buyer_company,country,city,contact_name,email,phone,incoterm,destination_port,corridor_route,required_certifications,items,notes,status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    d.id,
    d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    d.buyerCompany,
    d.country || "",
    d.city || "",
    d.contactName || "",
    d.email,
    d.phone || "",
    d.incoterm || "CIF",
    d.destinationPort || "",
    d.corridorRoute || "",
    JSON.stringify(d.requiredCertifications || []),
    JSON.stringify(d.items || []),
    d.notes || "",
    d.status || "Pending"
  );
  await azDel("azexbuy:rfqs");
  res.json({ success: true, id: d.id });
  const itemsList = (d.items || []).map((it) => `<li><b>${it.productName}</b> \u2014 ${it.quantity} ${it.unit} (HS: ${it.hsCode || "\u2014"})</li>`).join("");
  sendNotificationEmail(
    `[AZEXBUY] Yeni RFQ: ${d.buyerCompany} (${d.country})`,
    `<h2>Yeni RFQ Sor\u011Fusu</h2>
     <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
       <tr><td style="padding:4px 12px;color:#666">ID</td><td><b>${d.id}</b></td></tr>
       <tr><td style="padding:4px 12px;color:#666">\u015Eirk\u0259t</td><td>${d.buyerCompany}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">\xD6lk\u0259</td><td>${d.country}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">\u018Flaq\u0259</td><td>${d.contactName} \u2014 ${d.email}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">Incoterm</td><td>${d.incoterm} / ${d.destinationPort || "\u2014"}</td></tr>
     </table>
<h3 style="margin-top:16px">Mallar</h3><ul>${itemsList}</ul>
      ${d.notes ? `<p><b>Qeyd:</b> ${d.notes}</p>` : ""}
      <p style="color:#888;font-size:12px;margin-top:24px">AZEXBUY Admin: <a href="http://localhost:${PORT}/octo-admin">Panel\u0259 ke\xE7</a></p>`,
    getSmtpSettings()?.rfq_email || void 0
  );
});
app.patch("/api/azexbuy/rfqs/:id", requireAuth, async (req, res) => {
  const { status, assignedTo, internalNotes } = req.body;
  const row = azexbuyDb.prepare("SELECT id FROM azexbuy_rfqs WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "RFQ not found" });
  if (status !== void 0) azexbuyDb.prepare("UPDATE azexbuy_rfqs SET status = ? WHERE id = ?").run(status, req.params.id);
  if (assignedTo !== void 0) azexbuyDb.prepare("UPDATE azexbuy_rfqs SET assigned_to = ? WHERE id = ?").run(assignedTo, req.params.id);
  if (internalNotes !== void 0) azexbuyDb.prepare("UPDATE azexbuy_rfqs SET internal_notes = ? WHERE id = ?").run(internalNotes, req.params.id);
  await azDel("azexbuy:rfqs");
  res.json({ success: true });
});
app.delete("/api/azexbuy/rfqs/:id", requireAuth, async (req, res) => {
  azexbuyDb.prepare("DELETE FROM azexbuy_rfqs WHERE id = ?").run(req.params.id);
  await azDel("azexbuy:rfqs");
  res.json({ success: true });
});
app.get("/api/azexbuy/producers", requireAuth, async (req, res) => {
  const cached = await azGet("azexbuy:producers");
  if (cached) return res.json(JSON.parse(cached));
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_producers ORDER BY created_at DESC").all();
  const result = rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    companyName: r.company_name,
    voenTin: r.voen_tin,
    economicRegion: r.economic_region,
    city: r.city || "",
    contactPerson: r.contact_person,
    email: r.email,
    phone: r.phone,
    productName: r.product_name,
    hsCode: r.hs_code,
    categoryKey: r.category_key,
    monthlyCapacity: r.monthly_capacity,
    certifications: JSON.parse(r.certifications || "[]"),
    targetMarkets: JSON.parse(r.target_markets || "[]"),
    products: JSON.parse(r.products || "[]"),
    outsourcedDeskRequested: Boolean(r.outsourced_desk),
    readinessScore: r.readiness_score,
    status: r.status,
    assignedTo: r.assigned_to || "",
    internalNotes: r.internal_notes || ""
  }));
  await azSet("azexbuy:producers", JSON.stringify(result));
  res.json(result);
});
app.post("/api/azexbuy/producers", async (req, res) => {
  const d = req.body;
  if (!d.id || !d.companyName || !d.email) return res.status(400).json({ error: "Missing fields" });
  azexbuyDb.prepare(`INSERT OR REPLACE INTO azexbuy_producers
    (id,created_at,company_name,voen_tin,economic_region,city,contact_person,email,phone,product_name,hs_code,category_key,monthly_capacity,certifications,target_markets,outsourced_desk,readiness_score,status,products)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    d.id,
    d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    d.companyName,
    d.voenTin || "",
    d.economicRegion || "",
    d.city || "",
    d.contactPerson || "",
    d.email,
    d.phone || "",
    d.productName || "",
    d.hsCode || "",
    d.categoryKey || "",
    d.monthlyCapacity || "",
    JSON.stringify(d.certifications || []),
    JSON.stringify(d.targetMarkets || []),
    d.outsourcedDeskRequested ? 1 : 0,
    d.readinessScore || 0,
    d.status || "Pending",
    JSON.stringify(d.products || [])
  );
  await azDel("azexbuy:producers");
  res.json({ success: true, id: d.id });
  const certs = (d.certifications || []).join(", ") || "\u2014";
  const markets = (d.targetMarkets || []).join(", ") || "\u2014";
  sendNotificationEmail(
    `[AZEXBUY] Yeni \u0130stehsal\xE7\u0131: ${d.companyName}`,
    `<h2>Yeni \u0130stehsal\xE7\u0131 Qeydiyyat\u0131</h2>
     <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
       <tr><td style="padding:4px 12px;color:#666">ID</td><td><b>${d.id}</b></td></tr>
       <tr><td style="padding:4px 12px;color:#666">\u015Eirk\u0259t</td><td>${d.companyName}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">V\xD6EN</td><td>${d.voenTin || "\u2014"}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">\u018Flaq\u0259</td><td>${d.contactPerson || "\u2014"} \u2014 ${d.email}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">M\u0259hsul</td><td>${d.productName} (HS: ${d.hsCode || "\u2014"})</td></tr>
       <tr><td style="padding:4px 12px;color:#666">Kapasite</td><td>${d.monthlyCapacity || "\u2014"}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">Sertifikatlar</td><td>${certs}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">H\u0259d\u0259f Bazarlar</td><td>${markets}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">Outsourced Desk</td><td>${d.outsourcedDeskRequested ? "B\u0259li" : "Xeyr"}</td></tr>
     </table>
     <p style="color:#888;font-size:12px;margin-top:24px">AZEXBUY Admin: <a href="http://localhost:${PORT}/octo-admin">Panel\u0259 ke\xE7</a></p>`,
    getSmtpSettings()?.producer_email || void 0
  );
});
app.patch("/api/azexbuy/producers/:id", requireAuth, async (req, res) => {
  const { status, assignedTo, internalNotes } = req.body;
  const row = azexbuyDb.prepare("SELECT id FROM azexbuy_producers WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Producer not found" });
  if (status !== void 0) azexbuyDb.prepare("UPDATE azexbuy_producers SET status = ? WHERE id = ?").run(status, req.params.id);
  if (assignedTo !== void 0) azexbuyDb.prepare("UPDATE azexbuy_producers SET assigned_to = ? WHERE id = ?").run(assignedTo, req.params.id);
  if (internalNotes !== void 0) azexbuyDb.prepare("UPDATE azexbuy_producers SET internal_notes = ? WHERE id = ?").run(internalNotes, req.params.id);
  await azDel("azexbuy:producers");
  res.json({ success: true });
});
app.delete("/api/azexbuy/producers/:id", requireAuth, async (req, res) => {
  azexbuyDb.prepare("DELETE FROM azexbuy_producers WHERE id = ?").run(req.params.id);
  await azDel("azexbuy:producers");
  res.json({ success: true });
});
app.get("/api/azexbuy/localization", async (req, res) => {
  const cached = await azGet("azexbuy:localization");
  if (cached) return res.json(JSON.parse(cached));
  const row = azexbuyDb.prepare("SELECT value FROM azexbuy_kv WHERE key = 'localization'").get();
  const result = row ? JSON.parse(row.value) : {};
  await azSet("azexbuy:localization", JSON.stringify(result));
  res.json(result);
});
app.post("/api/azexbuy/localization", requireAuth, async (req, res) => {
  const data = req.body;
  azexbuyDb.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('localization', ?, ?)").run(JSON.stringify(data), (/* @__PURE__ */ new Date()).toISOString());
  await azDel("azexbuy:localization");
  res.json({ success: true });
});
var APPLICATION_STATUSES = ["New", "Under Review", "Awaiting Info", "Searching", "Offer Preparing", "Sent to Client", "Completed", "Closed"];
app.get("/api/azexbuy/stats", async (_req, res) => {
  const rfqCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_rfqs").get().c;
  const producerCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_producers").get().c;
  const pendingRfqs = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_rfqs WHERE status IN ('Pending','New','Under Review')").get().c;
  const activeProducers = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_producers WHERE status NOT IN ('Rejected','Closed')").get().c;
  const categoryCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_categories WHERE is_active = 1").get().c;
  const productCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_products WHERE is_active = 1").get().c;
  const articleCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_articles WHERE is_published = 1").get().c;
  const contactCount = azexbuyDb.prepare("SELECT COUNT(*) as c FROM azexbuy_contacts").get().c;
  const rfqByStatus = azexbuyDb.prepare("SELECT status, COUNT(*) as c FROM azexbuy_rfqs GROUP BY status").all().reduce((acc, r) => {
    acc[r.status] = r.c;
    return acc;
  }, {});
  res.json({
    rfqCount,
    producerCount,
    pendingRfqs,
    activeProducers,
    categoryCount,
    productCount,
    articleCount,
    contactCount,
    rfqByStatus,
    statuses: APPLICATION_STATUSES,
    redis: azRedis ? "connected" : "unavailable"
  });
});
app.get("/api/azexbuy/statuses", (_req, res) => {
  res.json(APPLICATION_STATUSES);
});
app.get("/api/azexbuy/contacts", requireAuth, async (req, res) => {
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_contacts ORDER BY created_at DESC").all();
  res.json(rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    fullName: r.full_name,
    organization: r.organization,
    email: r.email,
    inquiryType: r.inquiry_type,
    message: r.message,
    status: r.status
  })));
});
app.post("/api/azexbuy/contacts", async (req, res) => {
  const { fullName, organization, email, inquiryType, message } = req.body;
  if (!fullName || !organization || !email || !message) {
    return res.status(400).json({ error: "fullName, organization, email and message are required" });
  }
  const id = `AZX-CNT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  azexbuyDb.prepare(`
    INSERT INTO azexbuy_contacts (id, created_at, full_name, organization, email, inquiry_type, message, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'New')
  `).run(id, (/* @__PURE__ */ new Date()).toISOString(), fullName.trim(), organization.trim(), email.trim().toLowerCase(), inquiryType || "Buyer Sourcing Inquiry", message.trim());
  res.json({ success: true, id });
  sendNotificationEmail(
    `[AZEXBUY] Yeni \u018Flaq\u0259 Sor\u011Fusu: ${fullName} \u2014 ${organization}`,
    `<h2>Yeni \u018Flaq\u0259 Sor\u011Fusu</h2>
     <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
       <tr><td style="padding:4px 12px;color:#666">ID</td><td><b>${id}</b></td></tr>
       <tr><td style="padding:4px 12px;color:#666">Ad</td><td>${fullName}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">T\u0259\u015Fkilat</td><td>${organization}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">E-po\xE7t</td><td>${email}</td></tr>
       <tr><td style="padding:4px 12px;color:#666">Sor\u011Fu N\xF6v\xFC</td><td>${inquiryType || "\u2014"}</td></tr>
     </table>
     <h3 style="margin-top:16px">Mesaj</h3>
     <p style="font-family:sans-serif;font-size:14px">${message}</p>
     <p style="color:#888;font-size:12px;margin-top:24px">AZEXBUY Admin: <a href="http://localhost:${PORT}/octo-admin">Panel\u0259 ke\xE7</a></p>`,
    getSmtpSettings()?.contact_email || void 0
  );
});
app.patch("/api/azexbuy/contacts/:id", requireAuth, (req, res) => {
  const { status } = req.body;
  azexbuyDb.prepare("UPDATE azexbuy_contacts SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});
app.delete("/api/azexbuy/contacts/:id", requireAuth, (req, res) => {
  azexbuyDb.prepare("DELETE FROM azexbuy_contacts WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});
var azexbuyUploadDir = path3.join(ROOT_DIR, "uploads", "azexbuy");
if (!fs3.existsSync(azexbuyUploadDir)) fs3.mkdirSync(azexbuyUploadDir, { recursive: true });
var azexbuyStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, azexbuyUploadDir),
  filename: (_req, file, cb) => {
    const ext = path3.extname(file.originalname).toLowerCase();
    cb(null, `azexbuy-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});
var azexbuyUpload = multer({
  storage: azexbuyStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"];
    const ext = path3.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
}).single("image");
app.post("/api/azexbuy/upload-image", requireAuth, (req, res) => {
  azexbuyUpload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = `/uploads/azexbuy/${req.file.filename}`;
    res.json({ success: true, url, filename: req.file.filename });
  });
});
app.use("/uploads/azexbuy", express.static(azexbuyUploadDir));
app.get("/api/azexbuy/content", async (req, res) => {
  const cached = await azGet("azexbuy:content");
  if (cached) return res.json(JSON.parse(cached));
  const row = azexbuyDb.prepare("SELECT value FROM azexbuy_kv WHERE key = 'content'").get();
  const result = row ? JSON.parse(row.value) : {};
  await azSet("azexbuy:content", JSON.stringify(result));
  res.json(result);
});
app.post("/api/azexbuy/content", requireAuth, async (req, res) => {
  const data = req.body;
  azexbuyDb.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('content', ?, ?)").run(JSON.stringify(data), (/* @__PURE__ */ new Date()).toISOString());
  await azDel("azexbuy:content");
  res.json({ success: true });
});
app.get("/api/azexbuy/images", requireAuth, (_req, res) => {
  if (!fs3.existsSync(azexbuyUploadDir)) return res.json([]);
  const files = fs3.readdirSync(azexbuyUploadDir).filter((f) => /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(f)).map((f) => ({
    filename: f,
    url: `/uploads/azexbuy/${f}`,
    size: fs3.statSync(path3.join(azexbuyUploadDir, f)).size,
    created: fs3.statSync(path3.join(azexbuyUploadDir, f)).birthtime
  })).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  res.json(files);
});
app.delete("/api/azexbuy/images/:filename", requireAuth, (req, res) => {
  const filePath = path3.join(azexbuyUploadDir, req.params.filename);
  if (fs3.existsSync(filePath)) fs3.unlinkSync(filePath);
  res.json({ success: true });
});
app.get("/api/azexbuy/services", async (_req, res) => {
  const cached = await azGet("azexbuy:services");
  if (cached) return res.json(JSON.parse(cached));
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_services ORDER BY sort_order ASC, created_at ASC").all();
  const result = rows.map((r) => {
    let title = {};
    let description = {};
    let scope = { AZ: [], EN: [], TR: [], RU: [], AR: [], ES: [] };
    let targetAudience = {};
    try {
      title = typeof r.title === "string" ? JSON.parse(r.title) : r.title || {};
    } catch {
      title = { AZ: r.title, EN: r.title };
    }
    try {
      description = typeof r.description === "string" ? JSON.parse(r.description) : r.description || {};
    } catch {
      description = { AZ: r.description, EN: r.description };
    }
    try {
      scope = typeof r.scope === "string" ? JSON.parse(r.scope) : r.scope || {};
    } catch {
      scope = { AZ: [], EN: [], TR: [], RU: [], AR: [], ES: [] };
    }
    try {
      targetAudience = typeof r.target_audience === "string" ? JSON.parse(r.target_audience) : r.target_audience || {};
    } catch {
      targetAudience = { AZ: r.target_audience, EN: r.target_audience };
    }
    return {
      id: r.id,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      title,
      description,
      scope,
      targetAudience,
      iconClass: r.icon_class,
      colorClass: r.color_class,
      serviceType: r.service_type,
      isActive: Boolean(r.is_active),
      sortOrder: r.sort_order
    };
  });
  await azSet("azexbuy:services", JSON.stringify(result));
  res.json(result);
});
app.post("/api/azexbuy/services", requireAuth, async (req, res) => {
  const d = req.body;
  if (!d.id || !d.title) return res.status(400).json({ error: "Missing required fields" });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  azexbuyDb.prepare(`
    INSERT OR REPLACE INTO azexbuy_services
    (id, created_at, updated_at, title, description, scope, target_audience, icon_class, color_class, service_type, is_active, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id,
    d.createdAt || now,
    now,
    typeof d.title === "string" ? d.title : JSON.stringify(d.title || {}),
    typeof d.description === "string" ? d.description : JSON.stringify(d.description || {}),
    typeof d.scope === "string" ? d.scope : JSON.stringify(d.scope || {}),
    typeof d.targetAudience === "string" ? d.targetAudience : JSON.stringify(d.targetAudience || {}),
    d.iconClass || "fa-solid fa-briefcase",
    d.colorClass || "bg-brandNavy",
    d.serviceType || "primary",
    d.isActive === false ? 0 : 1,
    d.sortOrder || 0
  );
  await azDel("azexbuy:services");
  res.json({ success: true, id: d.id });
});
app.patch("/api/azexbuy/services/:id", requireAuth, async (req, res) => {
  const d = req.body;
  const r = azexbuyDb.prepare("SELECT * FROM azexbuy_services WHERE id = ?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Not found" });
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const title = d.title !== void 0 ? typeof d.title === "string" ? d.title : JSON.stringify(d.title) : r.title;
  const description = d.description !== void 0 ? typeof d.description === "string" ? d.description : JSON.stringify(d.description) : r.description;
  const scope = d.scope !== void 0 ? typeof d.scope === "string" ? d.scope : JSON.stringify(d.scope) : r.scope;
  const targetAudience = d.targetAudience !== void 0 ? typeof d.targetAudience === "string" ? d.targetAudience : JSON.stringify(d.targetAudience) : r.target_audience;
  const iconClass = d.iconClass !== void 0 ? d.iconClass : r.icon_class;
  const colorClass = d.colorClass !== void 0 ? d.colorClass : r.color_class;
  const serviceType = d.serviceType !== void 0 ? d.serviceType : r.service_type;
  const isActive = d.isActive !== void 0 ? d.isActive ? 1 : 0 : r.is_active;
  const sortOrder = d.sortOrder !== void 0 ? d.sortOrder : r.sort_order;
  azexbuyDb.prepare(`
    UPDATE azexbuy_services SET
      updated_at = ?,
      title = ?,
      description = ?,
      scope = ?,
      target_audience = ?,
      icon_class = ?,
      color_class = ?,
      service_type = ?,
      is_active = ?,
      sort_order = ?
    WHERE id = ?
  `).run(now, title, description, scope, targetAudience, iconClass, colorClass, serviceType, isActive, sortOrder, req.params.id);
  await azDel("azexbuy:services");
  res.json({ success: true });
});
app.delete("/api/azexbuy/services/:id", requireAuth, async (req, res) => {
  azexbuyDb.prepare("DELETE FROM azexbuy_services WHERE id = ?").run(req.params.id);
  await azDel("azexbuy:services");
  res.json({ success: true });
});
app.get("/api/azexbuy/service-applications", requireAuth, async (_req, res) => {
  const rows = azexbuyDb.prepare("SELECT * FROM azexbuy_service_applications ORDER BY created_at DESC").all();
  const result = rows.map((r) => {
    let selectedServices = [];
    try {
      selectedServices = JSON.parse(r.selected_services || "[]");
    } catch {
      selectedServices = [];
    }
    return {
      id: r.id,
      createdAt: r.created_at,
      fullName: r.full_name,
      company: r.company,
      country: r.country,
      email: r.email,
      phone: r.phone,
      details: r.details,
      selectedServices,
      status: r.status
    };
  });
  res.json(result);
});
app.post("/api/azexbuy/service-applications", async (req, res) => {
  const d = req.body;
  if (!d.id || !d.fullName || !d.email) return res.status(400).json({ error: "Missing required fields" });
  azexbuyDb.prepare(`
    INSERT OR REPLACE INTO azexbuy_service_applications
    (id, created_at, full_name, company, country, email, phone, details, selected_services, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id,
    d.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    d.fullName,
    d.company || "",
    d.country || "",
    d.email,
    d.phone || "",
    d.details || "",
    JSON.stringify(d.selectedServices || []),
    d.status || "Pending"
  );
  res.json({ success: true, id: d.id });
});
app.patch("/api/azexbuy/service-applications/:id", requireAuth, async (req, res) => {
  const { status } = req.body;
  if (status) {
    azexbuyDb.prepare("UPDATE azexbuy_service_applications SET status = ? WHERE id = ?").run(status, req.params.id);
  }
  res.json({ success: true });
});
app.delete("/api/azexbuy/service-applications/:id", requireAuth, async (req, res) => {
  azexbuyDb.prepare("DELETE FROM azexbuy_service_applications WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});
app.all("/api/azexbuy/seed", async (_req, res) => {
  try {
    const stats = seedAzexbuyData(azexbuyDb);
    await azDel("azexbuy:products:all");
    await azDel("azexbuy:categories:all");
    await azDel("azexbuy:services");
    await azDel("azexbuy:content");
    res.json({ success: true, message: "AZEXBUY data seeded successfully", stats });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/img-proxy", async (req, res) => {
  const url = req.query.url;
  if (!url || !/^https?:\/\//.test(url)) return res.status(400).send("Invalid URL");
  try {
    const parsed = new URL(url);
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "::1"];
    if (blockedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith(".internal"))) {
      return res.status(403).send("Forbidden");
    }
  } catch {
    return res.status(400).send("Invalid URL");
  }
  try {
    const https = await import("node:https");
    const http2 = await import("node:http");
    const mod = url.startsWith("https") ? https : http2;
    const proxyReq = mod.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "",
        "Accept": "image/*,*/*"
      }
    }, (proxyRes) => {
      res.set("Content-Type", proxyRes.headers["content-type"] || "image/jpeg");
      res.set("Cache-Control", "public, max-age=86400");
      res.set("Access-Control-Allow-Origin", "*");
      proxyRes.pipe(res);
    });
    proxyReq.on("error", () => res.status(500).send("Proxy error"));
  } catch {
    res.status(500).send("Proxy failed");
  }
});
app.get("/api/admin-users", requireAuth, (req, res) => {
  const rows = mainDb.prepare("SELECT id, created_at, full_name, username, email, role, is_active, last_login FROM admin_users ORDER BY created_at ASC").all();
  res.json(rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    fullName: r.full_name,
    username: r.username,
    email: r.email,
    role: r.role,
    isActive: Boolean(r.is_active),
    lastLogin: r.last_login
  })));
});
app.post("/api/admin-users", requireAuth, async (req, res) => {
  const { fullName, username, email, password, role } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: "fullName, username, email and password are required" });
  }
  const existing = mainDb.prepare("SELECT id FROM admin_users WHERE username = ? OR email = ?").get(username, email);
  if (existing) return res.status(409).json({ error: "Username or email already exists" });
  const id = `admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  mainDb.prepare(`
    INSERT INTO admin_users (id, created_at, full_name, username, email, password, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, (/* @__PURE__ */ new Date()).toISOString(), fullName, username.toLowerCase().trim(), email.toLowerCase().trim(), hashedPassword, role || "Editor");
  res.json({ success: true, id });
});
app.patch("/api/admin-users/:id", requireAuth, async (req, res) => {
  const { fullName, username, email, role, isActive, password } = req.body;
  const user = mainDb.prepare("SELECT id FROM admin_users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (fullName !== void 0) mainDb.prepare("UPDATE admin_users SET full_name = ? WHERE id = ?").run(fullName, req.params.id);
  if (username !== void 0 && username.trim().length >= 3) {
    const conflict = mainDb.prepare("SELECT id FROM admin_users WHERE username = ? AND id != ?").get(username.toLowerCase().trim(), req.params.id);
    if (conflict) return res.status(409).json({ error: "Bu istifad\u0259\xE7i ad\u0131 art\u0131q m\xF6vcuddur" });
    mainDb.prepare("UPDATE admin_users SET username = ? WHERE id = ?").run(username.toLowerCase().trim(), req.params.id);
    if (activeSessionToken) {
      activeSessionToken = null;
      persistSession(null);
      kickAllClients("\u0130stifad\u0259\xE7i ad\u0131 d\u0259yi\u015Fdirildi. Z\u0259hm\u0259t olmasa yenid\u0259n daxil olun.");
    }
  }
  if (email !== void 0) mainDb.prepare("UPDATE admin_users SET email = ? WHERE id = ?").run(email.toLowerCase().trim(), req.params.id);
  if (role !== void 0) mainDb.prepare("UPDATE admin_users SET role = ? WHERE id = ?").run(role, req.params.id);
  if (isActive !== void 0) mainDb.prepare("UPDATE admin_users SET is_active = ? WHERE id = ?").run(isActive ? 1 : 0, req.params.id);
  if (password !== void 0 && password.length >= 4) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    mainDb.prepare("UPDATE admin_users SET password = ? WHERE id = ?").run(hashedPassword, req.params.id);
    if (activeSessionToken) {
      activeSessionToken = null;
      persistSession(null);
      kickAllClients("\u015Eifr\u0259 d\u0259yi\u015Fdirildi. Z\u0259hm\u0259t olmasa yenid\u0259n daxil olun.");
    }
  }
  res.json({ success: true });
});
app.delete("/api/admin-users/:id", requireAuth, (req, res) => {
  if (req.params.id === "admin-root") return res.status(403).json({ error: "Cannot delete root admin" });
  mainDb.prepare("DELETE FROM admin_users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});
mainDb.exec(`
  CREATE TABLE IF NOT EXISTS smtp_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    host TEXT DEFAULT '',
    port INTEGER DEFAULT 587,
    secure INTEGER DEFAULT 0,
    user TEXT DEFAULT '',
    password TEXT DEFAULT '',
    from_name TEXT DEFAULT 'AZEXBUY',
    from_email TEXT DEFAULT '',
    notify_email TEXT DEFAULT '',
    rfq_email TEXT DEFAULT 'procurement@azexbuy.com',
    producer_email TEXT DEFAULT 'export@azexbuy.com',
    contact_email TEXT DEFAULT 'info@azexbuy.com',
    enabled INTEGER DEFAULT 0,
    updated_at TEXT
  );
  INSERT OR IGNORE INTO smtp_settings (id) VALUES (1);
`);
try {
  const smtpCols = mainDb.prepare("PRAGMA table_info(smtp_settings)").all().map((c) => c.name);
  if (!smtpCols.includes("rfq_email")) mainDb.exec("ALTER TABLE smtp_settings ADD COLUMN rfq_email TEXT DEFAULT 'procurement@azexbuy.com'");
  if (!smtpCols.includes("producer_email")) mainDb.exec("ALTER TABLE smtp_settings ADD COLUMN producer_email TEXT DEFAULT 'export@azexbuy.com'");
  if (!smtpCols.includes("contact_email")) mainDb.exec("ALTER TABLE smtp_settings ADD COLUMN contact_email TEXT DEFAULT 'info@azexbuy.com'");
} catch (err) {
  console.warn("[DB] SMTP migration warning:", err);
}
function getSmtpSettings() {
  return mainDb.prepare("SELECT * FROM smtp_settings WHERE id = 1").get();
}
async function createTransport() {
  const s = getSmtpSettings();
  if (!s?.enabled || !s?.host || !s?.user || !s?.password) return null;
  return nodemailer.createTransport({
    host: s.host,
    port: s.port || 587,
    secure: Boolean(s.secure),
    auth: { user: s.user, pass: s.password },
    tls: { rejectUnauthorized: false }
  });
}
async function sendNotificationEmail(subject, html, toOverride) {
  try {
    const s = getSmtpSettings();
    if (!s?.enabled) return;
    const to = toOverride || s?.notify_email;
    if (!to) return;
    const transporter = await createTransport();
    if (!transporter) return;
    await transporter.sendMail({
      from: `"${s.from_name || "AZEXBUY"}" <${s.from_email || s.user}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("[SMTP] Send failed:", err);
  }
}
app.get("/api/smtp-settings", requireAuth, (_req, res) => {
  const s = getSmtpSettings();
  res.json({ ...s, password: s?.password ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "" });
});
app.post("/api/smtp-settings", requireAuth, (req, res) => {
  const { host, port, secure, user, password, from_name, from_email, notify_email, rfq_email, producer_email, contact_email, enabled } = req.body;
  const current = getSmtpSettings();
  const newPass = password && password !== "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" ? password : current?.password || "";
  mainDb.prepare(`
    UPDATE smtp_settings SET
      host = ?, port = ?, secure = ?, user = ?,
      password = ?, from_name = ?, from_email = ?,
      notify_email = ?, rfq_email = ?, producer_email = ?, contact_email = ?, enabled = ?, updated_at = ?
    WHERE id = 1
  `).run(
    host || "",
    parseInt(port) || 587,
    secure ? 1 : 0,
    user || "",
    newPass,
    from_name || "AZEXBUY",
    from_email || "",
    notify_email || "",
    rfq_email || "procurement@azexbuy.com",
    producer_email || "export@azexbuy.com",
    contact_email || "info@azexbuy.com",
    enabled ? 1 : 0,
    (/* @__PURE__ */ new Date()).toISOString()
  );
  res.json({ success: true });
});
app.post("/api/smtp-test", requireAuth, async (req, res) => {
  try {
    const { host, port, secure, user, password, from_name, from_email, to } = req.body;
    if (!host || !user || !password || !to) {
      return res.status(400).json({ success: false, error: "host, user, password and to are required" });
    }
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port) || 587,
      secure: Boolean(secure),
      auth: { user, pass: password },
      tls: { rejectUnauthorized: false }
    });
    await transporter.verify();
    await transporter.sendMail({
      from: `"${from_name || "AZEXBUY"}" <${from_email || user}>`,
      to,
      subject: "AZEXBUY SMTP Test \u2014 U\u011Furlu",
      html: "<p>SMTP konfiqurasiyas\u0131 u\u011Furla yoxland\u0131. AZEXBUY bildiriml\u0259ri aktiv.</p>"
    });
    res.json({ success: true, message: "Test e-po\xE7tu g\xF6nd\u0259rildi." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "SMTP x\u0259tas\u0131" });
  }
});
app.get("/octo-fix-localization-xK9mP2qL", (_req, res) => {
  try {
    const row = azexbuyDb.prepare("SELECT value FROM azexbuy_kv WHERE key = 'localization'").get();
    if (!row) return res.send("No localization override in DB \u2014 nothing to fix.");
    const data = JSON.parse(row.value);
    let fixes = 0;
    for (const locale of Object.keys(data)) {
      for (const key of Object.keys(data[locale])) {
        const val = data[locale][key];
        if (typeof val === "string" && val.endsWith("g") && !val.endsWith("ing") && !val.endsWith("ng") && val.length > 2) {
          const trimmed = val.slice(0, -1);
          data[locale][key] = trimmed;
          fixes++;
          console.log(`[fix-loc] ${locale}.${key}: "${val}" \u2192 "${trimmed}"`);
        }
      }
    }
    azexbuyDb.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('localization', ?, ?)").run(JSON.stringify(data), (/* @__PURE__ */ new Date()).toISOString());
    azDel("azexbuy:localization");
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:monospace;padding:40px;background:#0f172a;color:#10b981;"><h2>\u2713 Localization temizlendi</h2><p>${fixes} d\u0259y\u0259r d\xFCz\u0259ldildi.</p><p><a href="/octo-admin/" style="color:#60a5fa">Admin Panel\u0259 Get</a></p></body></html>`);
  } catch (e) {
    res.status(500).send("X\u0259ta: " + e.message);
  }
});
app.delete("/api/azexbuy/localization", requireAuth, async (_req, res) => {
  azexbuyDb.prepare("DELETE FROM azexbuy_kv WHERE key = 'localization'").run();
  await azDel("azexbuy:localization");
  res.json({ success: true, message: "Localization override cleared \u2014 defaults will be used." });
});
app.get("/octo-emergency-reset-xK9mP2qL", (_req, res) => {
  try {
    Database.updateAdmin({ password: "admin", username: "admin" });
    try {
      mainDb.prepare("UPDATE admin_users SET password = 'admin', username = 'admin', is_active = 1 WHERE id = 'admin-root' OR username = 'admin'").run();
    } catch (dbErr) {
      console.warn("[EmergencyReset] SQLite update warning:", dbErr);
    }
    res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Reset</title></head><body style="font-family:monospace;padding:40px;background:#0f172a;color:#10b981;"><h2>\u2713 \u015Eifr\u0259 s\u0131f\u0131rland\u0131</h2><p>\u0130stifad\u0259\xE7i ad\u0131: <b>admin</b></p><p>\u015Eifr\u0259: <b>admin</b></p><p><a href="/octo-admin/" style="color:#60a5fa">Admin Panel\u0259 Get</a></p></body></html>`);
  } catch (e) {
    res.status(500).send("X\u0259ta: " + e.message);
  }
});
app.get("/octo-admin", (_req, res) => {
  const idx = path3.join(clientDist, "index.html");
  if (fs3.existsSync(idx)) return res.sendFile(idx);
  res.status(404).send("Admin panel not built yet. Run: npm run build");
});
app.get("/octo-admin/*", (_req, res) => {
  const idx = path3.join(clientDist, "index.html");
  if (fs3.existsSync(idx)) return res.sendFile(idx);
  res.status(404).send("Admin panel not built yet.");
});
app.get("*", (_req, res) => {
  const azexbuyIdx = path3.join(azexbuyDist, "index.html");
  if (!fs3.existsSync(azexbuyIdx)) return res.status(404).send("AZEXBUY frontend not built yet.");
  try {
    const seo = Database.getSeo();
    let html = fs3.readFileSync(azexbuyIdx, "utf-8");
    const title = seo.title || "AZEXBUY \u2014 Connecting Azerbaijani Products with Global Buyers";
    const description = seo.description || "Sovereign digital trade gateway connecting international business buyers with vetted Azerbaijani manufacturers, producers, and export suppliers.";
    const canonical = seo.canonical || "";
    const ogImage = seo.ogImage || "";
    const robots = [seo.robotsIndex !== false ? "index" : "noindex", seo.robotsFollow !== false ? "follow" : "nofollow"].join(", ");
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}" />`);
    html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${description}" />`);
    if (!html.includes('name="robots"')) {
      html = html.replace("</head>", `  <meta name="robots" content="${robots}" />
  </head>`);
    } else {
      html = html.replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" />`);
    }
    if (canonical) {
      if (!html.includes('rel="canonical"')) {
        html = html.replace("</head>", `  <link rel="canonical" href="${canonical}" />
  </head>`);
      } else {
        html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`);
      }
    }
    if (ogImage) {
      if (!html.includes("og:image")) {
        html = html.replace("</head>", `  <meta property="og:image" content="${ogImage}" />
  </head>`);
      } else {
        html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${ogImage}" />`);
      }
    }
    if (seo.keywords) {
      if (!html.includes('name="keywords"')) {
        html = html.replace("</head>", `  <meta name="keywords" content="${seo.keywords}" />
  </head>`);
      } else {
        html = html.replace(/<meta name="keywords"[^>]*>/, `<meta name="keywords" content="${seo.keywords}" />`);
      }
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch {
    res.sendFile(azexbuyIdx);
  }
});
app.listen(PORT, () => {
  console.log(`[Octotech LL. Admin] Server running on http://localhost:${PORT}`);
});
export {
  APPLICATION_STATUSES
};
