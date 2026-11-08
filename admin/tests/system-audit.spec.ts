import { test, expect, Page } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const PORT = 3366;
const LOCAL_URL = `http://localhost:${PORT}`;

let serverProcess: ChildProcess;

test.beforeAll(async () => {
  serverProcess = spawn('node', ['dist/server.js'], {
    cwd: path.resolve(process.cwd(), 'admin'),
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'production' },
    stdio: 'pipe',
  });

  serverProcess.stdout?.on('data', (d) => process.stdout.write(`[Server] ${d}`));
  serverProcess.stderr?.on('data', (d) => process.stderr.write(`[Server Err] ${d}`));

  // Wait for server ready
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${LOCAL_URL}/api/health`);
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
});

test.afterAll(() => {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
  }
});

function monitorErrors(page: Page) {
  const errors: { console: string[]; page: string[] } = { console: [], page: [] };
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!text.includes('favicon.ico') && !text.includes('Failed to load resource: net::ERR_CONNECTION_REFUSED')) {
        errors.console.push(text);
      }
    }
  });
  page.on('pageerror', (err) => {
    errors.page.push(err.message);
  });
  return errors;
}

test.describe('End-to-End System Zero-Error Audit', () => {
  test('01 - Storefront All Main Views, Navigation, Modals without runtime errors', async ({ page }) => {
    const errors = monitorErrors(page);

    // 1. Home
    await page.goto(`${LOCAL_URL}/`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(1000);

    // 2. Products
    await page.goto(`${LOCAL_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    // Specs button should exist for Natural Honey
    const specsBtn = page.locator('button:has-text("Specs")');
    if (await specsBtn.count() > 0) {
      await specsBtn.first().click();
      await page.waitForTimeout(500);
      const closeBtn = page.locator('.fixed button:has(i.fa-xmark)').first();
      if (await closeBtn.isVisible().catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // 3. Services
    await page.goto(`${LOCAL_URL}/#/services`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();

    // 4. About
    await page.goto(`${LOCAL_URL}/#/about`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();

    // 5. Insights
    await page.goto(`${LOCAL_URL}/#/insights`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();

    // 6. Contact
    await page.goto(`${LOCAL_URL}/#/contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await expect(page.locator('body')).toBeVisible();

    expect(errors.page).toEqual([]);
    expect(errors.console).toEqual([]);
  });

  test('02 - Octo Admin Login and Navigation through all Views without errors', async ({ page }) => {
    const errors = monitorErrors(page);

    await page.addInitScript(() => {
      localStorage.setItem('octotech_tutorial_completed', 'true');
    });

    await page.goto(`${LOCAL_URL}/octo-admin/`, { waitUntil: 'domcontentloaded' });

    // Handle login if present
    const usernameInput = page.locator('input[type="text"][placeholder="admin"]');
    if (await usernameInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      await usernameInput.fill('admin');
      await page.locator('input[type="password"]').first().fill('admin');
      await page.locator('button[type="submit"]').first().click();
      await page.waitForSelector('aside', { timeout: 15000 });
      await page.waitForTimeout(1000);
    } else {
      await page.waitForSelector('aside', { timeout: 15000 });
    }

    // Dismiss tutorial if any
    const skipBtn = page.locator('button:has-text("Burax")');
    if (await skipBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await skipBtn.click();
    }

    // 1. Dashboard
    await page.waitForTimeout(800);

    // 2. Product Catalog
    const prodCatalogNav = page.locator('aside nav button:has-text("Məhsul Kataloqu")');
    if (await prodCatalogNav.isVisible()) {
      await prodCatalogNav.click();
      await page.waitForTimeout(1000);
      // Products tab
      const prodsTab = page.locator('button:has-text("Məhsullar")');
      if (await prodsTab.isVisible()) {
        await prodsTab.click();
        await page.waitForTimeout(800);
        // Expand product row if available
        const firstRow = page.locator('.space-y-3 button.text-left').first();
        if (await firstRow.isVisible()) {
          await firstRow.click();
          await page.waitForTimeout(500);
        }
      }
      // Categories tab
      const catsTab = page.locator('button:has-text("Kateqoriyalar")');
      if (await catsTab.isVisible()) {
        await catsTab.click();
        await page.waitForTimeout(500);
      }
    }

    // 3. Services
    const srvNav = page.locator('aside nav button:has-text("Xidmətlər")');
    if (await srvNav.isVisible()) {
      await srvNav.click();
      await page.waitForTimeout(1000);
    }

    // 4. Articles
    const artNav = page.locator('aside nav button:has-text("Məqalələr")');
    if (await artNav.isVisible()) {
      await artNav.click();
      await page.waitForTimeout(1000);
    }

    // 5. Inbox
    const inboxNav = page.locator('aside nav button:has-text("Gələn Qutusu"), aside nav button:has-text("Inbox")');
    if (await inboxNav.count() > 0) {
      await inboxNav.first().click();
      await page.waitForTimeout(1000);
    }

    // 6. Azexbuy CMS
    const cmsNav = page.locator('aside nav button:has-text("Məzmun"), aside nav button:has-text("CMS"), aside nav button:has-text("Azexbuy CMS")');
    if (await cmsNav.count() > 0) {
      await cmsNav.first().click();
      await page.waitForTimeout(1000);
    }

    // 7. SEO
    const seoNav = page.locator('aside nav button:has-text("SEO")');
    if (await seoNav.count() > 0) {
      await seoNav.first().click();
      await page.waitForTimeout(1000);
    }

    expect(errors.page).toEqual([]);
    expect(errors.console).toEqual([]);
  });
});
