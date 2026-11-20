const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  
  // Check for any JS errors
  const errors = await page.evaluate(() => window.__errors || []);
  console.log('Errors:', errors);
  
  // Check marquee animation
  const marqueeTrack = await page.$('.marquee-track');
  if (marqueeTrack) {
    const animation = await marqueeTrack.evaluate(el => getComputedStyle(el).animation);
    console.log('Marquee animation:', animation);
  }
  
  // Check HeroFacts animation
  const heroFacts = await page.$('[data-testid="hero-facts"]');
  if (heroFacts) {
    const facts = await heroFacts.$$('.reveal-fact');
    for (let i = 0; i < facts.length; i++) {
      const anim = await facts[i].evaluate(el => getComputedStyle(el).animation);
      console.log(`HeroFact ${i} animation:`, anim);
    }
  }
  
  // Check image container clip-path
  const imgContainer = await page.$('#home .relative.aspect-\\[4\\/5\\] > div:first-child');
  if (imgContainer) {
    const clipPath = await imgContainer.evaluate(el => getComputedStyle(el).clipPath);
    console.log('Image container clip-path:', clipPath);
  }
  
  // Test different image aspect ratios by checking the image behavior
  const img = await page.$('#home img');
  if (img) {
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    const naturalHeight = await img.evaluate(el => el.naturalHeight);
    console.log('Image natural dimensions:', naturalWidth, 'x', naturalHeight);
    const clientWidth = await img.evaluate(el => el.clientWidth);
    const clientHeight = await img.evaluate(el => el.clientHeight);
    console.log('Image rendered dimensions:', clientWidth, 'x', clientHeight);
  }
  
  await browser.close();
})();
