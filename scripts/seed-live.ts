import { SEED_PRODUCTS, SEED_ARTICLES, SEED_CMS_PRODUCTS, SEED_SERVICES } from '../admin/src/seed.js';

const BASE_URL = 'https://beta.azexbuy.com';

async function main() {
  console.log('🚀 AZEXBUY Real Site Seeding Starting...');
  console.log(`🌐 Target: ${BASE_URL}`);

  // 1. Login to obtain JWT
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }

  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  if (!token) throw new Error('No JWT token returned from login');
  console.log('✅ Logged in successfully as admin.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Fetch existing products to avoid slug collisions
  const existingProdsRes = await fetch(`${BASE_URL}/api/azexbuy/admin/products`, { headers: authHeaders });
  if (existingProdsRes.ok) {
    const existingProds = await existingProdsRes.json();
    console.log(`📦 Found ${existingProds.length} existing products on live server.`);
    for (const ep of existingProds) {
      if (SEED_PRODUCTS.some(sp => sp.slug === ep.slug)) {
        console.log(`  🗑️ Removing old version of product: ${ep.slug} (${ep.id})`);
        await fetch(`${BASE_URL}/api/azexbuy/admin/products/${ep.id}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
      }
    }
  }

  // 3. Seed Products
  console.log(`\n🌱 Seeding ${SEED_PRODUCTS.length} detailed export products...`);
  let prodSuccess = 0;
  for (const p of SEED_PRODUCTS) {
    const res = await fetch(`${BASE_URL}/api/azexbuy/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        technicalSpecs: p.technicalSpecs,
        images: p.images,
        moq: p.moq,
        certificates: p.certificates,
        packagingInfo: p.packagingInfo,
        hsCode: p.hsCode,
        originRegion: p.originRegion,
        isFeatured: p.isFeatured,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      }),
    });

    if (res.status === 201 || res.status === 200) {
      const data = await res.json();
      console.log(`  ✓ Product created: [${p.hsCode || 'NO-HS'}] ${p.name} (ID: ${data.id})`);
      prodSuccess++;
    } else {
      console.error(`  ❌ Failed to create product ${p.name}: ${res.status} ${await res.text()}`);
    }
  }

  // 4. Fetch existing articles to avoid slug collisions
  const existingArtsRes = await fetch(`${BASE_URL}/api/azexbuy/admin/articles`, { headers: authHeaders });
  if (existingArtsRes.ok) {
    const existingArts = await existingArtsRes.json();
    console.log(`\n📰 Found ${existingArts.length} existing articles on live server.`);
    for (const ea of existingArts) {
      if (SEED_ARTICLES.some(sa => sa.slug === ea.slug)) {
        console.log(`  🗑️ Removing old version of article: ${ea.slug} (${ea.id})`);
        await fetch(`${BASE_URL}/api/azexbuy/admin/articles/${ea.id}`, {
          method: 'DELETE',
          headers: authHeaders,
        });
      }
    }
  }

  // 5. Seed Articles
  console.log(`\n🌱 Seeding ${SEED_ARTICLES.length} in-depth trade & market articles...`);
  let artSuccess = 0;
  for (const a of SEED_ARTICLES) {
    const res = await fetch(`${BASE_URL}/api/azexbuy/admin/articles`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: a.title,
        slug: a.slug,
        category: a.category,
        summary: a.summary,
        content: a.content,
        coverImage: a.coverImage,
        seoTitle: a.seoTitle,
        seoDescription: a.seoDescription,
        isPublished: true,
        author: a.author || 'AZEXBUY',
      }),
    });

    if (res.status === 201 || res.status === 200) {
      const data = await res.json();
      console.log(`  ✓ Article published: "${a.title.slice(0, 50)}..." (ID: ${data.id})`);
      artSuccess++;
    } else {
      console.error(`  ❌ Failed to create article "${a.title}": ${res.status} ${await res.text()}`);
    }
  }

  // 6. Seed CMS Content (Homepage Carousel Products & Services)
  console.log(`\n🌱 Updating CMS Content (Carousel Products & Services Pillars)...`);
  const contentRes = await fetch(`${BASE_URL}/api/azexbuy/content`);
  let contentData: any = {};
  if (contentRes.ok) {
    try {
      const text = await contentRes.text();
      contentData = JSON.parse(text);
    } catch {}
  }

  contentData.products = SEED_CMS_PRODUCTS;
  
  // Format services for CMS content if needed
  contentData.servicesPillars = SEED_SERVICES.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    scope: s.scope,
    targetAudience: s.targetAudience,
    iconClass: s.iconClass,
    colorClass: s.colorClass,
    serviceType: s.serviceType,
  }));

  const saveContentRes = await fetch(`${BASE_URL}/api/azexbuy/content`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(contentData),
  });

  if (saveContentRes.ok) {
    console.log(`  ✓ CMS content updated with ${SEED_CMS_PRODUCTS.length} carousel products and services.`);
  } else {
    console.error(`  ❌ Failed to update CMS content: ${saveContentRes.status} ${await saveContentRes.text()}`);
  }

  // 7. Verification
  console.log('\n🔍 Verifying public endpoints...');
  const verifyProds = await (await fetch(`${BASE_URL}/api/azexbuy/products`)).json();
  const verifyArts = await (await fetch(`${BASE_URL}/api/azexbuy/articles`)).json();
  const verifyContent = await (await fetch(`${BASE_URL}/api/azexbuy/content`)).json();

  console.log(`\n✨ Seeding Complete!`);
  console.log(`   - Public Products: ${verifyProds.length} active`);
  console.log(`   - Public Articles: ${verifyArts.length} published`);
  console.log(`   - CMS Carousel Products: ${(verifyContent.products || []).length} items`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error in seeding:', err);
  process.exit(1);
});
