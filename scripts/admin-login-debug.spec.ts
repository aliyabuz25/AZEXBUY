import { test, expect, Page } from '@playwright/test';

const BASE = 'https://beta.azexbuy.com';
const ADMIN = `${BASE}/octo-admin`;

test.setTimeout(120000);

test('Login Flow Debug', async ({ page, context }) => {
  const networkLog: { url: string; status: number; method: string; body?: string }[] = [];

  // Capture ALL requests and responses
  page.on('request', req => {
    if (req.url().includes('/api/') || req.url().includes('/auth') || req.url().includes('/login')) {
      console.log(`REQ: ${req.method()} ${req.url()}`);
      const body = req.postData();
      if (body) console.log(`  BODY: ${body.substring(0, 200)}`);
    }
  });

  page.on('response', async resp => {
    const url = resp.url();
    if (url.includes('/api/') || url.includes('/auth') || url.includes('/login')) {
      let body = '';
      try { body = await resp.text(); } catch {}
      console.log(`RESP: ${resp.status()} ${url}`);
      if (body) console.log(`  BODY: ${body.substring(0, 300)}`);
      networkLog.push({ url, status: resp.status(), method: resp.request().method(), body: body.substring(0, 200) });
    }
  });

  page.on('console', msg => {
    console.log(`CONSOLE[${msg.type()}]: ${msg.text()}`);
  });

  // ── Step 1: Load the admin panel ─────────────────────────────────────────
  console.log('\n=== STEP 1: Load admin panel ===');
  await page.goto(`${ADMIN}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('URL after goto:', page.url());
  await page.screenshot({ path: 'scripts/screenshots/login-01-initial.png', fullPage: true });

  // ── Step 2: Inspect the login page DOM ───────────────────────────────────
  console.log('\n=== STEP 2: Inspect login form ===');
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('Body HTML (1500):', bodyHTML.substring(0, 1500));

  const inputs = await page.locator('input').all();
  console.log(`Found ${inputs.length} inputs:`);
  for (const inp of inputs) {
    const type = await inp.getAttribute('type') || 'text';
    const name = await inp.getAttribute('name') || '';
    const id = await inp.getAttribute('id') || '';
    const placeholder = await inp.getAttribute('placeholder') || '';
    console.log(`  input type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`);
  }

  const forms = await page.locator('form').all();
  console.log(`Found ${forms.length} forms`);
  for (const form of forms) {
    const action = await form.getAttribute('action') || '';
    const method = await form.getAttribute('method') || '';
    console.log(`  form action="${action}" method="${method}"`);
  }

  // ── Step 3: Try to login ──────────────────────────────────────────────────
  console.log('\n=== STEP 3: Attempt login ===');

  // The page might redirect to /login
  if (page.url().includes('login') || await page.locator('input[type="password"]').isVisible({ timeout: 3000 }).catch(() => false)) {
    const usernameInput = page.locator('input[type="text"], input[type="email"], input[name="username"], input[name="user"], input[id="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    console.log('Username field visible:', await usernameInput.isVisible({ timeout: 1000 }).catch(() => false));
    console.log('Password field visible:', await passwordInput.isVisible({ timeout: 1000 }).catch(() => false));

    await usernameInput.fill('admin');
    await passwordInput.fill('admin');

    await page.screenshot({ path: 'scripts/screenshots/login-02-filled.png', fullPage: true });

    // Find and click submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Giriş"), button:has-text("Daxil"), button:has-text("Login"), button:has-text("Giris")').first();
    console.log('Submit button text:', await submitBtn.textContent().catch(() => 'not found'));

    await submitBtn.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
  } else {
    console.log('No login form found, already logged in? URL:', page.url());
  }

  console.log('URL after login attempt:', page.url());
  await page.screenshot({ path: 'scripts/screenshots/login-03-after.png', fullPage: true });

  // ── Step 4: Check cookies ─────────────────────────────────────────────────
  console.log('\n=== STEP 4: Check cookies ===');
  const cookies = await context.cookies();
  console.log('Cookies:');
  cookies.forEach(c => console.log(`  ${c.name}=${c.value.substring(0, 50)} (domain=${c.domain}, path=${c.path})`));

  // ── Step 5: Check localStorage / sessionStorage ───────────────────────────
  console.log('\n=== STEP 5: Check localStorage ===');
  const storage = await page.evaluate(() => {
    const ls: Record<string, string> = {};
    const ss: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      ls[key] = localStorage.getItem(key)?.substring(0, 100) || '';
    }
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)!;
      ss[key] = sessionStorage.getItem(key)?.substring(0, 100) || '';
    }
    return { localStorage: ls, sessionStorage: ss };
  });
  console.log('localStorage:', JSON.stringify(storage.localStorage, null, 2));
  console.log('sessionStorage:', JSON.stringify(storage.sessionStorage, null, 2));

  // ── Step 6: Navigate to a protected page ─────────────────────────────────
  console.log('\n=== STEP 6: Navigate to dashboard ===');
  await page.goto(`${ADMIN}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  console.log('Dashboard URL:', page.url());
  await page.screenshot({ path: 'scripts/screenshots/login-04-dashboard.png', fullPage: true });

  const dashHTML = await page.locator('#root').innerHTML();
  console.log('Root div HTML (2000):', dashHTML.substring(0, 2000));

  // ── Step 7: Try navigating via sidebar click ──────────────────────────────
  console.log('\n=== STEP 7: Try sidebar navigation ===');

  // Find CMS button in sidebar and click it
  const cmsBtn = page.locator('button:has-text("CMS"), button:has-text("Məzmun"), a:has-text("CMS")').first();
  if (await cmsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cmsBtn.click();
    await page.waitForTimeout(1000);
    console.log('After clicking CMS, URL:', page.url());
    await page.screenshot({ path: 'scripts/screenshots/login-05-cms-click.png', fullPage: true });

    const afterCmsHTML = await page.locator('#root').innerHTML();
    console.log('After CMS click root HTML (2000):', afterCmsHTML.substring(0, 2000));
  }

  // ── Step 8: Check the actual main content area ────────────────────────────
  console.log('\n=== STEP 8: Inspect main content area ===');
  await page.goto(`${ADMIN}/cms/hero`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const mainArea = await page.evaluate(() => {
    // Find the main content div (not sidebar)
    const aside = document.querySelector('aside');
    const main = document.querySelector('main') ||
                 document.querySelector('[class*="content"]') ||
                 document.querySelector('[class*="main"]');

    return {
      hasMain: !!main,
      mainClass: main?.className?.substring(0, 100),
      mainHTML: main?.innerHTML?.substring(0, 1000),
      asideClass: aside?.className?.substring(0, 100),
      rootChildren: Array.from(document.getElementById('root')?.children || []).map(el => ({
        tag: el.tagName,
        class: el.className.substring(0, 60),
      })),
    };
  });
  console.log('Main area analysis:', JSON.stringify(mainArea, null, 2));

  // ── Step 9: Try a direct API call ────────────────────────────────────────
  console.log('\n=== STEP 9: Direct API calls ===');

  // Try the CMS API
  const apiResponse = await page.evaluate(async (adminUrl) => {
    try {
      const r = await fetch(`${adminUrl.replace('/octo-admin', '')}/api/cms/hero`, {
        credentials: 'include',
      });
      return { status: r.status, body: await r.text() };
    } catch (e: any) {
      return { error: e.message };
    }
  }, ADMIN);
  console.log('API /api/cms/hero:', JSON.stringify(apiResponse));

  const apiResponse2 = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/auth/me', { credentials: 'include' });
      return { status: r.status, body: await r.text() };
    } catch (e: any) {
      return { error: e.message };
    }
  });
  console.log('API /api/auth/me:', JSON.stringify(apiResponse2));

  const apiResponse3 = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/admin/cms', { credentials: 'include' });
      return { status: r.status, body: await r.text() };
    } catch (e: any) {
      return { error: e.message };
    }
  });
  console.log('API /api/admin/cms:', JSON.stringify(apiResponse3));

  expect(true).toBe(true);
});
