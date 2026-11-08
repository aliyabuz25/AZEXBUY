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

// Admin DB — localization & content buradan okunur/yazılır
const adminDbPath = process.env.ADMIN_DB_PATH || path.join(__dirname, '../admin/data/azexbuy.db');
let adminDb = null;
let adminDbRw = null;
try {
  adminDb = new Database(adminDbPath, { readonly: true });
  adminDbRw = new Database(adminDbPath);
} catch (e) {
  console.warn('Admin DB açılamadı:', e.message);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    title_az TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_tr TEXT DEFAULT '',
    title_ru TEXT DEFAULT '',
    description_az TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    description_tr TEXT DEFAULT '',
    description_ru TEXT DEFAULT '',
    scope_az TEXT DEFAULT '[]',
    scope_en TEXT DEFAULT '[]',
    scope_tr TEXT DEFAULT '[]',
    scope_ru TEXT DEFAULT '[]',
    target_audience_az TEXT DEFAULT '',
    target_audience_en TEXT DEFAULT '',
    target_audience_tr TEXT DEFAULT '',
    target_audience_ru TEXT DEFAULT '',
    icon_class TEXT DEFAULT 'fa-solid fa-briefcase',
    color_class TEXT DEFAULT 'bg-brandNavy',
    service_type TEXT DEFAULT 'primary',
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS service_applications (
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

  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    author TEXT DEFAULT 'AZEXBUY Editorial',
    category TEXT DEFAULT 'Trade Insights',
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT
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

  CREATE TABLE IF NOT EXISTS azexbuy_team_members (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    name TEXT NOT NULL DEFAULT '',
    role TEXT DEFAULT '{}',
    bio TEXT DEFAULT '{}',
    photo TEXT DEFAULT '',
    email TEXT DEFAULT '',
    linkedin TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );
`);

// Seed team members if table empty in local backend db
try {
  const teamCount = (db.prepare('SELECT COUNT(*) as c FROM azexbuy_team_members').get() || {}).c;
  if (!teamCount) {
    const now = new Date().toISOString();
    const ins = db.prepare('INSERT OR IGNORE INTO azexbuy_team_members (id,created_at,updated_at,name,role,bio,photo,email,linkedin,sort_order,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,1)');
    ins.run('tm-001', now, now, 'Ali Əhmədov',
      JSON.stringify({ AZ:'Baş İcraçı Direktor', EN:'Chief Executive Officer', TR:'Genel Müdür', RU:'Генеральный директор', AR:'الرئيس التنفيذي', ES:'Director Ejecutivo' }),
      JSON.stringify({ AZ:'Beynəlxalq ticarət və ixrac sahəsində 15 ildən çox təcrübəyə malik. AZEXBUY-un quruluşundan bəri şirkətin inkişafına rəhbərlik edir.', EN:'Over 15 years of experience in international trade and export. Leading the strategic growth and global partnerships of AZEXBUY.', TR:'Uluslararası ticaret ve ihracat alanında 15 yılı aşkın deneyime sahip.', RU:'Более 15 лет опыта в международной торговле и экспорте.', AR:'أكثر من 15 عاماً من الخبرة في التجارة الدولية والتصدير.', ES:'Más de 15 años de experiencia en comercio internacional y exportación.' }),
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      'ceo@azexbuy.com', 'https://linkedin.com', 1);
    ins.run('tm-002', now, now, 'Leyla Hüseynova',
      JSON.stringify({ AZ:'İxrac Əməliyyatları Direktoru', EN:'Director of Export Operations', TR:'İhracat Operasyonları Direktörü', RU:'Директор по экспортным операциям', AR:'مديرة عمليات التصدير', ES:'Directora de Operaciones de Exportación' }),
      JSON.stringify({ AZ:'Sertifikasiya, gömrük prosedurları və beynəlxalq lojistika sahəsində ixtisaslaşmış. 10 ildən çox sahə təcrübəsi var.', EN:'Specializes in product certification, customs regulations, and multimodal logistics across EU and GCC corridors.', TR:'Sertifikasyon, gümrük prosedürleri ve uluslararası lojistik alanında uzmanlaşmış.', RU:'Специализируется на сертификации, таможенных процедурах и международной логистике.', AR:'متخصصة في الشهادات والإجراءات الجمركية واللوجستيات الدولية.', ES:'Especializada en certificación, procedimientos aduaneros y logística internacional.' }),
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
      'export@azexbuy.com', 'https://linkedin.com', 2);
    ins.run('tm-003', now, now, 'Murad Quliyev',
      JSON.stringify({ AZ:'Bazar Araşdırması və Alıcı Əlaqələri', EN:'Market Research & Buyer Relations', TR:'Pazar Araştırması ve Alıcı İlişkileri', RU:'Исследование рынков и работа с покупателями', AR:'بحوث السوق وعلاقات المشترين', ES:'Investigación de Mercado y Relaciones con Compradores' }),
      JSON.stringify({ AZ:'Avropa, Körfəz və Asiya bazarlarında alıcı axtarışı və kommersiya danışıqlarında ixtisaslaşmışdır.', EN:'Focuses on buyer sourcing, market intelligence, and structured commercial negotiations in European and Asian markets.', TR:'Avrupa, Körfez ve Asya pazarlarında alıcı arama ve ticari müzakerelerde uzmanlaşmıştır.', RU:'Специализируется на поиске покупателей и коммерческих переговорах на европейских, ближневосточных и азиатских рынках.', AR:'متخصص في البحث عن المشترين والتفاوض التجاري في الأسواق الأوروبية وأسواق الخليج وآسيا.', ES:'Especializado en búsqueda de compradores y negociaciones comerciales en mercados europeos, del Golfo y asiáticos.' }),
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
      'buyers@azexbuy.com', 'https://linkedin.com', 3);
    ins.run('tm-004', now, now, 'Nərgiz Məmmədova',
      JSON.stringify({ AZ:'Keyfiyyət və Uyğunluq Mütəxəssisi', EN:'Quality & Compliance Specialist', TR:'Kalite ve Uygunluk Uzmanı', RU:'Специалист по качеству и соответствию', AR:'أخصائية الجودة والامتثال', ES:'Especialista en Calidad y Cumplimiento' }),
      JSON.stringify({ AZ:'ISO, HACCP, Halal və GlobalGAP standartları üzrə yoxlama və akkreditasiya proseslərini idarə edir.', EN:'Oversees product audit, AQTA phytosanitary licensing, and international conformity assessments (ISO, GlobalGAP, Halal).', TR:'ISO, HACCP, Helal ve GlobalGAP standartları üzere denetim ve akreditasyon süreçlerini yönetir.', RU:'Курирует проверку стандартов качества, фитосанитарные сертификаты AQTA и международный комплаенс.', AR:'تشرف على معايير الجودة الدولية وتراخيص الامتثال (ISO, GlobalGAP, حلال).', ES:'Gestiona auditorías de producto, normativas de calidad y acreditaciones internacionales.' }),
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
      'compliance@azexbuy.com', 'https://linkedin.com', 4);
    console.log('[Backend] Demo team members seeded.');
  }
} catch (e) {
  console.warn('[Backend] Team seed warning:', e.message);
}

// ─── Schema migrations (safe, idempotent) ────────────────────────
['is_featured INTEGER DEFAULT 0', 'seo_title TEXT', 'seo_description TEXT'].forEach(col => {
  try { db.prepare(`ALTER TABLE articles ADD COLUMN ${col}`).run(); } catch {}
});

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

// ─── Articles Routes ─────────────────────────────────────────────
app.get('/api/articles', async (req, res) => {
  const cached = await getCache('articles:all');
  if (cached) return res.json(JSON.parse(cached));

  const rows = db.prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY created_at DESC").all();
  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    title: r.title,
    slug: r.slug,
    summary: r.summary,
    content: r.content,
    coverImage: r.cover_image,
    author: r.author,
    category: r.category,
    tags: JSON.parse(r.tags || '[]'),
    status: r.status,
    viewCount: r.view_count,
  }));

  await setCache('articles:all', JSON.stringify(result));
  res.json(result);
});

app.get('/api/articles/:slug', async (req, res) => {
  const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);
  if (!row) return res.status(404).json({ error: 'Article not found' });

  // Increment view count
  db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE slug = ?').run(req.params.slug);
  await delCache('articles:all');

  res.json({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    content: row.content,
    coverImage: row.cover_image,
    author: row.author,
    category: row.category,
    tags: JSON.parse(row.tags || '[]'),
    status: row.status,
    viewCount: row.view_count + 1,
  });
});

app.post('/api/articles', async (req, res) => {
  const d = req.body;
  if (!d.id || !d.title || !d.slug) {
    return res.status(400).json({ error: 'Missing required fields: id, title, slug' });
  }
  db.prepare(`
    INSERT OR REPLACE INTO articles
    (id, created_at, updated_at, title, slug, summary, content, cover_image,
     author, category, tags, status, view_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id,
    d.createdAt || new Date().toISOString(),
    d.updatedAt || new Date().toISOString(),
    d.title, d.slug,
    d.summary || '', d.content || '',
    d.coverImage || '',
    d.author || 'AZEXBUY Editorial',
    d.category || 'Trade Insights',
    JSON.stringify(d.tags || []),
    d.status || 'draft',
    d.viewCount || 0
  );
  await delCache('articles:all');
  res.json({ success: true, id: d.id });
});

