const { chromium } = require('/mnt/c/project/nwk/private/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'DZTdOcGn2Lu');
const STATE = path.join(__dirname, '.ig_state.json');
const LOGIN = path.join(__dirname, '.ig_login');
const POST = 'https://www.instagram.com/p/DZTdOcGn2Lu/';
const EXEC = '/home/mini531/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ['--no-sandbox'] });
  const ctxOpts = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'ko-KR',
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  };
  if (fs.existsSync(STATE)) ctxOpts.storageState = STATE;
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();

  // --- login if no saved session ---
  if (!fs.existsSync(STATE)) {
    if (!fs.existsSync(LOGIN)) { console.log('NO_LOGIN_FILE'); process.exit(2); }
    const lines = fs.readFileSync(LOGIN, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
    const [id, pw] = lines;
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);
    try { await page.click('button:has-text("허용"), button:has-text("Allow")', { timeout: 3000 }); } catch {}
    const userSel = (await page.$('input[name="username"]')) ? 'input[name="username"]' : 'input[name="email"]';
    const passSel = (await page.$('input[name="password"]')) ? 'input[name="password"]' : 'input[name="pass"]';
    await page.fill(userSel, id);
    await page.fill(passSel, pw);
    // submit: try visible role-button, else press Enter
    let clicked = false;
    for (const sel of ['div[role="button"]:has-text("로그인")', 'div[role="button"]:has-text("Log in")', 'button:has-text("로그인")']) {
      const el = await page.$(sel);
      if (el && (await el.isVisible().catch(() => false))) { await el.click().catch(() => {}); clicked = true; break; }
    }
    if (!clicked) { await page.focus(passSel); await page.keyboard.press('Enter'); }
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await sleep(8000);
    // possible checkpoint / 2FA
    if (/challenge|two_factor|login/.test(page.url())) {
      await page.screenshot({ path: path.join(OUT, '_login_blocked.png'), fullPage: true });
      console.log('LOGIN_NEEDS_VERIFICATION url=' + page.url());
      await browser.close();
      process.exit(3);
    }
    await ctx.storageState({ path: STATE });
    console.log('LOGIN_OK session saved');
  }

  // --- open post ---
  await page.goto(POST, { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(4000);
  try { await page.keyboard.press('Escape'); } catch {}
  await sleep(1000);

  // figure out total slides from dots
  const dots = await page.evaluate(() => {
    const c = document.querySelectorAll('div._acnb, ._acnb').length;
    return c;
  });
  console.log('DOT_COUNT_GUESS:', dots);

  const seen = new Set();
  let idx = 0;
  const MAX = 15;
  for (let i = 0; i < MAX; i++) {
    await sleep(900);
    // capture the largest article image element
    const shot = path.join(OUT, `panel_${String(idx + 1).padStart(2, '0')}.png`);
    // find main carousel image bounding box
    const box = await page.evaluate(() => {
      let best = null, area = 0;
      document.querySelectorAll('article img, div[role="presentation"] img, img').forEach((im) => {
        const r = im.getBoundingClientRect();
        const a = r.width * r.height;
        if (a > area && r.width > 300 && r.height > 300 && /scontent/.test(im.currentSrc || im.src)) { area = a; best = r; }
      });
      return best ? { x: best.x, y: best.y, w: best.width, h: best.height, src: null } : null;
    });
    if (box) {
      await page.screenshot({ path: shot, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h } });
      console.log('saved', shot);
      idx++;
    }
    // click next
    const next = await page.$('button[aria-label="다음"], button[aria-label="Next"]');
    if (!next) { console.log('no next button -> end'); break; }
    const before = await page.evaluate(() => {
      let s = '';
      document.querySelectorAll('article img').forEach((im) => { if ((im.currentSrc||im.src).includes('scontent')) s += (im.currentSrc||im.src).slice(-30); });
      return s;
    });
    try { await next.click(); } catch { break; }
    await sleep(1200);
    const after = await page.evaluate(() => {
      let s = '';
      document.querySelectorAll('article img').forEach((im) => { if ((im.currentSrc||im.src).includes('scontent')) s += (im.currentSrc||im.src).slice(-30); });
      return s;
    });
    if (before === after) { console.log('no change -> reached end'); break; }
  }

  await page.screenshot({ path: path.join(OUT, '_post_full.png'), fullPage: true });
  console.log('TOTAL_PANELS:', idx);
  await browser.close();
})();
