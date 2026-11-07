import { SEED_SERVICES } from '../admin/src/seed.js';
import { SERVICES_PILLARS } from '../src/data/translations.js';

const BASE_URL = 'https://beta.azexbuy.com';

async function main() {
  console.log('🚀 Seeding Services to AZEXBUY Live...');

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' }),
  });

  if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
  const { data: { token } } = await loginRes.json();
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  console.log('✅ Logged in successfully.');

  // 2. Format cmsServices (for Services grid in portal view and admin panel)
  const cmsServices = SEED_SERVICES.map(s => ({
    id: s.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    title: s.title,
    description: s.description,
    scope: s.scope,
    targetAudience: s.targetAudience,
    iconClass: s.iconClass,
    colorClass: s.colorClass,
    serviceType: s.serviceType,
    isActive: Boolean(s.isActive),
    sortOrder: s.sortOrder,
  }));

  // 3. Format services (the 4 homepage pillars)
  const servicesPillars = SERVICES_PILLARS;

  // 4. Update CMS content
  const contentRes = await fetch(`${BASE_URL}/api/azexbuy/content`);
  let content = {};
  if (contentRes.ok) {
    try { content = await contentRes.json(); } catch {}
  }

  const updatedContent = {
    ...content,
    services: servicesPillars,
    cmsServices: cmsServices,
  };

  const saveRes = await fetch(`${BASE_URL}/api/azexbuy/content`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(updatedContent),
  });

  if (!saveRes.ok) throw new Error(`Save content failed: ${saveRes.status} ${await saveRes.text()}`);
  console.log(`✅ CMS Content updated successfully with ${cmsServices.length} cmsServices and ${servicesPillars.length} service pillars!`);

  // 5. Try direct POST to /api/azexbuy/services in case backend supports it
  console.log('\nTesting /api/azexbuy/services direct endpoint...');
  for (const s of cmsServices) {
    try {
      const srvRes = await fetch(`${BASE_URL}/api/azexbuy/services`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(s),
      });
      if (srvRes.ok) {
        console.log(`  ✓ Service ${s.id} pushed via direct endpoint`);
      }
    } catch {}
  }

  // 6. Verify
  const verifyRes = await fetch(`${BASE_URL}/api/azexbuy/content`);
  const verifyData = await verifyRes.json();
  console.log('\n🔍 Verification:');
  console.log(`   - Homepage Service Pillars: ${(verifyData.services || []).length}`);
  console.log(`   - Full CMS Services: ${(verifyData.cmsServices || []).length}`);
  console.log(`   - Carousel Products: ${(verifyData.products || []).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
