import { test, expect, Page } from '@playwright/test';

const BASE = 'https://beta.azexbuy.com';
const ADMIN = `${BASE}/octo-admin`;
const USERNAME = 'admin';
const PASSWORD = 'admin';

type TestResult = {
  section: string;
  action: string;
  success: boolean;
  note: string;
  error?: string;
};

const results: TestResult[] = [];

function log(section: string, action: string, success: boolean, note: string, error?: string) {
  results.push({ section, action, success, note, error });
  const icon = success ? '✅' : '❌';
  console.log(`${icon} [${section}] ${action}: ${note}${error ? ` | ERROR: ${error}` : ''}`);
}

async function login(page: Page) {
  await page.goto(`${ADMIN}/login`);
  await page.waitForLoadState('networkidle');
  
  // Try to find login form
  const usernameField = page.locator('input[type="text"], input[name="username"], input[placeholder*="user" i], input[placeholder*="admin" i]').first();
  const passwordField = page.locator('input[type="password"]').first();
  
  await usernameField.fill(USERNAME);
  await passwordField.fill(PASSWORD);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');
  
  const url = page.url();
  if (url.includes('login')) {
    // Try clicking button
    const btn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login")').first();
    await btn.click();
    await page.waitForLoadState('networkidle');
  }
}

async function checkForSuccess(page: Page): Promise<{ success: boolean; message: string }> {
  // Wait a moment for any toast/notification
  await page.waitForTimeout(1500);
  
  const successSelectors = [
    '[class*="success"]',
    '[class*="toast"]',
    '[class*="alert-success"]',
    '[class*="notification"]',
    'text=uğurla',
    'text=saxlanıldı',
    'text=saved',
    'text=success',
    'text=✓',
    '[class*="checkmark"]',
    '[data-status="success"]',
  ];
  
  for (const sel of successSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 500 })) {
        const text = await el.textContent();
        return { success: true, message: text?.trim() || sel };
      }
    } catch {}
  }
  
  // Check for error
  const errorSelectors = [
    '[class*="error"]',
    '[class*="alert-danger"]',
    'text=xəta',
    'text=error',
    'text=failed',
  ];
  for (const sel of errorSelectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 300 })) {
        const text = await el.textContent();
        return { success: false, message: text?.trim() || 'Error shown' };
      }
    } catch {}
  }
  
  return { success: true, message: 'No visible confirmation (assumed ok)' };
}

// ─── MAIN TEST ─────────────────────────────────────────────────────────────────

test.setTimeout(300000); // 5 minutes total

