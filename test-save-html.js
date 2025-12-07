const puppeteer = require("puppeteer");
const fs = require("fs");

const url = "https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2025-12-07/breakfast";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log("Navigating...");
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const html = await page.content();
    fs.writeFileSync("fetched-page.html", html, "utf8");
    console.log("✓ HTML saved to fetched-page.html");
    console.log("File size:", (html.length / 1024).toFixed(2), "KB");
  } catch (error) {
    console.log("✗ Error:", error.message);
  } finally {
    await browser.close();
  }
})();
