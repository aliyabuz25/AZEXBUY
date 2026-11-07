const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://beta.azexbuy.com/octo-admin';
const USERNAME = 'admin';
const PASSWORD = 'admin';
const SCREENSHOTS_DIR = '/Users/ali_new/Desktop/AZEXBUY/admin-screenshots2';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

let screenshotIndex = 0;
const report = { working: [], errors: [], broken: [], consoleErrors: [], details: {} };

async function ss(page, name) {
  screenshotIndex++;
  const filename = `${String(screenshotIndex).padStart(3, '0')}-${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: true });
  console.log(`  📸 ${filename}`);
  return filename;
}

function ok(msg) { console.log(`  ✅ ${msg}`); report.working.push(msg); }
function err(msg) { console.log(`  ❌ ${msg}`); report.errors.push(msg); }
function info(msg) { console.log(`  ℹ️  ${msg}`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }

// Dump the full page structure to understand what we're dealing with
async function dumpPageInfo(page, label) {
  const data = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent.trim().substring(0, 50),
      href: a.getAttribute('href')
    })).filter(l => l.text);

    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim().substring(0, 50)).filter(Boolean);

    const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(i => ({
      type: i.tagName + '[' + (i.type || i.name || 'no-type') + ']',
      name: i.name,
      placeholder: i.placeholder,
      id: i.id
    }));

    const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.textContent.trim().substring(0, 80));

    const toasts = Array.from(document.querySelectorAll('[class*="toast"],[class*="alert"],[class*="notification"],[class*="snack"],[role="alert"]'))
      .map(el => el.textContent.trim().substring(0, 100)).filter(Boolean);

    return { links, buttons, inputs, headings, toasts, url: window.location.href };
  });
  
  info(`[${label}] URL: ${data.url}`);
  info(`[${label}] Headings: ${data.headings.join(' | ')}`);
  info(`[${label}] Buttons: ${data.buttons.slice(0, 10).join(' | ')}`);
  info(`[${label}] Links (first 10): ${data.links.slice(0, 10).map(l => `"${l.text}" -> ${l.href}`).join(' | ')}`);
  if (data.toasts.length) warn(`[${label}] Toast/Alert messages: ${data.toasts.join(' | ')}`);
  return data;
}

async function clickSidebarItem(page, keywords) {
  for (const kw of keywords) {
    try {
      // Try exact link text
      const el = await page.$(`a:has-text("${kw}")`);
      if (el) {
        const href = await el.getAttribute('href');
        info(`Clicking sidebar link "${kw}" -> ${href}`);
        await el.click();
        await page.waitForTimeout(2500);
        return true;
      }
    } catch(e) {}
  }
  // Fallback: JS click on nav/sidebar elements
  for (const kw of keywords) {
    const clicked = await page.evaluate((k) => {
      const candidates = document.querySelectorAll('nav a, aside a, [class*="sidebar"] a, [class*="menu"] a, [class*="nav"] a');
      for (const el of candidates) {
        if (el.textContent.trim().includes(k)) {
          el.click();
          return { text: el.textContent.trim(), href: el.href };
        }
      }
      return null;
    }, kw);
    if (clicked) {
      info(`JS clicked: "${clicked.text}" -> ${clicked.href}`);
      await page.waitForTimeout(2500);
      return true;
    }
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(`${msg.text()}`);
      console.log(`  🔴 Console error: ${msg.text().substring(0, 150)}`);
    }
  });
  page.on('pageerror', e => {
    report.consoleErrors.push(e.message);
    console.log(`  🔴 Page error: ${e.message.substring(0, 150)}`);
  });

  // ════════════════════════════════════════════════
  // 1. LOGIN
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('1. LOGIN');
  console.log('══════════════════════════════════════════════');

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await ss(page, 'initial-load');
  await dumpPageInfo(page, 'initial');

  // Check if already on dashboard or need to login
  const needsLogin = await page.$('input[type="password"]');
  if (needsLogin) {
    info('Login form detected');
    
    // Fill username - try multiple field types
    const userField = await page.$('input[name="username"], input[name="email"], input[type="email"], input[type="text"]');
    if (userField) {
      await userField.fill(USERNAME);
      ok('Filled username field');
    } else {
      err('Username field not found');
    }

    const passField = await page.$('input[type="password"]');
    if (passField) {
      await passField.fill(PASSWORD);
      ok('Filled password field');
    }

    await ss(page, 'login-filled');

    const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Giriş"), button:has-text("Login")');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await ss(page, 'after-login');
  } else {
    info('No login form found — may already be authenticated or SSO');
    await ss(page, 'no-login-form');
  }

  const finalUrl = page.url();
  info(`Post-login URL: ${finalUrl}`);
  if (!finalUrl.includes('login') && !finalUrl.includes('signin')) {
    ok(`Login successful — on: ${finalUrl}`);
  } else {
    err(`Still on login page: ${finalUrl}`);
  }

  // ════════════════════════════════════════════════
  // 2. DASHBOARD / İCMAL
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('2. DASHBOARD (İcmal)');
  console.log('══════════════════════════════════════════════');

  const dashData = await dumpPageInfo(page, 'dashboard');
  report.details.dashboard = dashData;

  // Find all sidebar nav links
  const sidebarLinks = await page.evaluate(() => {
    const links = document.querySelectorAll('nav a, aside a, [class*="sidebar"] a, [class*="Sidebar"] a, [class*="menu"] a, [class*="Menu"] a');
    return Array.from(links).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href'),
      classes: a.className
    })).filter(l => l.text && l.href);
  });
  info(`Found ${sidebarLinks.length} sidebar links:`);
  sidebarLinks.forEach(l => info(`  "${l.text}" -> ${l.href}`));

  await ss(page, 'dashboard');
  ok('Dashboard loaded');

  // ════════════════════════════════════════════════
  // 3. CMS
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('3. CMS');
  console.log('══════════════════════════════════════════════');

  const cmsFound = await clickSidebarItem(page, ['CMS', 'cms', 'Məzmun', 'məzmun']);
  await ss(page, 'cms-page');
  const cmsData = await dumpPageInfo(page, 'CMS');
  report.details.cms = cmsData;

  if (!cmsFound) err('Could not navigate to CMS');
  else ok(`CMS section loaded: ${cmsData.url}`);

  // Look for editable content in CMS
  if (cmsData.inputs.length > 0) {
    info(`CMS has ${cmsData.inputs.length} form fields`);
    try {
      const firstInput = await page.$('input[type="text"]:not([readonly]), textarea:not([readonly])');
      if (firstInput) {
        const val = await firstInput.inputValue();
        info(`CMS first field value: "${val.substring(0, 60)}"`);
        await firstInput.click({ clickCount: 3 });
        await firstInput.type(' [TEST EDIT]');
        await ss(page, 'cms-edited-field');

        // Find save button
        const saveBtn = await page.$('button:has-text("Saxla"), button:has-text("Save"), button:has-text("Yenilə"), button[type="submit"]');
        if (saveBtn) {
          const btnText = await saveBtn.textContent();
          info(`Clicking save button: "${btnText}"`);
          await saveBtn.click();
          await page.waitForTimeout(2000);
          await ss(page, 'cms-saved');
          const afterData = await dumpPageInfo(page, 'CMS after save');
          if (afterData.toasts.length) {
            ok(`CMS save response: ${afterData.toasts.join(' | ')}`);
          } else {
            warn('No toast/confirmation after CMS save');
          }
        } else {
          warn('No save button found in CMS');
        }
      }
    } catch(e) {
      err(`CMS edit error: ${e.message}`);
    }
  } else {
    // CMS may use a different structure — look at what's on the page
    const cmsContent = await page.evaluate(() => {
      return {
        tables: document.querySelectorAll('table').length,
        cards: document.querySelectorAll('[class*="card"]').length,
        tabs: Array.from(document.querySelectorAll('[role="tab"], [class*="tab"]')).map(t => t.textContent.trim()),
        editBtns: Array.from(document.querySelectorAll('button, a')).filter(el => 
          el.textContent.match(/edit|düzəlt|dəyiş|redakt/i)
        ).map(el => el.textContent.trim()),
      };
    });
    info(`CMS structure — tables: ${cmsContent.tables}, cards: ${cmsContent.cards}`);
    info(`CMS tabs: ${cmsContent.tabs.join(' | ')}`);
    info(`CMS edit buttons: ${cmsContent.editBtns.join(' | ')}`);

    if (cmsContent.editBtns.length > 0) {
      try {
        const editBtn = await page.$('button, a');
        const allBtns = await page.$$('button, a');
        for (const btn of allBtns) {
          const txt = await btn.textContent();
          if (txt && txt.match(/edit|düzəlt|dəyiş|redakt/i)) {
            await btn.click();
            await page.waitForTimeout(2000);
            await ss(page, 'cms-edit-clicked');
            break;
          }
        }
      } catch(e) {}
    }
    warn('CMS: no direct input fields found on main view');
  }

  // ════════════════════════════════════════════════
  // 4. MƏHSUL KATALOQU
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('4. MƏHSUL KATALOQU (Product Catalog)');
  console.log('══════════════════════════════════════════════');

  const prodFound = await clickSidebarItem(page, ['Məhsul Kataloqu', 'Məhsul', 'məhsul', 'Product', 'product', 'Kataloq']);
  await ss(page, 'products-main');
  const prodData = await dumpPageInfo(page, 'Products');
  report.details.products = prodData;

  if (!prodFound) err('Could not navigate to Məhsul Kataloqu');
  else ok(`Məhsul Kataloqu loaded: ${prodData.url}`);

  // Look for tabs (Categories / Products)
  const prodTabs = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], [class*="tab"], [class*="Tab"], nav a, .tabs a'));
    return tabs.map(t => ({ text: t.textContent.trim(), href: t.getAttribute('href') || '' })).filter(t => t.text);
  });
  info(`Product tabs/nav: ${prodTabs.map(t => `"${t.text}"`).join(', ')}`);

  // Try to find and click "New Category" or "Yeni Kateqoriya"
  const newCatBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    for (const btn of btns) {
      const txt = btn.textContent.trim();
      if (txt.match(/kateqoriya|category|new.*cat|yeni.*kat/i)) {
        return { text: txt, found: true };
      }
    }
    // Also try generic new/add buttons
    for (const btn of btns) {
      const txt = btn.textContent.trim();
      if (txt.match(/^(yeni|new|add|əlavə|create)$/i)) {
        btn.click();
        return { text: txt, found: true, clicked: true };
      }
    }
    return { found: false };
  });
  info(`New category button: ${JSON.stringify(newCatBtn)}`);

  if (newCatBtn.found && !newCatBtn.clicked) {
    // Find and click it
    const btn = await page.$(`button:has-text("${newCatBtn.text}"), a:has-text("${newCatBtn.text}")`);
    if (btn) {
      await btn.click();
      await page.waitForTimeout(2000);
    }
  }

  await ss(page, 'products-category-attempt');

  // Try to find add new product/category button more aggressively
  const allProdBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(el => ({
      text: el.textContent.trim().substring(0, 60),
      href: el.getAttribute('href') || '',
      type: el.tagName
    })).filter(el => el.text);
  });
  info(`All buttons/links on products page: ${allProdBtns.slice(0, 20).map(b => `"${b.text}"`).join(', ')}`);

  // Try clicking new product button
  for (const btnInfo of allProdBtns) {
    if (btnInfo.text.match(/yeni|new|add|əlavə/i) && !btnInfo.text.match(/yenilə|refresh/i)) {
      info(`Trying to click: "${btnInfo.text}"`);
      try {
        if (btnInfo.href) {
          await page.goto(`https://beta.azexbuy.com${btnInfo.href}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        } else {
          const el = await page.$(`button:has-text("${btnInfo.text}"), a:has-text("${btnInfo.text}")`);
          if (el) await el.click();
        }
        await page.waitForTimeout(2000);
        break;
      } catch(e) {}
    }
  }

  await ss(page, 'products-new-form-attempt');
  const prodFormData = await dumpPageInfo(page, 'Products form');

  if (prodFormData.inputs.length > 0) {
    info(`Found ${prodFormData.inputs.length} inputs in product form`);
    try {
      const inputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
      if (inputs[0]) await inputs[0].fill('Test Kateqoriya');
      if (inputs[1]) await inputs[1].fill('Test Category EN');
      ok('Filled product category fields');
      await ss(page, 'products-category-filled');

      const saveBtn = await page.$('button:has-text("Saxla"), button:has-text("Save"), button:has-text("Yadda saxla"), button[type="submit"]');
      if (saveBtn) {
        const txt = await saveBtn.textContent();
        await saveBtn.click();
        await page.waitForTimeout(3000);
        await ss(page, 'products-category-saved');
        const result = await dumpPageInfo(page, 'After product save');
        if (result.toasts.length) ok(`Product save: ${result.toasts.join(' | ')}`);
        else warn('No confirmation after product save');
      }
    } catch(e) {
      err(`Product form error: ${e.message}`);
    }
  } else {
    warn('No form inputs found for product/category creation');
  }

  // ════════════════════════════════════════════════
  // 5. MƏQALƏLƏR
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('5. MƏQALƏLƏR (Articles)');
  console.log('══════════════════════════════════════════════');

  const artFound = await clickSidebarItem(page, ['Məqalələr', 'məqalə', 'Makaleler', 'Article', 'Blog']);
  await ss(page, 'articles-main');
  const artData = await dumpPageInfo(page, 'Articles');
  report.details.articles = artData;

  if (!artFound) err('Could not navigate to Məqalələr');
  else ok(`Məqalələr loaded: ${artData.url}`);

  // Look for new article button
  const artBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(el => ({
      text: el.textContent.trim().substring(0, 60),
      href: el.getAttribute('href') || ''
    })).filter(el => el.text);
  });
  info(`Article page buttons: ${artBtns.slice(0, 15).map(b => `"${b.text}"`).join(', ')}`);

  // Find "new article" button — avoid "Yenilə" (refresh)
  let artNewClicked = false;
  for (const btnInfo of artBtns) {
    if (btnInfo.text.match(/yeni məqalə|new article|article.*new|yazı yaz|create/i)) {
      info(`Found new article button: "${btnInfo.text}"`);
      if (btnInfo.href && btnInfo.href !== '#') {
        await page.goto(`https://beta.azexbuy.com${btnInfo.href}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        artNewClicked = true;
        break;
      }
    }
  }

  if (!artNewClicked) {
    // Try any "yeni" button that isn't "yenilə"
    for (const btnInfo of artBtns) {
      if (btnInfo.text.match(/^yeni$/i) || btnInfo.text.match(/^new$/i) || btnInfo.text.match(/^add$/i)) {
        info(`Trying generic new button: "${btnInfo.text}" -> ${btnInfo.href}`);
        try {
          if (btnInfo.href && btnInfo.href !== '#') {
            await page.goto(`https://beta.azexbuy.com${btnInfo.href}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
          } else {
            const el = await page.$(`button:has-text("${btnInfo.text}"), a:has-text("${btnInfo.text}")`);
            if (el) await el.click();
          }
          await page.waitForTimeout(2000);
          artNewClicked = true;
          break;
        } catch(e) {}
      }
    }
  }

  await ss(page, 'articles-new-form');
  const artFormData = await dumpPageInfo(page, 'Articles new form');

  if (artFormData.inputs.length > 0 || artFormData.url.includes('new') || artFormData.url.includes('create')) {
    info(`Article form has ${artFormData.inputs.length} inputs`);
    try {
      const inputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
      if (inputs[0]) { await inputs[0].fill('Test Məqalə AZ'); ok('Filled article title AZ'); }
      if (inputs[1]) { await inputs[1].fill('Test Article EN'); ok('Filled article title EN'); }

      const textareas = await page.$$('textarea:not([readonly])');
      if (textareas[0]) { await textareas[0].fill('Bu məqalənin məzmunu burada. This is the article content for testing.'); ok('Filled article content'); }

      // Rich text editors (TipTap, Quill, etc.)
      const richEditor = await page.$('[contenteditable="true"]');
      if (richEditor) {
        await richEditor.click();
        await richEditor.type('Test məqalə məzmunu. Test article content.');
        ok('Filled rich text editor');
      }

      const selects = await page.$$('select');
      if (selects.length > 0) {
        for (const sel of selects) {
          const options = await sel.$$('option');
          if (options.length > 1) {
            await sel.selectOption({ index: 1 });
            ok('Selected article category');
            break;
          }
        }
      }

      await ss(page, 'articles-form-filled');

      // Try publish or save
      const publishBtns = await page.$$('button');
      let published = false;
      for (const btn of publishBtns) {
        const txt = await btn.textContent();
        if (txt.match(/nəşr et|publish|yayımla/i)) {
          await btn.click();
          await page.waitForTimeout(3000);
          published = true;
          ok(`Article published with: "${txt.trim()}"`);
          break;
        }
      }
      if (!published) {
        for (const btn of publishBtns) {
          const txt = await btn.textContent();
          if (txt.match(/saxla|save|submit/i) && !txt.match(/saxla.*sonra/i)) {
            await btn.click();
            await page.waitForTimeout(3000);
            ok(`Article saved with: "${txt.trim()}"`);
            break;
          }
        }
      }

      await ss(page, 'articles-after-save');
      const afterArt = await dumpPageInfo(page, 'After article save');
      if (afterArt.toasts.length) ok(`Article save response: ${afterArt.toasts.join(' | ')}`);
      else warn('No toast after article save');
    } catch(e) {
      err(`Article form error: ${e.message}`);
    }
  } else {
    warn('Could not reach article creation form');
    report.broken.push('Məqalələr: Could not find/reach new article form');
  }

  // ════════════════════════════════════════════════
  // 6. XİDMƏTLƏR
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('6. XİDMƏTLƏR (Services)');
  console.log('══════════════════════════════════════════════');

  const svcFound = await clickSidebarItem(page, ['Xidmətlər', 'xidmət', 'Service', 'service']);
  await ss(page, 'services-main');
  const svcData = await dumpPageInfo(page, 'Services');
  report.details.services = svcData;

  if (!svcFound) err('Could not navigate to Xidmətlər');
  else ok(`Xidmətlər loaded: ${svcData.url}`);

  // List all buttons
  const svcBtns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a')).map(el => ({
      text: el.textContent.trim().substring(0, 60),
      href: el.getAttribute('href') || ''
    })).filter(el => el.text);
  });
  info(`Services page buttons: ${svcBtns.slice(0, 15).map(b => `"${b.text}"`).join(', ')}`);

  // Navigate to new service form
  let svcNewClicked = false;
  for (const btnInfo of svcBtns) {
    if (btnInfo.text.match(/yeni xidmət|new service|service.*new/i) ||
        (btnInfo.text.match(/^(yeni|new|add|əlavə|create)$/i) && !btnInfo.text.match(/yenilə/i))) {
      info(`Clicking for new service: "${btnInfo.text}" -> ${btnInfo.href}`);
      try {
        if (btnInfo.href && btnInfo.href !== '#' && !btnInfo.href.startsWith('javascript')) {
          await page.goto(`https://beta.azexbuy.com${btnInfo.href}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        } else {
          const el = await page.$(`button:has-text("${btnInfo.text}"), a:has-text("${btnInfo.text}")`);
          if (el) await el.click();
        }
        await page.waitForTimeout(2000);
        svcNewClicked = true;
        break;
      } catch(e) { info(`Error: ${e.message}`); }
    }
  }

  await ss(page, 'services-new-form');
  const svcFormData = await dumpPageInfo(page, 'Services form');

  if (svcFormData.inputs.length > 0) {
    info(`Service form inputs: ${svcFormData.inputs.map(i => `${i.type}[name=${i.name}][ph=${i.placeholder}]`).join(', ')}`);
    try {
      const textInputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
      info(`Text inputs: ${textInputs.length}`);
      
      // Fill by order — typically: title_az, title_en, description_az, etc.
      for (let i = 0; i < Math.min(textInputs.length, 4); i++) {
        const nameAttr = await textInputs[i].getAttribute('name') || '';
        const placeholderAttr = await textInputs[i].getAttribute('placeholder') || '';
        info(`Input ${i}: name="${nameAttr}" placeholder="${placeholderAttr}"`);
        
        if (nameAttr.includes('en') || placeholderAttr.match(/english|en/i)) {
          await textInputs[i].fill('Test Service EN');
        } else {
          await textInputs[i].fill(i === 0 ? 'Test Xidmət AZ' : 'Test Service Value');
        }
      }
      ok('Filled service title fields');

      const textareas = await page.$$('textarea:not([readonly])');
      for (let i = 0; i < Math.min(textareas.length, 2); i++) {
        const nameAttr = await textareas[i].getAttribute('name') || '';
        await textareas[i].fill(nameAttr.includes('en') ? 'Test service description in English.' : 'Test xidməti açıqlaması Azərbaycanca.');
      }
      if (textareas.length > 0) ok('Filled service description fields');

      // Look for scope items / repeater fields
      const addScopeBtn = await page.$('button:has-text("Əlavə et"), button:has-text("Add"), button:has-text("+ "), [class*="add-item"]');
      if (addScopeBtn) {
        await addScopeBtn.click();
        await page.waitForTimeout(1000);
        ok('Clicked add scope item button');
        const newInputs = await page.$$('input[type="text"]:not([readonly])');
        if (newInputs.length > textInputs.length) {
          await newInputs[newInputs.length - 1].fill('Test scope item');
          ok('Filled scope item');
        }
      }

      // Ana Xidmət checkbox
      const checkboxes = await page.$$('input[type="checkbox"]');
      info(`Found ${checkboxes.length} checkboxes`);
      for (const cb of checkboxes) {
        const labelEl = await page.evaluate(el => {
          const label = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
          return label ? label.textContent.trim() : '';
        }, cb);
        info(`Checkbox label: "${labelEl}"`);
        if (labelEl.match(/ana xidmət|main service|əsas/i)) {
          await cb.check();
          ok('Checked Ana Xidmət');
          break;
        }
      }
      if (checkboxes.length > 0 && !checkboxes[0].checked) {
        await checkboxes[0].check();
        ok('Checked first checkbox (presumed Ana Xidmət)');
      }

      await ss(page, 'services-form-filled');

      // Save
      const allBtns = await page.$$('button');
      let saved = false;
      for (const btn of allBtns) {
        const txt = await btn.textContent();
        if (txt.match(/saxla|save|submit|yarat|create/i) && !txt.match(/saxla.*sonra|save.*draft/i)) {
          info(`Clicking save: "${txt.trim()}"`);
          await btn.click();
          await page.waitForTimeout(3000);
          saved = true;
          break;
        }
      }

      await ss(page, 'services-after-save');
      const afterSvc = await dumpPageInfo(page, 'After service save');
      if (afterSvc.toasts.length) {
        ok(`Service save response: ${afterSvc.toasts.join(' | ')}`);
      } else {
        warn('No toast/confirmation after service save');
        // Check if URL changed (redirect to list = success)
        if (afterSvc.url !== svcFormData.url) {
          ok(`Service saved — redirected to: ${afterSvc.url}`);
        }
      }
    } catch(e) {
      err(`Service form error: ${e.message}`);
      await ss(page, 'services-form-error');
    }
  } else {
    warn('No form inputs in service creation form');
    report.broken.push('Xidmətlər: Service creation form not found/accessible');
  }

  // ════════════════════════════════════════════════
  // 7. GƏLƏN QUTUSU
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('7. GƏLƏN QUTUSU (Inbox)');
  console.log('══════════════════════════════════════════════');

  const inboxFound = await clickSidebarItem(page, ['Gələn Qutusu', 'Gələn', 'Inbox', 'inbox', 'Qutusu']);
  await ss(page, 'inbox-main');
  const inboxData = await dumpPageInfo(page, 'Inbox');
  report.details.inbox = inboxData;

  if (!inboxFound) err('Could not navigate to Gələn Qutusu');
  else ok(`Gələn Qutusu loaded: ${inboxData.url}`);

  const inboxContent = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr, [class*="message"], [class*="inbox"], [class*="mail"]');
    const badges = Array.from(document.querySelectorAll('[class*="badge"], [class*="count"]')).map(el => el.textContent.trim());
    return { rows: rows.length, badges, bodyPreview: document.body.innerText.substring(0, 300) };
  });
  info(`Inbox rows: ${inboxContent.rows}, badges: ${inboxContent.badges.join(', ')}`);
  info(`Inbox preview: ${inboxContent.bodyPreview.replace(/\n/g, ' ')}`);

  // ════════════════════════════════════════════════
  // 8. İSTİFADƏÇİLƏR
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('8. İSTİFADƏÇİLƏR (Users)');
  console.log('══════════════════════════════════════════════');

  const usersFound = await clickSidebarItem(page, ['İstifadəçilər', 'İstifadəçi', 'Users', 'User', 'İdarəetmə']);
  await ss(page, 'users-main');
  const usersData = await dumpPageInfo(page, 'Users');
  report.details.users = usersData;

  if (!usersFound) err('Could not navigate to İstifadəçilər');
  else ok(`İstifadəçilər loaded: ${usersData.url}`);

  const usersContent = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr');
    const userCards = document.querySelectorAll('[class*="user"]');
    return { 
      tableRows: rows.length,
      userCards: userCards.length,
      preview: document.body.innerText.substring(0, 400).replace(/\n+/g, ' ')
    };
  });
  info(`Users: ${usersContent.tableRows} table rows, preview: ${usersContent.preview}`);

  // ════════════════════════════════════════════════
  // 9. SMTP
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('9. SMTP E-Poçt');
  console.log('══════════════════════════════════════════════');

  const smtpFound = await clickSidebarItem(page, ['SMTP', 'smtp', 'E-poçt', 'Mail', 'mail']);
  await ss(page, 'smtp-main');
  const smtpData = await dumpPageInfo(page, 'SMTP');
  report.details.smtp = smtpData;

  if (!smtpFound) err('Could not navigate to SMTP');
  else ok(`SMTP loaded: ${smtpData.url}`);

  info(`SMTP inputs: ${smtpData.inputs.length}`);
  if (smtpData.inputs.length > 0) {
    info(`SMTP fields: ${smtpData.inputs.map(i => `${i.type}[name=${i.name}][ph=${i.placeholder}]`).join(', ')}`);
    ok('SMTP has configurable fields');
  } else {
    warn('SMTP page has no visible config fields');
  }

  // ════════════════════════════════════════════════
  // 10. PARAMETRLƏRs
  // ════════════════════════════════════════════════
  console.log('\n══════════════════════════════════════════════');
  console.log('10. PARAMETRLƏR (Settings)');
  console.log('══════════════════════════════════════════════');

  const settingsFound = await clickSidebarItem(page, ['Parametrlər', 'Parametr', 'Settings', 'Setting', 'Sistem Parametr']);
  await ss(page, 'settings-main');
  const settingsData = await dumpPageInfo(page, 'Settings');
  report.details.settings = settingsData;

  if (!settingsFound) err('Could not navigate to Parametrlər');
  else ok(`Parametrlər loaded: ${settingsData.url}`);

  info(`Settings inputs: ${settingsData.inputs.length}`);
  if (settingsData.inputs.length > 0) {
    ok('Settings has configurable fields');
  }

  // Also check Sistem Logları if visible
  console.log('\n══════════════════════════════════════════════');
  console.log('11. SİSTEM LOGLARI (Bonus)');
  console.log('══════════════════════════════════════════════');
  const logsFound = await clickSidebarItem(page, ['Sistem Logları', 'Log', 'Logs']);
  if (logsFound) {
    await ss(page, 'system-logs');
    const logsData = await dumpPageInfo(page, 'System Logs');
    ok(`Sistem Logları loaded: ${logsData.url}`);
  }

  // Final screenshot
  await ss(page, 'final');
  await browser.close();

  // ════════════════════════════════════════════════
  // FINAL REPORT
  // ════════════════════════════════════════════════
  console.log('\n\n' + '═'.repeat(70));
  console.log('FINAL REPORT');
  console.log('═'.repeat(70));

  console.log(`\n✅ WORKING (${report.working.length}):`);
  report.working.forEach(w => console.log(`  • ${w}`));

  console.log(`\n❌ ERRORS (${report.errors.length}):`);
  report.errors.forEach(e => console.log(`  • ${e}`));

  console.log(`\n🚫 BROKEN (${report.broken.length}):`);
  if (report.broken.length === 0) console.log('  None explicitly identified');
  report.broken.forEach(b => console.log(`  • ${b}`));

  console.log(`\n🔴 CONSOLE ERRORS (${report.consoleErrors.length}):`);
  if (report.consoleErrors.length === 0) {
    console.log('  None');
  } else {
    report.consoleErrors.slice(0, 30).forEach(e => console.log(`  • ${e}`));
  }

  console.log(`\n📸 ${screenshotIndex} screenshots -> ${SCREENSHOTS_DIR}`);

  const reportPath = path.join(SCREENSHOTS_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 JSON report -> ${reportPath}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