app.patch('/api/articles/:id', async (req, res) => {
  const d = req.body;
  const fields = [];
  const vals = [];
  if (d.title !== undefined) { fields.push('title = ?'); vals.push(d.title); }
  if (d.summary !== undefined) { fields.push('summary = ?'); vals.push(d.summary); }
  if (d.content !== undefined) { fields.push('content = ?'); vals.push(d.content); }
  if (d.status !== undefined) { fields.push('status = ?'); vals.push(d.status); }
  if (d.coverImage !== undefined) { fields.push('cover_image = ?'); vals.push(d.coverImage); }
  if (d.tags !== undefined) { fields.push('tags = ?'); vals.push(JSON.stringify(d.tags)); }
  fields.push('updated_at = ?');
  vals.push(new Date().toISOString());
  vals.push(req.params.id);
  if (fields.length > 1) {
    db.prepare(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`).run(...vals);
  }
  await delCache('articles:all');
  res.json({ success: true });
});

app.delete('/api/articles/:id', async (req, res) => {
  db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
  await delCache('articles:all');
  res.json({ success: true });
});

// ─── Services Routes ─────────────────────────────────────────────
app.get('/api/azexbuy/services', async (req, res) => {
  const cached = await getCache('services:all');
  if (cached) return res.json(JSON.parse(cached));
  const rows = db.prepare('SELECT * FROM services ORDER BY sort_order ASC, created_at ASC').all();
  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    title: { AZ: r.title_az, EN: r.title_en, TR: r.title_tr, RU: r.title_ru },
    description: { AZ: r.description_az, EN: r.description_en, TR: r.description_tr, RU: r.description_ru },
    scope: {
      AZ: JSON.parse(r.scope_az || '[]'),
      EN: JSON.parse(r.scope_en || '[]'),
      TR: JSON.parse(r.scope_tr || '[]'),
      RU: JSON.parse(r.scope_ru || '[]'),
    },
    targetAudience: { AZ: r.target_audience_az, EN: r.target_audience_en, TR: r.target_audience_tr, RU: r.target_audience_ru },
    iconClass: r.icon_class,
    colorClass: r.color_class,
    serviceType: r.service_type,
    isActive: Boolean(r.is_active),
    sortOrder: r.sort_order,
  }));
  await setCache('services:all', JSON.stringify(result));
  res.json(result);
});

app.post('/api/azexbuy/services', async (req, res) => {
  const d = req.body;
  if (!d.id || !d.title) return res.status(400).json({ error: 'Missing required fields' });
  const t = d.title || {};
  const desc = d.description || {};
  const scope = d.scope || {};
  const ta = d.targetAudience || {};
  db.prepare(`
    INSERT OR REPLACE INTO services
    (id, created_at, updated_at, title_az, title_en, title_tr, title_ru,
     description_az, description_en, description_tr, description_ru,
     scope_az, scope_en, scope_tr, scope_ru,
     target_audience_az, target_audience_en, target_audience_tr, target_audience_ru,
     icon_class, color_class, service_type, is_active, sort_order)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    d.id, d.createdAt || new Date().toISOString(), new Date().toISOString(),
    t.AZ||'', t.EN||'', t.TR||'', t.RU||'',
    desc.AZ||'', desc.EN||'', desc.TR||'', desc.RU||'',
    JSON.stringify(scope.AZ||[]), JSON.stringify(scope.EN||[]),
    JSON.stringify(scope.TR||[]), JSON.stringify(scope.RU||[]),
    ta.AZ||'', ta.EN||'', ta.TR||'', ta.RU||'',
    d.iconClass||'fa-solid fa-briefcase', d.colorClass||'bg-brandNavy',
    d.serviceType||'primary', d.isActive===false?0:1, d.sortOrder||0
  );
  await delCache('services:all');
  res.json({ success: true, id: d.id });
});

app.patch('/api/azexbuy/services/:id', async (req, res) => {
  const d = req.body;
  const r = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  const t = d.title || { AZ: r.title_az, EN: r.title_en, TR: r.title_tr, RU: r.title_ru };
  const desc = d.description || { AZ: r.description_az, EN: r.description_en, TR: r.description_tr, RU: r.description_ru };
  const scope = d.scope || { AZ: JSON.parse(r.scope_az||'[]'), EN: JSON.parse(r.scope_en||'[]'), TR: JSON.parse(r.scope_tr||'[]'), RU: JSON.parse(r.scope_ru||'[]') };
  const ta = d.targetAudience || { AZ: r.target_audience_az, EN: r.target_audience_en, TR: r.target_audience_tr, RU: r.target_audience_ru };
  db.prepare(`
    UPDATE services SET
    updated_at=?, title_az=?, title_en=?, title_tr=?, title_ru=?,
    description_az=?, description_en=?, description_tr=?, description_ru=?,
    scope_az=?, scope_en=?, scope_tr=?, scope_ru=?,
    target_audience_az=?, target_audience_en=?, target_audience_tr=?, target_audience_ru=?,
    icon_class=?, color_class=?, service_type=?, is_active=?, sort_order=?
    WHERE id=?
  `).run(
    new Date().toISOString(),
    t.AZ||'', t.EN||'', t.TR||'', t.RU||'',
    desc.AZ||'', desc.EN||'', desc.TR||'', desc.RU||'',
    JSON.stringify(scope.AZ||[]), JSON.stringify(scope.EN||[]),
    JSON.stringify(scope.TR||[]), JSON.stringify(scope.RU||[]),
    ta.AZ||'', ta.EN||'', ta.TR||'', ta.RU||'',
    d.iconClass!==undefined?d.iconClass:r.icon_class,
    d.colorClass!==undefined?d.colorClass:r.color_class,
    d.serviceType!==undefined?d.serviceType:r.service_type,
    d.isActive!==undefined?(d.isActive?1:0):r.is_active,
    d.sortOrder!==undefined?d.sortOrder:r.sort_order,
    req.params.id
  );
  await delCache('services:all');
  res.json({ success: true });
});

app.delete('/api/azexbuy/services/:id', async (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  await delCache('services:all');
  res.json({ success: true });
});

// ─── Service Applications Routes ─────────────────────────────────
app.get('/api/azexbuy/service-applications', async (req, res) => {
  const cached = await getCache('service_applications:all');
  if (cached) return res.json(JSON.parse(cached));
  const rows = db.prepare('SELECT * FROM service_applications ORDER BY created_at DESC').all();
  const result = rows.map(r => ({
    id: r.id,
    createdAt: r.created_at,
    fullName: r.full_name,
    company: r.company,
    country: r.country,
    email: r.email,
    phone: r.phone,
    details: r.details,
    selectedServices: JSON.parse(r.selected_services || '[]'),
    status: r.status,
  }));
  await setCache('service_applications:all', JSON.stringify(result));
  res.json(result);
});

app.post('/api/azexbuy/service-applications', async (req, res) => {
  const d = req.body;
  if (!d.id || !d.fullName || !d.email) return res.status(400).json({ error: 'Missing required fields' });
  db.prepare(`
    INSERT OR REPLACE INTO service_applications
    (id, created_at, full_name, company, country, email, phone, details, selected_services, status)
    VALUES (?,?,?,?,?,?,?,?,?,?)
  `).run(
    d.id, d.createdAt || new Date().toISOString(),
    d.fullName, d.company||'', d.country||'', d.email,
    d.phone||'', d.details||'',
    JSON.stringify(d.selectedServices||[]), d.status||'Pending'
  );
  await delCache('service_applications:all');
  res.json({ success: true, id: d.id });
});

app.patch('/api/azexbuy/service-applications/:id', async (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE service_applications SET status = ? WHERE id = ?').run(status, req.params.id);
  await delCache('service_applications:all');
  res.json({ success: true });
});

app.delete('/api/azexbuy/service-applications/:id', async (req, res) => {
  db.prepare('DELETE FROM service_applications WHERE id = ?').run(req.params.id);
  await delCache('service_applications:all');
  res.json({ success: true });
});

// ─── Team Members Routes ──────────────────────────────────────────
const getTeamHandler = async (req, res) => {
  try {
    const cached = await getCache('azexbuy:team');
    if (cached && req.query.fresh !== '1') return res.json(JSON.parse(cached));
    const targetDb = (adminDb ? adminDb : db);
    const rows = targetDb.prepare('SELECT * FROM azexbuy_team_members ORDER BY sort_order ASC, created_at ASC').all();
    const result = rows.map(r => ({
      id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
      name: r.name, photo: r.photo, email: r.email, linkedin: r.linkedin,
      sortOrder: r.sort_order, isActive: Boolean(r.is_active),
      role: (() => { try { return JSON.parse(r.role); } catch { return { AZ: r.role }; } })(),
      bio: (() => { try { return JSON.parse(r.bio); } catch { return { AZ: r.bio }; } })(),
    }));
    await setCache('azexbuy:team', JSON.stringify(result));
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
app.get('/api/azexbuy/team', getTeamHandler);
app.get('/api/team', getTeamHandler);

const postTeamHandler = async (req, res) => {
  try {
    const d = req.body;
    if (!d.id || !d.name) return res.status(400).json({ error: 'Missing id or name' });
    const now = new Date().toISOString();
    const query = `INSERT OR REPLACE INTO azexbuy_team_members
      (id,created_at,updated_at,name,role,bio,photo,email,linkedin,sort_order,is_active)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
    const params = [
      d.id, d.createdAt || now, now, d.name,
      typeof d.role === 'string' ? d.role : JSON.stringify(d.role || {}),
      typeof d.bio === 'string' ? d.bio : JSON.stringify(d.bio || {}),
      d.photo || '', d.email || '', d.linkedin || '',
      d.sortOrder ?? 0, d.isActive !== false ? 1 : 0
    ];
    db.prepare(query).run(...params);
    if (adminDbRw) {
      try { adminDbRw.prepare(query).run(...params); } catch {}
    }
    await delCache('azexbuy:team');
    res.json({ success: true, id: d.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
app.post('/api/azexbuy/team', postTeamHandler);
app.post('/api/team', postTeamHandler);

const patchTeamHandler = async (req, res) => {
  try {
    const d = req.body;
    const now = new Date().toISOString();
    const existing = db.prepare('SELECT * FROM azexbuy_team_members WHERE id=?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Team member not found' });
    const name = d.name !== undefined ? d.name : existing.name;
    const role = d.role !== undefined ? (typeof d.role === 'string' ? d.role : JSON.stringify(d.role)) : existing.role;
    const bio = d.bio !== undefined ? (typeof d.bio === 'string' ? d.bio : JSON.stringify(d.bio)) : existing.bio;
    const photo = d.photo !== undefined ? d.photo : existing.photo;
    const email = d.email !== undefined ? d.email : existing.email;
    const linkedin = d.linkedin !== undefined ? d.linkedin : existing.linkedin;
    const sortOrder = d.sortOrder !== undefined ? d.sortOrder : existing.sort_order;
    const isActive = d.isActive !== undefined ? (d.isActive ? 1 : 0) : existing.is_active;

    const query = `UPDATE azexbuy_team_members SET updated_at=?,name=?,role=?,bio=?,photo=?,email=?,linkedin=?,sort_order=?,is_active=? WHERE id=?`;
    const params = [now, name, role, bio, photo, email, linkedin, sortOrder, isActive, req.params.id];
    db.prepare(query).run(...params);
    if (adminDbRw) {
      try { adminDbRw.prepare(query).run(...params); } catch {}
    }
    await delCache('azexbuy:team');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
app.patch('/api/azexbuy/team/:id', patchTeamHandler);
app.patch('/api/team/:id', patchTeamHandler);

const deleteTeamHandler = async (req, res) => {
  try {
    db.prepare('DELETE FROM azexbuy_team_members WHERE id=?').run(req.params.id);
    if (adminDbRw) {
      try { adminDbRw.prepare('DELETE FROM azexbuy_team_members WHERE id=?').run(req.params.id); } catch {}
    }
    await delCache('azexbuy:team');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
app.delete('/api/azexbuy/team/:id', deleteTeamHandler);
app.delete('/api/team/:id', deleteTeamHandler);

// ─── Seed Default Services ────────────────────────────────────────
const existingServices = db.prepare('SELECT COUNT(*) as cnt FROM services').get();
if (existingServices.cnt === 0) {
  const defaultServices = [
    {
      id: 'srv-market-access', sort_order: 1, service_type: 'primary', is_active: 1,
      icon_class: 'fa-solid fa-chart-line', color_class: 'bg-emerald-600',
      title_az: 'Bazar Araşdırması', title_en: 'Market Research',
      title_tr: 'Pazar Araştırması', title_ru: 'Исследование рынков',
      description_az: 'Məhsulunuz üçün beynəlxalq bazarlardakı tələbi, rəqabəti və satış imkanlarını araşdıraraq uyğun bazar istiqamətlərinin müəyyənləşdirilməsinə dəstək göstəririk.',
      description_en: 'We help identify suitable market directions by researching international demand, competition and sales opportunities for your product.',
      description_tr: 'Ürününüz için uluslararası pazarlardaki talep, rekabet ve satış imkânlarını araştırarak uygun pazar yönlerinin belirlenmesine yardımcı oluyoruz.',
      description_ru: 'Помогаем определить подходящие направления рынка, исследуя международный спрос, конкуренцию и возможности продаж для вашего продукта.',
      scope_az: JSON.stringify(['Bazar tələbinin araşdırılması','Rəqiblərin və qiymət səviyyəsinin təhlili','Potensial bazar imkanlarının müəyyənləşdirilməsi']),
      scope_en: JSON.stringify(['Market demand research','Competitor and price level analysis','Identification of potential market opportunities']),
      scope_tr: JSON.stringify(['Pazar talebinin araştırılması','Rakiplerin ve fiyat seviyelerinin analizi','Potansiyel pazar imkânlarının belirlenmesi']),
      scope_ru: JSON.stringify(['Исследование рыночного спроса','Анализ конкурентов и уровня цен','Определение потенциальных рыночных возможностей']),
      target_audience_az: 'İstehsalçılar və ixracatçılar',
      target_audience_en: 'Manufacturers and exporters',
      target_audience_tr: 'Üreticiler ve ihracatçılar',
      target_audience_ru: 'Производители и экспортёры',
    },
    {
      id: 'srv-buyer-search', sort_order: 2, service_type: 'primary', is_active: 1,
      icon_class: 'fa-solid fa-handshake', color_class: 'bg-sky-600',
      title_az: 'Alıcı Axtarışı', title_en: 'Buyer Search',
      title_tr: 'Alıcı Arama', title_ru: 'Поиск покупателей',
      description_az: 'Məhsulunuz üçün yoxlanılmış beynəlxalq alıcılar, distribütorlar və satınalma mərkəzləri ilə birbaşa B2B əlaqələrin qurulmasına koordinasiya edirik.',
      description_en: 'We coordinate establishing direct B2B connections with verified international buyers, distributors and procurement desks for your products.',
      description_tr: 'Ürününüz için doğrulanmış uluslararası alıcılar, distribütörler ve satın alma merkezleriyle doğrudan B2B bağlantıları kurulmasını koordine ediyoruz.',
      description_ru: 'Координируем установление прямых B2B-связей с проверенными международными покупателями, дистрибьюторами и закупочными центрами.',
      scope_az: JSON.stringify(['Alıcıların müəyyənləşdirilməsi və yoxlanılması','Distribütor şəbəkəsinin qurulması','B2B görüşlərinin təşkili','Danışıqların dəstəklənməsi']),
      scope_en: JSON.stringify(['Buyer identification and verification','Distribution network setup','B2B meeting organization','Negotiation support']),
      scope_tr: JSON.stringify(['Alıcıların belirlenmesi ve doğrulanması','Distribütör ağı kurulumu','B2B toplantı organizasyonu','Müzakere desteği']),
      scope_ru: JSON.stringify(['Выявление и верификация покупателей','Создание дистрибьюторской сети','Организация B2B-встреч','Поддержка переговоров']),
      target_audience_az: 'İstehsalçılar və ixracatçılar',
      target_audience_en: 'Manufacturers and exporters',
      target_audience_tr: 'Üreticiler ve ihracatçılar',
      target_audience_ru: 'Производители и экспортёры',
    },
    {
      id: 'srv-export-mgmt', sort_order: 3, service_type: 'primary', is_active: 1,
      icon_class: 'fa-solid fa-file-contract', color_class: 'bg-purple-600',
      title_az: 'İxracın İdarə Edilməsi', title_en: 'Export Management',
      title_tr: 'İhracat Yönetimi', title_ru: 'Управление экспортом',
      description_az: 'İxrac sənədlərinin hazırlanması, sertifikatlaşdırma prosesləri və gömrük rəsmiləşdirilməsi üçün uyğun xidmət təminatçıları ilə koordinasiya dəstəyi göstəririk.',
      description_en: 'We provide coordination support with appropriate service providers for export documentation, certification processes and customs clearance.',
      description_tr: 'İhracat belgelerinin hazırlanması, sertifikasyon süreçleri ve gümrük işlemleri için uygun hizmet sağlayıcılarla koordinasyon desteği sağlıyoruz.',
      description_ru: 'Обеспечиваем координационную поддержку с соответствующими поставщиками услуг для подготовки экспортной документации, сертификации и таможенного оформления.',
      scope_az: JSON.stringify(['Sənədləşmə dəstəyi','AQTA fitosanitar, CT-1/EUR.1 mənşə sənədləri','Gömrük rəsmiləşdirilməsinə koordinasiya','İcazə və lisenziya prosesləri']),
      scope_en: JSON.stringify(['Documentation support','AQTA phytosanitary, CT-1/EUR.1 origin documents','Customs clearance coordination','Permit and license processes']),
      scope_tr: JSON.stringify(['Belgeleme desteği','AQTA fitosaniter, CT-1/EUR.1 menşe belgeleri','Gümrük işlemleri koordinasyonu','İzin ve lisans süreçleri']),
      scope_ru: JSON.stringify(['Документационная поддержка','Фитосанитарный сертификат AQTA, CT-1/EUR.1','Координация таможенного оформления','Процессы разрешений и лицензий']),
      target_audience_az: 'İstehsalçılar və ixracatçılar',
      target_audience_en: 'Manufacturers and exporters',
      target_audience_tr: 'Üreticiler ve ihracatçılar',
      target_audience_ru: 'Производители и экспортёры',
    },
    {
      id: 'srv-logistics', sort_order: 4, service_type: 'primary', is_active: 1,
      icon_class: 'fa-solid fa-truck-fast', color_class: 'bg-amber-500',
      title_az: 'Beynəlxalq Logistika', title_en: 'International Logistics',
      title_tr: 'Uluslararası Lojistik', title_ru: 'Международная логистика',
      description_az: 'Orta Dəhliz (TİTR), Bakı Limanı (Ələt) və BTQ dəmir yolu vasitəsilə multimodal yük daşıma imkanlarının koordinasiyasında dəstək göstəririk.',
      description_en: 'We provide support in coordinating multimodal freight transport options via the Middle Corridor (TITR), Port of Baku (Alat) and BTK Railway.',
      description_tr: 'Orta Koridor (TITR), Bakü Limanı (Alat) ve BTK Demiryolu üzerinden çok modlu yük taşıma seçeneklerinin koordinasyonunda destek sağlıyoruz.',
      description_ru: 'Оказываем поддержку в координации мультимодальных грузоперевозок через Средний коридор (ТМТМ), Порт Баку (Алят) и ж/д БТК.',
      scope_az: JSON.stringify(['Avtomobil daşımaları (TIR)','Dəniz daşımaları (Xəzər/Qara dəniz)','Dəmir yolu daşımaları (BTQ)','Hava karqo','Anbar və soyuducu saxlama','Yük sığortası koordinasiyası']),
      scope_en: JSON.stringify(['Road freight (TIR)','Sea freight (Caspian/Black Sea)','Rail freight (BTK)','Air cargo','Warehousing and cold storage','Cargo insurance coordination']),
      scope_tr: JSON.stringify(['Karayolu taşımacılığı (TIR)','Deniz taşımacılığı (Hazar/Karadeniz)','Demiryolu taşımacılığı (BTK)','Hava kargo','Depolama ve soğuk hava deposu','Kargo sigortası koordinasyonu']),
      scope_ru: JSON.stringify(['Автоперевозки (TIR)','Морской фрахт (Каспий/Чёрное море)','Ж/д перевозки (БТК)','Авиакарго','Складирование и холодовая цепь','Координация страхования груза']),
      target_audience_az: 'İstehsalçılar, ixracatçılar və xarici alıcılar',
      target_audience_en: 'Manufacturers, exporters and foreign buyers',
      target_audience_tr: 'Üreticiler, ihracatçılar ve yabancı alıcılar',
      target_audience_ru: 'Производители, экспортёры и иностранные покупатели',
    },
    {
      id: 'srv-outsourced-export', sort_order: 5, service_type: 'secondary', is_active: 1,
      icon_class: 'fa-solid fa-building-columns', color_class: 'bg-brandNavy',
      title_az: 'Outsourced İxrac Departamenti', title_en: 'Outsourced Export Department',
      title_tr: 'Dış Kaynaklı İhracat Departmanı', title_ru: 'Аутсорсинг экспортного департамента',
      description_az: 'Öz ixrac departamentinizi qurmadan tam ixrac əməliyyatlarının idarə edilməsinə dəstək göstəririk: bazar araşdırmasından tutmuş alıcı axtarışına, sənədləşməyə və logistikaya qədər.',
      description_en: 'We support management of complete export operations without building your own export department: from market research to buyer search, documentation and logistics.',
      description_tr: 'Kendi ihracat departmanınızı kurmadan tam ihracat operasyonlarının yönetilmesine destek sağlıyoruz: pazar araştırmasından alıcı aramaya, belgeleme ve lojistiğe kadar.',
      description_ru: 'Поддерживаем управление полным экспортным операционным циклом без создания собственного департамента: от исследования рынка до поиска покупателей, документации и логистики.',
      scope_az: JSON.stringify(['Tam ixrac əməliyyatlarının koordinasiyası','Dedicated menecer dəstəyi','Bazar araşdırması + alıcı axtarışı + sənədləşmə + logistika','Aylıq hesabat və analitika']),
      scope_en: JSON.stringify(['Full export operations coordination','Dedicated manager support','Market research + buyer search + documentation + logistics','Monthly reporting and analytics']),
      scope_tr: JSON.stringify(['Tam ihracat operasyonları koordinasyonu','Özel yönetici desteği','Pazar araştırması + alıcı arama + belgeleme + lojistik','Aylık raporlama ve analitik']),
      scope_ru: JSON.stringify(['Координация полного экспортного цикла','Поддержка выделенного менеджера','Исследование рынка + поиск покупателей + документация + логистика','Ежемесячная отчётность и аналитика']),
      target_audience_az: 'İstehsalçılar və ixracatçılar',
      target_audience_en: 'Manufacturers and exporters',
      target_audience_tr: 'Üreticiler ve ihracatçılar',
      target_audience_ru: 'Производители и экспортёры',
    },
  ];

  const insertSrv = db.prepare(`
    INSERT OR IGNORE INTO services
    (id, created_at, updated_at, title_az, title_en, title_tr, title_ru,
     description_az, description_en, description_tr, description_ru,
     scope_az, scope_en, scope_tr, scope_ru,
     target_audience_az, target_audience_en, target_audience_tr, target_audience_ru,
     icon_class, color_class, service_type, is_active, sort_order)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const s of defaultServices) {
    insertSrv.run(
      s.id, new Date().toISOString(), new Date().toISOString(),
      s.title_az, s.title_en, s.title_tr, s.title_ru,
      s.description_az, s.description_en, s.description_tr, s.description_ru,
      s.scope_az, s.scope_en, s.scope_tr, s.scope_ru,
      s.target_audience_az, s.target_audience_en, s.target_audience_tr, s.target_audience_ru,
      s.icon_class, s.color_class, s.service_type, s.is_active, s.sort_order
    );
  }
  console.log('✓ Seeded 5 default services');
}

// ─── Localization & Content Routes ───────────────────────────────
app.get("/api/azexbuy/localization", (req, res) => {
  try {
    if (!adminDb) return res.json({});
    const row = adminDb.prepare("SELECT value FROM azexbuy_kv WHERE key = 'localization'").get();
    if (!row || !row.value) return res.json({});
    res.json(JSON.parse(row.value));
  } catch (e) { console.error("localization read error:", e.message); res.json({}); }
});

app.get("/api/azexbuy/content", (req, res) => {
  try {
    if (!adminDb) return res.json({});
    const row = adminDb.prepare("SELECT value FROM azexbuy_kv WHERE key = 'content'").get();
    if (!row || !row.value) return res.json({});
    res.json(JSON.parse(row.value));
  } catch (e) { console.error("content read error:", e.message); res.json({}); }
});

app.post("/api/azexbuy/content", (req, res) => {
  try {
    if (!adminDbRw) return res.status(503).json({ error: 'DB unavailable' });
    const data = req.body;
    adminDbRw.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('content', ?, ?)")
      .run(JSON.stringify(data), new Date().toISOString());
    res.json({ success: true });
  } catch (e) { console.error("content write error:", e.message); res.status(500).json({ error: e.message }); }
});

app.post("/api/azexbuy/localization", (req, res) => {
  try {
    if (!adminDbRw) return res.status(503).json({ error: 'DB unavailable' });
    const data = req.body;
    adminDbRw.prepare("INSERT OR REPLACE INTO azexbuy_kv (key, value, updated_at) VALUES ('localization', ?, ?)")
      .run(JSON.stringify(data), new Date().toISOString());
    res.json({ success: true });
  } catch (e) { console.error("localization write error:", e.message); res.status(500).json({ error: e.message }); }
});

// ─── AZEXBUY Articles Alias ──────────────────────────────────────
app.get('/api/azexbuy/articles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const category = req.query.category || null;
    let query = "SELECT * FROM articles WHERE status = 'published'";
    const params = [];
    if (category) { query += ' AND category = ?'; params.push(category); }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(r => ({
      id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
      title: r.title, slug: r.slug, summary: r.summary, content: r.content,
      coverImage: r.cover_image, author: r.author, category: r.category,
      tags: JSON.parse(r.tags || '[]'), status: r.status, viewCount: r.view_count,
      isPublished: r.status === 'published', publishedAt: r.created_at,
      isFeatured: Boolean(r.is_featured || 0), seoTitle: r.seo_title, seoDescription: r.seo_description,
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/azexbuy/articles/featured', async (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM articles WHERE status = 'published' AND is_featured = 1 ORDER BY created_at DESC LIMIT 1").get()
      || db.prepare("SELECT * FROM articles WHERE status = 'published' ORDER BY view_count DESC LIMIT 1").get();
    if (!row) return res.json(null);
    res.json({
      id: row.id, createdAt: row.created_at, updatedAt: row.updated_at,
      title: row.title, slug: row.slug, summary: row.summary, content: row.content,
      coverImage: row.cover_image, author: row.author, category: row.category,
      tags: JSON.parse(row.tags || '[]'), status: row.status, viewCount: row.view_count,
      isPublished: row.status === 'published', publishedAt: row.created_at,
      isFeatured: true, seoTitle: row.seo_title, seoDescription: row.seo_description,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/azexbuy/articles/:slug', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);
    if (!row) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').run(row.id);
    res.json({
      id: row.id, createdAt: row.created_at, updatedAt: row.updated_at,
      title: row.title, slug: row.slug, summary: row.summary, content: row.content,
      coverImage: row.cover_image, author: row.author, category: row.category,
      tags: JSON.parse(row.tags || '[]'), status: row.status, viewCount: row.view_count + 1,
      isPublished: row.status === 'published', publishedAt: row.created_at,
      isFeatured: Boolean(row.is_featured || 0), seoTitle: row.seo_title, seoDescription: row.seo_description,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Admin Articles CRUD ─────────────────────────────────────────
const mapArticle = r => ({
  id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
  title: r.title, slug: r.slug, summary: r.summary, content: r.content,
  coverImage: r.cover_image, author: r.author, category: r.category,
  tags: JSON.parse(r.tags || '[]'), status: r.status, viewCount: r.view_count,
  isPublished: r.status === 'published', publishedAt: r.created_at,
  isFeatured: Boolean(r.is_featured || 0), seoTitle: r.seo_title, seoDescription: r.seo_description,
});

app.get('/api/azexbuy/admin/articles', async (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    res.json(rows.map(mapArticle));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/azexbuy/admin/articles', async (req, res) => {
  try {
    const { title, slug, category, summary, content, coverImage, author, seoTitle, seoDescription, isPublished } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });
    const existing = db.prepare('SELECT id FROM articles WHERE slug = ?').get(slug);
    if (existing) return res.status(409).json({ error: 'Slug already exists' });
    const id = `art-${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO articles (id, created_at, updated_at, title, slug, category, summary, content, cover_image, author, seo_title, seo_description, status, tags, view_count, is_featured)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0)`).run(id, now, now, title, slug, category || 'Export Guides', summary || '', content || '', coverImage || '', author || 'AZEXBUY Editorial', seoTitle || '', seoDescription || '', isPublished ? 'published' : 'draft', '[]');
    await delCache('articles:all');
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/azexbuy/admin/articles/:id', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const b = req.body;
    const now = new Date().toISOString();
    db.prepare(`UPDATE articles SET updated_at=?, title=COALESCE(?,title), slug=COALESCE(?,slug), category=COALESCE(?,category), summary=COALESCE(?,summary), content=COALESCE(?,content), cover_image=COALESCE(?,cover_image), author=COALESCE(?,author), seo_title=COALESCE(?,seo_title), seo_description=COALESCE(?,seo_description), status=COALESCE(?,status) WHERE id=?`).run(now, b.title, b.slug, b.category, b.summary, b.content, b.coverImage, b.author, b.seoTitle, b.seoDescription, b.isPublished !== undefined ? (b.isPublished ? 'published' : 'draft') : null, req.params.id);
    await delCache('articles:all');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/azexbuy/admin/articles/:id/feature', async (req, res) => {
  try {
    db.prepare('UPDATE articles SET is_featured = 0').run();
    db.prepare('UPDATE articles SET is_featured = 1 WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/azexbuy/admin/articles/:id/unfeature', async (req, res) => {
  try {
    db.prepare('UPDATE articles SET is_featured = 0 WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/azexbuy/admin/articles/:id', async (req, res) => {
  try {
    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    await delCache('articles:all');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Categories + Products Tables & CRUD ─────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT DEFAULT '',
    description TEXT DEFAULT '',
    moq TEXT DEFAULT '',
    hs_code TEXT DEFAULT '',
    origin_region TEXT DEFAULT '',
    packaging_info TEXT DEFAULT '',
    certificates TEXT DEFAULT '[]',
    images TEXT DEFAULT '[]',
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    seo_title TEXT DEFAULT '',
    seo_description TEXT DEFAULT '',
    view_count INTEGER DEFAULT 0
  );
`);

const mapCat = r => ({
  id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
  name: tryParse(r.name), slug: r.slug, description: tryParse(r.description),
  imageUrl: r.image_url, sortOrder: r.sort_order, isActive: Boolean(r.is_active),
});

const mapProd = (r, cats) => {
  const cat = cats ? cats.find(c => c.id === r.category_id) : null;
  return {
    id: r.id, createdAt: r.created_at, updatedAt: r.updated_at,
    categoryId: r.category_id, categoryName: cat ? (typeof cat.name === 'object' ? (cat.name.EN || cat.name.AZ) : cat.name) : '',
    name: tryParse(r.name), slug: r.slug,
    shortDescription: tryParse(r.short_description), description: tryParse(r.description),
    moq: r.moq, hsCode: r.hs_code, originRegion: r.origin_region, packagingInfo: r.packaging_info,
    certificates: JSON.parse(r.certificates || '[]'), images: JSON.parse(r.images || '[]'),
    isFeatured: Boolean(r.is_featured), isActive: Boolean(r.is_active),
    seoTitle: r.seo_title, seoDescription: r.seo_description, viewCount: r.view_count,
  };
};

function tryParse(val) {
  if (!val) return val;
  try { const p = JSON.parse(val); if (typeof p === 'object' && !Array.isArray(p)) return p; return val; } catch { return val; }
}

// Categories
app.get('/api/azexbuy/categories', async (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM product_categories ORDER BY sort_order ASC, created_at ASC').all();
    res.json(rows.map(mapCat));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/azexbuy/categories', async (req, res) => {
  try {
    const { name, slug, description, imageUrl, sortOrder } = req.body;
    if (!slug) return res.status(400).json({ error: 'slug required' });
    const existing = db.prepare('SELECT id FROM product_categories WHERE slug = ?').get(slug);
    if (existing) return res.status(409).json({ error: 'Slug already exists' });
    const id = `cat-${Date.now()}`;
    const now = new Date().toISOString();
    const nameStr = typeof name === 'object' ? JSON.stringify(name) : (name || slug);
    const descStr = typeof description === 'object' ? JSON.stringify(description) : (description || '');
    db.prepare('INSERT INTO product_categories (id,created_at,updated_at,name,slug,description,image_url,sort_order) VALUES (?,?,?,?,?,?,?,?)').run(id, now, now, nameStr, slug, descStr, imageUrl || '', sortOrder || 0);
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/azexbuy/categories/:id', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM product_categories WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const b = req.body;
    const now = new Date().toISOString();
    if (b.name !== undefined) db.prepare('UPDATE product_categories SET name=?, updated_at=? WHERE id=?').run(typeof b.name === 'object' ? JSON.stringify(b.name) : b.name, now, req.params.id);
    if (b.slug !== undefined) db.prepare('UPDATE product_categories SET slug=?, updated_at=? WHERE id=?').run(b.slug, now, req.params.id);
    if (b.description !== undefined) db.prepare('UPDATE product_categories SET description=?, updated_at=? WHERE id=?').run(typeof b.description === 'object' ? JSON.stringify(b.description) : b.description, now, req.params.id);
    if (b.imageUrl !== undefined) db.prepare('UPDATE product_categories SET image_url=?, updated_at=? WHERE id=?').run(b.imageUrl, now, req.params.id);
    if (b.isActive !== undefined) db.prepare('UPDATE product_categories SET is_active=?, updated_at=? WHERE id=?').run(b.isActive ? 1 : 0, now, req.params.id);
    if (b.sortOrder !== undefined) db.prepare('UPDATE product_categories SET sort_order=?, updated_at=? WHERE id=?').run(b.sortOrder, now, req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/azexbuy/categories/:id', async (req, res) => {
  try {
    const prods = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(req.params.id);
    if (prods.c > 0) return res.status(409).json({ error: `Bu kateqoriyada ${prods.c} məhsul var. Əvvəlcə məhsulları silin.` });
    db.prepare('DELETE FROM product_categories WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Products
app.get('/api/azexbuy/admin/products', async (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    const cats = db.prepare('SELECT * FROM product_categories').all().map(mapCat);
    res.json(rows.map(r => mapProd(r, cats)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/azexbuy/products', async (req, res) => {
  try {
    const catId = req.query.categoryId || null;
    let q = "SELECT * FROM products WHERE is_active = 1";
    const params = [];
    if (catId) { q += ' AND category_id = ?'; params.push(catId); }
    q += ' ORDER BY is_featured DESC, created_at DESC';
    const rows = db.prepare(q).all(...params);
    const cats = db.prepare('SELECT * FROM product_categories').all().map(mapCat);
    res.json(rows.map(r => mapProd(r, cats)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/azexbuy/admin/products', async (req, res) => {
  try {
    const { categoryId, name, slug, shortDescription, description, moq, hsCode, originRegion, packagingInfo, isFeatured, seoTitle, seoDescription, certificates, images } = req.body;
    if (!slug || !categoryId) return res.status(400).json({ error: 'slug and categoryId required' });
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
    if (existing) return res.status(409).json({ error: 'Slug already exists' });
    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const nameStr = typeof name === 'object' ? JSON.stringify(name) : (name || slug);
    const sdStr = typeof shortDescription === 'object' ? JSON.stringify(shortDescription) : (shortDescription || '');
    const dStr = typeof description === 'object' ? JSON.stringify(description) : (description || '');
    db.prepare(`INSERT INTO products (id,created_at,updated_at,category_id,name,slug,short_description,description,moq,hs_code,origin_region,packaging_info,is_featured,is_active,seo_title,seo_description,certificates,images,view_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?,?,?,0)`).run(id, now, now, categoryId, nameStr, slug, sdStr, dStr, moq || '', hsCode || '', originRegion || '', packagingInfo || '', isFeatured ? 1 : 0, seoTitle || '', seoDescription || '', JSON.stringify(certificates || []), JSON.stringify(images || []));
    res.status(201).json({ id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/azexbuy/admin/products/:id', async (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const b = req.body;
    const now = new Date().toISOString();
    const fields = {
      name: b.name !== undefined ? (typeof b.name === 'object' ? JSON.stringify(b.name) : b.name) : undefined,
      slug: b.slug, category_id: b.categoryId,
      short_description: b.shortDescription !== undefined ? (typeof b.shortDescription === 'object' ? JSON.stringify(b.shortDescription) : b.shortDescription) : undefined,
      description: b.description !== undefined ? (typeof b.description === 'object' ? JSON.stringify(b.description) : b.description) : undefined,
      moq: b.moq, hs_code: b.hsCode, origin_region: b.originRegion, packaging_info: b.packagingInfo,
      is_featured: b.isFeatured !== undefined ? (b.isFeatured ? 1 : 0) : undefined,
      is_active: b.isActive !== undefined ? (b.isActive ? 1 : 0) : undefined,
      seo_title: b.seoTitle, seo_description: b.seoDescription,
    };
    for (const [col, val] of Object.entries(fields)) {
      if (val !== undefined) db.prepare(`UPDATE products SET ${col}=?, updated_at=? WHERE id=?`).run(val, now, req.params.id);
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/azexbuy/admin/products/:id', async (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', redis: redis ? 'connected' : 'unavailable', db: 'sqlite' });
});

// ─── Seed Demo Articles ───────────────────────────────────────────
const existingArticles = db.prepare('SELECT COUNT(*) as cnt FROM articles').get();
if (existingArticles.cnt === 0) {
const seedArticles = [
    {
      id: 'art-001',
      created_at: '2026-10-15T10:00:00.000Z',
      updated_at: '2026-10-15T10:00:00.000Z',
      title: "Azerbaijan's Middle Corridor: The New Silk Road Opportunity",
      slug: 'azerbaijan-middle-corridor-new-silk-road',
      summary: 'How the Trans-Caspian International Transport Route (TITR) is reshaping global trade flows and opening unprecedented export opportunities for Azerbaijani producers.',
      content: "The Middle Corridor — officially the Trans-Caspian International Transport Route (TITR) — has emerged as one of the most strategically significant trade arteries of the 21st century. Stretching from China through Kazakhstan, the Caspian Sea, Azerbaijan, Georgia, and onward to Europe, this route offers transit times of 15-18 days compared to 30-45 days via the Northern Route through Russia.\n\nAzerbaijan sits at the geographical and logistical heart of this corridor. The Port of Alat (Baku International Sea Trade Port), completed in 2018, has a capacity of 15 million tonnes per year and serves as the primary Caspian gateway. With roll-on/roll-off (RoRo) ferry services, container handling, and direct rail connections to the BTK (Baku-Tbilisi-Kars) line, Alat is now handling record cargo volumes.\n\nFor Azerbaijani exporters, the Middle Corridor translates into direct access to the EU market — particularly Germany, Austria, and Central European buyers — without Russian territory dependency. Agricultural commodities including hazelnuts, pomegranates, dried fruits, and saffron are increasingly being shipped via this route with EUR.1 origin certificates and AQTA phytosanitary documentation.\n\nKey statistics for 2026: Container throughput on the TITR increased by 87% year-on-year. Azerbaijan handled over 2.1 million tonnes of transit cargo in the first half of 2026 alone. The BTK railway now operates 10 freight trains per week in each direction.\n\nFor buyers seeking Azerbaijani commodities, the Middle Corridor means shorter lead times, competitive CIF pricing to Black Sea ports (Constanta, Odessa, Varna), and a well-documented chain of custody from farm to destination port.",
      cover_image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      author: 'AZEXBUY Trade Intelligence',
      category: 'Trade Insights',
      tags: JSON.stringify(['Middle Corridor', 'TITR', 'Logistics', 'Export']),
      status: 'published',
      view_count: 142,
    },
    {
      id: 'art-002',
      created_at: '2026-10-22T08:30:00.000Z',
      updated_at: '2026-10-22T08:30:00.000Z',
      title: 'Azerbaijani Hazelnut Export: 2026 Season Outlook and Pricing Guide',
      slug: 'azerbaijan-hazelnut-export-2026-season',
      summary: 'A comprehensive breakdown of the 2026 Sheki-Zaqatala hazelnut harvest, international pricing benchmarks, packaging standards, and what buyers need to know before issuing an RFQ.',
      content: "Azerbaijan is the world's fourth-largest hazelnut producer, and the Sheki-Zaqatala economic region accounts for over 85% of domestic output. The 2026 season has produced an estimated 48,000 metric tonnes of in-shell hazelnuts, with shelled kernel yield projections at approximately 22,000 MT.\n\nVariety Profile: The dominant variety is Ata-Baba (locally called Topbari), prized for its rich fat content (60-65%), large caliber (11-13mm), and low free fatty acid (FFA) values below 0.5%. European confectionery buyers — particularly in Germany, Italy, and Switzerland — specifically request Ata-Baba for premium chocolate and praline applications.\n\nPricing (October 2026 FOB Baku): In-shell natural: USD 2,100-2,350/MT. Shelled blanched kernels: USD 5,800-6,400/MT. Shelled natural kernels: USD 5,200-5,800/MT. Roasted kernels: USD 6,500-7,200/MT.\n\nPackaging Standards: 25kg vacuum-sealed foil bags (export standard), 10kg retail-ready bags available. Jute sacks are accepted for some CIS market buyers but EU buyers typically require vacuum foil.\n\nCertification Requirements for EU Market: AQTA phytosanitary certificate, EUR.1 movement certificate, ISO 22000 food safety management, aflatoxin testing report (B1+B2+G1+G2 less than 4 ppb for EU), and moisture content certificate (max 5.5% for shelled kernels).\n\nLead Times: Spot orders (existing stock): 7-14 days. Custom specification orders: 21-35 days depending on processing facility availability. Full container (20ft FCL = approx. 18 MT shelled) is the standard minimum order for international buyers.",
      cover_image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&q=80',
      author: 'AZEXBUY Commodity Desk',
      category: 'Commodity Reports',
      tags: JSON.stringify(['Hazelnut', 'Agriculture', 'Pricing', 'Export Guide']),
      status: 'published',
      view_count: 289,
    },
    {
      id: 'art-003',
      created_at: '2026-11-01T12:00:00.000Z',
      updated_at: '2026-11-01T12:00:00.000Z',
      title: "Understanding Azerbaijan's Export Certification Stack: AQTA, EUR.1, CT-1 and ISO",
      slug: 'azerbaijan-export-certifications-guide',
      summary: 'A step-by-step guide to the documentation required for exporting Azerbaijani goods to the EU, GCC, and CIS markets — including which certificates are mandatory, optional, and how to obtain them.',
      content: "Navigating Azerbaijan's export certification landscape is one of the most common challenges for first-time international buyers. This guide breaks down every document you may need, who issues it, and how long it takes.\n\n**AQTA Phytosanitary Certificate**: Issued by the Food Safety Agency of Azerbaijan (AQTA), this is mandatory for all agricultural and food products. It certifies that the goods are free from pests and plant diseases as required by the importing country. Processing time: 3-5 business days. Cost: AZN 25-80 depending on product category.\n\n**EUR.1 Movement Certificate**: This is the preferential origin certificate used for exports to countries with which the EU has free trade or origin protocols. Azerbaijan uses EUR.1 for exports transiting via Georgia to the EU under the DCFTA framework. The certificate must be endorsed by the Chamber of Commerce of Azerbaijan. Processing time: 1-2 business days.\n\n**CT-1 Certificate**: The CT-1 is the CIS-specific certificate of origin for exports to Russia, Kazakhstan, Belarus, Kyrgyzstan, and other EAEU member states. It grants preferential tariff treatment under the CIS Free Trade Agreement. Issued by the Chamber of Commerce.\n\n**ISO 22000 / HACCP**: Increasingly required by EU and GCC supermarket chains. This food safety management system certification is obtained from accredited international bodies (Bureau Veritas, SGS, TUV). Azerbaijani processing facilities with ISO 22000 certification can command a 5-12% price premium.\n\n**Halal Certificate**: Mandatory for GCC (Saudi Arabia, UAE, Qatar) and many Southeast Asian buyers. Issued by the Azerbaijan Muslim Religious Board (QUMC) or internationally recognized bodies like JAKIM or MUI. Processing time: 7-14 days.\n\n**Practical Checklist for EU Buyers**: AQTA phytosanitary + EUR.1 + quality assay report + aflatoxin test + moisture certificate. For producers: ensure your facility has AQTA registration, ISO 22000, and that your VOEN (tax ID) is registered for export operations.",
      cover_image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
      author: 'AZEXBUY Legal and Compliance',
      category: 'Compliance',
      tags: JSON.stringify(['Certification', 'AQTA', 'EUR.1', 'Compliance', 'Export']),
      status: 'published',
      view_count: 198,
    },
    {
      id: 'art-004',
      created_at: '2026-11-04T09:15:00.000Z',
      updated_at: '2026-11-04T09:15:00.000Z',
      title: 'Pomegranate Season 2026: Goychay PGI and Export Windows',
      slug: 'pomegranate-goychay-pgi-export-2026',
      summary: "Goychay pomegranates hold Protected Geographical Indication (PGI) status and are among Azerbaijan's most prestigious agricultural exports. Everything buyers need to know for the October-December 2026 export window.",
      content: "The Goychay Pomegranate Festival — held annually in October — signals the start of Azerbaijan's most celebrated agricultural export season. The Goychay variety holds PGI (Protected Geographical Indication) status and is distinguished by its thin skin, ruby-red arils, low acidity, and Brix value of 15-18.\n\n**2026 Harvest Data**: Total production in Goychay and surrounding Karabakh-Mil economic region: approximately 165,000 MT. Export-grade (caliber 350g+): around 52,000 MT available for international buyers. Primary markets: Russia (CIS route), UAE, Saudi Arabia (Gulf route), Germany, France (EU route via Middle Corridor).\n\n**Pricing (November 2026 FOB Baku)**: Grade A (380g+, PGI-labeled): USD 0.85-1.10/kg. Grade B (280-380g): USD 0.55-0.75/kg. Pomegranate juice concentrate (65 Brix): USD 2,800-3,200/MT.\n\n**Export Window**: Fresh pomegranates: October 1 to December 20. Cold storage extended availability: through February (quality degradation risk noted after 90 days at 5-7C, 90% RH).\n\n**Packaging**: Standard export: 5kg mesh bags or 10kg cartons with individual foam wrapping. Premium EU/UAE market: single-layer presentation boxes with PGI sticker.\n\n**Logistics**: Transit time to Dubai (Baku to Alat Port to Bandar Abbas ferry): 6-8 days. Transit time to Hamburg (Baku to Tbilisi to Poti to container ship): 18-22 days. Air freight from Heydar Aliyev International Airport (GYD) to major EU/Gulf hubs available for premium express shipments.",
      cover_image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
      author: 'AZEXBUY Commodity Desk',
      category: 'Commodity Reports',
      tags: JSON.stringify(['Pomegranate', 'Goychay', 'PGI', 'Agriculture', 'Season']),
      status: 'published',
      view_count: 176,
    },
  ];

  const insertArticle = db.prepare(`
    INSERT OR IGNORE INTO articles
    (id, created_at, updated_at, title, slug, summary, content, cover_image, author, category, tags, status, view_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of seedArticles) {
    insertArticle.run(a.id, a.created_at, a.updated_at, a.title, a.slug, a.summary, a.content, a.cover_image, a.author, a.category, a.tags, a.status, a.view_count);
  }
  console.log('✓ Seeded 4 demo articles');
}

app.listen(PORT, () => {
  console.log(`AZEXBUY Backend running on http://localhost:${PORT}`);
});
