import fs from 'fs';
import readline from 'readline';

const LIVE_URL = 'https://beta.azexbuy.com';
const CSV_PATH = '/Users/ali_new/Desktop/Azerbaycan_ihracat_mehsullari_tekrarsiz.csv';

// Category mapping helper
function mapSectorToCategory(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes('kənd') || s.includes('qida')) return 'cat-agri';
  if (s.includes('tikinti')) return 'cat-construction';
  if (s.includes('kimya')) return 'cat-chemicals';
  if (s.includes('taxta') || s.includes('kağız')) return 'cat-packaging';
  if (s.includes('metall') || s.includes('maşın') || s.includes('elektrik') || s.includes('cihaz') || s.includes('nəqliyyat') || s.includes('dəri') || s.includes('yüngül') || s.includes('sənaye')) {
    return 'cat-industrial';
  }
  return 'cat-industrial';
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ə': 'e', 'Ə': 'e', 'ı': 'i', 'I': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o',
    'ü': 'u', 'Ü': 'u', 'ş': 's', 'Ş': 's', 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g'
  };
  let clean = text.split('').map(c => trMap[c] || c).join('').toLowerCase();
  return clean
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function login(): Promise<string> {
  const res = await fetch(`${LIVE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });
  const data = await res.json();
  if (!data?.data?.token) {
    throw new Error('Login failed: ' + JSON.stringify(data));
  }
  return data.data.token;
}

async function run() {
  console.log('Logging in to live server...');
  const token = await login();
  console.log('Logged in successfully.');

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Get existing products to avoid duplicates
  const existingRes = await fetch(`${LIVE_URL}/api/azexbuy/admin/products`, { headers: authHeaders });
  const existingProds = await existingRes.json();
  const existingNames = new Set<string>();
  const existingSlugs = new Set<string>();

  if (Array.isArray(existingProds)) {
    for (const p of existingProds) {
      const azName = typeof p.name === 'object' ? p.name.AZ : p.name;
      if (azName) existingNames.add(azName.trim().toLowerCase());
      if (p.slug) existingSlugs.add(p.slug.trim().toLowerCase());
    }
  }
  console.log(`Found ${existingProds.length} existing products in DB.`);

  const fileStream = fs.createReadStream(CSV_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let isHeader = true;
  let added = 0;
  let skipped = 0;
  let failed = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (isHeader) {
      isHeader = false;
      continue;
    }

    const parts = line.split(';');
    if (parts.length < 3) continue;

    const sira = parts[0]?.trim();
    const sector = parts[1]?.trim();
    const productName = parts[2]?.trim();

    if (!productName || productName.toLowerCase() === 'məhsul') continue;

    const normalizedName = productName.toLowerCase();
    if (existingNames.has(normalizedName)) {
      skipped++;
      continue;
    }

    let slug = slugify(productName);
    if (!slug) slug = `prod-${sira || Date.now()}`;
    let uniqueSlug = slug;
    let counter = 1;
    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    existingSlugs.add(uniqueSlug);
    existingNames.add(normalizedName);

    const categoryId = mapSectorToCategory(sector);

    const payload = {
      categoryId,
      name: {
        AZ: productName,
        EN: productName, // fallback
        TR: productName,
        RU: productName,
      },
      slug: uniqueSlug,
      shortDescription: {
        AZ: `Azərbaycan istehsalı yüksək keyfiyyətli ${productName}. İxrac standartlarına tam uyğundur.`,
        EN: `Export-grade ${productName} produced in Azerbaijan conforming to international quality standards.`,
        TR: `Azerbaycan üretimi yüksek kaliteli ${productName}. İhracat standartlarına uygundur.`,
        RU: `Высококачественный экспортный продукт из Азербайджана: ${productName}.`,
      },
      description: `Azərbaycan Respublikasının daxili sənaye və aqrar klasterlərində istehsal olunan ${productName}. Məhsul beynəlxalq ticarət, standartlaşdırma və fitosanitar/sənaye tələblərinə cavab verir.`,
      originRegion: 'Azərbaycan',
      packagingInfo: 'İxrac qablaşdırması / Standart konteyner və ya palet',
      isFeatured: false,
    };

    try {
      const postRes = await fetch(`${LIVE_URL}/api/azexbuy/admin/products`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (postRes.ok) {
        added++;
        if (added % 25 === 0) {
          console.log(`Progress: ${added} added, ${skipped} skipped...`);
        }
      } else {
        console.error(`Failed to add ${productName}: ${postRes.status} ${await postRes.text()}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`Error adding ${productName}:`, err?.message);
      failed++;
    }
  }

  console.log(`\nImport Summary:`);
  console.log(`✓ Added: ${added}`);
  console.log(`• Skipped (Already existed): ${skipped}`);
  console.log(`✗ Failed: ${failed}`);

  // Check total count on live server
  const finalRes = await fetch(`${LIVE_URL}/api/azexbuy/products`);
  const finalProds = await finalRes.json();
  console.log(`Total live products now: ${finalProds.length}`);
}

run().catch(console.error);
