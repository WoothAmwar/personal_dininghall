import puppeteer from 'puppeteer';

const url = "https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2026-04-22/lunch";

async function testModal() {
  console.log("Launching browser for lunch...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', response => {
    if (response.url().includes('api')) {
      console.log('API Request:', response.url());
    }
  });

  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  
  await browser.close();
}

testModal().catch(console.error);
