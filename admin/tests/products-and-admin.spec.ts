import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://beta.azexbuy.com';
const ADMIN_URL = 'https://beta.azexbuy.com/octo-admin';
const USERNAME = 'admin';
const PASSWORD = 'admin';
const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'screenshots', 'audit');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface ErrorLog {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: { url: string; status: number; method: string }[];
}

function setupErrorTracking(page: Page): ErrorLog {
  const errors: ErrorLog = {
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore non-breaking favicon or external font errors if any
      if (!text.includes('favicon.ico')) {
        errors.consoleErrors.push(text);
      }
    }
  });

  page.on('pageerror', (err) => {
    errors.pageErrors.push(err.message);
  });

  page.on('response', (res) => {
    const s = res.status();
    const url = res.url();
    // Ignore deliberate 401 on initial unauthenticated auth check & favicon
    if (s >= 400 && !url.includes('/api/auth/me') && !url.includes('favicon.ico')) {
      errors.failedRequests.push({ url, status: s, method: res.request().method() });
    }
  });

  return errors;
}

test.describe('AZEXBUY Storefront & Admin Diagnostic Audit', () => {
  test.setTimeout(90000);

  // ───────────────────────────────────────────────────────────────────────────
  // 1. STOREFRONT #/products TEST
  // ───────────────────────────────────────────────────────────────────────────
  test('01 - Storefront #/products renders products, filters, search and spec modal without errors', async ({ page }) => {
    const errors = setupErrorTracking(page);

    console.log('Navigating to', `${BASE_URL}/#/products`);
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'networkidle', timeout: 35000 });
    await page.waitForTimeout(2000);

    // Take screenshot of initial products view
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-storefront-products-view.png'), fullPage: true });

    // Verify main catalog heading exists
    const mainSection = page.locator('section');
    await expect(mainSection.first()).toBeVisible({ timeout: 15000 });

    // Verify product cards are displayed
    const specsButtons = page.locator('button:has-text("Specs")');
    const productCount = await specsButtons.count();
    console.log(`Detected ${productCount} product cards on storefront`);
    expect(productCount).toBeGreaterThanOrEqual(4);

    // Verify product titles are loaded properly from backend
    const productHeadings = page.locator('main h3, section h3');
    const h3Count = await productHeadings.count();
    const titles: string[] = [];
    for (let i = 0; i < h3Count; i++) {
      const text = (await productHeadings.nth(i).textContent()) || '';
      if (text.trim().length > 3) {
        titles.push(text.trim());
      }
    }
    console.log(`Loaded ${titles.length} product titles:`, titles);
    expect(titles.length).toBeGreaterThanOrEqual(4);

    // Test Search input
    const searchInput = page.locator('input[type="text"][placeholder*="HS"], input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="Axtar"], input[type="text"]').first();
    if (await searchInput.isVisible()) {
      console.log('Testing search bar with "Honey"...');
      await searchInput.fill('Honey');
      await page.waitForTimeout(600);
      const afterSearchCount = await specsButtons.count();
      console.log(`Cards matching "Honey": ${afterSearchCount}`);
      expect(afterSearchCount).toBeGreaterThanOrEqual(1);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-search-honey.png') });
      await searchInput.clear();
      await page.waitForTimeout(600);
    }

    // Test Clicking "Specs" on the first product card to open ProductSpecModal
    console.log('Opening ProductSpecModal for first product...');
    await specsButtons.first().click();
    await page.waitForTimeout(1000);

    // Verify Modal is opened
    const modalContainer = page.locator('.fixed:has-text("Origin Cluster")');
    await expect(modalContainer).toBeVisible({ timeout: 5000 });
    const modalHeading = modalContainer.locator('h3').first();
    await expect(modalHeading).toBeVisible();
    console.log('Product Spec Modal opened for:', await modalHeading.textContent());

    // Verify modal contains origin cluster and specifications
    const modalText = await modalContainer.textContent();
    expect(modalText).toContain('Origin Cluster');
    expect(modalText).toContain('Incoterms® 2020');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-product-spec-modal.png') });

    // Close Modal via close button
    const modalCloseBtn = modalContainer.locator('button:has(i.fa-xmark)');
    await expect(modalCloseBtn).toBeVisible({ timeout: 5000 });
    await modalCloseBtn.click();
    await page.waitForTimeout(800);
    await expect(modalContainer).not.toBeVisible({ timeout: 5000 });

    // Report any console or page errors
    console.log('Console Errors:', errors.consoleErrors);
    console.log('Page Errors:', errors.pageErrors);
    console.log('Failed Requests:', errors.failedRequests);

    expect(errors.pageErrors).toEqual([]);
    expect(errors.failedRequests).toEqual([]);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. ADMIN PANEL /octo-admin/ TEST
  // ───────────────────────────────────────────────────────────────────────────
  test('02 - Octo Admin login, dashboard, product catalog view and inbox', async ({ page }) => {
    const errors = setupErrorTracking(page);

    // Pre-seed localStorage before page scripts execute so interactive tutorial does not intercept clicks
    await page.addInitScript(() => {
      localStorage.setItem('octotech_tutorial_completed', 'true');
    });

    console.log('Navigating to', ADMIN_URL);
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Check if login form is displayed
    const usernameInput = page.locator('input[type="text"][placeholder="admin"]');
    const isLoginVisible = await usernameInput.isVisible({ timeout: 8000 }).catch(() => false);

    if (isLoginVisible) {
      console.log('Logging in as admin...');
      await usernameInput.fill(USERNAME);
      await page.locator('input[type="password"]').first().fill(PASSWORD);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForSelector('aside', { timeout: 20000 });
      await page.waitForTimeout(1200);
    } else {
      console.log('Already logged in or session resumed');
      await page.waitForSelector('aside', { timeout: 20000 });
    }

    // Dismiss tutorial if it still popped up
    const skipBtn = page.locator('button:has-text("Burax")');
    if (await skipBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await skipBtn.click();
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-admin-dashboard.png'), fullPage: true });

    // Navigate to "Məhsul Kataloqu" (Product Catalog) in sidebar
    console.log('Navigating to Product Catalog in admin sidebar...');
    const prodCatalogBtn = page.locator('aside nav button:has-text("Məhsul Kataloqu")');
    await expect(prodCatalogBtn).toBeVisible({ timeout: 10000 });
    await prodCatalogBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-admin-product-catalog.png'), fullPage: true });

    // Verify product catalog loaded
    const productCatalogTitle = page.locator('h1:has-text("Ürün Kataloğu"), h1:has-text("Məhsul Kataloqu")');
    await expect(productCatalogTitle.first()).toBeVisible({ timeout: 8000 });

    // Check tabs: Switch to Products tab
    const productsTabBtn = page.locator('button:has-text("Məhsullar")');
    await expect(productsTabBtn.first()).toBeVisible({ timeout: 5000 });
    console.log('Clicking Products tab in admin...');
    await productsTabBtn.first().click();
    await page.waitForTimeout(1200);

    // Verify products are loaded from database in admin catalog
    const productRowTitles = await page.locator('.text-xs.font-bold.text-slate-800').allTextContents();
    console.log(`Found ${productRowTitles.length} products in admin catalog:`, productRowTitles);
    expect(productRowTitles.length).toBeGreaterThanOrEqual(5);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-admin-products-tab.png'), fullPage: true });

    // Verify Inbox / Gələn Qutusu
    const inboxBtn = page.locator('aside nav button:has-text("Gələn Qutusu"), aside nav button:has-text("Inbox"), aside nav button:has-text("Gelen Kutusu")');
    if (await inboxBtn.count() > 0) {
      console.log('Navigating to Inbox...');
      await inboxBtn.first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-admin-inbox.png'), fullPage: true });

      // Verify Inbox heading / view
      const inboxHeading = page.locator('h1, h2, h3').filter({ hasText: /Gələn|Gelen|Inbox|RFQ/i });
      await expect(inboxHeading.first()).toBeVisible({ timeout: 5000 });
      console.log('Inbox view confirmed.');
    }

    // Report any console or page errors
    console.log('Admin Console Errors:', errors.consoleErrors);
    console.log('Admin Page Errors:', errors.pageErrors);
    console.log('Admin Failed Requests:', errors.failedRequests);

    expect(errors.pageErrors).toEqual([]);
    expect(errors.failedRequests).toEqual([]);
  });
});
