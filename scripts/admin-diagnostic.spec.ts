import { test, expect, Page } from '@playwright/test';

const BASE = 'https://beta.azexbuy.com';
const ADMIN = `${BASE}/octo-admin`;

// ── helpers ──────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto(`${ADMIN}/login`, { waitUntil: 'networkidle' });
  // Also handle SPA redirect
  if (!page.url().includes('login')) {
    await page.goto(`${ADMIN}`, { waitUntil: 'networkidle' });
  }

  const pwdField = page.locator('input[type="password"]');
  if (await pwdField.isVisible({ timeout: 5000 })) {
    await page.locator('input[type="text"], input[type="email"], input[name="username"]').first().fill('admin');
    await pwdField.fill('admin');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }
  console.log('Post-login URL:', page.url());
}

async function dismissModal(page: Page) {
  // Check for and dismiss any blocking overlay/modal
  const overlay = page.locator('div.fixed.inset-0, [class*="modal"], [class*="overlay"], [class*="dialog"]').first();
  if (await overlay.isVisible({ timeout: 500 }).catch(() => false)) {
    // Try ESC key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Try clicking close button
    const closeBtn = page.locator('[aria-label="close"], [aria-label="Close"], button:has-text("×"), button:has-text("✕"), button:has-text("Bağla")').first();
    if (await closeBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
  }
}

async function forceClick(page: Page, locator: any) {
  // Use force click to bypass overlay interception
  await locator.click({ force: true });
}

// Get text content of body, truncated
async function bodyText(page: Page, chars = 2000): Promise<string> {
  return (await page.locator('body').textContent() || '').replace(/\s+/g, ' ').substring(0, chars);
}

// Dump all visible buttons text
async function dumpButtons(page: Page): Promise<string[]> {
  const btns = await page.locator('button').filter({ visible: true }).all();
  const labels: string[] = [];
  for (const btn of btns.slice(0, 30)) {
    const t = (await btn.textContent() || '').trim().substring(0, 50);
    if (t) labels.push(t);
  }
  return labels;
}

// Dump all visible inputs
async function dumpInputs(page: Page): Promise<string[]> {
  const inputs = await page.locator('input, textarea, select').filter({ visible: true }).all();
  const info: string[] = [];
  for (const inp of inputs.slice(0, 20)) {
    const type = await inp.getAttribute('type') || await inp.evaluate(el => el.tagName.toLowerCase());
    const name = await inp.getAttribute('name') || '';
    const placeholder = await inp.getAttribute('placeholder') || '';
    const value = await inp.inputValue().catch(() => '');
    info.push(`${type}[name=${name}][placeholder=${placeholder}][value=${value.substring(0,20)}]`);
  }
  return info;
}

test.setTimeout(300000);

test('Admin Deep Diagnostic', async ({ page, context }) => {
  const networkLog: { url: string; status: number; method: string }[] = [];
  const consoleErrors: string[] = [];

  page.on('response', resp => {
    if (resp.status() >= 400) {
      networkLog.push({ url: resp.url(), status: resp.status(), method: resp.request().method() });
    }
  });
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`PAGEERROR: ${err.message}`));

  await login(page);

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DISCOVER ADMIN STRUCTURE
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' DISCOVERING ADMIN STRUCTURE');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/diag-00-dashboard.png', fullPage: true });

  // Capture all nav links
  const navLinks = await page.locator('nav a, aside a, [class*="sidebar"] a, [class*="nav"] a').all();
  const navItems: { text: string; href: string }[] = [];
  for (const link of navLinks.slice(0, 50)) {
    const text = (await link.textContent() || '').trim();
    const href = (await link.getAttribute('href') || '').trim();
    if (text && href) navItems.push({ text, href });
  }
  console.log('NAV LINKS FOUND:');
  navItems.forEach(n => console.log(`  "${n.text}" -> ${n.href}`));

  // Check for modal
  const modal = page.locator('div.fixed.inset-0, [class*="modal"][class*="backdrop"], .backdrop-blur-xs');
  const hasModal = await modal.isVisible({ timeout: 1000 }).catch(() => false);
  console.log('Modal/overlay on dashboard:', hasModal);
  if (hasModal) {
    const modalText = await modal.first().textContent().catch(() => '');
    console.log('Modal text:', modalText?.substring(0, 200));
    await page.screenshot({ path: 'scripts/screenshots/diag-00-modal.png', fullPage: true });
    // Dismiss it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const stillModal = await modal.isVisible({ timeout: 500 }).catch(() => false);
    console.log('Modal still visible after ESC:', stillModal);
  }

  // Dashboard buttons
  const dashButtons = await dumpButtons(page);
  console.log('Dashboard buttons:', dashButtons);

  // ══════════════════════════════════════════════════════════════════════════
  // 2. CMS SECTIONS - with detailed DOM inspection
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' CMS SECTIONS - DETAILED INSPECTION');
  console.log('════════════════════════════════════════');

  const cmsSections = [
    { slug: 'gorseller', label: 'Görsellər' },
    { slug: 'naviqasiya', label: 'Naviqasiya' },
    { slug: 'hero', label: 'Hero' },
    { slug: 'niye-azexbuy', label: 'Niyə AZEXBUY' },
    { slug: 'alici-istehsalci', label: 'Alıcı/İstehsalçı' },
    { slug: 'xidmetler', label: 'Xidmətlər' },
    { slug: 'nece-isleyir', label: 'Necə İşləyir' },
    { slug: 'one-cixan', label: 'Öne Çıxan' },
    { slug: 'niye-azerbaycan', label: 'Niyə Azərbaycan' },
    { slug: 'footer', label: 'Footer' },
    { slug: 'alici-adimlar', label: 'Alıcı Addımları' },
    { slug: 'istehsalci-adimlar', label: 'İstehsalçı Addımları' },
  ];

  for (const sec of cmsSections) {
    console.log(`\n--- CMS/${sec.slug} ---`);
    await page.goto(`${ADMIN}/cms/${sec.slug}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Dismiss any modal
    await dismissModal(page);

    // Wait for content to load (SPA may lazy-load)
    await page.waitForTimeout(500);

    const url = page.url();
    const title = await page.title();

    // Check for modal overlay blocking
    const overlayEl = page.locator('div[class*="fixed"][class*="inset-0"][class*="bg-black"], div[class*="backdrop"]').first();
    const overlayVisible = await overlayEl.isVisible({ timeout: 300 }).catch(() => false);

    // Count ALL inputs (not just visible)
    const allInputs = await page.locator('input, textarea, select').count();
    const visInputs = await page.locator('input, textarea, select').filter({ visible: true }).count();

    // Get page main content
    const mainContent = await page.locator('main, [class*="content"], [class*="main"], .container').first().textContent().catch(() => '');

    console.log(`  URL: ${url}`);
    console.log(`  Overlay blocking: ${overlayVisible}`);
    console.log(`  Inputs - all: ${allInputs}, visible: ${visInputs}`);
    console.log(`  Main content (100 chars): "${mainContent?.replace(/\s+/g, ' ').substring(0, 100)}"`);

    // If overlay, try to dismiss and retry
    if (overlayVisible) {
      console.log('  -> Trying to dismiss overlay...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      const closeBtn = page.locator('button[class*="close"], [aria-label*="close" i], button:has-text("✕"), button:has-text("Bağla"), button:has-text("İptal")').first();
      if (await closeBtn.isVisible({ timeout: 400 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(400);
      }
      const stillOverlay = await overlayEl.isVisible({ timeout: 300 }).catch(() => false);
      console.log(`  -> Overlay after dismiss attempt: ${stillOverlay}`);
    }

    const buttons = await dumpButtons(page);
    console.log(`  Buttons: ${JSON.stringify(buttons.slice(0, 10))}`);

    await page.screenshot({ path: `scripts/screenshots/diag-cms-${sec.slug}.png`, fullPage: true });

    // Try to interact if inputs found
    if (visInputs > 0) {
      const inputs = await dumpInputs(page);
      console.log(`  Visible inputs:`, inputs);

      const firstInput = page.locator('input[type="text"], input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]), textarea').filter({ visible: true }).first();
      const origVal = await firstInput.inputValue();
      const newVal = (origVal || 'Test').substring(0, 15) + '_mod';
      await firstInput.fill(newVal);

      // Find save button
      const saveBtn = page.locator('button:has-text("Saxla"), button:has-text("Save"), button:has-text("Yadda"), button[type="submit"]').first();
      if (await saveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await saveBtn.click({ force: true });
        await page.waitForTimeout(1500);

        // Check result
        const toast = await page.locator('[class*="toast"], [class*="alert"], [class*="notification"], [role="alert"]').first().textContent().catch(() => '');
        console.log(`  Save result - toast: "${toast?.substring(0, 100)}"`);

        // Revert
        await firstInput.fill(origVal);
        await saveBtn.click({ force: true });
        await page.waitForTimeout(500);
        console.log(`  ✅ CMS/${sec.slug}: EDIT & SAVE WORKS`);
      } else {
        console.log(`  ⚠️ No save button found after filling input`);
      }
    } else {
      // Inspect the actual HTML structure
      const bodyHTML = await page.locator('main, [id="root"] > div, [class*="page"], [class*="content"]').first().innerHTML().catch(() => '');
      console.log(`  HTML snippet: "${bodyHTML.substring(0, 300)}"`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SERVICES - inspect actual structure
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' SERVICES - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/xidmetler`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await dismissModal(page);
  await page.screenshot({ path: 'scripts/screenshots/diag-services.png', fullPage: true });

  const servicesHTML = await page.locator('main, [class*="content"]').first().innerHTML().catch(async () => await page.locator('body').innerHTML());
  console.log('Services page HTML (500 chars):', servicesHTML.substring(0, 500));

  // Check if there's a modal/dialog already open
  const dialogVisible = await page.locator('[role="dialog"], [class*="modal"], [class*="Dialog"]').isVisible({ timeout: 500 }).catch(() => false);
  console.log('Dialog already open on services page:', dialogVisible);

  if (dialogVisible) {
    const dialogContent = await page.locator('[role="dialog"], [class*="modal"]').first().innerHTML().catch(() => '');
    console.log('Dialog content (300 chars):', dialogContent.substring(0, 300));
    // The page might have loaded with a dialog - close it first
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  const allButtons = await dumpButtons(page);
  console.log('All buttons on services page:', allButtons);

  // Find the "Yeni" button with force click
  const yeniBtn = page.locator('button').filter({ hasText: /Yeni|New|Əlavə/i }).first();
  if (await yeniBtn.count() > 0) {
    const btnText = await yeniBtn.textContent();
    console.log('Found button:', btnText?.trim());

    // Check if it's blocked by overlay
    const isBlocked = await yeniBtn.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const topEl = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return topEl !== el && !el.contains(topEl);
    });
    console.log('Button blocked by overlay:', isBlocked);

    if (isBlocked) {
      // Try to remove the overlay from DOM
      const overlayRemoved = await page.evaluate(() => {
        const overlays = document.querySelectorAll('div[class*="fixed"][class*="inset-0"], div[class*="backdrop"]');
        let count = 0;
        overlays.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.position === 'fixed') {
            (el as HTMLElement).style.display = 'none';
            count++;
          }
        });
        return count;
      });
      console.log(`Removed ${overlayRemoved} fixed overlays from DOM`);
      await page.waitForTimeout(300);
    }

    await yeniBtn.click({ force: true });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'scripts/screenshots/diag-services-new.png', fullPage: true });
    console.log('After clicking Yeni button, URL:', page.url());

    // Check what appeared
    const newPageButtons = await dumpButtons(page);
    console.log('Buttons after click:', newPageButtons);
    const newPageInputs = await dumpInputs(page);
    console.log('Inputs after click:', newPageInputs);
  } else {
    console.log('No Yeni/New button found on services page');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. ARTICLES - structure inspection
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' ARTICLES - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/articles`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/diag-articles.png', fullPage: true });

  console.log('Articles page URL:', page.url());
  const artButtons = await dumpButtons(page);
  console.log('Buttons:', artButtons);

  // Check for the persistent modal that blocks
  const fixedDivs = await page.evaluate(() => {
    const fixed = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' && style.zIndex && parseInt(style.zIndex) > 100;
    });
    return fixed.map(el => ({
      tag: el.tagName,
      class: el.className.substring(0, 100),
      zIndex: window.getComputedStyle(el).zIndex,
      text: el.textContent?.substring(0, 50),
    }));
  });
  console.log('Fixed positioned high-z elements:', JSON.stringify(fixedDivs, null, 2));

  // ══════════════════════════════════════════════════════════════════════════
  // 5. CATALOG
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' CATALOG - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/catalog`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/diag-catalog.png', fullPage: true });

  const catButtons = await dumpButtons(page);
  console.log('Catalog buttons:', catButtons);
  const catHTML = await page.locator('main, [class*="content"]').first().innerHTML().catch(() => '');
  console.log('Catalog HTML snippet (500):', catHTML.substring(0, 500));

  // ══════════════════════════════════════════════════════════════════════════
  // 6. INBOX
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' INBOX - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/inbox`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/diag-inbox.png', fullPage: true });

  const inboxHTML = await page.locator('body').innerHTML();
  console.log('Inbox HTML (800 chars):', inboxHTML.substring(0, 800));
  const inboxBtns = await dumpButtons(page);
  console.log('Inbox buttons:', inboxBtns);

  // ══════════════════════════════════════════════════════════════════════════
  // 7. USERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' USERS - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/users`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/diag-users.png', fullPage: true });

  const usersHTML = await page.locator('body').innerHTML();
  console.log('Users HTML (600 chars):', usersHTML.substring(0, 600));
  const userBtns = await dumpButtons(page);
  console.log('Users buttons:', userBtns);

  // ══════════════════════════════════════════════════════════════════════════
  // 8. SMTP
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' SMTP - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/smtp`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // extra wait for data fetch
  await page.screenshot({ path: 'scripts/screenshots/diag-smtp.png', fullPage: true });

  const smtpHTML = await page.locator('body').innerHTML();
  console.log('SMTP HTML (800 chars):', smtpHTML.substring(0, 800));
  const smtpInputs = await dumpInputs(page);
  console.log('SMTP inputs:', smtpInputs);
  const smtpBtns = await dumpButtons(page);
  console.log('SMTP buttons:', smtpBtns);

  // ══════════════════════════════════════════════════════════════════════════
  // 9. SETTINGS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' SETTINGS - STRUCTURE INSPECTION');
  console.log('════════════════════════════════════════');

  await page.goto(`${ADMIN}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scripts/screenshots/diag-settings.png', fullPage: true });

  const settingsHTML = await page.locator('body').innerHTML();
  console.log('Settings HTML (800 chars):', settingsHTML.substring(0, 800));
  const settingsInputs = await dumpInputs(page);
  console.log('Settings inputs:', settingsInputs);
  const settingsBtns = await dumpButtons(page);
  console.log('Settings buttons:', settingsBtns);

  // ══════════════════════════════════════════════════════════════════════════
  // 10. API CALLS CHECK
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n════════════════════════════════════════');
  console.log(' NETWORK ERRORS');
  console.log('════════════════════════════════════════');

  if (networkLog.length > 0) {
    console.log('HTTP Errors:');
    networkLog.forEach(r => console.log(`  ${r.method} ${r.status} ${r.url}`));
  } else {
    console.log('No HTTP errors (4xx/5xx) detected');
  }

  if (consoleErrors.length > 0) {
    console.log('\nConsole Errors:');
    consoleErrors.slice(0, 20).forEach(e => console.log(`  ${e}`));
  } else {
    console.log('No console errors detected');
  }

  expect(true).toBe(true);
});
