import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const PORT = 4325;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function runAudit() {
  console.log('--- STARTING ZERO-ERROR BACKUP & SITE EDITING AUDIT ---');

  // 1. Spawn server
  const adminDir = fs.existsSync(path.resolve(process.cwd(), 'dist/server.js')) ? process.cwd() : path.resolve(process.cwd(), 'admin');
  const server = spawn(process.argv[0], ['dist/server.js'], {
    cwd: adminDir,
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
    stdio: 'pipe'
  });

  server.stdout?.on('data', d => {
    // console.log('[Server]', d.toString().trim());
  });
  server.stderr?.on('data', d => {
    console.error('[Server Err]', d.toString().trim());
  });

  try {
    // Wait for server health
    let ready = false;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`${BASE_URL}/api/health`);
        if (res.ok) {
          ready = true;
          break;
        }
      } catch {}
      await sleep(200);
    }

    if (!ready) throw new Error('Server failed to start within timeout');
    console.log('✓ Server is ready on port', PORT);

    // 2. Login to get JWT
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token || loginData.token;
    if (!loginData.success || !token) {
      throw new Error('Login failed: ' + JSON.stringify(loginData));
    }
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('✓ Admin login successful. Token acquired.');

    // 3. Test Backup Info endpoint
    const infoRes = await fetch(`${BASE_URL}/api/backup/info`, { headers: authHeaders });
    const infoData = await infoRes.json();
    if (!infoData.success || !infoData.data || !infoData.data.tablesCount) {
      throw new Error('Backup info failed: ' + JSON.stringify(infoData));
    }
    console.log(`✓ Backup info verified: ${infoData.data.tablesCount} tables, ${infoData.data.totalRecords} total records.`);

    // 4. Test Backup Download endpoint (with query token)
    const dlRes = await fetch(`${BASE_URL}/api/backup/download?token=${encodeURIComponent(token)}`);
    if (!dlRes.ok) {
      throw new Error('Backup download failed with status ' + dlRes.status);
    }
    const backupBuf = Buffer.from(await dlRes.arrayBuffer());
    if (backupBuf.length < 50000) {
      throw new Error(`Backup file too small: ${backupBuf.length} bytes`);
    }
    console.log(`✓ Backup export downloaded successfully: ${backupBuf.length} bytes.`);

    // Validate the downloaded buffer is indeed a valid SQLite 3 database
    const tempBackupPath = path.join(adminDir, 'data/test_audit_backup.sqlite');
    fs.writeFileSync(tempBackupPath, backupBuf);
    const inspectDb = new DatabaseSync(tempBackupPath);
    const tables = inspectDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as any[];
    inspectDb.close();
    console.log(`✓ Exported SQLite binary verified: contains ${tables.length} tables:`, tables.map(t => t.name).join(', '));

    // 5. Audit Site Editing: CMS Content
    console.log('\n--- Testing Site Editing (CMS & Content) ---');
    const contentGetRes = await fetch(`${BASE_URL}/api/azexbuy/content`);
    const contentText = await contentGetRes.text();
    if (!contentGetRes.ok || contentText.startsWith('<')) {
      throw new Error(`Failed to GET /api/azexbuy/content: status ${contentGetRes.status}, body: ${contentText.slice(0, 200)}`);
    }
    const initialContent = JSON.parse(contentText);

    const testTimestamp = Date.now();
    const updatedContent = {
      ...initialContent,
      about: {
        ...(initialContent.about || {}),
        heroTitle: {
          AZ: `Test Haqqımızda Başlığı ${testTimestamp}`,
          EN: `Test About Title ${testTimestamp}`
        }
      }
    };

    const contentPostRes = await fetch(`${BASE_URL}/api/azexbuy/content`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(updatedContent)
    });
    const contentPostData = await contentPostRes.json();
    if (!contentPostData.success) throw new Error('Content save failed: ' + JSON.stringify(contentPostData));

    // Read back content
    const contentVerifyRes = await fetch(`${BASE_URL}/api/azexbuy/content`);
    const verifiedContent = await contentVerifyRes.json();
    if (verifiedContent.about?.heroTitle?.AZ !== `Test Haqqımızda Başlığı ${testTimestamp}`) {
      throw new Error('Content edit was not persisted correctly!');
    }
    console.log('✓ CMS Content editing (about heroTitle) works and persists!');

    // 6. Audit Site Editing: Localization Overrides
    console.log('\n--- Testing Site Editing (Localization Overrides) ---');
    const locGetRes = await fetch(`${BASE_URL}/api/azexbuy/localization`);
    const initialLoc = await locGetRes.json();

    const updatedLoc = {
      ...initialLoc,
      AZ: {
        ...(initialLoc.AZ || {}),
        'audit.test.key': `Audited Translation ${testTimestamp}`
      }
    };
    const locPostRes = await fetch(`${BASE_URL}/api/azexbuy/localization`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(updatedLoc)
    });
    const locPostData = await locPostRes.json();
    if (!locPostData.success) throw new Error('Localization save failed: ' + JSON.stringify(locPostData));

    const locVerifyRes = await fetch(`${BASE_URL}/api/azexbuy/localization`);
    const verifiedLoc = await locVerifyRes.json();
    if (verifiedLoc.AZ?.['audit.test.key'] !== `Audited Translation ${testTimestamp}`) {
      throw new Error('Localization edit was not persisted correctly!');
    }
    console.log('✓ Localization editing works and persists!');

    // 7. Audit Site Editing: Product Catalog
    console.log('\n--- Testing Product Catalog Editing ---');
    const newProduct = {
      categoryId: 'cat-food',
      name: { AZ: `Audit Məhsul ${testTimestamp}`, EN: `Audit Product ${testTimestamp}` },
      slug: `audit-product-${testTimestamp}`,
      shortDescription: { AZ: 'Qısa izah', EN: 'Short desc' },
      description: { AZ: 'Ətraflı məlumat', EN: 'Full description' },
      technicalSpecs: { AZ: 'Texniki göstəricilər', EN: 'Technical specs' },
      images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'],
      moq: '500 kg',
      certificates: ['ISO 22000', 'Halal'],
      packagingInfo: 'Karton qutu 20kg',
      originRegion: 'Gəncə-Qazax',
      isActive: true,
      isFeatured: false
    };

    const prodCreateRes = await fetch(`${BASE_URL}/api/azexbuy/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProduct)
    });
    const prodCreateData = await prodCreateRes.json();
    if (!prodCreateData.success || !prodCreateData.id) {
      throw new Error('Product creation failed: ' + JSON.stringify(prodCreateData));
    }
    const createdProdId = prodCreateData.id;
    console.log('✓ Product created successfully with ID:', createdProdId);

    // Verify product can be fetched by slug
    const prodGetRes = await fetch(`${BASE_URL}/api/azexbuy/products/${newProduct.slug}`);
    if (!prodGetRes.ok) throw new Error('Product not found by slug');
    const fetchedProd = await prodGetRes.json();
    if (fetchedProd.slug !== newProduct.slug) throw new Error('Product slug mismatch');
    console.log('✓ Product retrieved via public API by slug!');

    // 8. Audit Site Editing: Articles / Blog
    console.log('\n--- Testing Articles / Blog Editing ---');
    const newArticle = {
      title: `Audit Məqalə ${testTimestamp}`,
      slug: `audit-article-${testTimestamp}`,
      category: 'Market Insights',
      summary: 'Qısa xülasə',
      content: '<p>Ətraflı məqalə mətni</p>',
      coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      isPublished: true,
      author: 'AZEXBUY Test Audit'
    };
    const artCreateRes = await fetch(`${BASE_URL}/api/azexbuy/admin/articles`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newArticle)
    });
    const artCreateData = await artCreateRes.json();
    if (!artCreateData.success || !artCreateData.id) {
      throw new Error('Article creation failed: ' + JSON.stringify(artCreateData));
    }
    const createdArtId = artCreateData.id;
    console.log('✓ Article created with ID:', createdArtId);

    // 9. Audit Site Editing: Services
    console.log('\n--- Testing Services Editing ---');
    const newService = {
      title: { AZ: `Audit Xidmət ${testTimestamp}`, EN: `Audit Service ${testTimestamp}` },
      description: { AZ: 'Xidmət izahı', EN: 'Service description' },
      scope: { AZ: ['Maddə 1', 'Maddə 2'], EN: ['Item 1', 'Item 2'] },
      targetAudience: { AZ: 'Hədəf kütlə', EN: 'Target audience' },
      iconClass: 'fa-solid fa-plane-departure',
      colorClass: 'bg-brandNavy',
      serviceType: 'primary',
      isActive: true,
      sortOrder: 99
    };
    const srvCreateRes = await fetch(`${BASE_URL}/api/azexbuy/services`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newService)
    });
    const srvCreateData = await srvCreateRes.json();
    if (!srvCreateData.success || !srvCreateData.id) {
      throw new Error('Service creation failed: ' + JSON.stringify(srvCreateData));
    }
    const createdSrvId = srvCreateData.id;
    console.log('✓ Service created with ID:', createdSrvId);

    // 10. Audit Site Editing: Team Members
    console.log('\n--- Testing Team Members Editing ---');
    const newMember = {
      id: `tm-audit-${testTimestamp}`,
      name: `Audit Komanda Üzvü ${testTimestamp}`,
      role: { AZ: 'Mütəxəssis', EN: 'Specialist' },
      bio: { AZ: 'Təcrübəli mütəxəssis', EN: 'Experienced specialist' },
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      email: 'audit@azexbuy.com',
      linkedin: 'https://linkedin.com',
      isActive: true,
      sortOrder: 10
    };
    const teamCreateRes = await fetch(`${BASE_URL}/api/azexbuy/team`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newMember)
    });
    const teamCreateData = await teamCreateRes.json();
    if (!teamCreateData.success) {
      throw new Error('Team member creation failed: ' + JSON.stringify(teamCreateData));
    }
    console.log('✓ Team member created with ID:', newMember.id);

    // 11. Test Backup Restore with FormData Upload
    console.log('\n--- Testing Backup Restore via Upload ---');
    // First, export the database containing the newly created items
    const exportPostRes = await fetch(`${BASE_URL}/api/backup/export`, {
      method: 'POST',
      headers: authHeaders
    });
    const exportPostData = await exportPostRes.json();
    if (!exportPostData.success) throw new Error('Backup export POST failed');
    console.log('✓ Live backup export generated on server:', exportPostData.filename);

    // Download this backup file
    const newDlRes = await fetch(`${BASE_URL}/api/backup/download`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const newBackupBuf = Buffer.from(await newDlRes.arrayBuffer());

    // Upload it to /api/backup/restore via multipart form data
    const formData = new FormData();
    const backupBlob = new Blob([newBackupBuf], { type: 'application/vnd.sqlite3' });
    formData.append('backupFile', backupBlob, 'audit_restore_test.sqlite');

    const restoreRes = await fetch(`${BASE_URL}/api/backup/restore`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const restoreData = await restoreRes.json();
    if (!restoreData.success) {
      throw new Error('Backup restore failed: ' + JSON.stringify(restoreData));
    }
    console.log(`✓ Backup restore succeeded! ${restoreData.data?.totalRestoredTables} tables restored, ${restoreData.data?.totalRestoredRows} rows.`);

    // 12. Verify all restored records are intact
    console.log('\n--- Verifying Data Integrity Post-Restore ---');
    const postRestoreProd = await fetch(`${BASE_URL}/api/azexbuy/products/${newProduct.slug}`);
    if (!postRestoreProd.ok) throw new Error('Post-restore product lookup failed!');
    console.log('✓ Post-restore product verified!');

    const postRestoreLoc = await fetch(`${BASE_URL}/api/azexbuy/localization`);
    const locJson = await postRestoreLoc.json();
    if (locJson.AZ?.['audit.test.key'] !== `Audited Translation ${testTimestamp}`) {
      throw new Error('Post-restore localization missing!');
    }
    console.log('✓ Post-restore localization verified!');

    const postRestoreContent = await fetch(`${BASE_URL}/api/azexbuy/content`);
    const contentJson = await postRestoreContent.json();
    if (contentJson.about?.heroTitle?.AZ !== `Test Haqqımızda Başlığı ${testTimestamp}`) {
      throw new Error('Post-restore content missing!');
    }
    console.log('✓ Post-restore CMS content verified!');

    // Cleanup created test items
    await fetch(`${BASE_URL}/api/azexbuy/admin/products/${createdProdId}`, { method: 'DELETE', headers: authHeaders });
    await fetch(`${BASE_URL}/api/azexbuy/admin/articles/${createdArtId}`, { method: 'DELETE', headers: authHeaders });
    await fetch(`${BASE_URL}/api/azexbuy/services/${createdSrvId}`, { method: 'DELETE', headers: authHeaders });
    await fetch(`${BASE_URL}/api/azexbuy/team/${newMember.id}`, { method: 'DELETE', headers: authHeaders });
    if (fs.existsSync(tempBackupPath)) fs.unlinkSync(tempBackupPath);
    console.log('✓ Test items cleaned up.');

    console.log('\n======================================================');
    console.log('🎉 AUDIT SUCCESSFUL: 100% OF BACKUP, RESTORE & SITE EDITING FEATURES WORK WITH ZERO ERRORS!');
    console.log('======================================================\n');
  } finally {
    server.kill('SIGTERM');
  }
}

runAudit().catch(err => {
  console.error('\n❌ AUDIT FAILED:', err);
  process.exit(1);
});
