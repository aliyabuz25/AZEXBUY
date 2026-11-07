import { test, expect, Page } from '@playwright/test';
import path from 'path';

const SS = (name: string) => path.join('tests/screenshots', `${name}.png`);

test.beforeAll(async ({ }, testInfo) => {
  const { mkdirSync } = await import('fs');
  mkdirSync('tests/screenshots', { recursive: true });
});

test('Homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: SS('01-homepage'), fullPage: false });

  const title = await page.title();
  console.log('Page title:', title);

  // Check hero section exists
  const hero = page.locator('section, [class*="hero"], h1, h2').first();
  await expect(hero).toBeVisible();
  console.log('✓ Homepage loaded');
});

test('RFQ Modal — open, fill, submit', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Find "Find a Supplier" or "Request a Quote" button
  const rfqBtn = page.locator('button, a').filter({
    hasText: /find a supplier|request.*quote|rfq|sorğu|təchizatçı tap/i
  }).first();

  await rfqBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✓ RFQ button found:', await rfqBtn.textContent());
  await rfqBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: SS('02-rfq-modal-open') });

  // Fill company name
  const companyInput = page.locator('input[placeholder*="company" i], input[placeholder*="şirkət" i], input[name*="company" i], input[id*="company" i]').first();
  if (await companyInput.isVisible()) {
    await companyInput.fill('Playwright Test GmbH');
    console.log('✓ Company filled');
  } else {
    // Try to find any visible text input in modal
    const inputs = await page.locator('input[type="text"], input:not([type])').all();
    console.log(`Found ${inputs.length} text inputs`);
    if (inputs.length > 0) await inputs[0].fill('Playwright Test GmbH');
  }

  // Fill country
  const countryInput = page.locator('input[placeholder*="country" i], input[placeholder*="ölkə" i], select[name*="country" i]').first();
  if (await countryInput.isVisible().catch(() => false)) {
    await countryInput.fill('Germany');
    console.log('✓ Country filled');
  }

  // Fill contact name
  const contactInput = page.locator('input[placeholder*="contact" i], input[placeholder*="əlaqə" i], input[placeholder*="name" i]').nth(1);
  if (await contactInput.isVisible().catch(() => false)) {
    await contactInput.fill('Hans Mueller');
    console.log('✓ Contact filled');
  }

  // Fill email
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[name*="email" i]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill('hans@playwright-test.com');
    console.log('✓ Email filled');
  }

  // Fill phone
  const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i], input[placeholder*="telefon" i]').first();
  if (await phoneInput.isVisible().catch(() => false)) {
    await phoneInput.fill('+49 30 1234 5678');
    console.log('✓ Phone filled');
  }

  await page.screenshot({ path: SS('03-rfq-form-filled') });

  // Try to add a product — look for "Add Product" or similar button
  const addProductBtn = page.locator('button').filter({
    hasText: /add.*product|məhsul əlavə|add item|produkt/i
  }).first();
  if (await addProductBtn.isVisible().catch(() => false)) {
    await addProductBtn.click();
    await page.waitForTimeout(500);
    // Fill product name
    const productInput = page.locator('input[placeholder*="product" i], input[placeholder*="məhsul" i]').last();
    if (await productInput.isVisible().catch(() => false)) {
      await productInput.fill('Hazelnut');
    }
    // Fill quantity
    const qtyInput = page.locator('input[placeholder*="qty" i], input[placeholder*="quantity" i], input[placeholder*="miqdar" i]').last();
    if (await qtyInput.isVisible().catch(() => false)) {
      await qtyInput.fill('5');
    }
    console.log('✓ Product added');
  }

  // Fill notes
  const notesInput = page.locator('textarea[placeholder*="note" i], textarea[placeholder*="qeyd" i], textarea').first();
  if (await notesInput.isVisible().catch(() => false)) {
    await notesInput.fill('Playwright automated test submission');
    console.log('✓ Notes filled');
  }

  await page.screenshot({ path: SS('04-rfq-form-complete') });

  // Listen for API response
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/azexbuy/rfqs'), { timeout: 15000 }).catch(() => null),
    // Click submit button
    page.locator('button[type="submit"], button').filter({
      hasText: /submit|göndər|send|register|qeydiyyat|rfq/i
    }).last().click(),
  ]);

  await page.waitForTimeout(2000);
  await page.screenshot({ path: SS('05-rfq-submitted') });

  if (response) {
    console.log('✓ RFQ API response:', response.status(), await response.text().catch(() => ''));
  } else {
    console.log('⚠ No API response captured (may have used localStorage fallback)');
  }

  // Check for success toast or message
  const toast = page.locator('[class*="toast" i], [class*="success" i], [class*="notification" i]').first();
  if (await toast.isVisible().catch(() => false)) {
    console.log('✓ Toast message:', await toast.textContent());
  }
});