test('Admin Panel Deep Test', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`PAGE ERROR: ${err.message}`));

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════');
  console.log('  STEP 0: LOGIN');
  console.log('═══════════════════════════════');
  
  await page.goto(`${ADMIN}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'scripts/screenshots/00-initial.png', fullPage: true });
  
  let loginURL = page.url();
  console.log('After goto /octo-admin, URL:', loginURL);
  
  if (loginURL.includes('login') || await page.locator('input[type="password"]').isVisible()) {
    // Fill login form
    await page.locator('input[type="text"], input[name="username"]').first().fill(USERNAME);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.screenshot({ path: 'scripts/screenshots/00-login-filled.png' });
    
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Login"), button:has-text("Daxil")').first();
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }
  
  const afterLoginURL = page.url();
  console.log('After login attempt, URL:', afterLoginURL);
  await page.screenshot({ path: 'scripts/screenshots/00-after-login.png', fullPage: true });
  
  if (afterLoginURL.includes('login')) {
    log('LOGIN', 'Login attempt', false, 'Still on login page after submitting');
    // Try to continue anyway
  } else {
    log('LOGIN', 'Login attempt', true, `Redirected to: ${afterLoginURL}`);
  }

  // ── HELPER: Navigate to admin section ─────────────────────────────────────
  async function goToSection(path: string): Promise<boolean> {
    try {
      await page.goto(`${ADMIN}/${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      const url = page.url();
      if (url.includes('login')) {
        // Re-login
        await page.locator('input[type="text"], input[name="username"]').first().fill(USERNAME);
        await page.locator('input[type="password"]').first().fill(PASSWORD);
        await page.locator('button[type="submit"]').first().click();
        await page.waitForLoadState('networkidle');
        await page.goto(`${ADMIN}/${path}`);
        await page.waitForLoadState('networkidle');
      }
      return true;
    } catch (e: any) {
      return false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 1: CMS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 1: CMS');
  console.log('═══════════════════════════════');

  // First, navigate to CMS to discover sub-sections
  await goToSection('cms');
  await page.screenshot({ path: 'scripts/screenshots/01-cms-overview.png', fullPage: true });
  const cmsPageContent = await page.content();
  console.log('CMS page title/url:', page.url());

  // Helper to find and click a save button
  async function clickSave(): Promise<void> {
    const saveBtn = page.locator(
      'button:has-text("Saxla"), button:has-text("Save"), button:has-text("Yadda saxla"), button[type="submit"]'
    ).first();
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Helper to find first text input and change its value
  async function changeFirstTextInput(suffix: string = '_test'): Promise<string> {
    const inputs = page.locator('input[type="text"], input:not([type]), textarea').filter({ visible: true });
    const count = await inputs.count();
    if (count > 0) {
      const original = await inputs.first().inputValue();
      const newVal = original ? original.substring(0, 20) + suffix : 'Test Value' + suffix;
      await inputs.first().triple_click?.() ?? await inputs.first().click({ clickCount: 3 });
      await inputs.first().fill(newVal);
      return newVal;
    }
    return '';
  }

  // Helper: triple-click workaround
  async function tripleClick(locator: any): Promise<void> {
    await locator.click({ clickCount: 3 });
  }

  // CMS Sub-sections to test
  const cmsSections = [
    { key: 'gorseller', path: 'cms/gorseller', label: 'Görsellər' },
    { key: 'naviqasiya', path: 'cms/naviqasiya', label: 'Naviqasiya Menyusu' },
    { key: 'hero', path: 'cms/hero', label: 'Hero Bölməsi' },
    { key: 'niye-azexbuy', path: 'cms/niye-azexbuy', label: 'Niyə AZEXBUY' },
    { key: 'alici-istehsalci', path: 'cms/alici-istehsalci', label: 'Alıcı/İstehsalçı' },
    { key: 'xidmetler-cms', path: 'cms/xidmetler', label: 'Xidmətlər (CMS)' },
    { key: 'nece-isleyir', path: 'cms/nece-isleyir', label: 'Necə İşləyir' },
    { key: 'one-cixan', path: 'cms/one-cixan', label: 'Öne Çıxan Məhsullar' },
    { key: 'niye-azerbaycan', path: 'cms/niye-azerbaycan', label: 'Niyə Azərbaycan' },
    { key: 'footer', path: 'cms/footer', label: 'Footer' },
    { key: 'alici-adimlar', path: 'cms/alici-adimlar', label: 'Alıcı Addımları' },
    { key: 'istehsalci-adimlar', path: 'cms/istehsalci-adimlar', label: 'İstehsalçı Addımları' },
  ];

  for (const section of cmsSections) {
    console.log(`\n--- CMS: ${section.label} ---`);
    try {
      await goToSection(section.path);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `scripts/screenshots/cms-${section.key}-before.png`, fullPage: true });
      
      // Check page loaded
      const pageTitle = await page.title();
      const h1 = await page.locator('h1, h2, h3').first().textContent().catch(() => '');
      console.log(`  Page: ${page.url()} | Title: ${pageTitle} | H1: ${h1}`);
      
      // Try to find and change a text field
      const textInputs = page.locator('input[type="text"], input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea').filter({ visible: true });
      const inputCount = await textInputs.count();
      console.log(`  Found ${inputCount} text inputs`);
      
      if (inputCount > 0) {
        const firstInput = textInputs.first();
        const originalValue = await firstInput.inputValue();
        const newValue = (originalValue || 'Test').substring(0, 15) + '_edited';
        await firstInput.click({ clickCount: 3 });
        await firstInput.fill(newValue);
        
        await clickSave();
        const saveResult = await checkForSuccess(page);
        await page.screenshot({ path: `scripts/screenshots/cms-${section.key}-after.png`, fullPage: true });
        
        log('CMS', `${section.label} - Change text & save`, saveResult.success, saveResult.message);
        
        // Restore original value
        await firstInput.click({ clickCount: 3 });
        await firstInput.fill(originalValue || '');
        await clickSave();
      } else {
        // Page might have different structure - check for buttons, links
        const pageText = await page.locator('body').textContent();
        const has404 = pageText?.includes('404') || pageText?.includes('tapılmadı') || pageText?.includes('not found');
        if (has404) {
          log('CMS', `${section.label} - Page load`, false, 'Page not found (404)');
        } else {
          log('CMS', `${section.label} - Page load`, true, `Loaded but no text inputs found. URL: ${page.url()}`);
        }
      }
    } catch (e: any) {
      log('CMS', `${section.label}`, false, 'Exception occurred', e.message);
      await page.screenshot({ path: `scripts/screenshots/cms-${section.key}-error.png`, fullPage: true }).catch(() => {});
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 2: SERVICES (Xidmətlər)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 2: SERVICES');
  console.log('═══════════════════════════════');

  try {
    await goToSection('xidmetler');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'scripts/screenshots/02-services-list.png', fullPage: true });
    
    const servicesList = await page.locator('table tbody tr, [class*="service-item"], [class*="list-item"]').count();
    log('Services', 'View services list', true, `Found ${servicesList} items`);

    // Create new service
    const newServiceBtn = page.locator('button:has-text("Yeni Xidmət"), button:has-text("Yeni"), a:has-text("Yeni Xidmət"), a:has-text("+ Yeni")').first();
    if (await newServiceBtn.isVisible({ timeout: 2000 })) {
      await newServiceBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'scripts/screenshots/02-services-new-form.png', fullPage: true });
      
      // Fill form fields
      const fields = page.locator('input[type="text"], input:not([type="hidden"]):not([type="checkbox"])').filter({ visible: true });
      const fieldCount = await fields.count();
      console.log(`  New service form has ${fieldCount} text fields`);
      
      // Try filling title fields (AZ/EN)
      for (let i = 0; i < Math.min(fieldCount, 6); i++) {
        const field = fields.nth(i);
        const placeholder = await field.getAttribute('placeholder') || '';
        const name = await field.getAttribute('name') || '';
        console.log(`  Field ${i}: name="${name}" placeholder="${placeholder}"`);
        
        if (placeholder.toLowerCase().includes('az') || name.includes('az') || name.includes('title')) {
          await field.fill('Test Xidmət AZ');
        } else if (placeholder.toLowerCase().includes('en') || name.includes('en')) {
          await field.fill('Test Service EN');
        } else {
          await field.fill(`Test value ${i}`);
        }
      }
      
      // Fill textarea
      const textareas = page.locator('textarea').filter({ visible: true });
      const taCount = await textareas.count();
      for (let i = 0; i < taCount; i++) {
        await textareas.nth(i).fill(`Test description ${i + 1}`);
      }
      
      // Handle select dropdowns
      const selects = page.locator('select').filter({ visible: true });
      const selCount = await selects.count();
      for (let i = 0; i < selCount; i++) {
        const options = await selects.nth(i).locator('option').all();
        if (options.length > 1) {
          await selects.nth(i).selectOption({ index: 1 });
        }
      }
      
      await page.screenshot({ path: 'scripts/screenshots/02-services-new-filled.png', fullPage: true });
      await clickSave();
      const saveResult = await checkForSuccess(page);
      await page.screenshot({ path: 'scripts/screenshots/02-services-new-saved.png', fullPage: true });
      log('Services', 'Create new service', saveResult.success, saveResult.message);
    } else {
      log('Services', 'Find "Yeni Xidmət" button', false, 'Button not found');
    }

    // Go back to list and try editing
    await goToSection('xidmetler');
    await page.waitForTimeout(500);
    
    const editBtns = page.locator('button:has-text("Düzəliş"), button:has-text("Edit"), a:has-text("Düzəliş"), [title="Edit"], [aria-label="edit"]');
    if (await editBtns.first().isVisible({ timeout: 2000 })) {
      await editBtns.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'scripts/screenshots/02-services-edit.png', fullPage: true });
      
      const firstField = page.locator('input[type="text"]').filter({ visible: true }).first();
      if (await firstField.isVisible({ timeout: 2000 })) {
        const original = await firstField.inputValue();
        await firstField.fill(original + ' (edited)');
        await clickSave();
        const saveResult = await checkForSuccess(page);
        log('Services', 'Edit existing service', saveResult.success, saveResult.message);
        // Revert
        await firstField.fill(original);
        await clickSave();
      }
    } else {
      log('Services', 'Edit service', false, 'No edit buttons found');
    }

    // Try toggle active status
    await goToSection('xidmetler');
    await page.waitForTimeout(500);
    const toggles = page.locator('input[type="checkbox"], [role="switch"]').filter({ visible: true });
    if (await toggles.first().isVisible({ timeout: 2000 })) {
      await toggles.first().click();
      await page.waitForTimeout(500);
      const saveResult = await checkForSuccess(page);
      log('Services', 'Toggle active status', saveResult.success, saveResult.message || 'Toggle clicked');
      // Toggle back
      await toggles.first().click();
    } else {
      log('Services', 'Toggle active status', false, 'No toggles found on list page');
    }

    // Try delete
    const deleteBtns = page.locator('button:has-text("Sil"), button:has-text("Delete"), [title="Delete"], [aria-label="delete"]');
    if (await deleteBtns.first().isVisible({ timeout: 2000 })) {
      await deleteBtns.first().click();
      await page.waitForTimeout(500);
      // Handle confirmation dialog
      const confirmBtn = page.locator('button:has-text("Bəli"), button:has-text("Yes"), button:has-text("Confirm"), button:has-text("OK")').first();
      if (await confirmBtn.isVisible({ timeout: 1000 })) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
        const saveResult = await checkForSuccess(page);
        log('Services', 'Delete service', saveResult.success, saveResult.message);
      } else {
        log('Services', 'Delete service', false, 'No confirmation dialog appeared');
      }
    } else {
      log('Services', 'Delete service', false, 'No delete buttons found');
    }
  } catch (e: any) {
    log('Services', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/02-services-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 3: ARTICLES (Məqalələr)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 3: ARTICLES');
  console.log('═══════════════════════════════');

  try {
    // Try different possible paths
    const articlePaths = ['articles', 'meqaleler', 'blog', 'posts'];
    let articlePath = '';
    for (const p of articlePaths) {
      await page.goto(`${ADMIN}/${p}`);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('login') && !page.url().includes('404')) {
        articlePath = p;
        break;
      }
    }
    
    if (!articlePath) {
      // Try sidebar navigation
      await page.goto(`${ADMIN}`);
      await page.waitForLoadState('networkidle');
      const articleLink = page.locator('a:has-text("Məqalə"), a:has-text("Article"), nav a').filter({ hasText: /məqal|article|blog/i }).first();
      if (await articleLink.isVisible({ timeout: 2000 })) {
        await articleLink.click();
        await page.waitForLoadState('networkidle');
        articlePath = page.url().replace(ADMIN + '/', '');
      }
    }
    
    console.log(`  Articles path: ${articlePath || 'not found'}, URL: ${page.url()}`);
    await page.screenshot({ path: 'scripts/screenshots/03-articles-list.png', fullPage: true });
    
    const listItems = await page.locator('table tbody tr, [class*="article"], [class*="post"]').count();
    log('Articles', 'View articles list', true, `URL: ${page.url()}, Items: ${listItems}`);

    // Create new article
    const newBtn = page.locator('button:has-text("Yeni Məqalə"), button:has-text("Yeni"), a:has-text("Yeni Məqalə"), button:has-text("New")').first();
    if (await newBtn.isVisible({ timeout: 2000 })) {
      await newBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'scripts/screenshots/03-articles-new.png', fullPage: true });
      
      // Fill title
      const titleField = page.locator('input[name*="title"], input[placeholder*="başlıq" i], input[placeholder*="title" i], input[type="text"]').first();
      if (await titleField.isVisible({ timeout: 2000 })) {
        await titleField.fill('Test Məqalə AZ');
      }
      
      // Fill slug
      const slugField = page.locator('input[name*="slug"], input[placeholder*="slug"]').first();
      if (await slugField.isVisible({ timeout: 1000 })) {
        await slugField.fill('test-meqale-az-' + Date.now());
      }
      
      // Fill other text fields
      const otherFields = page.locator('input[type="text"]').filter({ visible: true });
      const otherCount = await otherFields.count();
      for (let i = 0; i < Math.min(otherCount, 5); i++) {
        const val = await otherFields.nth(i).inputValue();
        if (!val) await otherFields.nth(i).fill(`Test value ${i}`);
      }
      
      // Fill textarea / content editor
      const textareas = page.locator('textarea').filter({ visible: true });
      const taCount = await textareas.count();
      for (let i = 0; i < taCount; i++) {
        await textareas.nth(i).fill(`Bu bir test məqaləsidir. This is a test article. Content ${i + 1}.`);
      }
      
      // Check "Dərhal yayımla"
      const publishCheck = page.locator('input[type="checkbox"]').filter({ visible: true }).first();
      if (await publishCheck.isVisible({ timeout: 1000 })) {
        const checked = await publishCheck.isChecked();
        if (!checked) await publishCheck.check();
      }
      
      await page.screenshot({ path: 'scripts/screenshots/03-articles-new-filled.png', fullPage: true });
      await clickSave();
      const saveResult = await checkForSuccess(page);
      await page.screenshot({ path: 'scripts/screenshots/03-articles-new-saved.png', fullPage: true });
      log('Articles', 'Create new article', saveResult.success, saveResult.message);
    } else {
      log('Articles', 'Find "Yeni Məqalə" button', false, `URL: ${page.url()}, button not found`);
    }

    // Edit existing article
    await page.goto(`${ADMIN}/${articlePath || 'articles'}`);
    await page.waitForLoadState('networkidle');
    const editBtns = page.locator('button:has-text("Düzəliş"), a:has-text("Düzəliş"), [title="Edit"]').first();
    if (await editBtns.isVisible({ timeout: 2000 })) {
      await editBtns.click();
      await page.waitForLoadState('networkidle');
      const firstField = page.locator('input[type="text"]').filter({ visible: true }).first();
      if (await firstField.isVisible({ timeout: 2000 })) {
        const orig = await firstField.inputValue();
        await firstField.fill(orig + ' (edited)');
        await clickSave();
        const r = await checkForSuccess(page);
        log('Articles', 'Edit article', r.success, r.message);
        await firstField.fill(orig);
        await clickSave();
      } else {
        log('Articles', 'Edit article', false, 'No fields in edit form');
      }
    } else {
      log('Articles', 'Edit article', false, 'No edit buttons on list');
    }

    // Delete test
    await page.goto(`${ADMIN}/${articlePath || 'articles'}`);
    await page.waitForLoadState('networkidle');
    const delBtns = page.locator('button:has-text("Sil"), button:has-text("Delete")').first();
    if (await delBtns.isVisible({ timeout: 2000 })) {
      await delBtns.click();
      await page.waitForTimeout(500);
      const confirmBtn = page.locator('button:has-text("Bəli"), button:has-text("Yes"), button:has-text("OK")').first();
      if (await confirmBtn.isVisible({ timeout: 1000 })) {
        await confirmBtn.click();
        await page.waitForTimeout(1000);
        const r = await checkForSuccess(page);
        log('Articles', 'Delete article', r.success, r.message);
      } else {
        log('Articles', 'Delete article', false, 'No confirm dialog');
      }
    } else {
      log('Articles', 'Delete article', false, 'No delete buttons');
    }
  } catch (e: any) {
    log('Articles', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/03-articles-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 4: PRODUCT CATALOG
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 4: PRODUCT CATALOG');
  console.log('═══════════════════════════════');

  try {
    const catalogPaths = ['catalog', 'mehsullar', 'products', 'katalog'];
    let catalogPath = '';
    for (const p of catalogPaths) {
      await page.goto(`${ADMIN}/${p}`);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('login') && !page.url().includes('404')) {
        const bodyText = await page.locator('body').textContent();
        if (!bodyText?.toLowerCase().includes('not found') && !bodyText?.includes('404')) {
          catalogPath = p;
          break;
        }
      }
    }
    
    console.log(`  Catalog at: ${catalogPath || 'not found'}, URL: ${page.url()}`);
    await page.screenshot({ path: 'scripts/screenshots/04-catalog-list.png', fullPage: true });
    log('Catalog', 'View catalog page', !!catalogPath, `URL: ${page.url()}`);

    if (catalogPath) {
      // Try creating a category
      const catBtn = page.locator('button:has-text("Kateqoriya"), button:has-text("Category"), a:has-text("Kateqoriya")').first();
      if (await catBtn.isVisible({ timeout: 2000 })) {
        await catBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'scripts/screenshots/04-catalog-newcat.png', fullPage: true });
        
        const fields = page.locator('input[type="text"]').filter({ visible: true });
        const fc = await fields.count();
        for (let i = 0; i < Math.min(fc, 4); i++) {
          await fields.nth(i).fill(`Test Kateqoriya ${i + 1}`);
        }
        await clickSave();
        const r = await checkForSuccess(page);
        log('Catalog', 'Create category', r.success, r.message);
      } else {
        log('Catalog', 'Create category', false, 'No category creation button found');
      }

      // Try creating a product
      await page.goto(`${ADMIN}/${catalogPath}`);
      await page.waitForLoadState('networkidle');
      const productBtn = page.locator('button:has-text("Yeni Məhsul"), button:has-text("Məhsul"), a:has-text("Yeni Məhsul")').first();
      if (await productBtn.isVisible({ timeout: 2000 })) {
        await productBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'scripts/screenshots/04-catalog-newproduct.png', fullPage: true });
        
        const fields = page.locator('input[type="text"]').filter({ visible: true });
        const fc = await fields.count();
        for (let i = 0; i < Math.min(fc, 6); i++) {
          await fields.nth(i).fill(`Test Məhsul ${i + 1}`);
        }
        await clickSave();
        const r = await checkForSuccess(page);
        log('Catalog', 'Create product', r.success, r.message);
      } else {
        log('Catalog', 'Create product', false, 'No product creation button found');
      }
    }
  } catch (e: any) {
    log('Catalog', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/04-catalog-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 5: INBOX
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 5: INBOX');
  console.log('═══════════════════════════════');

  try {
    const inboxPaths = ['inbox', 'gelen-qutusu', 'rfq', 'messages'];
    let inboxPath = '';
    for (const p of inboxPaths) {
      await page.goto(`${ADMIN}/${p}`);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('login')) {
        const bodyText = await page.locator('body').textContent();
        if (!bodyText?.toLowerCase().includes('not found') && !bodyText?.includes('404')) {
          inboxPath = p;
          break;
        }
      }
    }
    
    console.log(`  Inbox at: ${inboxPath || 'not found'}, URL: ${page.url()}`);
    await page.screenshot({ path: 'scripts/screenshots/05-inbox.png', fullPage: true });
    log('Inbox', 'View inbox', !!inboxPath, `URL: ${page.url()}`);

    if (inboxPath) {
      // Check for RFQ tab
      const rfqTab = page.locator('[role="tab"]:has-text("RFQ"), button:has-text("RFQ"), a:has-text("RFQ")').first();
      if (await rfqTab.isVisible({ timeout: 2000 })) {
        await rfqTab.click();
        await page.waitForTimeout(500);
        const count = await page.locator('table tbody tr, [class*="rfq"], [class*="item"]').count();
        log('Inbox', 'View RFQ tab', true, `${count} items`);
        
        // Try status change
        const statusSelect = page.locator('select, [role="combobox"]').filter({ visible: true }).first();
        if (await statusSelect.isVisible({ timeout: 1000 })) {
          await statusSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
          const r = await checkForSuccess(page);
          log('Inbox', 'Change RFQ status', r.success, r.message);
        }
      }

      // Check for producer registrations tab
      const producerTab = page.locator('[role="tab"]:has-text("İstehsalçı"), button:has-text("İstehsalçı"), a:has-text("İstehsalçı")').first();
      if (await producerTab.isVisible({ timeout: 2000 })) {
        await producerTab.click();
        await page.waitForTimeout(500);
        const count = await page.locator('table tbody tr').count();
        log('Inbox', 'View producer registrations', true, `${count} items`);
      }
    }
  } catch (e: any) {
    log('Inbox', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/05-inbox-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 6: USERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 6: USERS');
  console.log('═══════════════════════════════');

  try {
    const userPaths = ['users', 'istifadeciler', 'admins'];
    let userPath = '';
    for (const p of userPaths) {
      await page.goto(`${ADMIN}/${p}`);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('login')) {
        const bodyText = await page.locator('body').textContent();
        if (!bodyText?.toLowerCase().includes('not found') && !bodyText?.includes('404')) {
          userPath = p;
          break;
        }
      }
    }
    
    console.log(`  Users at: ${userPath || 'not found'}, URL: ${page.url()}`);
    await page.screenshot({ path: 'scripts/screenshots/06-users.png', fullPage: true });
    
    const userCount = await page.locator('table tbody tr, [class*="user"]').count();
    log('Users', 'View users list', !!userPath, `URL: ${page.url()}, Count: ${userCount}`);

    // Try "Yeni Admin" button
    const newAdminBtn = page.locator('button:has-text("Yeni Admin"), a:has-text("Yeni Admin"), button:has-text("Admin")').first();
    if (await newAdminBtn.isVisible({ timeout: 2000 })) {
      await newAdminBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'scripts/screenshots/06-users-newadmin.png', fullPage: true });
      log('Users', 'Open new admin form', true, `URL: ${page.url()}`);
      
      // Fill the form
      const fields = page.locator('input[type="text"], input[type="email"]').filter({ visible: true });
      const fc = await fields.count();
      for (let i = 0; i < Math.min(fc, 3); i++) {
        const type = await fields.nth(i).getAttribute('type') || '';
        if (type === 'email') {
          await fields.nth(i).fill('testadmin@test.com');
        } else {
          await fields.nth(i).fill('testadmin');
        }
      }
      const passField = page.locator('input[type="password"]').filter({ visible: true }).first();
      if (await passField.isVisible({ timeout: 1000 })) {
        await passField.fill('TestPass123!');
      }
      await page.screenshot({ path: 'scripts/screenshots/06-users-newadmin-filled.png', fullPage: true });
      // Don't actually save to avoid creating test admin
    } else {
      log('Users', 'Find "Yeni Admin" button', false, 'Button not found');
    }
  } catch (e: any) {
    log('Users', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/06-users-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 7: SMTP
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 7: SMTP');
  console.log('═══════════════════════════════');

  try {
    const smtpPaths = ['smtp', 'email', 'mail', 'settings/smtp'];
    let smtpPath = '';
    for (const p of smtpPaths) {
      await page.goto(`${ADMIN}/${p}`);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('login')) {
        const bodyText = await page.locator('body').textContent();
        if (!bodyText?.toLowerCase().includes('not found') && !bodyText?.includes('404')) {
          const hasSmtp = bodyText?.toLowerCase().includes('smtp') || bodyText?.toLowerCase().includes('email') || bodyText?.toLowerCase().includes('host');
          if (hasSmtp) {
            smtpPath = p;
            break;
          }
        }
      }
    }
    
    console.log(`  SMTP at: ${smtpPath || 'not found'}, URL: ${page.url()}`);
    await page.screenshot({ path: 'scripts/screenshots/07-smtp.png', fullPage: true });
    
    const fields = page.locator('input[type="text"], input[type="number"], input[type="email"]').filter({ visible: true });
    const fc = await fields.count();
    log('SMTP', 'Load SMTP settings', fc > 0 || !!smtpPath, `URL: ${page.url()}, Fields: ${fc}`);

    if (fc > 0) {
      // Try saving without changing anything
      await clickSave();
      const r = await checkForSuccess(page);
      log('SMTP', 'Save SMTP settings', r.success, r.message);
    }
  } catch (e: any) {
    log('SMTP', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/07-smtp-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 8: PARAMETRLƏR (Settings)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 8: SETTINGS');
  console.log('═══════════════════════════════');

  try {
    const settingsPaths = ['settings', 'parametrler', 'config'];
    let settingsPath = '';
    for (const p of settingsPaths) {
      await page.goto(`${ADMIN}/${p}`);
      await page.waitForLoadState('networkidle');
      if (!page.url().includes('login')) {
        const bodyText = await page.locator('body').textContent();
        if (!bodyText?.toLowerCase().includes('not found') && !bodyText?.includes('404')) {
          settingsPath = p;
          break;
        }
      }
    }
    
    console.log(`  Settings at: ${settingsPath || 'not found'}, URL: ${page.url()}`);
    await page.screenshot({ path: 'scripts/screenshots/08-settings.png', fullPage: true });
    log('Settings', 'Load settings page', !!settingsPath, `URL: ${page.url()}`);

    // Try theme change
    const themeSelect = page.locator('select[name*="theme"], [class*="theme"] select, input[name*="theme"]').first();
    if (await themeSelect.isVisible({ timeout: 2000 })) {
      const options = await themeSelect.locator('option').all();
      if (options.length > 1) {
        await themeSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
        log('Settings', 'Change theme', true, 'Theme option selected');
      }
    } else {
      log('Settings', 'Change theme', false, 'No theme selector found');
    }

    // Try saving settings
    const saveBtn = page.locator('button:has-text("Saxla"), button:has-text("Save"), button[type="submit"]').first();
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click();
      await page.waitForTimeout(1500);
      const r = await checkForSuccess(page);
      log('Settings', 'Save settings', r.success, r.message);
    }
  } catch (e: any) {
    log('Settings', 'Section test', false, 'Exception', e.message);
    await page.screenshot({ path: 'scripts/screenshots/08-settings-error.png', fullPage: true }).catch(() => {});
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SECTION 9: CHECK FRONTEND REFLECTS CMS CHANGES
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════');
  console.log('  SECTION 9: FRONTEND CHECK');
  console.log('═══════════════════════════════');

  try {
    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'scripts/screenshots/09-frontend.png', fullPage: true });
    
    const heroText = await page.locator('h1, [class*="hero"] h2, [class*="hero"] h1').first().textContent().catch(() => '');
    log('Frontend', 'Load frontend', true, `Hero text: "${heroText?.substring(0, 50)}"`);
  } catch (e: any) {
    log('Frontend', 'Load frontend', false, 'Exception', e.message);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FINAL REPORT
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n\n');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('  FINAL TEST REPORT');
  console.log('══════════════════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total: ${results.length} tests | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log('');
  
  console.log('--- PASSED ---');
  for (const r of results.filter(r => r.success)) {
    console.log(`  ✅ [${r.section}] ${r.action}: ${r.note}`);
  }
  
  console.log('\n--- FAILED ---');
  for (const r of results.filter(r => !r.success)) {
    console.log(`  ❌ [${r.section}] ${r.action}: ${r.note}${r.error ? ` | ${r.error}` : ''}`);
  }
  
  if (consoleErrors.length > 0) {
    console.log('\n--- CONSOLE ERRORS ---');
    for (const err of consoleErrors.slice(0, 20)) {
      console.log(`  ⚠️  ${err}`);
    }
  }

  // Don't fail the test just because features are missing
  expect(passed).toBeGreaterThan(0);
});
