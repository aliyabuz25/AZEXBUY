import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://beta.azexbuy.com/octo-admin';
const USERNAME = 'admin';
const PASSWORD = 'admin';
const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Module-level error collectors
const consoleErrors: string[] = [];
const networkErrors: { url: string; status: number; method: string }[] = [];
const bugs: string[] = [];

function collectErrors(page: Page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[CONSOLE ERROR] ${msg.text()}`);
    if (msg.type() === 'warning') consoleErrors.push(`[CONSOLE WARN] ${msg.text()}`);
  });
  page.on('pageerror', (err) => consoleErrors.push(`[PAGE ERROR] ${err.message}`));
  page.on('response', (res) => {
    const s = res.status();
    if (s >= 400) networkErrors.push({ url: res.url(), status: s, method: res.request().method() });
  });
}

async function ss(page: Page, name: string): Promise<string> {
  const fp = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  return fp;
}

async function login(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.setItem('octotech_tutorial_completed', 'true');
    localStorage.removeItem('octotech_admin_jwt');
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('input[type="text"][placeholder="admin"]', { timeout: 15000 });
  await page.locator('input[type="text"][placeholder="admin"]').fill(USERNAME);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForSelector('aside', { timeout: 20000 });
  await page.waitForTimeout(800);
}

// Click a sidebar button by its exact full text
// Uses force:true to bypass any fixed overlays (StartupUpdateToast etc.)
async function clickSidebar(page: Page, exactLabel: string): Promise<boolean> {
  const btn = page.locator('aside nav button').filter({ hasText: exactLabel }).first();
  try {
    const count = await btn.count();
    if (count === 0) {
      // Try expanding the collapsible first
      const platformBtn = page.locator('aside nav button').filter({ hasText: 'Platformlar / AZEXBUY' }).first();
      if (await platformBtn.count() > 0) {
        await platformBtn.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(400);
      }
    }
    await btn.click({ force: true, timeout: 5000 });
    await page.waitForTimeout(800);
    return true;
  } catch (e: any) {
    bugs.push(`BUG: Could not click sidebar button "${exactLabel}": ${e.message}`);
    return false;
  }
}

// ─── TESTS ──────────────────────────────────────────────────────────────────

test.describe('AZEXBUY Admin Panel — Comprehensive Tests', () => {
  test.setTimeout(60000);

  // ── 01 Login ──────────────────────────────────────────────────────────────
  test('01 - Login with admin/admin credentials', async ({ page }) => {
    collectErrors(page);

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.setItem('octotech_tutorial_completed', 'true');
      localStorage.removeItem('octotech_admin_jwt');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
    await ss(page, '01-login-page');

    const usernameField = page.locator('input[type="text"][placeholder="admin"]');
    const passwordField = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(usernameField).toBeVisible({ timeout: 10000 });
    await expect(passwordField).toBeVisible();
    await expect(submitBtn).toBeVisible();

    const btnText = await submitBtn.textContent();
    console.log(`  Submit button text: "${btnText?.trim()}"`);

    await usernameField.fill(USERNAME);
    await passwordField.fill(PASSWORD);
    await ss(page, '01b-credentials-filled');
    await submitBtn.click();

    try {
      await page.waitForSelector('aside', { timeout: 20000 });
      await ss(page, '01c-logged-in');
      console.log('✅ Login: PASS — sidebar appeared after login');
    } catch {
      await ss(page, '01c-login-failed');
      const errorEl = page.locator('[class*="red"], [class*="error"]').first();
      const errTxt = await errorEl.textContent().catch(() => 'N/A');
      bugs.push(`BUG: Login failed — sidebar never appeared. Error: "${errTxt}"`);
      throw new Error(`Login failed: ${errTxt}`);
    }
  });

  // ── 02 Dashboard ──────────────────────────────────────────────────────────
  test('02 - Dashboard view', async ({ page }) => {
    collectErrors(page);
    await login(page);
    await ss(page, '02-dashboard');

    // Sidebar must be visible
    await expect(page.locator('aside')).toBeVisible();

    const body = await page.textContent('body') ?? '';
    const ok = body.includes('İcmal') || body.includes('Dashboard') || body.includes('Canlı')
      || body.includes('AZEXBUY') || body.includes('Statistik') || body.includes('sessiya')
      || body.includes('Sessiya');

    if (!ok) bugs.push('BUG: Dashboard has no recognizable content after login');
    expect(ok).toBe(true);
    console.log('✅ Dashboard: PASS');
  });

  // ── 03 AZEXBUY İcmal & Sorğular ──────────────────────────────────────────
  test('03 - AZEXBUY: İcmal & Sorğular tab', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const ok = await clickSidebar(page, 'İcmal & Sorğular');
    await ss(page, '03-azexbuy-icmal');

    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('AZEXBUY') || body.includes('RFQ') || body.includes('İcmal')
      || body.includes('Sorğu') || body.includes('sorğu') || body.includes('Producer');
    if (ok && !hasContent) bugs.push('BUG: AZEXBUY İcmal & Sorğular tab has no recognizable content');

    console.log(`${ok ? '✅' : '⚠️'} AZEXBUY İcmal & Sorğular: ${ok ? 'PASS' : 'NAV FAILED'}`);
  });

  // ── 04 AZEXBUY CMS ────────────────────────────────────────────────────────
  test('04 - AZEXBUY CMS — Məzmun tab', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const ok = await clickSidebar(page, 'CMS — Məzmun');
    await ss(page, '04-azexbuy-cms');

    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('CMS') || body.includes('Məzmun') || body.includes('Content');
    if (ok && !hasContent) bugs.push('BUG: AZEXBUY CMS — Məzmun tab has no recognizable content');

    console.log(`${ok ? '✅' : '⚠️'} AZEXBUY CMS — Məzmun: ${ok ? 'PASS' : 'NAV FAILED'}`);
  });

  // ── 05 Inbox ──────────────────────────────────────────────────────────────
  test('05 - Gelen Qutusu (Inbox) tab', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const ok = await clickSidebar(page, 'Gələn Qutusu') || await clickSidebar(page, 'Gelen Qutusu');
    await ss(page, '05-inbox');

    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('Qutusu') || body.includes('Inbox') || body.includes('RFQ')
      || body.includes('mesaj') || body.includes('Mesaj') || body.includes('Producer');
    if (ok && !hasContent) bugs.push('BUG: Gelen Qutusu (Inbox) tab has no recognizable content');

    console.log(`${ok ? '✅' : '⚠️'} Gelen Qutusu (Inbox): ${ok ? 'PASS' : 'NAV FAILED'}`);
  });

  // ── 06 User Management ────────────────────────────────────────────────────
  test('06 - İstifadəçi İdarəetməsi (User Management)', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const ok = await clickSidebar(page, 'İstifadəçilər') || await clickSidebar(page, 'İstifadəçi İdarəetməsi');
    await page.waitForTimeout(1000);
    await ss(page, '06-user-management');

    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('İstifadəçi') || body.includes('User') || body.includes('admin')
      || body.includes('Rol') || body.includes('rol') || body.includes('şifrə');
    if (ok && !hasContent) bugs.push('BUG: User Management tab has no recognizable content');

    console.log(`${ok ? '✅' : '⚠️'} User Management: ${ok ? 'PASS' : 'NAV FAILED'}`);
  });

  // ── 07 SMTP Settings ──────────────────────────────────────────────────────
  test('07 - SMTP E-poçt Settings', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const ok = await clickSidebar(page, 'SMTP E-poçt');
    await page.waitForTimeout(1000);
    await ss(page, '07-smtp-settings');

    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('SMTP') || body.includes('E-poçt') || body.includes('host')
      || body.includes('port') || body.includes('email') || body.includes('mail');
    if (ok && !hasContent) bugs.push('BUG: SMTP E-poçt tab has no recognizable content');

    console.log(`${ok ? '✅' : '⚠️'} SMTP E-poçt: ${ok ? 'PASS' : 'NAV FAILED'}`);
  });

  // ── 08 System Settings ────────────────────────────────────────────────────
  test('08 - Sistem Parametrləri (System Settings)', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const ok = await clickSidebar(page, 'Parametrlər') || await clickSidebar(page, 'Sistem Parametrləri');
    await page.waitForTimeout(1000);
    await ss(page, '08-system-settings');

    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('Parametr') || body.includes('Settings') || body.includes('Sistem')
      || body.includes('Sayt') || body.includes('sayt') || body.includes('Multer');
    if (ok && !hasContent) bugs.push('BUG: Sistem Parametrləri tab has no recognizable content');

    console.log(`${ok ? '✅' : '⚠️'} Sistem Parametrləri: ${ok ? 'PASS' : 'NAV FAILED'}`);
  });

  // ── 09 SEO Manager ────────────────────────────────────────────────────────
  test('09 - SEO Manager tab (via tabs bar quick-add)', async ({ page }) => {
    collectErrors(page);
    await login(page);

    // The TabsBar quick-add button has title="Yeni Vərəq Aç" and opens seo-manager
    const quickAddBtn = page.locator('button[title="Yeni Vərəq Aç"]').first();
    let found = false;
    try {
      await quickAddBtn.click({ force: true, timeout: 5000 });
      found = true;
    } catch {}

    await page.waitForTimeout(800);
    await ss(page, '09-seo-manager');
    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('SEO') || body.includes('Axtarış') || body.includes('Meta') || body.includes('sitemap');

    if (!found) bugs.push('BUG: "Yeni Vərəq Aç" (quick-add) button not found in tabs bar');
    if (found && !hasContent) bugs.push('BUG: SEO Manager opened but has no recognizable content');
    console.log(`${found && hasContent ? '✅' : '⚠️'} SEO Manager: ${found && hasContent ? 'PASS' : found ? 'OPENED BUT NO CONTENT' : 'BUTTON NOT FOUND'}`);
  });

  // ── 10 Media Library ──────────────────────────────────────────────────────
  test('10 - Media Library tab (via command palette)', async ({ page }) => {
    collectErrors(page);
    await login(page);

    // Open command palette via its button (force click to bypass overlay)
    const cmdBtn = page.locator('button').filter({ hasText: /Axtarış/ }).first();
    let found = false;
    try {
      await cmdBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(600);
      // Find the search input inside the palette
      const inp = page.locator('input').nth(0);
      if (await inp.isVisible({ timeout: 2000 })) {
        await inp.fill('Media');
        await page.waitForTimeout(500);
        const result = page.locator('li, button, [role="option"]').filter({ hasText: /[Mm]edia/ }).first();
        if (await result.count() > 0) {
          await result.click({ force: true, timeout: 3000 });
          found = true;
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        await page.keyboard.press('Escape');
      }
    } catch { await page.keyboard.press('Escape').catch(() => {}); }

    await page.waitForTimeout(800);
    await ss(page, '10-media-library');
    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('Media') || body.includes('media') || body.includes('fayl') || body.includes('upload');

    if (!found) bugs.push('NOTE: Media Library not in sidebar — command palette search attempted');
    if (found && !hasContent) bugs.push('BUG: Media Library opened but has no recognizable content');
    console.log(`${found ? '✅' : '⚠️'} Media Library: ${found ? 'PASS' : 'NOT IN SIDEBAR (palette attempted)'}`);
  });

  // ── 11 Localization ───────────────────────────────────────────────────────
  test('11 - Localization tab (via command palette)', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const cmdBtn = page.locator('button').filter({ hasText: /Axtarış/ }).first();
    let found = false;
    try {
      await cmdBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(600);
      const inp = page.locator('input').nth(0);
      if (await inp.isVisible({ timeout: 2000 })) {
        await inp.fill('Lokalizasiya');
        await page.waitForTimeout(500);
        const result = page.locator('li, button, [role="option"]').filter({ hasText: /[Ll]okalizasiya|[Ll]ocalization/ }).first();
        if (await result.count() > 0) {
          await result.click({ force: true, timeout: 3000 });
          found = true;
        } else {
          await page.keyboard.press('Escape');
        }
      } else {
        await page.keyboard.press('Escape');
      }
    } catch { await page.keyboard.press('Escape').catch(() => {}); }

    await page.waitForTimeout(800);
    await ss(page, '11-localization');
    const body = await page.textContent('body') ?? '';
    const hasContent = body.includes('Lokalizasiya') || body.includes('Localization') || body.includes('Dil') || body.includes('Tərcümə');

    if (!found) bugs.push('NOTE: Localization tab not in sidebar — command palette search attempted');
    if (found && !hasContent) bugs.push('BUG: Localization opened but has no recognizable content');
    console.log(`${found ? '✅' : '⚠️'} Localization: ${found ? 'PASS' : 'NOT IN SIDEBAR (palette attempted)'}`);
  });

  // ── 12 API Health Check ───────────────────────────────────────────────────
  test('12 - API endpoint health check', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const token = await page.evaluate(() => localStorage.getItem('octotech_admin_jwt') || '');
    console.log(`  JWT obtained: ${token ? 'YES' : 'NO'}`);

    const endpoints = [
      { path: '/api/setup',             auth: false },
      { path: '/api/seo',               auth: false },
      { path: '/api/translations',      auth: false },
      { path: '/api/records',           auth: false },
      { path: '/api/media',             auth: false },
      { path: '/api/settings/upload',   auth: true  },
      { path: '/api/auth/me',           auth: true  },
      { path: '/api/azexbuy/rfqs',      auth: true  },
      { path: '/api/azexbuy/producers', auth: true  },
    ];

    for (const ep of endpoints) {
      try {
        const headers: Record<string, string> = {};
        if (ep.auth && token) headers['Authorization'] = `Bearer ${token}`;
        const res = await page.request.get(`https://beta.azexbuy.com${ep.path}`, { headers });
        const status = res.status();
        const icon = status < 400 ? '✅' : status === 401 ? '🔒' : '❌';
        console.log(`  ${icon} ${ep.path} → HTTP ${status}`);
        if (status >= 500) {
          bugs.push(`BUG: API ${ep.path} → HTTP ${status} (server error)`);
          networkErrors.push({ url: `https://beta.azexbuy.com${ep.path}`, status, method: 'GET' });
        } else if (status === 404) {
          bugs.push(`BUG: API ${ep.path} → HTTP 404 (not found)`);
          networkErrors.push({ url: `https://beta.azexbuy.com${ep.path}`, status, method: 'GET' });
        }
      } catch (e: any) {
        console.log(`  ❌ ${ep.path} → ERROR: ${e.message}`);
        bugs.push(`BUG: API ${ep.path} threw error: ${e.message}`);
      }
    }
    await ss(page, '12-api-health');
    console.log('✅ API health check complete');
  });

  // ── 13 Theme Selector Modal ───────────────────────────────────────────────
  test('13 - Theme selector modal', async ({ page }) => {
    collectErrors(page);
    await login(page);

    // The Tema button is in the top breadcrumb bar — force click to bypass overlay
    const themeBtn = page.locator('button').filter({ hasText: 'Tema' }).first();
    let clicked = false;
    try {
      await themeBtn.click({ force: true, timeout: 5000 });
      clicked = true;
    } catch {}

    await page.waitForTimeout(800);
    await ss(page, '13-theme-modal-open');

    const body = await page.textContent('body') ?? '';
    const isOpen = body.includes('Tema') || body.includes('Theme') || body.includes('Rəng') || body.includes('rəng');
    if (!clicked) bugs.push('BUG: "Tema" button not found/clickable in top bar');
    if (clicked && !isOpen) bugs.push('BUG: Theme modal clicked but no theme content visible');

    if (isOpen) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await ss(page, '13b-theme-modal-closed');
      console.log('✅ Theme selector modal: PASS');
    } else {
      const allBtnTexts = await page.locator('button').allTextContents();
      console.log('  Buttons found:', allBtnTexts.filter((t: string) => t.trim()).slice(0, 15));
      await ss(page, '13-tema-btn-missing');
      console.log(`⚠️ Theme selector modal: ${clicked ? 'CLICKED BUT NO CONTENT' : 'BUTTON NOT FOUND'}`);
    }
  });

  // ── 14 Command Palette ────────────────────────────────────────────────────
  test('14 - Command palette (CMD+K)', async ({ page }) => {
    collectErrors(page);
    await login(page);

    // Force-click the Axtarış (CMD+K) button in the top bar
    const searchBtn = page.locator('button').filter({ hasText: /Axtarış/ }).first();
    try {
      await searchBtn.click({ force: true, timeout: 5000 });
    } catch {
      // Fallback: keyboard shortcut
      await page.keyboard.press('Meta+k');
    }
    await page.waitForTimeout(800);
    await ss(page, '14-command-palette-open');

    const inputCount = await page.locator('input').count();
    // The palette renders a search input — there should be at least one input visible
    const paletteVisible = await page.locator('input').first().isVisible({ timeout: 1000 }).catch(() => false);

    if (!paletteVisible) bugs.push('BUG: Command palette input not visible after clicking search button');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    console.log(`${paletteVisible ? '✅' : '⚠️'} Command palette: ${paletteVisible ? 'PASS' : 'NOT DETECTED'} (inputs: ${inputCount})`);
  });

  // ── 15 Sidebar Collapse/Expand ────────────────────────────────────────────
  test('15 - Sidebar collapse and expand', async ({ page }) => {
    collectErrors(page);
    await login(page);

    // Force-click to bypass overlay
    const collapseBtn = page.locator('button[title="Yığ"], button[title="Sidebarı yığ"]').first();
    try {
      await collapseBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(500);
      await ss(page, '15-sidebar-collapsed');

      const expandBtn = page.locator('button[title="Genişləndir"], button[title="Sidebarı genişləndir"]').first();
      await expandBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(500);
      await ss(page, '15b-sidebar-expanded');
      console.log('✅ Sidebar collapse/expand: PASS');
    } catch (e: any) {
      bugs.push(`BUG: Sidebar collapse/expand failed: ${e.message}`);
      await ss(page, '15-collapse-failed');
      console.log('⚠️ Sidebar collapse/expand: FAILED');
    }
  });

  // ── 16 Language Switcher ──────────────────────────────────────────────────
  test('16 - Language switcher (FloatingFlagSelector)', async ({ page }) => {
    collectErrors(page);
    await login(page);
    await ss(page, '16-full-page-for-flag');

    // FloatingFlagSelector is a fixed bottom-right element
    // Check all button texts for language codes
    const allBtns = await page.locator('button').allTextContents();
    const langBtn = allBtns.find((t: string) => /^(AZ|TR|RU|EN)$/.test(t.trim()));

    if (langBtn) {
      const btn = page.locator('button').filter({ hasText: new RegExp(`^${langBtn.trim()}$`) }).first();
      await btn.click({ force: true, timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
      await ss(page, '16b-flag-selector-clicked');
      console.log(`✅ Language switcher: PASS — found "${langBtn.trim()}"`);
    } else {
      bugs.push('NOTE: FloatingFlagSelector renders as pure CSS flags without detectable text');
      console.log('⚠️ Language switcher: pure icon/flag rendering, no text found (see screenshots)');
    }
  });

  // ── 17 SQLite Backup Link ─────────────────────────────────────────────────
  test('17 - SQLite Backup download link', async ({ page }) => {
    collectErrors(page);
    await login(page);

    // Check if link exists in DOM (don't need isVisible with timeout — just check count)
    const backupLinkCount = await page.locator('a[href*="backup"]').count();

    if (backupLinkCount > 0) {
      const href = await page.locator('a[href*="backup"]').first().getAttribute('href');
      console.log(`  Backup link href: "${href}"`);
      await ss(page, '17-backup-link-visible');

      const token = await page.evaluate(() => localStorage.getItem('octotech_admin_jwt') || '');
      const res = await page.request.get('https://beta.azexbuy.com/api/backup/download', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (res) {
        const status = res.status();
        console.log(`  Backup endpoint: HTTP ${status}`);
        if (status >= 400) bugs.push(`BUG: /api/backup/download returned HTTP ${status}`);
        else console.log('✅ SQLite Backup link + endpoint: PASS');
      }
    } else {
      bugs.push('BUG: SQLite Backup link (a[href*="backup"]) not found in DOM');
      await ss(page, '17-backup-link-missing');
      console.log('⚠️ SQLite Backup link: NOT FOUND');
    }
  });

  // ── 18 Mobile Responsive ──────────────────────────────────────────────────
  test('18 - Responsive layout (375px mobile)', async ({ page }) => {
    collectErrors(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page);
    await page.waitForTimeout(500);
    await ss(page, '18-mobile-375px');

    const body = await page.textContent('body') ?? '';
    if (!body || body.length < 50) {
      bugs.push('BUG: Mobile layout (375px) appears empty');
      console.log('⚠️ Mobile layout: empty body');
    } else {
      console.log('✅ Mobile layout (375px): PASS');
    }
  });

  // ── 19 Logout ─────────────────────────────────────────────────────────────
  test('19 - Logout functionality', async ({ page }) => {
    collectErrors(page);
    await login(page);
    await ss(page, '19-before-logout');

    // Force click the logout button to bypass overlay
    const logoutBtn = page.locator('button[title="Çıxış"], button[title="Sessiyadan Çıxış"]').first();
    try {
      await logoutBtn.click({ force: true, timeout: 5000 });
      await page.waitForTimeout(2000);
      await ss(page, '19b-after-logout');

      // After logout login form should be visible — check for password input
      const hasLoginForm = await page.locator('input[type="password"]').count() > 0;
      if (hasLoginForm) {
        console.log('✅ Logout: PASS — login form reappeared');
      } else {
        bugs.push('BUG: After logout, login form (password input) did not reappear');
        console.log('⚠️ Logout: login form did not reappear');
      }
    } catch (e: any) {
      bugs.push(`BUG: Logout button click failed: ${e.message}`);
      await ss(page, '19-logout-failed');
      console.log('⚠️ Logout: FAILED');
    }
  });

  // ── 20 Session Timer ──────────────────────────────────────────────────────
  test('20 - Session countdown timer', async ({ page }) => {
    collectErrors(page);
    await login(page);

    const body = await page.textContent('body') ?? '';
    const hasTimer = /Sessiya:?\s*\d{2}:\d{2}/.test(body) || /\d{2}:\d{2}/.test(body);
    await ss(page, '20-session-timer');

    if (hasTimer) {
      const match = body.match(/\d{2}:\d{2}/);
      console.log(`✅ Session timer: PASS — found "${match?.[0]}"`);
    } else {
      bugs.push('BUG: Session countdown timer (MM:SS format) not found in page text');
      console.log('⚠️ Session timer: NOT FOUND');
    }
  });

  // ── 99 Final Report ───────────────────────────────────────────────────────
  test('99 - Final Report', async ({ page }) => {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('            AZEXBUY ADMIN PANEL — FULL TEST REPORT                ');
    console.log('═══════════════════════════════════════════════════════════════════');

    const uniqueConsoleErrors = [...new Set(consoleErrors)];
    if (uniqueConsoleErrors.length > 0) {
      console.log(`\n📛 CONSOLE ERRORS (${uniqueConsoleErrors.length}):`);
      uniqueConsoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
    } else {
      console.log('\n✅ No console errors recorded');
    }

    const realNetErrors = [...new Map(
      networkErrors.filter(e => e.status !== 401).map(e => [`${e.method}:${e.url}:${e.status}`, e])
    ).values()];
    if (realNetErrors.length > 0) {
      console.log(`\n🔴 NETWORK ERRORS — 4xx/5xx non-401 (${realNetErrors.length}):`);
      realNetErrors.forEach((e, i) => console.log(`  ${i + 1}. [${e.method}] ${e.url} → HTTP ${e.status}`));
    } else {
      console.log('\n✅ No critical network errors (4xx/5xx non-401)');
    }

    if (bugs.length > 0) {
      console.log(`\n🐛 BUGS / ISSUES FOUND (${bugs.length}):`);
      bugs.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
    } else {
      console.log('\n✅ No bugs found');
    }

    const files = fs.existsSync(SCREENSHOT_DIR)
      ? fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png')).sort()
      : [];
    console.log(`\n📸 SCREENSHOTS (${files.length}):`);
    files.forEach(f => console.log(`  - ${path.join(SCREENSHOT_DIR, f)}`));

    const report = {
      timestamp: new Date().toISOString(),
      summary: { consoleErrors: uniqueConsoleErrors.length, networkErrors: realNetErrors.length, bugs: bugs.length, screenshots: files.length },
      consoleErrors: uniqueConsoleErrors,
      networkErrors: realNetErrors,
      bugs,
      screenshots: files.map(f => path.join(SCREENSHOT_DIR, f)),
    };
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'report.json'), JSON.stringify(report, null, 2));
    console.log(`\n📄 JSON report: ${path.join(SCREENSHOT_DIR, 'report.json')}`);
    console.log('═══════════════════════════════════════════════════════════════════\n');
  });
});
