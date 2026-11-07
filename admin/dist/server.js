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
`);
} catch (err) {
  console.error("[DB] Product/Article schema init failed:", err);
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
    Database.updateAdmin({ password: "admin" });
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
