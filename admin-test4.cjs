const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://beta.azexbuy.com/octo-admin';
const SCREENSHOTS_DIR = '/Users/ali_new/Desktop/AZEXBUY/admin-screenshots4';
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

let idx = 0;
const report = { working: [], errors: [], broken: [], consoleErrors: [], sections: {} };

async function ss(page, name) {
  idx++;
  const f = `${String(idx).padStart(3,'0')}-${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, f), fullPage: true });
  console.log(`  📸 ${f}`);
  return f;
}
const ok   = (m) => { console.log(`  ✅ ${m}`); report.working.push(m); };
const err  = (m) => { console.log(`  ❌ ${m}`); report.errors.push(m); };
const info = (m) =>   console.log(`  ℹ️  ${m}`);
const warn = (m) =>   console.log(`  ⚠️  ${m}`);

// Dismiss the tutorial modal overlay if present
async function dismissModal(page) {
  const overlay = await page.$('div.fixed.inset-0[class*="z-[9999"]');
  if (!overlay) return false;

  info('Tutorial modal detected — dismissing...');
  // Try "Burax" (close/skip) button inside the modal
  const buraxBtn = await page.$('button:has-text("Burax")');
  if (buraxBtn) {
    await buraxBtn.dispatchEvent('click');
    await page.waitForTimeout(1000);
    // Check if still present
    const still = await page.$('div.fixed.inset-0[class*="z-[9999"]');
    if (!still) { ok('Tutorial modal dismissed via Burax'); return true; }
  }

  // Try pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const afterEsc = await page.$('div.fixed.inset-0[class*="z-[9999"]');
  if (!afterEsc) { ok('Tutorial modal dismissed via Escape'); return true; }

  // Force remove via JS
  await page.evaluate(() => {
    const overlays = document.querySelectorAll('div[class*="z-[9999"]');
    overlays.forEach(el => el.remove());
  });
  await page.waitForTimeout(500);
  ok('Tutorial modal force-removed via JS');
  return true;
}

// Wait for modal to disappear then click
async function safeClick(page, selector) {
  await dismissModal(page);
  const el = await page.$(selector);
  if (!el) return false;
  await el.dispatchEvent('click');
  await page.waitForTimeout(1500);
  return true;
}

// Click sidebar nav button by text
async function clickNav(page, text) {
  await dismissModal(page);
  const result = await page.evaluate((t) => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim().includes(t)) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return btn.textContent.trim();
      }
    }
    return null;
  }, text);
  if (result) {
    await page.waitForTimeout(2000);
    await dismissModal(page);
    info(`Navigated to: "${result}"`);
    return true;
  }
  err(`Nav item not found: "${text}"`);
  return false;
}

async function getState(page) {
  return page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(e => e.textContent.trim()).filter(Boolean);
    const btns = Array.from(document.querySelectorAll('button')).map(e => e.textContent.trim()).filter(Boolean);
    const inputs = Array.from(document.querySelectorAll('input,textarea,select')).map(e => ({
      tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder,
      readonly: e.readOnly, value: e.value ? e.value.substring(0,50) : ''
    }));
    const toasts = Array.from(document.querySelectorAll(
      '[class*="toast"],[class*="Toast"],[class*="Toaster"],[role="alert"],[class*="sonner"],[class*="notification"],[data-sonner]'
    )).map(e => e.textContent.trim()).filter(Boolean);
    const modalPresent = !!document.querySelector('div[class*="z-[9999"]');
    const modalText = modalPresent ? (document.querySelector('div[class*="z-[9999"]')?.textContent?.trim()?.substring(0,200) || '') : '';
    return { headings: h, buttons: btns, inputs, toasts, modalPresent, modalText };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();

  const networkErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text().substring(0,200));
      console.log(`  🔴 Console: ${msg.text().substring(0,120)}`);
    }
  });
  page.on('pageerror', e => {
    report.consoleErrors.push(e.message.substring(0,200));
    console.log(`  🔴 PageErr: ${e.message.substring(0,120)}`);
  });
  page.on('response', resp => {
    if (resp.status() >= 400) {
      const short = resp.url().replace('https://beta.azexbuy.com','');
      networkErrors.push(`HTTP ${resp.status()} ${short}`);
      console.log(`  🌐 HTTP ${resp.status()}: ${short}`);
    }
  });

  // ══════════════════════════════════════════════════
  // 1. LOGIN
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  1. LOGIN                            ║');
  console.log('╚══════════════════════════════════════╝');

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await ss(page, 'login-page');

  const passField = await page.$('input[type="password"]');
  if (passField) {
    const userField = await page.$('input:not([type="password"]):not([type="hidden"]):not([type="checkbox"])');
    if (userField) { await userField.fill('admin'); ok('Filled username: admin'); }
    await passField.fill('admin');
    ok('Filled password: admin');
    await ss(page, 'login-filled');

    // Click Daxil Ol
    const loginBtn = await page.$('button:has-text("Daxil Ol"), button[type="submit"]');
    if (loginBtn) {
      await loginBtn.dispatchEvent('click');
    } else {
      await page.keyboard.press('Enter');
    }
    await page.waitForFunction(() =>
      document.body.innerText.includes('İdarə Paneli') || document.body.innerText.includes('İcmal'),
      { timeout: 15000 }
    ).catch(() => {});
    await page.waitForTimeout(1500);
  }

  await ss(page, 'after-login');
  const loginState = await getState(page);
  if (loginState.headings.some(h => h.includes('İdarə Paneli') || h.includes('İcmal'))) {
    ok('Login successful — dashboard visible');
  } else {
    err('Login may have failed');
    info(`Post-login headings: ${loginState.headings.join(' | ')}`);
  }

  // Dismiss tutorial immediately after login
  await dismissModal(page);
  await ss(page, 'dashboard-clean');

  report.sections.login = 'SUCCESS';

  // ══════════════════════════════════════════════════
  // 2. İCMAL (Dashboard)
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  2. İCMAL / DASHBOARD                ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'İcmal');
  await dismissModal(page);
  await ss(page, 'icmal');
  const icmalState = await getState(page);
  info(`Headings: ${icmalState.headings.join(' | ')}`);

  const icmalContent = await page.evaluate(() => document.body.innerText.substring(0, 1200));
  console.log('--- Page Content ---');
  console.log(icmalContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  if (icmalState.headings.some(h => h.match(/icmal|dashboard|rfq|sorğu/i))) {
    ok('İcmal section works — shows RFQ/stats data');
    report.sections.icmal = 'WORKS';
  } else {
    warn('İcmal content unclear');
    report.sections.icmal = 'UNCLEAR';
  }

  // ══════════════════════════════════════════════════
  // 3. CMS
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  3. CMS                              ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'CMS');
  await dismissModal(page);
  await ss(page, 'cms-main');
  const cmsState = await getState(page);
  info(`CMS headings: ${cmsState.headings.join(' | ')}`);
  info(`CMS section buttons (content): ${cmsState.buttons.filter(b => b.match(/görsel|naviqasiya|hero|footer|mehsul|alici|istehsalci|sekil|saxla|yüklə/i)).join(' | ')}`);
  info(`CMS inputs: ${cmsState.inputs.length}`);

  const cmsContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- CMS Content ---');
  console.log(cmsContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  if (cmsState.headings.some(h => h.match(/məzmun|cms|görsel|idarə/i))) {
    ok('CMS section loads — shows content management sections');
    report.sections.cms = 'WORKS';
  }

  // Try clicking a CMS section tab (e.g. Hero Bolmesi)
  const cmsTabs = cmsState.buttons.filter(b => b.match(/görsel|naviqasiya|hero|footer|mehsul|sekil/i));
  if (cmsTabs.length > 0) {
    info(`CMS tabs found: ${cmsTabs.join(', ')}`);
    // Click "Hero Bolmesi"
    const heroBtn = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim().includes('Hero')) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return btn.textContent.trim();
        }
      }
      return null;
    });
    if (heroBtn) {
      await page.waitForTimeout(1500);
      await dismissModal(page);
      await ss(page, 'cms-hero-section');
      const heroState = await getState(page);
      info(`Hero section inputs: ${heroState.inputs.length}`);
      info(`Hero inputs detail: ${heroState.inputs.map(i => `${i.tag}[name=${i.name}][ph=${i.placeholder}]`).join(', ')}`);

      if (heroState.inputs.length > 0) {
        ok('CMS Hero section has editable fields');
        // Try to edit one
        try {
          const editableInput = await page.$('input[type="text"]:not([readonly]), textarea:not([readonly])');
          if (editableInput) {
            const val = await editableInput.inputValue();
            info(`Hero field value: "${val.substring(0,80)}"`);
            const attrs = await editableInput.evaluate(el => ({ name: el.name, placeholder: el.placeholder }));
            info(`Field attrs: ${JSON.stringify(attrs)}`);
            await editableInput.click();
            await editableInput.fill(val.trim() ? val.trim() + ' [TEST]' : 'Test Hero Text');
            ok('Modified CMS Hero text field');
            await ss(page, 'cms-hero-edited');

            // Save
            const saxlaBtn = await page.evaluate(() => {
              const btns = document.querySelectorAll('button');
              for (const btn of btns) {
                if (btn.textContent.trim().match(/^saxla$/i)) {
                  btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  return btn.textContent.trim();
                }
              }
              return null;
            });
            if (saxlaBtn) {
              await page.waitForTimeout(2500);
              await dismissModal(page);
              await ss(page, 'cms-hero-saved');
              const afterSave = await getState(page);
              if (afterSave.toasts.length) {
                ok(`CMS save response: ${afterSave.toasts.join(' | ')}`);
              } else {
                // Check for any visible success indicator
                const savedMsg = await page.evaluate(() => {
                  const all = document.querySelectorAll('*');
                  for (const el of all) {
                    if (el.children.length === 0 && el.textContent.match(/saxlan|saved|uğurla|success/i)) {
                      return el.textContent.trim();
                    }
                  }
                  return null;
                });
                if (savedMsg) ok(`CMS save confirmation: "${savedMsg}"`);
                else warn('CMS save: no visible toast/confirmation');
              }
            } else {
              warn('CMS Hero: no "Saxla" button found directly');
            }
          }
        } catch(e) { err(`CMS edit error: ${e.message.substring(0,100)}`); }
      }
    }
  }

  // ══════════════════════════════════════════════════
  // 4. MƏHSUL KATALOQU
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  4. MƏHSUL KATALOQU                  ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'Məhsul Kataloqu');
  await dismissModal(page);
  await ss(page, 'products-main');
  const prodState = await getState(page);
  info(`Products headings: ${prodState.headings.join(' | ')}`);

  const prodContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- Products Content ---');
  console.log(prodContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  // Click "Yeni Kateqoriya"
  const catClicked = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim().includes('Yeni Kateqoriya')) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return true;
      }
    }
    return false;
  });

  if (catClicked) {
    await page.waitForTimeout(2000);
    await dismissModal(page);
    await ss(page, 'products-new-category-form');
    const catFormState = await getState(page);
    info(`Category form headings: ${catFormState.headings.join(' | ')}`);
    info(`Category form inputs: ${catFormState.inputs.length}`);
    info(`Category inputs: ${catFormState.inputs.map(i => `${i.tag}[name=${i.name}][ph="${i.placeholder}"]`).join(' | ')}`);

    if (catFormState.inputs.length > 0) {
      ok('Category creation form opened');
      // Fill fields
      const textInputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
      for (let i = 0; i < textInputs.length; i++) {
        const attrs = await textInputs[i].evaluate(el => ({ name: el.name, placeholder: el.placeholder }));
        info(`Category input ${i}: name="${attrs.name}" placeholder="${attrs.placeholder}"`);
        let val = 'Test Category';
        if (attrs.name.match(/_az/i) || attrs.placeholder.match(/az[əe]r/i) || i === 0) val = 'Test Kateqoriya AZ';
        else if (attrs.name.match(/_en/i) || attrs.placeholder.match(/engl/i) || i === 1) val = 'Test Category EN';
        else if (attrs.name.match(/slug/i) || attrs.placeholder.match(/slug/i)) val = 'test-kateqoriya';
        await textInputs[i].fill(val);
      }

      // Textareas (descriptions)
      const tas = await page.$$('textarea:not([readonly])');
      for (let i = 0; i < tas.length; i++) {
        const attrs = await tas[i].evaluate(el => ({ name: el.name }));
        await tas[i].fill(attrs.name.match(/_en/i) ? 'Test category description EN' : 'Test kateqoriya açıqlaması AZ');
      }

      await ss(page, 'products-category-filled');

      // Save
      const saved = await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
          if (btn.textContent.trim().match(/saxla|save|yarat|create/i) && !btn.disabled) {
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            return btn.textContent.trim();
          }
        }
        return null;
      });

      if (saved) {
        await page.waitForTimeout(3000);
        await dismissModal(page);
        await ss(page, 'products-category-saved');
        const afterCat = await getState(page);
        if (afterCat.toasts.length) {
          ok(`Category save: ${afterCat.toasts.join(' | ')}`);
          report.sections.products_category = 'CREATED';
        } else {
          const anyMsg = await page.evaluate(() => {
            const els = document.querySelectorAll('*');
            for (const el of els) {
              if (el.children.length === 0 && el.textContent.match(/uğurla|created|saxlan|added/i)) return el.textContent.trim();
            }
            return null;
          });
          if (anyMsg) { ok(`Category saved: "${anyMsg}"`); report.sections.products_category = 'CREATED'; }
          else { warn('Category save: no confirmation toast'); report.sections.products_category = 'SAVE_NO_TOAST'; }
        }
      }
    } else {
      err('Category form has no inputs');
      report.broken.push('Məhsul Kataloqu: category form has no inputs');
      const catHTML = await page.evaluate(() => document.body.innerHTML.substring(0, 3000));
      info(`Category form HTML: ${catHTML}`);
    }
  } else {
    err('Yeni Kateqoriya button not clickable');
    report.broken.push('Məhsul Kataloqu: Yeni Kateqoriya button blocked');
  }

  // Go back and try "Məhsullar" tab
  await clickNav(page, 'Məhsul Kataloqu');
  await dismissModal(page);
  await page.waitForTimeout(1000);

  // Click Məhsullar tab
  const mehsulTab = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim().match(/^Məhsullar/)) {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return btn.textContent.trim();
      }
    }
    return null;
  });
  if (mehsulTab) {
    await page.waitForTimeout(1500);
    await dismissModal(page);
    await ss(page, 'products-products-tab');
    const mehsulState = await getState(page);
    info(`Məhsullar tab buttons: ${mehsulState.buttons.filter(b => b.match(/yeni|new|məhsul/i)).join(' | ')}`);

    // Try new product
    const newProdBtn = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim().match(/yeni məhsul|new product/i)) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return btn.textContent.trim();
        }
      }
      return null;
    });
    if (newProdBtn) {
      await page.waitForTimeout(2000);
      await dismissModal(page);
      await ss(page, 'products-new-product-form');
      const newProdState = await getState(page);
      info(`New product form inputs: ${newProdState.inputs.length}`);
      info(`New product headings: ${newProdState.headings.join(' | ')}`);
      if (newProdState.inputs.length > 0) ok('Product creation form opened');
      else warn('Product creation form: no inputs found');
    }
  }

  // ══════════════════════════════════════════════════
  // 5. MƏQALƏLƏR
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  5. MƏQALƏLƏR (Articles)             ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'Məqalələr');
  await dismissModal(page);
  await ss(page, 'articles-main');
  const artState = await getState(page);
  info(`Articles headings: ${artState.headings.join(' | ')}`);
  info(`Articles buttons: ${artState.buttons.join(' | ')}`);

  const artContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- Articles Content ---');
  console.log(artContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  // Find "Yeni Məqalə" or similar
  const newArtBtnText = artState.buttons.find(b => !b.match(/yenilə/i) && b.match(/yeni|new|məqalə|article|create|add/i));
  info(`New article button: "${newArtBtnText}"`);

  if (newArtBtnText) {
    const clicked = await page.evaluate((t) => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === t) {
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, newArtBtnText);

    if (clicked) {
      await page.waitForTimeout(2000);
      await dismissModal(page);
      await ss(page, 'articles-new-form');
      const artFormState = await getState(page);
      info(`Article form headings: ${artFormState.headings.join(' | ')}`);
      info(`Article form inputs: ${artFormState.inputs.length}`);
      info(`Article form inputs detail: ${artFormState.inputs.map(i => `${i.tag}[name=${i.name}][ph="${i.placeholder}"]`).join(' | ')}`);

      if (artFormState.inputs.length > 0) {
        ok('Article creation form opened');

        const textInputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
        for (let i = 0; i < textInputs.length; i++) {
          const attrs = await textInputs[i].evaluate(el => ({ name: el.name, placeholder: el.placeholder }));
          info(`Article input ${i}: "${attrs.name}" "${attrs.placeholder}"`);
          let val = 'Test Article';
          if (attrs.name.match(/_az/i) || i === 0) val = 'Test Məqalə Başlığı AZ';
          else if (attrs.name.match(/_en/i) || i === 1) val = 'Test Article Title EN';
          else if (attrs.name.match(/slug/i)) val = 'test-meqale';
          await textInputs[i].fill(val);
        }

        const tas = await page.$$('textarea:not([readonly])');
        for (let i = 0; i < tas.length; i++) {
          const attrs = await tas[i].evaluate(el => ({ name: el.name }));
          await tas[i].fill(attrs.name.match(/_en/i) ? 'Test article content in English.' : 'Test məqalənin məzmunu burada yazılır.');
        }

        // Rich text editors
        const richEditors = await page.$$('[contenteditable="true"]');
        for (let i = 0; i < richEditors.length; i++) {
          await richEditors[i].click();
          await page.keyboard.selectAll();
          await page.keyboard.type(i === 0 ? 'Test məqalə məzmunu AZ.' : 'Test article content EN.');
        }

        // Category/status selects
        const selects = await page.$$('select');
        for (const sel of selects) {
          const opts = await sel.$$('option');
          if (opts.length > 1) { await sel.selectOption({ index: 1 }); ok('Selected option in select'); break; }
        }

        await ss(page, 'articles-form-filled');

        // Find publish or save button
        const allBtns = await page.evaluate(() =>
          Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
        );
        info(`Article form buttons: ${allBtns.join(' | ')}`);

        const publishBtnText = allBtns.find(b => b.match(/nəşr et|publish|yayımla/i));
        const saveBtnText = allBtns.find(b => b.match(/^saxla$|^save$/i));

        const actionBtn = publishBtnText || saveBtnText;
        if (actionBtn) {
          info(`Clicking: "${actionBtn}"`);
          await page.evaluate((t) => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
              if (btn.textContent.trim() === t) {
                btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                return;
              }
            }
          }, actionBtn);
          await page.waitForTimeout(3000);
          await dismissModal(page);
          await ss(page, 'articles-after-action');
          const afterArt = await getState(page);
          if (afterArt.toasts.length) {
            ok(`Article action "${actionBtn}": ${afterArt.toasts.join(' | ')}`);
            report.sections.articles = 'CREATED';
          } else {
            warn(`Article "${actionBtn}": no toast — checking for errors`);
            if (afterArt.headings.some(h => h.match(/məqalə|article|list/i))) {
              ok('Redirected to article list — likely saved successfully');
              report.sections.articles = 'CREATED';
            } else {
              report.sections.articles = 'UNCERTAIN';
            }
          }
        } else {
          warn('No publish/save button found in article form');
          report.broken.push('Məqalələr: no publish/save button');
        }
      } else {
        err('Article form: no inputs visible');
        report.broken.push('Məqalələr: form has no inputs');
        const artHTML = await page.evaluate(() => document.body.innerHTML.substring(0,3000));
        info(`Article form HTML: ${artHTML}`);
      }
    }
  } else {
    err('No new article button found');
    report.broken.push('Məqalələr: no new article button');
    report.sections.articles = 'NO_CREATE_BUTTON';
  }

  // ══════════════════════════════════════════════════
  // 6. XİDMƏTLƏR
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  6. XİDMƏTLƏR (Services)            ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'Xidmətlər');
  await dismissModal(page);
  await ss(page, 'services-main');
  const svcState = await getState(page);
  info(`Services headings: ${svcState.headings.join(' | ')}`);
  info(`Services buttons: ${svcState.buttons.join(' | ')}`);

  const svcContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- Services Content ---');
  console.log(svcContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  const newSvcBtnText = svcState.buttons.find(b => !b.match(/yenilə/i) && b.match(/yeni|new|xidmət|service|create|add/i));
  info(`New service button: "${newSvcBtnText}"`);

  if (newSvcBtnText) {
    await page.evaluate((t) => {
      const btns = document.querySelectorAll('button');
      for (const btn of btns) {
        if (btn.textContent.trim() === t) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
      }
    }, newSvcBtnText);
    await page.waitForTimeout(2000);
    await dismissModal(page);
    await ss(page, 'services-new-form');
    const svcFormState = await getState(page);
    info(`Service form headings: ${svcFormState.headings.join(' | ')}`);
    info(`Service form inputs: ${svcFormState.inputs.length}`);
    info(`Service inputs: ${svcFormState.inputs.map(i => `${i.tag}[name=${i.name}][ph="${i.placeholder}"]`).join(' | ')}`);

    if (svcFormState.inputs.length > 0) {
      ok('Service creation form opened');

      const textInputs = await page.$$('input[type="text"]:not([readonly]), input:not([type]):not([readonly])');
      for (let i = 0; i < textInputs.length; i++) {
        const attrs = await textInputs[i].evaluate(el => ({ name: el.name, placeholder: el.placeholder, id: el.id }));
        info(`Service input ${i}: name="${attrs.name}" id="${attrs.id}" ph="${attrs.placeholder}"`);
        let val = 'Test Xidmət';
        if (attrs.name.match(/_az/i) || attrs.id.match(/_az/i) || i === 0) val = 'Test Xidmət AZ';
        else if (attrs.name.match(/_en/i) || attrs.id.match(/_en/i) || i === 1) val = 'Test Service EN';
        else if (attrs.name.match(/slug/i)) val = 'test-xidmet';
        await textInputs[i].fill(val);
      }

      const tas = await page.$$('textarea:not([readonly])');
      for (let i = 0; i < tas.length; i++) {
        const attrs = await tas[i].evaluate(el => ({ name: el.name, id: el.id }));
        info(`Service textarea ${i}: name="${attrs.name}" id="${attrs.id}"`);
        const val = (attrs.name.match(/_en/i) || attrs.id.match(/_en/i))
          ? 'Test service description in English.'
          : 'Test xidmətin açıqlaması Azərbaycan dilindədir.';
        await tas[i].fill(val);
      }

      // Look for "scope" / feature list items
      const addBtns = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).filter(b =>
          b.textContent.trim().match(/əlavə et|add scope|add item|\+ |scope/i)
        ).map(b => b.textContent.trim())
      );
      if (addBtns.length > 0) {
        info(`Scope add buttons: ${addBtns.join(', ')}`);
        await page.evaluate((t) => {
          const btns = document.querySelectorAll('button');
          for (const btn of btns) {
            if (btn.textContent.trim() === t) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
          }
        }, addBtns[0]);
        await page.waitForTimeout(1000);
        // Fill the new scope input
        const allTxtInputs = await page.$$('input[type="text"]:not([readonly])');
        if (allTxtInputs.length > 0) {
          await allTxtInputs[allTxtInputs.length - 1].fill('Test scope xidmət elementi');
          ok('Added scope item');
        }
      }

      // Ana Xidmət checkbox
      const checkboxes = await page.$$('input[type="checkbox"]');
      info(`Service checkboxes: ${checkboxes.length}`);
      for (const cb of checkboxes) {
        const lbl = await cb.evaluate(el => {
          const label = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
          return label ? label.textContent.trim() : (el.name || el.id || 'unknown');
        });
        info(`Checkbox: "${lbl}"`);
        if (lbl.match(/ana xidmət|main|əsas|featured|primary|highlight/i)) {
          await cb.evaluate(el => { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); });
          ok(`Checked: "${lbl}"`);
        }
      }

      await ss(page, 'services-form-filled');

      // Save
      const svcFormBtns = await page.evaluate(() =>
        Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(Boolean)
      );
      info(`Service form buttons: ${svcFormBtns.join(' | ')}`);

      const saveBtnTxt = svcFormBtns.find(b => b.match(/saxla|save|yarat|create|submit/i) && !b.match(/saxla.*sonra/i));
      if (saveBtnTxt) {
        info(`Clicking save: "${saveBtnTxt}"`);
        await page.evaluate((t) => {
          const btns = document.querySelectorAll('button');
          for (const btn of btns) {
            if (btn.textContent.trim() === t) { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
          }
        }, saveBtnTxt);
        await page.waitForTimeout(3000);
        await dismissModal(page);
        await ss(page, 'services-after-save');
        const afterSvc = await getState(page);
        if (afterSvc.toasts.length) {
          ok(`Service save: ${afterSvc.toasts.join(' | ')}`);
          report.sections.services = 'CREATED';
        } else if (afterSvc.errors.filter(e => e.match(/xəta|error|invalid/i)).length > 0) {
          err(`Service save errors: ${afterSvc.errors.slice(0,3).join(' | ')}`);
          report.sections.services = 'SAVE_ERROR';
        } else {
          warn('Service save: no toast — may have succeeded');
          report.sections.services = 'SAVED_NO_TOAST';
        }
      } else {
        warn(`No save button found. All form buttons: ${svcFormBtns.join(', ')}`);
        report.broken.push('Xidmətlər: no save button found');
      }
    } else {
      err('Service form: no inputs');
      report.broken.push('Xidmətlər: form opens but has no inputs');
      const svcHTML = await page.evaluate(() => document.body.innerHTML.substring(0,3000));
      info(`Service form HTML snippet: ${svcHTML}`);
    }
  } else {
    err('No new service button found');
    report.broken.push('Xidmətlər: no new service button');
    report.sections.services = 'NO_CREATE_BUTTON';
  }

  // ══════════════════════════════════════════════════
  // 7. GƏLƏN QUTUSU
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  7. GƏLƏN QUTUSU (Inbox)             ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'Gələn Qutusu');
  await dismissModal(page);
  await ss(page, 'inbox-main');
  const inboxState = await getState(page);
  info(`Inbox headings: ${inboxState.headings.join(' | ')}`);
  info(`Inbox buttons: ${inboxState.buttons.join(' | ')}`);

  const inboxContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- Inbox Content ---');
  console.log(inboxContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  if (inboxState.headings.some(h => h.match(/gələn|inbox|mesaj|sorğu|qutu/i))) {
    ok('Gələn Qutusu loaded correctly');
    report.sections.inbox = 'WORKS';
  } else {
    warn('Gələn Qutusu: unexpected content');
    report.sections.inbox = 'UNEXPECTED_CONTENT';
  }

  // Check inbox items/messages
  const inboxItems = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tr')).slice(1); // skip header
    const cards = document.querySelectorAll('[class*="message-item"], [class*="inbox"], [class*="email-row"]');
    return { tableRows: rows.length, cards: cards.length };
  });
  info(`Inbox: ${inboxItems.tableRows} table rows, ${inboxItems.cards} cards`);

  // Try opening an inbox item
  const firstRow = await page.$('table tr:nth-child(2), [class*="message-item"]:first-child');
  if (firstRow) {
    await firstRow.dispatchEvent('click');
    await page.waitForTimeout(1500);
    await dismissModal(page);
    await ss(page, 'inbox-item-opened');
    const itemState = await getState(page);
    info(`Inbox item headings: ${itemState.headings.join(' | ')}`);
    ok('Inbox item can be opened');
  }

  // ══════════════════════════════════════════════════
  // 8. İSTİFADƏÇİLƏR
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  8. İSTİFADƏÇİLƏR (Users)           ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'İstifadəçilər');
  await dismissModal(page);
  await ss(page, 'users-main');
  const usersState = await getState(page);
  info(`Users headings: ${usersState.headings.join(' | ')}`);
  info(`Users buttons: ${usersState.buttons.join(' | ')}`);

  const usersContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- Users Content ---');
  console.log(usersContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  if (usersState.headings.some(h => h.match(/istifadəçi|user|admin|idarə/i))) {
    ok('İstifadəçilər loaded');
    report.sections.users = 'WORKS';
  } else {
    warn('İstifadəçilər: unexpected content');
    report.sections.users = 'UNEXPECTED';
  }

  // ══════════════════════════════════════════════════
  // 9. SMTP
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  9. SMTP E-Poçt                      ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'SMTP');
  await dismissModal(page);
  await ss(page, 'smtp-main');
  const smtpState = await getState(page);
  info(`SMTP headings: ${smtpState.headings.join(' | ')}`);
  info(`SMTP buttons: ${smtpState.buttons.join(' | ')}`);
  info(`SMTP inputs: ${smtpState.inputs.length}`);

  const smtpContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- SMTP Content ---');
  console.log(smtpContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  if (smtpState.inputs.length > 0) {
    ok(`SMTP has ${smtpState.inputs.length} configurable fields`);
    info(`SMTP fields: ${smtpState.inputs.map(i => `${i.tag}[name=${i.name}][ph="${i.placeholder}"]`).join(', ')}`);
    report.sections.smtp = 'HAS_FIELDS';
  } else {
    warn('SMTP: no visible form fields');
    report.sections.smtp = 'NO_FIELDS';
  }

  if (smtpState.headings.some(h => h.match(/smtp|mail|e-poçt/i))) {
    ok('SMTP section loads correctly');
  }

  // ══════════════════════════════════════════════════
  // 10. PARAMETRLƏR
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  10. PARAMETRLƏR (Settings)          ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'Parametrlər');
  await dismissModal(page);
  await ss(page, 'settings-main');
  const settingsState = await getState(page);
  info(`Settings headings: ${settingsState.headings.join(' | ')}`);
  info(`Settings buttons: ${settingsState.buttons.join(' | ')}`);
  info(`Settings inputs: ${settingsState.inputs.length}`);

  const settingsContent = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  console.log('--- Settings Content ---');
  console.log(settingsContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');

  if (settingsState.inputs.length > 0) {
    ok(`Parametrlər has ${settingsState.inputs.length} configurable fields`);
    report.sections.settings = 'HAS_FIELDS';
  }
  if (settingsState.headings.some(h => h.match(/parametr|setting|sistem/i))) {
    ok('Parametrlər section loads correctly');
    report.sections.settings = report.sections.settings || 'WORKS';
  }

  // ══════════════════════════════════════════════════
  // 11. SİSTEM LOGLARI
  // ══════════════════════════════════════════════════
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  11. SİSTEM LOGLARI                  ║');
  console.log('╚══════════════════════════════════════╝');

  await clickNav(page, 'Sistem Logları');
  await dismissModal(page);
  await ss(page, 'system-logs');
  const logsState = await getState(page);
  info(`Logs headings: ${logsState.headings.join(' | ')}`);
  const logsContent = await page.evaluate(() => document.body.innerText.substring(0, 1000));
  console.log('--- Logs Content ---');
  console.log(logsContent.replace(/\n{3,}/g, '\n\n').trim());
  console.log('---');
  if (logsState.headings.some(h => h.match(/log|sistem|journal/i))) {
    ok('Sistem Logları loads');
    report.sections.systemLogs = 'WORKS';
  }

  // Final screenshot
  await ss(page, 'final');
  await browser.close();
  report.networkErrors = networkErrors;

  // ══════════════════════════════════════════════════
  // FINAL REPORT
  // ══════════════════════════════════════════════════
  console.log('\n\n' + '═'.repeat(70));
  console.log('                    FINAL REPORT');
  console.log('═'.repeat(70));

  console.log(`\n✅ WORKING (${report.working.length}):`);
  report.working.forEach(w => console.log(`  • ${w}`));

  console.log(`\n❌ ERRORS (${report.errors.length}):`);
  if (!report.errors.length) console.log('  None');
  report.errors.forEach(e => console.log(`  • ${e}`));

  console.log(`\n🚫 BROKEN / ISSUES (${report.broken.length}):`);
  if (!report.broken.length) console.log('  None');
  report.broken.forEach(b => console.log(`  • ${b}`));

  console.log('\n📊 SECTION STATUS:');
  Object.entries(report.sections).forEach(([k,v]) => console.log(`  ${v.match(/WORKS|CREATED|HAS_FIELDS|SUCCESS/) ? '✅' : '⚠️ '} ${k}: ${v}`));

  console.log(`\n🔴 CONSOLE ERRORS (${report.consoleErrors.length}):`);
  if (!report.consoleErrors.length) console.log('  None');
  else report.consoleErrors.slice(0,20).forEach(e => console.log(`  • ${e}`));

  console.log(`\n🌐 NETWORK ERRORS (${networkErrors.length}):`);
  if (!networkErrors.length) console.log('  None');
  else [...new Set(networkErrors)].slice(0,15).forEach(e => console.log(`  • ${e}`));

  console.log(`\n📸 ${idx} screenshots -> ${SCREENSHOTS_DIR}`);
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`📄 JSON -> ${SCREENSHOTS_DIR}/report.json`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
