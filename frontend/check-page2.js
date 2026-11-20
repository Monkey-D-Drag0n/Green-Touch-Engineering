const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  // Check HeroFacts content
  const heroFacts = await page.$('[data-testid="hero-facts"]');
  if (heroFacts) {
    const text = await heroFacts.textContent();
    console.log('HeroFacts content:', text);
  }
  
  // Check marquee items
  const marqueeItems = await page.$$('.marquee-track span');
  console.log('Marquee items count:', marqueeItems.length);
  
  // Check for the image
  const heroImage = await page.$('#home img');
  if (heroImage) {
    const src = await heroImage.getAttribute('src');
    console.log('Hero image src:', src);
    const style = await heroImage.getAttribute('style');
    console.log('Hero image style:', style);
  }
  
  // Check for CTA buttons
  const ctaButtons = await page.$$('[data-testid="hero-cta-group"] button, [data-testid="hero-cta-group"] a');
  console.log('CTA buttons count:', ctaButtons.length);
  for (const btn of ctaButtons) {
    const text = await btn.textContent();
    console.log('  CTA:', text.trim());
  }
  
  await browser.close();
})();
