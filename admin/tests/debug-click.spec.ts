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
  await page.waitForTimeout(800);
}

test('debug - is any overlay blocking clicks?', async ({ page }) => {
  test.setTimeout(25000);

  await login(page);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug-overlay-1-after-login.png'), fullPage: true });

  // Check for modals/overlays
  const overlays = await page.locator('[class*="modal"], [class*="overlay"], [class*="backdrop"], [class*="wizard"], [class*="tutorial"], [class*="onboard"]').count();
  console.log(`Overlays/modals found: ${overlays}`);

  // Check for fixed positioned elements on top
  const fixedEls = await page.evaluate(() => {
    const fixed: string[] = [];
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' || style.position === 'sticky') {
        fixed.push(`${el.tagName}.${el.className.toString().substring(0,60)} z:${style.zIndex}`);
      }
    });
    return fixed.slice(0, 20);
  });
  console.log('Fixed/sticky elements:', fixedEls);

  // Try clicking the button directly with force:true to bypass overlay
  console.log('Attempting click with force...');
  const btn = page.locator('aside nav button').nth(1); // İcmal & Sorğular is index 1
  await btn.click({ force: true, timeout: 5000 });
  console.log('Click succeeded!');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'debug-overlay-2-after-click.png'), fullPage: true });

  const body = await page.textContent('body') ?? '';
  const hasContent = body.includes('İcmal') || body.includes('RFQ') || body.includes('AZEXBUY');
  console.log(`Content found after click: ${hasContent}`);
});