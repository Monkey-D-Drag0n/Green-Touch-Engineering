const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  // Check mobile layout - hero should stack
  const heroContent = await page.$('[data-testid="hero-content"]');
  if (heroContent) {
    const style = await heroContent.evaluate(el => getComputedStyle(el).display);
    console.log('Hero content display:', style);
  }
  
  // Check image on mobile
  const img = await page.$('#home img');
  if (img) {
    const clientWidth = await img.evaluate(el => el.clientWidth);
    const clientHeight = await img.evaluate(el => el.clientHeight);
    console.log('Mobile image rendered dimensions:', clientWidth, 'x', clientHeight);
  }
  
  // Check marquee on mobile
  const marqueeTrack = await page.$('.marquee-track');
  if (marqueeTrack) {
    const animation = await marqueeTrack.evaluate(el => getComputedStyle(el).animation);
    console.log('Mobile marquee animation:', animation);
  }
  
  // Check HeroFacts on mobile
  const heroFacts = await page.$('[data-testid="hero-facts"]');
  if (heroFacts) {
    const display = await heroFacts.evaluate(el => getComputedStyle(el).display);
    const gap = await heroFacts.evaluate(el => getComputedStyle(el).gap);
    console.log('Mobile HeroFacts display:', display, 'gap:', gap);
  }
  
  await browser.close();
})();
