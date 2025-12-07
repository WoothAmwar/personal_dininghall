const puppeteer = require("puppeteer");

const url = "https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2025-12-07/breakfast";

console.log("Testing Puppeteer fetch...");
console.log("URL:", url);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log("\nNavigating to page...");
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const html = await page.content();

    console.log("\n✓ Success!");
    console.log("HTML length:", html.length);
    console.log("\nFirst 500 characters of HTML:");
    console.log(html.substring(0, 500));

    // Check if we got past Cloudflare
    if (html.includes("cloudflare") && html.includes("Checking your browser")) {
      console.log("\n⚠ Warning: Still showing Cloudflare challenge page");
    } else if (html.includes("Menu Item") || html.includes("menu")) {
      console.log("\n✓ Successfully bypassed Cloudflare! Found menu content.");
    }
  } catch (error) {
    console.log("\n✗ Error:", error.message);
  } finally {
    await browser.close();
  }
})();
