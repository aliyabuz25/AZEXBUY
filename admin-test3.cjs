const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://beta.azexbuy.com/octo-admin';
const SCREENSHOTS_DIR = '/Users/ali_new/Desktop/AZEXBUY/admin-screenshots3';
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let idx = 0;
const report = { working: [], errors: [], broken: [], consoleErrors: [] };

async function ss(page, name) {
  idx++;
  const f = `${String(idx).padStart(3,'0')}-${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, f), fullPage: true });
  console.log(`  📸 ${f}`);
}

const ok  = (m) => { console.log(`  ✅ ${m}`); report.working.push(m); };
const err = (m) => { console.log(`  ❌ ${m}`); report.errors.push(m); };
const info= (m) =>   console.log(`  ℹ️  ${m}`);
const warn= (m) =>   console.log(`  ⚠️  ${m}`);

async function getPageState(page) {
  return page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(e => e.textContent.trim()).filter(Boolean);
    const btns = Array.from(document.querySelectorAll('button')).map(e => e.textContent.trim()).filter(Boolean);
    const links = Array.from(document.querySelectorAll('a[href]')).map(e => ({ t: e.textContent.trim(), h: e.getAttribute('href') })).filter(e => e.t);
    const inputs = Array.from(document.querySelectorAll('input,textarea,select')).map(e => ({
      tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder
    }));
    const toasts = Array.from(document.querySelectorAll('[class*="toast"],[class*="Toast"],[class*="alert"],[class*="Alert"],[class*="notification"],[class*="Notification"],[role="alert"],[class*="snack"],[class*="Snack"]'))
      .map(e => e.textContent.trim()).filter(Boolean);
    const errors = Array.from(document.querySelectorAll('[class*="error"],[class*="Error"],[class*="danger"],[class*="invalid"]'))
      .map(e => e.textContent.trim()).filter(t => t && t.length < 300);
    return { headings: h, buttons: btns, links: links.slice(0,20), inputs, toasts, errors, url: window.location.href, hash: window.location.hash };
  });
}

// Click a sidebar button (they are <button> elements in a SPA)
async function clickNav(page, label) {
  // The sidebar buttons are identified from the dump: they have text like "İcmal & Sorğular", "CMS — Məzmun", etc.
  const result = await page.evaluate((lbl) => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      const t = btn.textContent.trim();
      if (t.includes(lbl)) {
        btn.click();
        return { clicked: true, text: t };
      }
    }
    return { clicked: false };
  }, label);

  if (result.clicked) {
    await page.waitForTimeout(1500);
    info(`Clicked nav button: "${result.text}"`);
    return true;
  }

  // Try partial match
  const result2 = await page.evaluate((lbl) => {
    const lower = lbl.toLowerCase();
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      const t = btn.textContent.trim().toLowerCase();
      if (t.includes(lower)) {
        btn.click();
        return { clicked: true, text: btn.textContent.trim() };
      }
    }
    return { clicked: false };
  }, label.toLowerCase());

  if (result2.clicked) {
    await page.waitForTimeout(1500);
    info(`Clicked nav button (lowercase): "${result2.text}"`);
    return true;
  }

  err(`Nav button not found: "${label}"`);
  return false;
}

// Wait for page content to change after clicking nav
async function waitForContent(page, keyword, timeout = 5000) {
  try {
    await page.waitForFunction(
      (kw) => document.body.innerText.toLowerCase().includes(kw.toLowerCase()),
      keyword,
      { timeout }
    );
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text().substring(0, 200));
      console.log(`  🔴 ${msg.text().substring(0, 150)}`);
    }
  });
  page.on('pageerror', e => {
    report.consoleErrors.push(e.message.substring(0, 200));
    console.log(`  🔴 PAGE ERR: ${e.message.substring(0, 150)}`);
  });
  // Log network errors
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`  🌐 HTTP ${resp.status()}: ${resp.url().replace('https://beta.azexbuy.com', '')}`);
    }
  });

  // ══════════════════════════════════════════
  // LOGIN
  // ══════════════════════════════════════════
  console.log('\n══════ 1. LOGIN ══════');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await ss(page, '01-initial');

  // The login form has a text input + password input + "Daxil Ol" button
  const passField = await page.$('input[type="password"]');
  if (passField) {
    // Find the first text/email input
    const userField = await page.$('input[type="text"], input[type="email"], input:not([type="password"]):not([type="hidden"]):not([type="checkbox"])');
    if (userField) {
      await userField.fill('admin');
      ok('Filled username');
    }
    await passField.fill('admin');
    ok('Filled password');
    await ss(page, '02-login-filled');

    // Click "Daxil Ol"
    const loginBtn = await page.$('button:has-text("Daxil Ol"), button[type="submit"]');
    if (loginBtn) {
      await loginBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    // Wait for dashboard to appear
    await page.waitForFunction(() => document.body.innerText.includes('İdarə Paneli') || document.body.innerText.includes('dashboard'), { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    ok('Login submitted');
  } else {
    info('No password field — checking if already authenticated');
  }

  await ss(page, '03-after-login');
  const loginState = await getPageState(page);
  info(`Post-login headings: ${loginState.headings.join(' | ')}`);
  info(`Post-login URL: ${loginState.url}`);

  if (loginState.headings.some(h => h.includes('İdarə Paneli') || h.includes('Dashboard'))) {
    ok('Dashboard visible — login successful');
  } else if (loginState.toasts.some(t => t.match(/xəta|error|səhv|invalid/i))) {
    err(`Login failed: ${loginState.toasts.join(' | ')}`);
  } else {
    warn(`Post-login state unclear. Buttons: ${loginState.buttons.slice(0,5).join(', ')}`);
  }

  // Dump full sidebar structure
  console.log('\n══════ SIDEBAR ANALYSIS ══════');
  const sidebarAnalysis = await page.evaluate(() => {
    // The sidebar appears to use buttons. Let's find them all.
    const allBtns = Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.textContent.trim(),
      classes: b.className,
      dataAttr: b.dataset,
      parentTag: b.parentElement ? b.parentElement.tagName : '',
      parentClass: b.parentElement ? b.parentElement.className : ''
    }));
    // Also find the sidebar/nav container
    const sidebarEl = document.querySelector('nav, aside, [class*="sidebar"], [class*="Sidebar"], [class*="nav"]');
    return {
      buttons: allBtns,
      sidebarHTML: sidebarEl ? sidebarEl.outerHTML.substring(0, 2000) : 'NOT FOUND'
    };
  });

  info(`Total buttons: ${sidebarAnalysis.buttons.length}`);
  sidebarAnalysis.buttons.forEach(b => info(`  btn: "${b.text}" | class: ${b.classes.substring(0,80)} | parent: ${b.parentTag}.${b.parentClass.substring(0,40)}`));
  info(`Sidebar HTML: ${sidebarAnalysis.sidebarHTML}`);

  // ══════════════════════════════════════════
  // İCMAL (Dashboard)
  // ══════════════════════════════════════════
  console.log('\n══════ 2. İCMAL (Dashboard) ══════');
  await clickNav(page, 'İcmal');
  await page.waitForTimeout(2000);
  await ss(page, '04-icmal');
  const icmalState = await getPageState(page);
  info(`İcmal headings: ${icmalState.headings.join(' | ')}`);
  info(`İcmal content preview:`);
  const icmalPreview = await page.evaluate(() => document.body.innerText.substring(0, 600));
  console.log(icmalPreview.replace(/\n+/g, '\n').trim());

  // ══════════════════════════════════════════
  // CMS
  // ══════════════════════════════════════════
  console.log('\n══════ 3. CMS ══════');
  await clickNav(page, 'CMS');
  await page.waitForTimeout(2000);
  await ss(page, '05-cms');
  const cmsState = await getPageState(page);
  info(`CMS headings: ${cmsState.headings.join(' | ')}`);
  info(`CMS buttons: ${cmsState.buttons.join(' | ')}`);
  info(`CMS inputs: ${cmsState.inputs.length}`);
  const cmsPreview = await page.evaluate(() => document.body.innerText.substring(0, 800));
  console.log(cmsPreview.replace(/\n+/g, '\n').trim());

  if (cmsState.inputs.length > 0) {
    ok('CMS has editable fields');
    // Try to edit
    try {
      const inp = await page.$('input[type="text"]:not([readonly]), textarea:not([readonly])');
      if (inp) {
        const val = await inp.inputValue();
        info(`CMS field current value: "${val.substring(0,80)}"`);
        await inp.click({ clickCount: 3 });
        await inp.type(' TEST');
        await ss(page, '05b-cms-edited');
        const saveBtn = await page.$('button:has-text("Saxla"), button:has-text("Save"), button:has-text("Yenilə"), button[type="submit"]');
        if (saveBtn) {
          const st = await saveBtn.textContent();
          await saveBtn.click();
          await page.waitForTimeout(2500);
          await ss(page, '05c-cms-saved');
          const after = await getPageState(page);
          if (after.toasts.length) ok(`CMS save: ${after.toasts.join(' | ')}`);
          else warn('CMS save: no toast shown');
        }
      }
    } catch(e) { err(`CMS edit: ${e.message}`); }
  } else {
    // Maybe CMS uses a tab structure — look at what's there
    const cmsStructure = await page.evaluate(() => {
      return {
        allText: document.body.innerText.substring(0, 1000),
        tabsHTML: Array.from(document.querySelectorAll('[role="tab"]')).map(t => t.outerHTML.substring(0,100)),
        tables: Array.from(document.querySelectorAll('table')).map(t => t.outerHTML.substring(0,200)),
        editButtons: Array.from(document.querySelectorAll('button')).filter(b => b.textContent.match(/edit|düzəlt|dəyiş|redakt|yenilə/i)).map(b => b.textContent.trim())
      };
    });
    info(`CMS all text: ${cmsStructure.allText.replace(/\n+/g, ' ')}`);
    info(`CMS edit buttons: ${cmsStructure.editButtons.join(', ')}`);
    if (cmsStructure.editButtons.length > 0) {
      // Click first edit button
      const editBtn = await page.$(`button:has-text("${cmsStructure.editButtons[0]}")`);
      if (editBtn) {
        await editBtn.click();
        await page.waitForTimeout(2000);
        await ss(page, '05d-cms-after-edit-click');
        const afterEdit = await getPageState(page);
        info(`After CMS edit click: ${afterEdit.inputs.length} inputs, headings: ${afterEdit.headings.join(' | ')}`);
        if (afterEdit.inputs.length > 0) {
          ok('CMS edit form opened');
        }
      }
    }
    warn('CMS: no direct input fields on main view');
  }

  // ══════════════════════════════════════════
  // MƏHSUL KATALOQU
  // ══════════════════════════════════════════
  console.log('\n══════ 4. MƏHSUL KATALOQU ══════');
  await clickNav(page, 'Məhsul Kataloqu');
  await page.waitForTimeout(2000);
  await ss(page, '06-products');
  const prodState = await getPageState(page);
  info(`Products headings: ${prodState.headings.join(' | ')}`);
  info(`Products buttons: ${prodState.buttons.join(' | ')}`);
  const prodPreview = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log(prodPreview.replace(/\n+/g, '\n').trim());

  // Look for sub-tabs like Categories / Products
  const prodTabs = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], [class*="tab"], [class*="Tab"]'));
    return tabs.map(t => t.textContent.trim()).filter(Boolean);
  });
  info(`Product tabs: ${prodTabs.join(' | ')}`);

  // Try new product/category
  const prodBtns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean));
  info(`All product page buttons: ${prodBtns.join(' | ')}`);

  // Find a "Yeni" button that is NOT "Yenilə"
  const yeniBtn = prodBtns.find(b => b.match(/^yeni$/i) || b.match(/yeni.*mə/i) || b.match(/yeni.*ka/i));
  if (yeniBtn) {
    info(`Found create button: "${yeniBtn}"`);
    const btn = await page.$(`button:has-text("${yeniBtn}")`);
    if (btn) {
      await btn.click();
      await page.waitForTimeout(2000);
      await ss(page, '06b-products-new');
      const newProdState = await getPageState(page);
      info(`After new product btn: headings=${newProdState.headings.join(' | ')}, inputs=${newProdState.inputs.length}`);
      if (newProdState.inputs.length > 0) {
        ok('Product creation form opened');
        const inputs = await page.$$('input[type="text"]:not([readonly])');
        if (inputs[0]) await inputs[0].fill('Test Məhsul');
        if (inputs[1]) await inputs[1].fill('Test Product EN');
        await ss(page, '06c-products-filled');
      }
    }
  } else {
    warn('No "Yeni" button for products — scanning all buttons for create action');
    for (const btnText of prodBtns) {
      if (!btnText.match(/yenilə|refresh/i) && btnText.match(/yeni|new|create|add|əlavə/i)) {
        info(`Trying: "${btnText}"`);
        const btn = await page.$(`button:has-text("${btnText}")`);
        if (btn) {
          await btn.click();
          await page.waitForTimeout(2000);
          await ss(page, '06b-products-new');
          break;
        }
      }
    }
  }

  // ══════════════════════════════════════════
  // MƏQALƏLƏR
  // ══════════════════════════════════════════
  console.log('\n══════ 5. MƏQALƏLƏR ══════');
  await clickNav(page, 'Məqalələr');
  await page.waitForTimeout(2000);
  await ss(page, '07-articles');
  const artState = await getPageState(page);
  info(`Articles headings: ${artState.headings.join(' | ')}`);
  info(`Articles buttons: ${artState.buttons.join(' | ')}`);
  const artPreview = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log(artPreview.replace(/\n+/g, '\n').trim());

  // Find new article button
  const artBtns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean));
  info(`All article buttons: ${artBtns.join(' | ')}`);

  const newArtBtn = artBtns.find(b => !b.match(/yenilə|refresh/i) && b.match(/yeni|new|create|add|məqalə|article/i));
  if (newArtBtn) {
    info(`Found new article btn: "${newArtBtn}"`);
    const btn = await page.$(`button:has-text("${newArtBtn}")`);
    if (btn) {
      await btn.click();
      await page.waitForTimeout(2000);
      await ss(page, '07b-articles-new');
      const artFormState = await getPageState(page);
      info(`Article form: headings=${artFormState.headings.join(' | ')}, inputs=${artFormState.inputs.length}, buttons=${artFormState.buttons.join(' | ')}`);

      if (artFormState.inputs.length > 0) {
        ok('Article form opened');
        const inputs = await page.$$('input[type="text"]:not([readonly])');
        if (inputs[0]) { await inputs[0].fill('Test Məqalə AZ'); ok('Filled article title AZ'); }
        if (inputs[1]) { await inputs[1].fill('Test Article EN'); ok('Filled article title EN'); }

        const textareas = await page.$$('textarea:not([readonly])');
        if (textareas[0]) { await textareas[0].fill('Bu məqalənin test məzmunudur.'); ok('Filled article body'); }

        // Rich text
        const richEd = await page.$('[contenteditable="true"]');
        if (richEd) {
          await richEd.click();
          await richEd.type('Test məqalə məzmunu.');
          ok('Filled rich text editor');
        }

        // Category select
        const selects = await page.$$('select');
        for (const sel of selects) {
          const opts = await sel.$$('option');
          if (opts.length > 1) { await sel.selectOption({ index: 1 }); ok('Selected category'); break; }
        }

        await ss(page, '07c-articles-filled');

        // Publish or save
        const allBtns = await page.$$('button');
        for (const btn of allBtns) {
          const t = await btn.textContent();
          if (t.match(/nəşr et|publish|yayımla/i)) {
            await btn.click();
            await page.waitForTimeout(3000);
            await ss(page, '07d-articles-published');
            const r = await getPageState(page);
            if (r.toasts.length) ok(`Article publish: ${r.toasts.join(' | ')}`);
            else if (r.errors.length) err(`Article publish errors: ${r.errors.join(' | ')}`);
            else warn('Article publish: no feedback toast');
            break;
          }
        }
        // Try save if no publish
        for (const btn of allBtns) {
          const t = await btn.textContent();
          if (t.match(/saxla|save/i) && !t.match(/saxla.*sonra/i)) {
            await btn.click();
            await page.waitForTimeout(3000);
            await ss(page, '07d-articles-saved');
            const r = await getPageState(page);
            if (r.toasts.length) ok(`Article save: ${r.toasts.join(' | ')}`);
            break;
          }
        }
      } else {
        warn('Article form has no inputs');
        const artFormHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 3000));
        info(`Article form HTML snippet: ${artFormHTML}`);
      }
    }
  } else {
    err('No new article button found');
    report.broken.push('Məqalələr: no new article button');
  }

  // ══════════════════════════════════════════
  // XİDMƏTLƏR
  // ══════════════════════════════════════════
  console.log('\n══════ 6. XİDMƏTLƏR ══════');
  await clickNav(page, 'Xidmətlər');
  await page.waitForTimeout(2000);
  await ss(page, '08-services');
  const svcState = await getPageState(page);
  info(`Services headings: ${svcState.headings.join(' | ')}`);
  info(`Services buttons: ${svcState.buttons.join(' | ')}`);
  const svcPreview = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log(svcPreview.replace(/\n+/g, '\n').trim());

  const svcBtns = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean));
  info(`All service buttons: ${svcBtns.join(' | ')}`);

  const newSvcBtn = svcBtns.find(b => !b.match(/yenilə|refresh/i) && b.match(/yeni|new|create|add|xidmət|service/i));
  if (newSvcBtn) {
    info(`Found new service btn: "${newSvcBtn}"`);
    const btn = await page.$(`button:has-text("${newSvcBtn}")`);
    if (btn) {
      await btn.click();
      await page.waitForTimeout(2000);
      await ss(page, '08b-services-new');
      const svcFormState = await getPageState(page);
      info(`Service form: headings=${svcFormState.headings.join(' | ')}, inputs=${svcFormState.inputs.length}`);
      info(`Service form inputs detail: ${JSON.stringify(svcFormState.inputs)}`);

      if (svcFormState.inputs.length > 0) {
        ok('Service form opened');

        // Fill each input based on name/placeholder
        const allInputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
        for (let i = 0; i < allInputs.length; i++) {
          const attrs = await allInputs[i].evaluate(el => ({ name: el.name, placeholder: el.placeholder, id: el.id }));
          info(`Service input ${i}: ${JSON.stringify(attrs)}`);
          let val = 'Test Value';
          if (attrs.name.match(/_az$|az$/i) || attrs.placeholder.match(/azərb|az\b/i)) val = 'Test Xidmət AZ';
          else if (attrs.name.match(/_en$|en$/i) || attrs.placeholder.match(/english|en\b/i)) val = 'Test Service EN';
          else if (i === 0) val = 'Test Xidmət AZ';
          else if (i === 1) val = 'Test Service EN';
          await allInputs[i].fill(val);
        }

        const textareas = await page.$$('textarea:not([readonly])');
        for (let i = 0; i < textareas.length; i++) {
          const attrs = await textareas[i].evaluate(el => ({ name: el.name, placeholder: el.placeholder }));
          info(`Service textarea ${i}: ${JSON.stringify(attrs)}`);
          const val = attrs.name.match(/_en$|en$/i) ? 'Test service description in English.' : 'Test xidmət açıqlaması.';
          await textareas[i].fill(val);
        }

        // Check for scope/feature items
        const addItemBtns = await page.$$('button');
        for (const btn of addItemBtns) {
          const t = await btn.textContent();
          if (t.match(/əlavə et|add item|add scope|scope əlavə/i)) {
            await btn.click();
            await page.waitForTimeout(1000);
            const newInputs = await page.$$('input[type="text"]:not([readonly])');
            const lastInput = newInputs[newInputs.length - 1];
            if (lastInput) await lastInput.fill('Test scope xidmət elementi');
            ok('Added scope item');
            break;
          }
        }

        // Ana Xidmət checkbox
        const checkboxes = await page.$$('input[type="checkbox"]');
        info(`Service form checkboxes: ${checkboxes.length}`);
        for (const cb of checkboxes) {
          const label = await cb.evaluate(el => {
            const lbl = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
            return lbl ? lbl.textContent.trim() : (el.name || el.id || '');
          });
          info(`Checkbox: "${label}"`);
          if (label.match(/ana xidmət|main|əsas|featured|primary/i)) {
            await cb.check();
            ok(`Checked: "${label}"`);
          }
        }

        await ss(page, '08c-services-filled');

        // Save
        const saveBtns = await page.$$('button');
        for (const btn of saveBtns) {
          const t = await btn.textContent();
          if (t.match(/saxla|save|yarat|create|submit/i) && !t.match(/saxla.*sonra/i)) {
            info(`Clicking save: "${t.trim()}"`);
            await btn.click();
            await page.waitForTimeout(3000);
            await ss(page, '08d-services-saved');
            const r = await getPageState(page);
            if (r.toasts.length) ok(`Service save: ${r.toasts.join(' | ')}`);
            else if (r.errors.length) err(`Service save errors: ${r.errors.slice(0,3).join(' | ')}`);
            else warn('Service save: no feedback toast');
            break;
          }
        }
      } else {
        warn('Service form: no inputs found');
        const html = await page.evaluate(() => document.body.innerHTML.substring(0, 4000));
        info(`Service form HTML: ${html}`);
      }
    }
  } else {
    err('No new service button found');
    report.broken.push('Xidmətlər: no new service button found');
  }

  // ══════════════════════════════════════════
  // GƏLƏN QUTUSU
  // ══════════════════════════════════════════
  console.log('\n══════ 7. GƏLƏN QUTUSU ══════');
  await clickNav(page, 'Gələn Qutusu');
  await page.waitForTimeout(2000);
  await ss(page, '09-inbox');
  const inboxState = await getPageState(page);
  info(`Inbox headings: ${inboxState.headings.join(' | ')}`);
  info(`Inbox buttons: ${inboxState.buttons.join(' | ')}`);
  const inboxPreview = await page.evaluate(() => document.body.innerText.substring(0, 800));
  console.log(inboxPreview.replace(/\n+/g, '\n').trim());

  if (inboxState.headings.some(h => h.match(/gələn|inbox|mesaj|sorğu|qutu/i))) {
    ok('Gələn Qutusu loaded correctly');
  } else {
    err('Gələn Qutusu: unexpected content');
    report.broken.push('Gələn Qutusu: not loading expected content');
  }

  // Click an inbox item if any
  const inboxItems = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tr[class*="cursor"], tr:has(td), [class*="message"], [class*="inbox-item"]'));
    return rows.length;
  });
  info(`Inbox items found: ${inboxItems}`);

  // ══════════════════════════════════════════
  // İSTİFADƏÇİLƏR
  // ══════════════════════════════════════════
  console.log('\n══════ 8. İSTİFADƏÇİLƏR ══════');
  await clickNav(page, 'İstifadəçilər');
  await page.waitForTimeout(2000);
  await ss(page, '10-users');
  const usersState = await getPageState(page);
  info(`Users headings: ${usersState.headings.join(' | ')}`);
  info(`Users buttons: ${usersState.buttons.join(' | ')}`);
  const usersPreview = await page.evaluate(() => document.body.innerText.substring(0, 800));
  console.log(usersPreview.replace(/\n+/g, '\n').trim());

  if (usersState.headings.some(h => h.match(/istifadəçi|user|admin/i))) {
    ok('İstifadəçilər loaded correctly');
  } else {
    warn('İstifadəçilər: unexpected content');
  }

  // ══════════════════════════════════════════
  // SMTP
  // ══════════════════════════════════════════
  console.log('\n══════ 9. SMTP ══════');
  await clickNav(page, 'SMTP');
  await page.waitForTimeout(2000);
  await ss(page, '11-smtp');
  const smtpState = await getPageState(page);
  info(`SMTP headings: ${smtpState.headings.join(' | ')}`);
  info(`SMTP buttons: ${smtpState.buttons.join(' | ')}`);
  info(`SMTP inputs: ${smtpState.inputs.length}`);
  info(`SMTP input details: ${JSON.stringify(smtpState.inputs)}`);
  const smtpPreview = await page.evaluate(() => document.body.innerText.substring(0, 800));
  console.log(smtpPreview.replace(/\n+/g, '\n').trim());

  if (smtpState.inputs.length > 0) {
    ok(`SMTP has ${smtpState.inputs.length} configurable fields`);
  } else {
    warn('SMTP: no visible form fields');
  }

  // ══════════════════════════════════════════
  // PARAMETRLƏRs
  // ══════════════════════════════════════════
  console.log('\n══════ 10. PARAMETRLƏR ══════');
  await clickNav(page, 'Parametrlər');
  await page.waitForTimeout(2000);
  await ss(page, '12-settings');
  const settingsState = await getPageState(page);
  info(`Settings headings: ${settingsState.headings.join(' | ')}`);
  info(`Settings buttons: ${settingsState.buttons.join(' | ')}`);
  info(`Settings inputs: ${settingsState.inputs.length}`);
  const settingsPreview = await page.evaluate(() => document.body.innerText.substring(0, 800));
  console.log(settingsPreview.replace(/\n+/g, '\n').trim());

  if (settingsState.inputs.length > 0) {
    ok(`Parametrlər has ${settingsState.inputs.length} configurable fields`);
  }

  // ══════════════════════════════════════════
  // SİSTEM LOGLARI
  // ══════════════════════════════════════════
  console.log('\n══════ 11. SİSTEM LOGLARI ══════');
  await clickNav(page, 'Sistem Logları');
  await page.waitForTimeout(2000);
  await ss(page, '13-logs');
  const logsState = await getPageState(page);
  info(`Logs headings: ${logsState.headings.join(' | ')}`);
  const logsPreview = await page.evaluate(() => document.body.innerText.substring(0, 600));
  console.log(logsPreview.replace(/\n+/g, '\n').trim());

  // Final state
  await ss(page, '99-final');
  await browser.close();

  // ══════════════════════════════════════════
  // REPORT
  // ══════════════════════════════════════════
  console.log('\n\n' + '═'.repeat(70));
  console.log('FINAL REPORT');
  console.log('═'.repeat(70));
  console.log(`\n✅ WORKING (${report.working.length}):`);
  report.working.forEach(w => console.log(`  • ${w}`));
  console.log(`\n❌ ERRORS (${report.errors.length}):`);
  report.errors.forEach(e => console.log(`  • ${e}`));
  console.log(`\n🚫 BROKEN (${report.broken.length}):`);
  if (!report.broken.length) console.log('  None explicitly identified');
  report.broken.forEach(b => console.log(`  • ${b}`));
  console.log(`\n🔴 CONSOLE ERRORS (${report.consoleErrors.length}):`);
  if (!report.consoleErrors.length) console.log('  None');
  else report.consoleErrors.slice(0,30).forEach(e => console.log(`  • ${e}`));

  console.log(`\n📸 ${idx} screenshots -> ${SCREENSHOTS_DIR}`);
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'report.json'), JSON.stringify(report, null, 2));
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
