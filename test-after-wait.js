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

    console.log("Waiting for content...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds for JS to render

    const html = await page.content();
    fs.writeFileSync("after-wait.html", html, "utf8");

    // Also try to get the body text to see what's there
    const bodyText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync("body-text.txt", bodyText, "utf8");

    console.log("✓ HTML saved to after-wait.html");
    console.log("✓ Body text saved to body-text.txt");
    console.log("File size:", (html.length / 1024).toFixed(2), "KB");

    // Check if menu content is there
    if (html.includes("Oatmeal") || html.includes("Scrambled") || html.includes("Bacon")) {
      console.log("✓ Found menu items!");
    } else if (html.includes("Loading Menu")) {
      console.log("⚠ Still showing 'Loading Menu'");
    } else {
      console.log("? Unknown state");
    }
  } catch (error) {
    console.log("✗ Error:", error.message);
  } finally {
    await browser.close();
  }
})();
