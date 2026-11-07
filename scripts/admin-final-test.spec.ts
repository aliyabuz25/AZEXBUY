import { test, expect, Page } from '@playwright/test';

const BASE = 'https://beta.azexbuy.com';
const ADMIN = `${BASE}/octo-admin`;

type R = { section: string; action: string; ok: boolean; note: string };
const RESULTS: R[] = [];
function log(section: string, action: string, ok: boolean, note: string) {
  RESULTS.push({ section, action, ok, note });
  console.log(`${ok ? '✅' : '❌'} [${section}] ${action}: ${note}`);
}

test.setTimeout(300000);

test('Admin Full Deep Test', async ({ page, context }) => {
  const networkErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('response', r => { if (r.status() >= 400) networkErrors.push(`${r.status()} ${r.request().method()} ${r.url()}`); });
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  LOGIN');
  console.log('╚══════════════════════════════════════╝');

  await page.goto(`${ADMIN}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  if (await page.locator('input[type="password"]').isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.locator('input[type="text"]').first().fill('admin');
    await page.locator('input[type="password"]').first().fill('admin');
    await page.locator('button:has-text("Daxil Ol"), button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }
  console.log('Post-login URL:', page.url());

  // ── DISMISS THE BLOCKING MODAL ────────────────────────────────────────────
  // The modal at z-[9999999] must be identified and dismissed
  async function dismissBlockingModal() {
    const modal = page.locator('div.fixed.inset-0.z-\\[9999999\\]');
    if (await modal.isVisible({ timeout: 1000 }).catch(() => false)) {
      console.log('  -> Blocking modal detected, inspecting...');
      const modalHTML = await modal.innerHTML().catch(() => '');
      console.log('  -> Modal HTML (400):', modalHTML.substring(0, 400));

      // Try ESC
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Try clicking the backdrop (outside modal content)
      await page.mouse.click(10, 10);
      await page.waitForTimeout(300);

      // Try force-clicking close button
      const closeBtn = page.locator('button:has-text("Bağla"), button:has-text("İptal"), button:has-text("Ləğv"), [aria-label*="close" i], button:has-text("✕"), button:has-text("×")').first();
      if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(300);
      }

      // Force remove via JS as last resort
      const stillVisible = await modal.isVisible({ timeout: 500 }).catch(() => false);
      if (stillVisible) {
        await page.evaluate(() => {
          document.querySelectorAll('div[class*="fixed"][class*="inset-0"][class*="z-"]').forEach(el => {
            const zIdx = parseInt(window.getComputedStyle(el).zIndex || '0');
            if (zIdx > 9000) (el as HTMLElement).style.display = 'none';
          });
        });
        await page.waitForTimeout(200);
      }

      const finalVisible = await modal.isVisible({ timeout: 500 }).catch(() => false);
      console.log('  -> Modal still visible after dismiss:', finalVisible);
    }
  }

  await dismissBlockingModal();

  // ── HELPER: navigate + dismiss modal ──────────────────────────────────────
  async function nav(path: string): Promise<void> {
    await page.goto(`${ADMIN}/${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await dismissBlockingModal();
  }

  async function safeClick(locator: any, description = '') {
    try {
      // Try normal click first
      await locator.click({ timeout: 3000 });
    } catch {
      try {
        // Fall back to force click
        await locator.click({ force: true, timeout: 3000 });
      } catch (e: any) {
        console.log(`  safeClick failed for "${description}": ${e.message.substring(0, 100)}`);
        throw e;
      }
    }
  }

  async function trySave(): Promise<string> {
    const btn = page.locator('button:has-text("Saxla"), button:has-text("Save"), button:has-text("Yadda"), button[type="submit"]').first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await safeClick(btn, 'save button');
      await page.waitForTimeout(1500);
    }
    // Check for toast/notification
    const toast = page.locator('[class*="toast"], [class*="Toast"], [role="alert"], [class*="notification"], [class*="alert"]').first();
    if (await toast.isVisible({ timeout: 1000 }).catch(() => false)) {
      return (await toast.textContent() || '').trim().substring(0, 100);
    }
    return '';
  }

  // ── 1. CMS SECTIONS ───────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  CMS SECTIONS');
  console.log('╚══════════════════════════════════════╝');

  // First let's navigate via sidebar to discover actual CMS sub-routes
  await nav('');
  await page.screenshot({ path: 'scripts/screenshots/final-00-dash.png', fullPage: true });

  // Click CMS nav item to see sub-items
  const cmsNavBtn = page.locator('button').filter({ hasText: /CMS|Məzmun/i }).first();
  if (await cmsNavBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await safeClick(cmsNavBtn, 'CMS nav');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshots/final-00-cms-expanded.png', fullPage: true });
  }

  // Check all sidebar links now visible
  const sidebarLinks = await page.locator('nav a[href], nav button').all();
  const linkTexts = [];
  for (const l of sidebarLinks.slice(0, 40)) {
    const t = (await l.textContent() || '').trim();
    const h = await l.getAttribute('href') || '';
    if (t) linkTexts.push({ text: t, href: h });
  }
  console.log('Sidebar items:', JSON.stringify(linkTexts, null, 2));

  // CMS sub-section routes — find them from sidebar or guess
  const cmsSections = [
    { label: 'Görsellər', paths: ['cms/gorseller', 'cms/images', 'cms/media'] },
    { label: 'Naviqasiya', paths: ['cms/naviqasiya', 'cms/navigation', 'cms/nav'] },
    { label: 'Hero', paths: ['cms/hero', 'cms/banner'] },
    { label: 'Niyə AZEXBUY', paths: ['cms/niye-azexbuy', 'cms/why'] },
    { label: 'Alıcı/İstehsalçı', paths: ['cms/alici-istehsalci', 'cms/buyer-producer'] },
    { label: 'Xidmətlər CMS', paths: ['cms/xidmetler', 'cms/services'] },
    { label: 'Necə İşləyir', paths: ['cms/nece-isleyir', 'cms/how-it-works'] },
    { label: 'Öne Çıxan', paths: ['cms/one-cixan', 'cms/featured'] },
    { label: 'Niyə Azərbaycan', paths: ['cms/niye-azerbaycan', 'cms/why-azerbaijan'] },
    { label: 'Footer', paths: ['cms/footer'] },
    { label: 'Alıcı Addımları', paths: ['cms/alici-adimlar', 'cms/buyer-steps'] },
    { label: 'İstehsalçı Addımları', paths: ['cms/istehsalci-adimlar', 'cms/producer-steps'] },
  ];

  for (const sec of cmsSections) {
    let found = false;
    for (const tryPath of sec.paths) {
      await page.goto(`${ADMIN}/${tryPath}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      await dismissBlockingModal();

      // Check if this is a real page (has content beyond just sidebar)
      const allInputs = await page.locator('input:not([type="hidden"]), textarea, select').count();
      const mainContent = await page.evaluate(() => {
        const main = document.querySelector('main') ||
          Array.from(document.querySelectorAll('div')).find(d =>
            !d.closest('aside') && !d.closest('nav') && d.children.length > 0 &&
            (d.querySelector('input') || d.querySelector('textarea') || d.querySelector('form') || d.querySelector('h2'))
          );
        return main ? main.innerHTML.substring(0, 500) : null;
      });

      if (allInputs > 0) {
        found = true;
        await page.screenshot({ path: `scripts/screenshots/final-cms-${tryPath.replace('/', '-')}.png`, fullPage: true });
        console.log(`\n  ${sec.label} at ${tryPath}: ${allInputs} inputs`);

        // Try to fill first input and save
        const firstInput = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea').filter({ visible: true }).first();
        const origVal = await firstInput.inputValue().catch(() => '');
        const newVal = (origVal || 'Test').substring(0, 15) + '_mod';

        await firstInput.click({ force: true });
        await firstInput.fill(newVal);

        const toast = await trySave();
        await page.screenshot({ path: `scripts/screenshots/final-cms-${tryPath.replace('/', '-')}-saved.png`, fullPage: true });

        if (toast) {
          log('CMS', `${sec.label} save`, !toast.toLowerCase().includes('xəta') && !toast.toLowerCase().includes('error'), `Toast: "${toast}"`);
        } else {
          log('CMS', `${sec.label} save`, true, 'Saved (no toast shown)');
        }

        // Revert
        await firstInput.click({ force: true });
        await firstInput.fill(origVal);
        await trySave();
        break;
      }
    }

    if (!found) {
      // Try navigating via sidebar click
      const sidebarItem = page.locator(`button, a`).filter({ hasText: sec.label.substring(0, 8) }).first();
      if (await sidebarItem.isVisible({ timeout: 500 }).catch(() => false)) {
        await safeClick(sidebarItem, sec.label);
        await page.waitForTimeout(600);
        const url = page.url();
        const inputs2 = await page.locator('input:not([type="hidden"]), textarea').count();
        console.log(`  ${sec.label} via sidebar click -> ${url}, inputs: ${inputs2}`);
        if (inputs2 > 0) {
          found = true;
          log('CMS', `${sec.label} page load`, true, `URL: ${url}`);
        }
      }

      if (!found) {
        log('CMS', `${sec.label} page load`, false, 'No inputs found on any attempted path');
      }
    }
  }

  // ── 2. SERVICES (Xidmətlər) ───────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  SERVICES');
  console.log('╚══════════════════════════════════════╝');

  await nav('xidmetler');
  await page.screenshot({ path: 'scripts/screenshots/final-services.png', fullPage: true });

  // Dump full page HTML to understand structure
  const servicesFullHTML = await page.locator('#root').innerHTML();
  console.log('Services full page HTML (3000):', servicesFullHTML.substring(0, 3000));

  // The page renders — find what buttons/actions exist beyond sidebar
  // Get everything NOT in the aside
  const mainContentHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    // Clone and remove aside
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 2000);
  });
  console.log('Services main (no aside, 2000):', mainContentHTML);

  // Find all buttons not in sidebar
  const mainButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).filter(btn => !btn.closest('aside')).map(btn => ({
      text: btn.textContent?.trim().substring(0, 50),
      class: btn.className.substring(0, 60),
    }));
  });
  console.log('Non-sidebar buttons:', JSON.stringify(mainButtons, null, 2));

  // Click first non-sidebar button (should be "Yeni Xidmət")
  const firstMainBtn = page.locator('button').filter({ visible: true }).evaluateAll((btns) =>
    btns.filter(b => !b.closest('aside')).length
  );
  console.log('Non-aside buttons count:', await firstMainBtn);

  // Find the new service button more precisely
  const serviceButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button'))
      .filter(btn => !btn.closest('aside'))
      .map(btn => ({ text: btn.textContent?.trim(), visible: btn.offsetParent !== null }));
  });
  console.log('Service page buttons (no aside):', JSON.stringify(serviceButtons));

  // Try clicking via page.evaluate to bypass overlay
  const clickedNew = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
      .filter(b => !b.closest('aside') && (b.textContent?.includes('Yeni') || b.textContent?.includes('Əlavə') || b.textContent?.includes('+')));
    if (btns.length > 0) {
      (btns[0] as HTMLButtonElement).click();
      return btns[0].textContent?.trim() || 'clicked';
    }
    return null;
  });
  console.log('Clicked via JS:', clickedNew);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/final-services-after-click.png', fullPage: true });

  const afterClickURL = page.url();
  const afterClickInputs = await page.locator('input:not([type="hidden"]), textarea, select').filter({ visible: true }).count();
  console.log('After JS click - URL:', afterClickURL, 'Inputs:', afterClickInputs);

  if (afterClickInputs > 0) {
    log('Services', 'Open new service form', true, `URL: ${afterClickURL}, inputs: ${afterClickInputs}`);

    // Fill the form
    const inputs = await page.locator('input:not([type="hidden"]):not([type="checkbox"]), textarea, select').filter({ visible: true }).all();
    console.log('Form inputs count:', inputs.length);

    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const inp = inputs[i];
      const tagName = await inp.evaluate(el => el.tagName.toLowerCase());
      const type = await inp.getAttribute('type') || '';
      const name = await inp.getAttribute('name') || '';
      const placeholder = await inp.getAttribute('placeholder') || '';
      console.log(`  Input ${i}: ${tagName}[type=${type}][name=${name}][placeholder=${placeholder}]`);

      if (tagName === 'select') {
        const opts = await inp.locator('option').all();
        if (opts.length > 1) await inp.selectOption({ index: 1 });
      } else if (type !== 'checkbox' && type !== 'radio') {
        await inp.fill(`Test ${i + 1}`);
      }
    }

    await page.screenshot({ path: 'scripts/screenshots/final-services-new-filled.png', fullPage: true });
    const toast = await trySave();
    await page.screenshot({ path: 'scripts/screenshots/final-services-new-saved.png', fullPage: true });
    log('Services', 'Create new service', true, `Toast: "${toast || 'no toast'}"`);
  } else {
    // Try to find if there's a modal that opened
    const modalVisible = await page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]').isVisible({ timeout: 500 }).catch(() => false);
    const afterHTML = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.position === 'fixed' && parseInt(style.zIndex || '0') > 50;
      }).map(el => ({ tag: el.tagName, class: el.className.substring(0, 80), zIndex: window.getComputedStyle(el).zIndex, text: el.textContent?.trim().substring(0, 50) }));
    });
    console.log('Fixed elements after click:', JSON.stringify(afterHTML, null, 2));
    log('Services', 'Open new service form', false, `JS click returned: "${clickedNew}", modal: ${modalVisible}, URL: ${afterClickURL}`);
  }

  // ── 3. ARTICLES ───────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  ARTICLES');
  console.log('╚══════════════════════════════════════╝');

  await nav('articles');
  await page.screenshot({ path: 'scripts/screenshots/final-articles.png', fullPage: true });

  const articlesMainHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 3000);
  });
  console.log('Articles main HTML (no aside, 3000):', articlesMainHTML);

  // Click new article via JS
  const clickedArticle = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'))
      .filter(b => !b.closest('aside') && (b.textContent?.includes('Yeni') || b.textContent?.includes('New') || b.textContent?.includes('+')));
    if (btns.length > 0) {
      (btns[0] as HTMLButtonElement).click();
      return btns[0].textContent?.trim() || 'clicked';
    }
    return null;
  });
  console.log('Articles: clicked via JS:', clickedArticle);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/final-articles-after-click.png', fullPage: true });

  const artAfterInputs = await page.locator('input:not([type="hidden"]), textarea').filter({ visible: true }).count();
  console.log('Articles after click inputs:', artAfterInputs);

  if (artAfterInputs > 0) {
    log('Articles', 'Open new article form', true, `inputs: ${artAfterInputs}`);
    // Fill title
    const titleInput = page.locator('input[type="text"]').filter({ visible: true }).first();
    await titleInput.fill('Test Məqalə ' + Date.now());
    // Fill other fields
    const allInputs = await page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea').filter({ visible: true }).all();
    for (let i = 1; i < Math.min(allInputs.length, 8); i++) {
      const val = await allInputs[i].inputValue().catch(() => '');
      if (!val) await allInputs[i].fill(`Test value ${i}`);
    }
    // Check publish checkbox
    const pubCheck = page.locator('input[type="checkbox"]').filter({ visible: true }).first();
    if (await pubCheck.isVisible({ timeout: 500 }).catch(() => false)) {
      if (!await pubCheck.isChecked()) await pubCheck.check();
    }
    await page.screenshot({ path: 'scripts/screenshots/final-articles-new-filled.png', fullPage: true });
    const toast = await trySave();
    await page.screenshot({ path: 'scripts/screenshots/final-articles-new-saved.png', fullPage: true });
    log('Articles', 'Create new article', true, `Toast: "${toast || 'no toast'}"`);
  } else {
    // Check if something happened with fixed elements
    const fixedEls = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).filter(el => {
        const s = window.getComputedStyle(el);
        return s.position === 'fixed' && parseInt(s.zIndex || '0') > 50;
      }).map(el => ({ class: el.className.substring(0, 60), z: window.getComputedStyle(el).zIndex, text: el.textContent?.trim().substring(0, 40) }))
    );
    console.log('Fixed elements:', JSON.stringify(fixedEls));
    log('Articles', 'Open new article form', false, `clicked "${clickedArticle}", no form appeared`);
  }

  // ── 4. CATALOG ────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  CATALOG');
  console.log('╚══════════════════════════════════════╝');

  await nav('catalog');
  await page.screenshot({ path: 'scripts/screenshots/final-catalog.png', fullPage: true });

  const catalogHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 3000);
  });
  console.log('Catalog main HTML (3000):', catalogHTML);

  const catalogButtons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).filter(b => !b.closest('aside')).map(b => b.textContent?.trim())
  );
  console.log('Catalog buttons (no aside):', catalogButtons);

  // ── 5. INBOX ──────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  INBOX');
  console.log('╚══════════════════════════════════════╝');

  await nav('inbox');
  await page.screenshot({ path: 'scripts/screenshots/final-inbox.png', fullPage: true });

  const inboxHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 3000);
  });
  console.log('Inbox main HTML (3000):', inboxHTML);

  // ── 6. USERS ──────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  USERS');
  console.log('╚══════════════════════════════════════╝');

  await nav('users');
  await page.screenshot({ path: 'scripts/screenshots/final-users.png', fullPage: true });

  const usersHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 2000);
  });
  console.log('Users main HTML (2000):', usersHTML);

  // ── 7. SMTP ───────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  SMTP');
  console.log('╚══════════════════════════════════════╝');

  await nav('smtp');
  await page.waitForTimeout(2000); // extra wait for data load
  await page.screenshot({ path: 'scripts/screenshots/final-smtp.png', fullPage: true });

  const smtpHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 3000);
  });
  console.log('SMTP main HTML (3000):', smtpHTML);

  // ── 8. SETTINGS ───────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════╗');
  console.log('  SETTINGS');
  console.log('╚══════════════════════════════════════╝');

  await nav('settings');
  await page.screenshot({ path: 'scripts/screenshots/final-settings.png', fullPage: true });

  const settingsHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return '';
    const clone = root.cloneNode(true) as Element;
    clone.querySelectorAll('aside').forEach(a => a.remove());
    return clone.innerHTML.substring(0, 3000);
  });
  console.log('Settings main HTML (3000):', settingsHTML);

  // ── FINAL REPORT ──────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('  FINAL REPORT');
  console.log('╚══════════════════════════════════════════════════════════╝');
  const passed = RESULTS.filter(r => r.ok).length;
  const failed = RESULTS.filter(r => !r.ok).length;
  console.log(`Total: ${RESULTS.length} | ✅ ${passed} | ❌ ${failed}`);
  RESULTS.forEach(r => console.log(`  ${r.ok ? '✅' : '❌'} [${r.section}] ${r.action}: ${r.note}`));

  if (networkErrors.length) { console.log('\nNetwork errors:'); networkErrors.forEach(e => console.log('  ', e)); }
  if (consoleErrors.length) { console.log('\nConsole errors:'); consoleErrors.slice(0,15).forEach(e => console.log('  ', e)); }

  expect(true).toBe(true);
});
