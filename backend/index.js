const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const Redis = require('ioredis');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── SQLite Setup ────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'azexbuy.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS rfqs (
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
    status TEXT DEFAULT 'Pending'
  );

  CREATE TABLE IF NOT EXISTS producers (
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
    status TEXT DEFAULT 'Pending'
  );
`);

// ─── Redis Setup ─────────────────────────────────────────────────
let redis;
try {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true,
    connectTimeout: 3000,
  });
  redis.connect().catch(() => {
    console.warn('Redis not available — running without cache.');
    redis = null;
  });
} catch {
  redis = null;
}

const CACHE_TTL = 60; // seconds

async function getCache(key) {
  if (!redis) return null;
  try { return await redis.get(key); } catch { return null; }
}

async function setCache(key, value) {
  if (!redis) return;
  try { await redis.set(key, value, 'EX', CACHE_TTL); } catch {}
}

async function delCache(key) {
  if (!redis) return;
  try { await redis.del(key); } catch {}
}

// ─── RFQ Routes ──────────────────────────────────────────────────
app.get('/api/rfqs', async (req, res) => {
  const cached = await getCache('rfqs:all');
  if (cached) return res.json(JSON.parse(cached));

  const rows = db.prepare('SELECT * FROM rfqs ORDER BY created_at DESC').all();
  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    buyerCompany: r.buyer_company,
    country: r.country,
    contactName: r.contact_name,
    email: r.email,
    phone: r.phone,
    incoterm: r.incoterm,
    destinationPort: r.destination_port,
    corridorRoute: r.corridor_route,
    requiredCertifications: JSON.parse(r.required_certifications || '[]'),
    items: JSON.parse(r.items || '[]'),
    notes: r.notes,
    status: r.status,
  }));

  await setCache('rfqs:all', JSON.stringify(result));
  res.json(result);
});

app.post('/api/rfqs', async (req, res) => {
  const d = req.body;
  if (!d.id || !d.buyerCompany || !d.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.prepare(`
    INSERT OR REPLACE INTO rfqs
    (id, created_at, buyer_company, country, contact_name, email, phone, incoterm,
     destination_port, corridor_route, required_certifications, items, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id, d.createdAt || new Date().toISOString(),
    d.buyerCompany, d.country || '', d.contactName || '', d.email,
    d.phone || '', d.incoterm || 'CIF', d.destinationPort || '',
    d.corridorRoute || '', JSON.stringify(d.requiredCertifications || []),
    JSON.stringify(d.items || []), d.notes || '',
    d.status || 'Pending'
  );
  await delCache('rfqs:all');
  res.json({ success: true, id: d.id });
});

app.patch('/api/rfqs/:id', async (req, res) => {
  const { status, assignedTo, note } = req.body;
  db.prepare('UPDATE rfqs SET status = ? WHERE id = ?').run(status, req.params.id);
  await delCache('rfqs:all');
  res.json({ success: true });
});

app.delete('/api/rfqs/:id', async (req, res) => {
  db.prepare('DELETE FROM rfqs WHERE id = ?').run(req.params.id);
  await delCache('rfqs:all');
  res.json({ success: true });
});

// ─── Producer Routes ─────────────────────────────────────────────
app.get('/api/producers', async (req, res) => {
  const cached = await getCache('producers:all');
  if (cached) return res.json(JSON.parse(cached));

  const rows = db.prepare('SELECT * FROM producers ORDER BY created_at DESC').all();
  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    companyName: r.company_name,
    voenTin: r.voen_tin,
    economicRegion: r.economic_region,
    contactPerson: r.contact_person,
    email: r.email,
    phone: r.phone,
    productName: r.product_name,
    hsCode: r.hs_code,
    categoryKey: r.category_key,
    monthlyCapacity: r.monthly_capacity,
    certifications: JSON.parse(r.certifications || '[]'),
    targetMarkets: JSON.parse(r.target_markets || '[]'),
    outsourcedDeskRequested: Boolean(r.outsourced_desk),
    readinessScore: r.readiness_score,
    status: r.status,
  }));

  await setCache('producers:all', JSON.stringify(result));
  res.json(result);
});

app.post('/api/producers', async (req, res) => {
  const d = req.body;
  if (!d.id || !d.companyName || !d.email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.prepare(`
    INSERT OR REPLACE INTO producers
    (id, created_at, company_name, voen_tin, economic_region, contact_person,
     email, phone, product_name, hs_code, category_key, monthly_capacity,
     certifications, target_markets, outsourced_desk, readiness_score, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id, d.createdAt || new Date().toISOString(),
    d.companyName, d.voenTin || '', d.economicRegion || '',
    d.contactPerson || '', d.email, d.phone || '',
    d.productName, d.hsCode || '', d.categoryKey || '',
    d.monthlyCapacity || '', JSON.stringify(d.certifications || []),
    JSON.stringify(d.targetMarkets || []),
    d.outsourcedDeskRequested ? 1 : 0,
    d.readinessScore || 0, d.status || 'Pending'
  );
  await delCache('producers:all');
  res.json({ success: true, id: d.id });
});

app.patch('/api/producers/:id', async (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE producers SET status = ? WHERE id = ?').run(status, req.params.id);
  await delCache('producers:all');
  res.json({ success: true });
});

app.delete('/api/producers/:id', async (req, res) => {
  db.prepare('DELETE FROM producers WHERE id = ?').run(req.params.id);
  await delCache('producers:all');
  res.json({ success: true });
});

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', redis: redis ? 'connected' : 'unavailable', db: 'sqlite' });
});

app.listen(PORT, () => {
  console.log(`AZEXBUY Backend running on http://localhost:${PORT}`);
});
