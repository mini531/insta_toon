const { chromium } = require('/mnt/c/project/nwk/private/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'DZTdOcGn2Lu');
const STATE = path.join(__dirname, '.ig_state.json');
const EXEC = '/home/mini531/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ executablePath: EXEC, headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ storageState: STATE, locale: 'ko-KR', viewport: { width: 1100, height: 1300 }, deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto('https://www.instagram.com/p/DZTdOcGn2Lu/', { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(4000);
  try { await page.keyboard.press('Escape'); } catch {}
  await sleep(1000);

  const total = 10;
  for (let i = 1; i <= total; i++) {
    await sleep(1100);
    // locate the largest carousel image (the one currently centered, fully in view)
    const box = await page.evaluate(() => {
      let best = null, score = -1e9;
      const vw = window.innerWidth;
      // main carousel lives near top of page; suggestion grid sits lower (y>700)
      document.querySelectorAll('img').forEach((im) => {
        const r = im.getBoundingClientRect();
        if (r.width < 400 || r.height < 400) return;     // main slide ~479x599
        if (r.y > 700) return;                            // exclude "more posts" grid
        if (!/scontent/.test(im.currentSrc || im.src)) return;
        if (r.x < -5 || r.x + r.width > vw + 5) return;   // fully visible only
        const cx = r.x + r.width / 2;
        const centered = -Math.abs(cx - vw / 2);          // nearest to center = current slide
        if (centered > score) { score = centered; best = r; }
      });
      return best ? { x: best.x, y: best.y, w: best.width, h: best.height } : null;
    });
    if (box) {
      const clip = { x: Math.max(0, Math.round(box.x)), y: Math.max(0, Math.round(box.y)), width: Math.round(box.w), height: Math.round(box.h) };
      await page.screenshot({ path: path.join(OUT, `panel_${String(i).padStart(2, '0')}.png`), clip });
      console.log(`panel ${i} saved`, JSON.stringify(clip));
    } else {
      console.log(`panel ${i} NO BOX`);
    }
    if (i < total) {
      const next = await page.$('button[aria-label="다음"], [aria-label="다음"]');
      if (!next) { console.log('next gone at', i); break; }
      await next.click({ force: true }).catch(async () => { await page.mouse.click(576, 352); });
    }
  }
  await browser.close();
  console.log('DONE');
})();
