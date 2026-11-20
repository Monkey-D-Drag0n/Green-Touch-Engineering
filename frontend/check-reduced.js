const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ 
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  // Check marquee animation is disabled
  const marqueeTrack = await page.$('.marquee-track');
  if (marqueeTrack) {
    const animation = await marqueeTrack.evaluate(el => getComputedStyle(el).animation);
    console.log('Reduced motion marquee animation:', animation);
  }
  
  // Check HeroFacts animation is disabled
  const heroFacts = await page.$('[data-testid="hero-facts"]');
  if (heroFacts) {
    const facts = await heroFacts.$$('.reveal-fact');
    for (let i = 0; i < facts.length; i++) {
      const anim = await facts[i].evaluate(el => getComputedStyle(el).animation);
      console.log(`Reduced motion HeroFact ${i} animation:`, anim);
    }
  }
  
  // Check GridLayer parallax is disabled
  const gridLayer = await page.$('.blueprint');
  if (gridLayer) {
    const transform = await gridLayer.evaluate(el => getComputedStyle(el).transform);
    console.log('Reduced motion grid transform:', transform);
  }
  
  // Check image hover (scale) - verify transition exists but won't trigger in reduced motion
  const img = await page.$('#home img');
  if (img) {
    const transition = await img.evaluate(el => getComputedStyle(el).transition);
    console.log('Image transition:', transition);
  }
  
  await browser.close();
})();
