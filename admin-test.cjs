const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://beta.azexbuy.com/octo-admin';
const USERNAME = 'admin';
const PASSWORD = 'admin';
const SCREENSHOTS_DIR = '/Users/ali_new/Desktop/AZEXBUY/admin-screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const report = {
  working: [],
  errors: [],
  broken: [],
  consoleErrors: [],
  steps: []
};

let screenshotIndex = 0;

async function screenshot(page, name) {
  screenshotIndex++;
  const filename = `${String(screenshotIndex).padStart(3, '0')}-${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${filename}`);
  return filename;
}

function log(msg, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type] || 'ℹ️'} ${msg}`);
  report.steps.push({ type, msg, time: new Date().toISOString() });
  if (type === 'success') report.working.push(msg);
  if (type === 'error') report.errors.push(msg);
}

async function waitAndClick(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return true;
  } catch (e) {
    log(`Could not click: ${selector} — ${e.message}`, 'warn');
    return false;
  }
}

async function safeGoto(page, url, label) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    log(`Navigated to: ${label}`, 'success');
    return true;
  } catch (e) {
    log(`Failed to navigate to ${label}: ${e.message}`, 'error');
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  // Collect console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = `[Console Error] ${msg.text()}`;
      report.consoleErrors.push(text);
      console.log(`🔴 ${text}`);
    }
  });

  page.on('pageerror', err => {
    const text = `[Page Error] ${err.message}`;
    report.consoleErrors.push(text);
    console.log(`🔴 ${text}`);
  });

  // ─── STEP 1: LOGIN ───────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('STEP 1: LOGIN');
  console.log('═══════════════════════════════════════');

  await safeGoto(page, BASE_URL, 'Admin Panel');
  await screenshot(page, 'login-page');

  const pageTitle = await page.title();
  const pageUrl = page.url();
  log(`Page URL: ${pageUrl}`, 'info');
  log(`Page Title: ${pageTitle}`, 'info');

  // Try to find login form
  try {
    // Try common selectors
    const usernameSelectors = [
      'input[name="username"]',
      'input[name="email"]',
      'input[type="email"]',
      'input[placeholder*="user"]',
      'input[placeholder*="User"]',
      'input[placeholder*="admin"]',
      '#username',
      '#email',
    ];

    let usernameField = null;
    for (const sel of usernameSelectors) {
      const el = await page.$(sel);
      if (el) { usernameField = sel; break; }
    }

    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password',
    ];

    let passwordField = null;
    for (const sel of passwordSelectors) {
      const el = await page.$(sel);
      if (el) { passwordField = sel; break; }
    }

    if (usernameField && passwordField) {
      await page.fill(usernameField, USERNAME);
      await page.fill(passwordField, PASSWORD);
      await screenshot(page, 'login-filled');

      // Click submit
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Giriş")',
        'button:has-text("Sign In")',
        '.login-btn',
        '#login-btn',
      ];

      let clicked = false;
      for (const sel of submitSelectors) {
        try {
          const el = await page.$(sel);
          if (el) {
            await el.click();
            clicked = true;
            break;
          }
        } catch (e) {}
      }

      if (!clicked) {
        await page.keyboard.press('Enter');
      }

      await page.waitForTimeout(3000);
      await screenshot(page, 'after-login');
      
      const afterUrl = page.url();
      if (afterUrl !== pageUrl || afterUrl.includes('dashboard') || afterUrl.includes('admin')) {
        log('Login successful', 'success');
      } else {
        log(`Login may have failed. URL after: ${afterUrl}`, 'warn');
      }
    } else {
      // Maybe already logged in or different login mechanism
      log(`No standard login form found. Username: ${usernameField}, Password: ${passwordField}`, 'warn');
      
      // Check page content
      const content = await page.content();
      log(`Page has ${content.length} chars of content`, 'info');
      
      // Try to find any form
      const forms = await page.$$('form');
      log(`Found ${forms.length} forms on page`, 'info');
      
      const inputs = await page.$$('input');
      log(`Found ${inputs.length} inputs on page`, 'info');
    }
  } catch (e) {
    log(`Login error: ${e.message}`, 'error');
    await screenshot(page, 'login-error');
  }

  // Check if we're on dashboard
  await screenshot(page, 'dashboard');
  const dashboardUrl = page.url();
  log(`Current URL after login attempt: ${dashboardUrl}`, 'info');

  // Get page structure
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  log(`Page content preview: ${bodyText}`, 'info');

  // ─── STEP 2: SIDEBAR SECTIONS ───────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('STEP 2: TESTING SIDEBAR SECTIONS');
  console.log('═══════════════════════════════════════');

  const sidebarItems = [
    { name: 'İcmal', keywords: ['icmal', 'İcmal', 'dashboard', 'Dashboard', 'Overview'] },
    { name: 'CMS', keywords: ['cms', 'CMS'] },
    { name: 'Məhsul Kataloqu', keywords: ['məhsul', 'Məhsul', 'product', 'Product', 'kataloq', 'catalog'] },
    { name: 'Məqalələr', keywords: ['məqalə', 'Məqalə', 'article', 'Article', 'blog', 'Blog'] },
    { name: 'Xidmətlər', keywords: ['xidmət', 'Xidmət', 'service', 'Service'] },
    { name: 'Gələn Qutusu', keywords: ['gələn', 'Gələn', 'inbox', 'Inbox', 'qutusu'] },
    { name: 'İstifadəçilər', keywords: ['istifadəçi', 'İstifadəçi', 'user', 'User'] },
    { name: 'SMTP', keywords: ['smtp', 'SMTP', 'mail', 'Mail', 'email'] },
    { name: 'Parametrlər', keywords: ['parametr', 'Parametr', 'setting', 'Setting', 'ayar'] },
  ];

  for (const item of sidebarItems) {
    console.log(`\n--- Testing: ${item.name} ---`);
    try {
      // Try multiple approaches to find sidebar item
      let found = false;
      
      // Try by text content
      for (const keyword of item.keywords) {
        try {
          const el = await page.$(`text="${keyword}"`);
          if (el) {
            await el.click();
            await page.waitForTimeout(2000);
            found = true;
            log(`Clicked sidebar item: ${item.name} (matched: ${keyword})`, 'success');
            break;
          }
        } catch (e) {}

        // Try partial text match via evaluate
        try {
          const clicked = await page.evaluate((kw) => {
            const links = document.querySelectorAll('a, li, button, [role="menuitem"], nav *');
            for (const el of links) {
              if (el.textContent.trim().toLowerCase().includes(kw.toLowerCase())) {
                el.click();
                return true;
              }
            }
            return false;
          }, keyword);
          
          if (clicked) {
            await page.waitForTimeout(2000);
            found = true;
            log(`Clicked sidebar item via JS: ${item.name} (matched: ${keyword})`, 'success');
            break;
          }
        } catch (e) {}
      }

      if (!found) {
        log(`Could not find sidebar item: ${item.name}`, 'error');
        report.broken.push(`Sidebar item not found: ${item.name}`);
      }

      await screenshot(page, `sidebar-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}`);
      
      // Check for error messages on page
      const errors = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('.error, .alert-danger, [class*="error"], [class*="Error"]');
        return Array.from(errorElements).map(el => el.textContent.trim()).filter(t => t.length > 0);
      });
      
      if (errors.length > 0) {
        log(`Page errors on ${item.name}: ${errors.join(', ')}`, 'warn');
      }

    } catch (e) {
      log(`Error testing sidebar ${item.name}: ${e.message}`, 'error');
      await screenshot(page, `sidebar-${item.name.replace(/[^a-zA-Z0-9]/g, '-')}-error`);
    }
  }

  // ─── STEP 3: XIDMƏTLƏR - CREATE SERVICE ────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('STEP 3: XIDMƏTLƏR - CREATE SERVICE');
  console.log('═══════════════════════════════════════');

  try {
    // Navigate to Xidmətlər
    for (const keyword of ['Xidmətlər', 'xidmət', 'service', 'Service']) {
      try {
        const clicked = await page.evaluate((kw) => {
          const links = document.querySelectorAll('a, li, button, [role="menuitem"], nav *, aside *');
          for (const el of links) {
            if (el.textContent.trim().toLowerCase().includes(kw.toLowerCase())) {
              el.click();
              return true;
            }
          }
          return false;
        }, keyword);
        if (clicked) { await page.waitForTimeout(2000); break; }
      } catch (e) {}
    }

    await screenshot(page, 'services-page');

    // Try to find "New" or "Add" button
    const addButtonSelectors = [
      'button:has-text("Yeni")',
      'button:has-text("Əlavə")',
      'button:has-text("Add")',
      'button:has-text("New")',
      'button:has-text("Create")',
      'a:has-text("Yeni")',
      'a:has-text("Add")',
      '[class*="add"]',
      '[class*="new"]',
      '[class*="create"]',
    ];

    let addClicked = false;
    for (const sel of addButtonSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.click();
          await page.waitForTimeout(2000);
          addClicked = true;
          log(`Clicked add button for services`, 'success');
          break;
        }
      } catch (e) {}
    }

    if (!addClicked) {
      // Try via JS
      const clicked = await page.evaluate(() => {
        const btns = document.querySelectorAll('button, a');
        for (const btn of btns) {
          const text = btn.textContent.trim().toLowerCase();
          if (text.includes('yeni') || text.includes('add') || text.includes('new') || text.includes('create') || text.includes('əlavə')) {
            btn.click();
            return true;
          }
        }
        return false;
      });
      if (clicked) {
        await page.waitForTimeout(2000);
        addClicked = true;
        log('Clicked add/new button via JS for services', 'success');
      }
    }

    await screenshot(page, 'services-new-form');

    // Fill in service form
    // Title AZ
    const titleSelectors = [
      'input[name*="title"]',
      'input[name*="az"]',
      'input[placeholder*="title"]',
      'input[placeholder*="Başlıq"]',
      'input[placeholder*="başlıq"]',
      '.title input',
      '#title',
      '#title_az',
      'input[name="title_az"]',
    ];

    for (const sel of titleSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.click();
          await el.fill('Test Xidmət AZ');
          log(`Filled AZ title with selector: ${sel}`, 'success');
          break;
        }
      } catch (e) {}
    }

    // Try all visible text inputs
    const inputs = await page.$$('input[type="text"], input:not([type])');
    if (inputs.length > 0) {
      log(`Found ${inputs.length} text inputs on service form`, 'info');
      try {
        await inputs[0].fill('Test Xidmət AZ');
        if (inputs.length > 1) await inputs[1].fill('Test Service EN');
      } catch (e) {}
    }

    // Description / textarea
    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      log(`Found ${textareas.length} textareas`, 'info');
      try {
        await textareas[0].fill('Bu test xidməti üçün açıqlama');
      } catch (e) {}
    }

    // Check for "Ana Xidmət" checkbox
    const checkboxes = await page.$$('input[type="checkbox"]');
    if (checkboxes.length > 0) {
      log(`Found ${checkboxes.length} checkboxes`, 'info');
      try {
        await checkboxes[0].check();
        log('Checked ana xidmət checkbox', 'success');
      } catch (e) {}
    }

    await screenshot(page, 'services-form-filled');

    // Submit
    const saveSelectors = [
      'button[type="submit"]',
      'button:has-text("Saxla")',
      'button:has-text("Save")',
      'button:has-text("Submit")',
      'button:has-text("Yadda saxla")',
    ];

    let saved = false;
    for (const sel of saveSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.click();
          await page.waitForTimeout(3000);
          saved = true;
          log(`Submitted service form with: ${sel}`, 'success');
          break;
        }
      } catch (e) {}
    }

    if (!saved) {
      const clicked = await page.evaluate(() => {
        const btns = document.querySelectorAll('button, input[type="submit"]');
        for (const btn of btns) {
          const text = btn.textContent.trim().toLowerCase();
          if (text.includes('saxla') || text.includes('save') || text.includes('submit') || text.includes('yarat') || text.includes('create')) {
            btn.click();
            return true;
          }
        }
        return false;
      });
      if (clicked) {
        await page.waitForTimeout(3000);
        log('Submitted service form via JS', 'success');
      }
    }

    await screenshot(page, 'services-after-save');

    // Check for success/error messages
    const messages = await page.evaluate(() => {
      const selectors = ['.toast', '.alert', '.notification', '.success', '.error', '[class*="toast"]', '[class*="alert"]', '[class*="notification"]', '[class*="success"]', '[class*="error"]'];
      const msgs = [];
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
          const text = el.textContent.trim();
          if (text) msgs.push(text);
        });
      }
      return msgs;
    });

    if (messages.length > 0) {
      log(`Service save messages: ${messages.join(' | ')}`, 'info');
    }

  } catch (e) {
    log(`Error in Xidmətlər section: ${e.message}`, 'error');
    await screenshot(page, 'services-error');
  }

  // ─── STEP 4: MƏQALƏLƏR - CREATE ARTICLE ─────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('STEP 4: MƏQALƏLƏR - CREATE ARTICLE');
  console.log('═══════════════════════════════════════');

  try {
    // Navigate to Məqalələr
    for (const keyword of ['Məqalələr', 'məqalə', 'article', 'Article', 'blog']) {
      try {
        const clicked = await page.evaluate((kw) => {
          const links = document.querySelectorAll('a, li, button, [role="menuitem"], nav *, aside *');
          for (const el of links) {
            if (el.textContent.trim().toLowerCase().includes(kw.toLowerCase())) {
              el.click();
              return true;
            }
          }
          return false;
        }, keyword);
        if (clicked) { await page.waitForTimeout(2000); break; }
      } catch (e) {}
    }

    await screenshot(page, 'articles-page');

    // Click add new
    const clicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, a');
      for (const btn of btns) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('yeni') || text.includes('add') || text.includes('new') || text.includes('create') || text.includes('əlavə')) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });

    if (clicked) {
      await page.waitForTimeout(2000);
      log(`Clicked: ${clicked} for new article`, 'success');
    }

    await screenshot(page, 'articles-new-form');

    // Fill form
    const inputs = await page.$$('input[type="text"], input:not([type])');
    if (inputs.length > 0) {
      try {
        await inputs[0].fill('Test Məqalə Başlığı AZ');
        if (inputs.length > 1) await inputs[1].fill('Test Article Title EN');
        log('Filled article title fields', 'success');
      } catch (e) {
        log(`Error filling article title: ${e.message}`, 'warn');
      }
    }

    const textareas = await page.$$('textarea');
    if (textareas.length > 0) {
      try {
        await textareas[0].fill('Bu test məqaləsinin məzmunudur. Test article content.');
        log('Filled article content', 'success');
      } catch (e) {
        log(`Error filling article content: ${e.message}`, 'warn');
      }
    }

    // Try to select category
    const selects = await page.$$('select');
    if (selects.length > 0) {
      try {
        const options = await selects[0].$$('option');
        if (options.length > 1) {
          await selects[0].selectOption({ index: 1 });
          log('Selected article category', 'success');
        }
      } catch (e) {}
    }

    await screenshot(page, 'articles-form-filled');

    // Submit
    const submitClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, input[type="submit"]');
      for (const btn of btns) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('saxla') || text.includes('save') || text.includes('submit') || text.includes('publish') || text.includes('nəşr')) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });

    if (submitClicked) {
      await page.waitForTimeout(3000);
      log(`Article saved with button: ${submitClicked}`, 'success');
    }

    await screenshot(page, 'articles-after-save');

  } catch (e) {
    log(`Error in Məqalələr section: ${e.message}`, 'error');
    await screenshot(page, 'articles-error');
  }

  // ─── STEP 5: CMS ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('STEP 5: CMS');
  console.log('═══════════════════════════════════════');

  try {
    for (const keyword of ['CMS', 'cms']) {
      try {
        const clicked = await page.evaluate((kw) => {
          const links = document.querySelectorAll('a, li, button, [role="menuitem"], nav *, aside *');
          for (const el of links) {
            if (el.textContent.trim().includes(kw)) {
              el.click();
              return true;
            }
          }
          return false;
        }, keyword);
        if (clicked) { await page.waitForTimeout(2000); break; }
      } catch (e) {}
    }

    await screenshot(page, 'cms-page');

    // Try to edit a text field
    const inputs = await page.$$('input[type="text"], textarea');
    if (inputs.length > 0) {
      try {
        const firstInput = inputs[0];
        const originalValue = await firstInput.inputValue();
        log(`CMS first field original value: "${originalValue}"`, 'info');
        
        await firstInput.click({ clickCount: 3 });
        await firstInput.fill(originalValue + ' (test edit)');
        log('Modified CMS text field', 'success');

        await screenshot(page, 'cms-edited');

        // Save
        const saveClicked = await page.evaluate(() => {
          const btns = document.querySelectorAll('button, input[type="submit"]');
          for (const btn of btns) {
            const text = btn.textContent.trim().toLowerCase();
            if (text.includes('saxla') || text.includes('save') || text.includes('submit') || text.includes('yenilə') || text.includes('update')) {
              btn.click();
              return btn.textContent.trim();
            }
          }
          return null;
        });

        if (saveClicked) {
          await page.waitForTimeout(3000);
          log(`CMS saved with: ${saveClicked}`, 'success');
        }

        await screenshot(page, 'cms-after-save');
      } catch (e) {
        log(`Error editing CMS: ${e.message}`, 'warn');
      }
    } else {
      log('No editable fields found in CMS', 'warn');
    }

  } catch (e) {
    log(`Error in CMS section: ${e.message}`, 'error');
    await screenshot(page, 'cms-error');
  }

  // ─── STEP 6: MƏHSUL KATALOQU ─────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('STEP 6: MƏHSUL KATALOQU');
  console.log('═══════════════════════════════════════');

  try {
    for (const keyword of ['Məhsul', 'məhsul', 'product', 'Product', 'kataloq']) {
      try {
        const clicked = await page.evaluate((kw) => {
          const links = document.querySelectorAll('a, li, button, [role="menuitem"], nav *, aside *');
          for (const el of links) {
            if (el.textContent.trim().toLowerCase().includes(kw.toLowerCase())) {
              el.click();
              return true;
            }
          }
          return false;
        }, keyword);
        if (clicked) { await page.waitForTimeout(2000); break; }
      } catch (e) {}
    }

    await screenshot(page, 'products-page');

    // Try category creation
    for (const keyword of ['Kateqoriya', 'kateqoriya', 'Category', 'category']) {
      try {
        const clicked = await page.evaluate((kw) => {
          const links = document.querySelectorAll('a, li, button, tab, [role="tab"]');
          for (const el of links) {
            if (el.textContent.trim().toLowerCase().includes(kw.toLowerCase())) {
              el.click();
              return true;
            }
          }
          return false;
        }, keyword);
        if (clicked) { await page.waitForTimeout(2000); break; }
      } catch (e) {}
    }

    await screenshot(page, 'products-category-tab');

    // Click new/add
    const addClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, a');
      for (const btn of btns) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('yeni') || text.includes('add') || text.includes('new') || text.includes('əlavə')) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });

    if (addClicked) {
      await page.waitForTimeout(2000);
      log(`Clicked: ${addClicked} for new category`, 'success');
    }

    await screenshot(page, 'products-new-category-form');

    const inputs = await page.$$('input[type="text"], input:not([type])');
    if (inputs.length > 0) {
      await inputs[0].fill('Test Kateqoriya');
      log('Filled category name', 'success');
    }

    // Save category
    const saveClicked = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, input[type="submit"]');
      for (const btn of btns) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('saxla') || text.includes('save') || text.includes('submit') || text.includes('create')) {
          btn.click();
          return btn.textContent.trim();
        }
      }
      return null;
    });

    if (saveClicked) {
      await page.waitForTimeout(3000);
      log(`Category saved with: ${saveClicked}`, 'success');
    }

    await screenshot(page, 'products-category-saved');

  } catch (e) {
    log(`Error in Məhsul Kataloqu section: ${e.message}`, 'error');
    await screenshot(page, 'products-error');
  }

  // ─── STEP 7: REMAINING SECTIONS ──────────────────────────────────────────────
  const remainingSections = [
    { name: 'Gələn Qutusu', keywords: ['Gələn', 'gələn', 'inbox', 'Inbox'] },
    { name: 'İstifadəçilər', keywords: ['İstifadəçi', 'istifadəçi', 'user', 'User'] },
    { name: 'SMTP', keywords: ['SMTP', 'smtp', 'mail'] },
    { name: 'Parametrlər', keywords: ['Parametr', 'parametr', 'setting', 'Setting'] },
  ];

  for (const section of remainingSections) {
    console.log(`\n═══════════════════════════════════════`);
    console.log(`TESTING: ${section.name}`);
    console.log('═══════════════════════════════════════');
    
    try {
      for (const keyword of section.keywords) {
        try {
          const clicked = await page.evaluate((kw) => {
            const links = document.querySelectorAll('a, li, button, [role="menuitem"], nav *, aside *');
            for (const el of links) {
              if (el.textContent.trim().toLowerCase().includes(kw.toLowerCase())) {
                el.click();
                return true;
              }
            }
            return false;
          }, keyword);
          if (clicked) { await page.waitForTimeout(2000); break; }
        } catch (e) {}
      }

      await screenshot(page, `section-${section.name.replace(/[^a-zA-Z0-9]/g, '-')}`);
      
      const currentUrl = page.url();
      log(`${section.name} URL: ${currentUrl}`, 'info');
      
      // Check page content
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body ? body.innerText.length > 100 : false;
      });
      
      if (hasContent) {
        log(`${section.name} has content`, 'success');
      } else {
        log(`${section.name} appears empty or failed to load`, 'warn');
      }

      // Check for error indicators
      const errors = await page.evaluate(() => {
        const selectors = ['.error', '.alert-danger', '[class*="error"]', '.not-found', '.404'];
        const msgs = [];
        for (const sel of selectors) {
          document.querySelectorAll(sel).forEach(el => {
            const text = el.textContent.trim();
            if (text && text.length < 200) msgs.push(`${sel}: ${text}`);
          });
        }
        return msgs;
      });

      if (errors.length > 0) {
        log(`${section.name} errors: ${errors.join(' | ')}`, 'error');
      }

    } catch (e) {
      log(`Error testing ${section.name}: ${e.message}`, 'error');
    }
  }

  // ─── FINAL SCREENSHOT ─────────────────────────────────────────────────────────
  await screenshot(page, 'final-state');

  await browser.close();

  // ─── GENERATE REPORT ──────────────────────────────────────────────────────────
  console.log('\n\n' + '═'.repeat(60));
  console.log('FINAL REPORT');
  console.log('═'.repeat(60));

  console.log('\n✅ WORKING FEATURES:');
  report.working.forEach(w => console.log(`  • ${w}`));

  console.log('\n❌ ERRORS:');
  report.errors.forEach(e => console.log(`  • ${e}`));

  console.log('\n🔴 CONSOLE ERRORS:');
  if (report.consoleErrors.length === 0) {
    console.log('  None recorded');
  } else {
    report.consoleErrors.slice(0, 20).forEach(e => console.log(`  • ${e}`));
  }

  console.log('\n🚫 BROKEN FEATURES:');
  report.broken.forEach(b => console.log(`  • ${b}`));

  console.log(`\n📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log(`Total screenshots: ${screenshotIndex}`);

  // Save JSON report
  fs.writeFileSync(
    path.join(SCREENSHOTS_DIR, 'report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log(`\n📄 Detailed report saved to: ${SCREENSHOTS_DIR}/report.json`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