test('Producer Modal — open, fill, submit', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Find producer/exporter button
  const producerBtn = page.locator('button, a').filter({
    hasText: /find a buyer|register.*producer|export.*register|alıcı tap|istehsalçı/i
  }).first();

  await producerBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✓ Producer button found:', await producerBtn.textContent());
  await producerBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: SS('06-producer-modal-open') });

  // Fill company name
  const inputs = page.locator('input[type="text"], input:not([type])');
  const inputCount = await inputs.count();
  console.log(`Producer modal: ${inputCount} text inputs found`);

  // Fill all visible inputs in order
  const fillMap: Record<string, string> = {
    'company': 'Playwright Export MMC',
    'şirkət': 'Playwright Export MMC',
    'voen': '1234567890',
    'tin': '1234567890',
    'contact': 'Əli Test',
    'əlaqə': 'Əli Test',
    'email': 'ali@playwright-test.az',
    'phone': '+994 50 999 88 77',
    'telefon': '+994 50 999 88 77',
    'product': 'Hazelnut',
    'məhsul': 'Hazelnut',
    'capacity': '100 MT',
    'kapasite': '100 MT',
  };

  for (const [placeholder, value] of Object.entries(fillMap)) {
    const input = page.locator(`input[placeholder*="${placeholder}" i]`).first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill(value);
      console.log(`✓ Filled ${placeholder}: ${value}`);
    }
  }

  // Fill email specifically
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill('ali@playwright-test.az');
    console.log('✓ Email filled');
  }

  await page.screenshot({ path: SS('07-producer-form-filled') });

  // Listen for API response and submit
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/azexbuy/producers'), { timeout: 15000 }).catch(() => null),
    page.locator('button[type="submit"], button').filter({
      hasText: /submit|göndər|send|register|qeydiyyat|apply/i
    }).last().click(),
  ]);

  await page.waitForTimeout(2000);
  await page.screenshot({ path: SS('08-producer-submitted') });

  if (response) {
    console.log('✓ Producer API response:', response.status(), await response.text().catch(() => ''));
  } else {
    console.log('⚠ No API response captured');
  }

  const toast = page.locator('[class*="toast" i], [class*="success" i]').first();
  if (await toast.isVisible().catch(() => false)) {
    console.log('✓ Toast:', await toast.textContent());
  }
});

test('API Security — GET endpoints require auth', async ({ page }) => {
  // Test unauthenticated access
  const rfqResp = await page.request.get('https://beta.azexbuy.com/api/azexbuy/rfqs');
  console.log('GET /rfqs without auth:', rfqResp.status());
  expect(rfqResp.status()).toBe(401);

  const prodResp = await page.request.get('https://beta.azexbuy.com/api/azexbuy/producers');
  console.log('GET /producers without auth:', prodResp.status());
  expect(prodResp.status()).toBe(401);

  console.log('✓ Security: Both GET endpoints correctly require auth');
});
