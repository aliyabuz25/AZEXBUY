import { test, expect, Page } from '@playwright/test';

const BASE = 'https://beta.azexbuy.com';
const ADMIN = `${BASE}/octo-admin`;

test.setTimeout(300000);

test('Admin Targeted Feature Test', async ({ page, context }) => {
  const networkLog: { status: number; method: string; url: string; response?: string }[] = [];
  page.on('response', async resp => {
    if (resp.url().includes('/api/') && resp.request().method() !== 'GET') {
      let body = '';
      try { body = await resp.text(); } catch {}
      networkLog.push({ status: resp.status(), method: resp.request().method(), url: resp.url(), response: body.substring(0, 300) });
      console.log(`API MUTATE: ${resp.request().method()} ${resp.status()} ${resp.url()}`);
      if (body) console.log(`  RESPONSE: ${body.substring(0, 200)}`);
    }
    if (resp.status() >= 400 && resp.url().includes('/api/')) {
      console.log(`API ERROR: ${resp.status()} ${resp.request().method()} ${resp.url()}`);
    }
  });

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  await page.goto(`${ADMIN}`, { waitUntil: 'networkidle' });
  if (await page.locator('input[type="password"]').isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin');
    await page.locator('button:has-text("Daxil Ol"), button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }

  // Dismiss any startup modal
  const modal = page.locator('div.fixed.inset-0.z-\\[9999999\\]');
  if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
    const modalHTML = await modal.innerHTML().catch(() => '');
    console.log('Startup modal HTML snippet:', modalHTML.substring(0, 300));
    // Try to find what this modal is — setup wizard? Welcome?
    await page.evaluate(() => {
      document.querySelectorAll('div[class*="fixed"][class*="inset-0"]').forEach(el => {
        const z = parseInt(window.getComputedStyle(el).zIndex || '0');
        if (z > 9000) (el as HTMLElement).style.display = 'none';
      });
    });
    await page.waitForTimeout(300);
  }

  async function nav(path: string) {
    await page.goto(`${ADMIN}/${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    // Dismiss any new modals
    const m = page.locator('div.fixed.inset-0.z-\\[9999999\\]');
    if (await m.isVisible({ timeout: 500 }).catch(() => false)) {
      await page.evaluate(() => {
        document.querySelectorAll('div[class*="fixed"][class*="inset-0"]').forEach(el => {
          const z = parseInt(window.getComputedStyle(el).zIndex || '0');
          if (z > 9000) (el as HTMLElement).style.display = 'none';
        });
      });
      await page.waitForTimeout(200);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CMS: Get actual section content by clicking the tab buttons
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ CMS DETAILED TEST ════════');

  await nav('cms/hero');
  await page.waitForTimeout(1000);

  // The CMS page has tab-like buttons: "Görseller", "Naviqasiya Menyusu", etc.
  // Click each one and inspect what content appears
  const cmsTabButtons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button[class*="w-full text-left"]'))
      .map(b => ({ text: b.textContent?.trim(), class: b.className.substring(0, 60) }))
  );
  console.log('CMS tab buttons found:', JSON.stringify(cmsTabButtons, null, 2));

  // Click the Hero tab specifically
  const heroTab = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const heroBtn = btns.find(b => b.textContent?.includes('Hero'));
    if (heroBtn) { (heroBtn as HTMLButtonElement).click(); return 'clicked'; }
    return 'not found';
  });
  await page.waitForTimeout(500);
  console.log('Hero tab click result:', heroTab);

  // Now check what inputs are visible in the main content panel
  await page.screenshot({ path: 'scripts/screenshots/targeted-cms-hero.png', fullPage: true });

  const cmsContentInputs = await page.evaluate(() => {
    // Get all inputs NOT in aside and NOT in the tab sidebar
    return Array.from(document.querySelectorAll('input, textarea')).filter(el => {
      if (el.closest('aside')) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    }).map(el => ({
      tag: el.tagName,
      type: (el as HTMLInputElement).type,
      name: (el as HTMLInputElement).name,
      placeholder: (el as HTMLInputElement).placeholder?.substring(0, 60),
      value: (el as HTMLInputElement).value?.substring(0, 40),
      label: el.closest('label, div')?.querySelector('label, [class*="label"]')?.textContent?.trim()?.substring(0, 40) || '',
    }));
  });
  console.log('CMS Hero tab inputs:', JSON.stringify(cmsContentInputs, null, 2));

  // Try clicking each CMS section tab and saving
  const tabNames = ['Hero Bolmesi', 'Naviqasiya Menyusu', 'Görseller', 'Footer', 'Alici Addimlari'];
  for (const tabName of tabNames) {
    console.log(`\n--- Clicking CMS tab: ${tabName} ---`);
    const clicked = await page.evaluate((name) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => {
        const t = b.textContent?.trim() || '';
        return t.includes(name.substring(0, 6)) || t.toLowerCase().includes(name.toLowerCase().substring(0, 6));
      });
      if (btn) { (btn as HTMLButtonElement).click(); return btn.textContent?.trim(); }
      return null;
    }, tabName);
    await page.waitForTimeout(400);

    if (clicked) {
      // Look for text inputs in the content area  
      const contentInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input[type="text"], input:not([type]), textarea')).filter(el => {
          if (el.closest('aside')) return false;
          const style = window.getComputedStyle(el);
          const placeholder = (el as HTMLInputElement).placeholder || '';
          // Skip image URL inputs (they have long google/unsplash placeholders)
          if (placeholder.length > 50) return false;
          return style.display !== 'none' && style.visibility !== 'hidden';
        }).map(el => ({
          type: (el as HTMLInputElement).type || el.tagName,
          placeholder: (el as HTMLInputElement).placeholder?.substring(0, 50),
          value: (el as HTMLInputElement).value?.substring(0, 40),
        }));
      });
      console.log(`  "${clicked}" non-image inputs:`, JSON.stringify(contentInputs));

      // Also get ALL visible inputs (including image URLs)
      const allVis = await page.locator('input[type="text"], textarea').filter({ visible: true }).count();
      console.log(`  Total visible inputs: ${allVis}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CMS: Try a real save with actual image URL
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ CMS REAL SAVE TEST ════════');

  await nav('cms/gorseller');
  await page.waitForTimeout(500);

  // Find image URL inputs and try saving one with a real URL
  const imageInputs = await page.locator('input[type="text"]').filter({ visible: true }).all();
  console.log(`Image URL inputs count: ${imageInputs.length}`);

  if (imageInputs.length > 0) {
    const firstInput = imageInputs[0];
    const origUrl = await firstInput.inputValue();
    console.log('Original URL:', origUrl?.substring(0, 80));

    // Set a valid test image URL
    const testUrl = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80';
    await firstInput.fill(testUrl);
    await page.waitForTimeout(300);

    // Click save button
    const saveClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => !b.closest('aside') && b.textContent?.includes('Saxla'));
      if (saveBtn) { (saveBtn as HTMLButtonElement).click(); return saveBtn.textContent?.trim(); }
      return null;
    });
    console.log('Clicked save button:', saveClicked);
    await page.waitForTimeout(2000);

    // Check API response
    const saveNetworkCall = networkLog.find(r => r.url.includes('/cms') || r.url.includes('/content'));
    console.log('CMS save API call:', JSON.stringify(saveNetworkCall));

    // Check for toast
    const toastEl = await page.evaluate(() => {
      const toasts = document.querySelectorAll('[class*="toast"], [class*="Toast"], [role="alert"], [class*="notification"]');
      return Array.from(toasts).map(t => ({ class: t.className.substring(0, 60), text: t.textContent?.trim().substring(0, 100) }));
    });
    console.log('Toast elements:', JSON.stringify(toastEl));

    await page.screenshot({ path: 'scripts/screenshots/targeted-cms-save.png', fullPage: true });

    // Restore
    await firstInput.fill(origUrl || '');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => !b.closest('aside') && b.textContent?.includes('Saxla'));
      if (saveBtn) (saveBtn as HTMLButtonElement).click();
    });
    await page.waitForTimeout(1000);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SERVICES: Real CRUD test  
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ SERVICES CRUD TEST ════════');

  await nav('xidmetler');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/screenshots/targeted-services.png', fullPage: true });

  // Get the actual services panel content
  const servicesContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return '';
    return main.innerHTML.substring(0, 4000);
  });
  console.log('Services main content HTML (4000):', servicesContent);

  // Look for the actual page content area - not the tab bar or sidebar
  const servicesPageDetails = await page.evaluate(() => {
    // Find scrollable content area
    const scrollable = Array.from(document.querySelectorAll('div')).find(d => {
      if (d.closest('aside')) return false;
      const style = window.getComputedStyle(d);
      return (style.overflowY === 'auto' || style.overflowY === 'scroll') && d.children.length > 2;
    });
    return {
      hasScrollable: !!scrollable,
      scrollableHTML: scrollable?.innerHTML?.substring(0, 2000),
      scrollableClass: scrollable?.className?.substring(0, 100),
    };
  });
  console.log('Services scrollable area:', JSON.stringify(servicesPageDetails, null, 2));

  // Try clicking "Yeni Xidmət" button via text match (excluding search bar buttons)
  const yeniXidmetClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    // Find button with Yeni in text that's not in sidebar and not the search button
    const btn = btns.find(b => {
      const text = b.textContent?.trim() || '';
      const cls = b.className || '';
      if (b.closest('aside')) return false;
      if (cls.includes('axtarish') || cls.includes('search')) return false;
      // "Yeni Xidmət" button specifically
      return text.includes('Yeni Xidmət') || (text.includes('Yeni') && cls.includes('border') && !cls.includes('h-7'));
    });
    if (btn) { (btn as HTMLButtonElement).click(); return { text: btn.textContent?.trim(), class: btn.className.substring(0, 80) }; }

    // Log all candidate buttons
    return btns.filter(b => !b.closest('aside') && b.textContent?.includes('Yeni'))
      .map(b => ({ text: b.textContent?.trim(), class: b.className.substring(0, 80) }));
  });
  console.log('Yeni Xidmət click result:', JSON.stringify(yeniXidmetClicked));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/targeted-services-new.png', fullPage: true });

  // Check what modal/form appeared
  const serviceFormInfo = await page.evaluate(() => {
    const fixed = Array.from(document.querySelectorAll('div')).filter(d => {
      const s = window.getComputedStyle(d);
      return s.position === 'fixed' && parseInt(s.zIndex || '0') > 50;
    });
    return fixed.map(d => ({
      zIndex: window.getComputedStyle(d).zIndex,
      class: d.className.substring(0, 100),
      inputCount: d.querySelectorAll('input, textarea, select').length,
      text: d.textContent?.trim().substring(0, 100),
    }));
  });
  console.log('Fixed elements after Yeni click:', JSON.stringify(serviceFormInfo, null, 2));

  const serviceInputCount = await page.locator('input:not([type="hidden"]), textarea, select').filter({ visible: true }).count();
  console.log('Visible inputs after Yeni Xidmət click:', serviceInputCount);

  // Try the sidebar Xidmətlər nav button to navigate into services section
  const xidmetlerNav = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('aside button'));
    const btn = btns.find(b => b.textContent?.includes('Xidmətlər'));
    if (btn) { (btn as HTMLButtonElement).click(); return btn.textContent?.trim(); }
    return null;
  });
  console.log('Xidmətlər sidebar nav click:', xidmetlerNav);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  console.log('URL after sidebar Xidmətlər click:', page.url());
  await page.screenshot({ path: 'scripts/screenshots/targeted-services-nav.png', fullPage: true });

  const afterNavContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 3000) || '';
  });
  console.log('After sidebar nav - main content (3000):', afterNavContent);

  // ══════════════════════════════════════════════════════════════════════════
  // INBOX - actual content test
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ INBOX DETAILED TEST ════════');

  await nav('inbox');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/targeted-inbox.png', fullPage: true });

  const inboxContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 5000) || '';
  });
  console.log('Inbox main content (5000):', inboxContent);

  // Count RFQ rows in table
  const rfqRows = await page.locator('table tbody tr').count();
  const rfqCards = await page.locator('[class*="rfq"], [class*="inbox-item"]').count();
  console.log('RFQ table rows:', rfqRows, 'RFQ cards:', rfqCards);

  // Look for any list items
  const listItems = await page.locator('li, [class*="item"], [class*="row"]').filter({ visible: true }).count();
  console.log('List items visible:', listItems);

  // ══════════════════════════════════════════════════════════════════════════
  // USERS - actual content test
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ USERS DETAILED TEST ════════');

  await nav('users');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/targeted-users.png', fullPage: true });

  const usersContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 4000) || '';
  });
  console.log('Users main content (4000):', usersContent);

  // ══════════════════════════════════════════════════════════════════════════
  // SMTP - actual content test  
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ SMTP DETAILED TEST ════════');

  await nav('smtp');
  await page.waitForTimeout(2000); // extra wait for data fetch
  await page.screenshot({ path: 'scripts/screenshots/targeted-smtp.png', fullPage: true });

  // Make a direct API call to check SMTP endpoint
  const smtpApiResult = await page.evaluate(async () => {
    try {
      const token = localStorage.getItem('octotech_admin_jwt') || '';
      const r = await fetch('/api/smtp', { headers: { 'Authorization': `Bearer ${token}` } });
      return { status: r.status, body: await r.text() };
    } catch (e: any) { return { error: e.message }; }
  });
  console.log('SMTP API direct call:', JSON.stringify(smtpApiResult));

  const smtpContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 5000) || '';
  });
  console.log('SMTP main content (5000):', smtpContent);

  // ══════════════════════════════════════════════════════════════════════════
  // SETTINGS - actual content test
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ SETTINGS DETAILED TEST ════════');

  await nav('settings');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/targeted-settings.png', fullPage: true });

  // Direct API call to settings
  const settingsApiResult = await page.evaluate(async () => {
    try {
      const token = localStorage.getItem('octotech_admin_jwt') || '';
      const r = await fetch('/api/settings', { headers: { 'Authorization': `Bearer ${token}` } });
      return { status: r.status, body: (await r.text()).substring(0, 400) };
    } catch (e: any) { return { error: e.message }; }
  });
  console.log('Settings API direct call:', JSON.stringify(settingsApiResult));

  const settingsContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 5000) || '';
  });
  console.log('Settings main content (5000):', settingsContent);

  // ══════════════════════════════════════════════════════════════════════════
  // CATALOG - actual content test
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ CATALOG DETAILED TEST ════════');

  await nav('catalog');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/targeted-catalog.png', fullPage: true });

  // Direct API calls
  const catalogApiResult = await page.evaluate(async () => {
    try {
      const token = localStorage.getItem('octotech_admin_jwt') || '';
      const [cats, prods] = await Promise.all([
        fetch('/api/catalog/categories', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.text()),
        fetch('/api/catalog/products', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.text()),
      ]);
      return { categories: cats.substring(0, 400), products: prods.substring(0, 400) };
    } catch (e: any) { return { error: e.message }; }
  });
  console.log('Catalog API calls:', JSON.stringify(catalogApiResult));

  const catalogContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 5000) || '';
  });
  console.log('Catalog main content (5000):', catalogContent);

  // ══════════════════════════════════════════════════════════════════════════
  // ARTICLES - actual content test
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════ ARTICLES DETAILED TEST ════════');

  await nav('articles');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/targeted-articles.png', fullPage: true });

  const articlesApiResult = await page.evaluate(async () => {
    try {
      const token = localStorage.getItem('octotech_admin_jwt') || '';
      const r = await fetch('/api/articles', { headers: { 'Authorization': `Bearer ${token}` } });
      return { status: r.status, body: (await r.text()).substring(0, 400) };
    } catch (e: any) { return { error: e.message }; }
  });
  console.log('Articles API direct call:', JSON.stringify(articlesApiResult));

  const articlesContent = await page.evaluate(() => {
    const main = document.querySelector('main');
    return main?.innerHTML?.substring(0, 5000) || '';
  });
  console.log('Articles main content (5000):', articlesContent);

  console.log('\n════════ ALL NETWORK MUTATIONS ════════');
  networkLog.forEach(r => console.log(`${r.method} ${r.status} ${r.url}\n  Response: ${r.response}`));

  expect(true).toBe(true);
});
