const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2000);
  
  // Check for HeroFacts
  const heroFacts = await page.$('[data-testid="hero-facts"]');
  console.log('HeroFacts present:', !!heroFacts);
  
  // Check for IndiaMART link in hero
  const indiamartLink = await page.$('[data-testid="hero-indiamart-link"]');
  console.log('IndiaMART link in hero:', !!indiamartLink);
  
  // Check for IndiaMART badge
  const indiamartBadge = await page.$('[data-testid="hero-badge"]');
  console.log('IndiaMART badge:', !!indiamartBadge);
  
  // Check hero content
  const heroContent = await page.$('[data-testid="hero-content"]');
  if (heroContent) {
    const text = await heroContent.textContent();
    console.log('Hero content snippet:', text.substring(0, 200));
  }
  
  // Check marquee
  const marquee = await page.$('[data-testid="marquee-section"]');
  console.log('Marquee present:', !!marquee);
  
  // Check for coords
  const coords = await page.$('[data-testid="hero-coords"]');
  console.log('Coords present:', !!coords);
  
  // Get full page text to verify
  const bodyText = await page.locator('body').textContent();
  console.log('--- Page contains IndiaMART:', bodyText.includes('IndiaMART'));
  console.log('--- Page contains TrustSEAL:', bodyText.includes('TrustSEAL'));
  
  await browser.close();
})();
