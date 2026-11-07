import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'https://beta.azexbuy.com/octo-admin';
const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'screenshots');

async function login(page: any) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => {
    localStorage.setItem('octotech_tutorial_completed', 'true');
    localStorage.removeItem('octotech_admin_jwt');
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForSelector('input[type="text"][placeholder="admin"]', { timeout: 15000 });
  await page.locator('input[type="text"][placeholder="admin"]').fill('admin');
  await page.locator('input[type="password"]').first().fill('admin');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForSelector('aside', { timeout: 20000 });
  await page.waitForTimeout(1000);
}

test('debug - dump sidebar DOM', async ({ page }) => {
  test.setTimeout(30000);
  await login(page);

  // Dump all button texts in aside
  const buttons = await page.locator('aside button').allTextContents();
  console.log('=== ASIDE BUTTONS ===');
  buttons.forEach((t: string, i: number) => console.log(`  [${i}] "${t.replace(/\n/g, '\\n').trim()}"`));

  // Dump the full aside HTML (truncated)
  const asideHtml = await page.locator('aside').innerHTML();
  console.log('\n=== ASIDE HTML (first 3000 chars) ===');
  console.log(asideHtml.substring(0, 3000));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug-sidebar.png'), fullPage: true });
});
