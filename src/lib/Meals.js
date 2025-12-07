import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function fetchDineOnCampusMenu(url) {
  console.log("Launching browser to fetch:", url);

  // For local development, use local Chrome; for production (Vercel), use chromium
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';

  const browser = await puppeteer.launch({
    args: isProduction ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: isProduction
      ? await chromium.executablePath()
      : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/usr/bin/google-chrome',
    headless: isProduction ? chromium.headless : true,
  });

  try {
    const page = await browser.newPage();

    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page and wait for content to load
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the menu content to be rendered (the page loads via JavaScript)
    console.log("Waiting for JavaScript to render menu content...");

    // Wait for menu tables to appear (more efficient than fixed 5s delay)
    try {
      await page.waitForSelector('table', { timeout: 10000 });
      // Give a bit more time for all content to finish rendering
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      // Fallback to fixed delay if selector doesn't appear
      console.log("Table selector not found, using fixed delay");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Extract menu data directly from the page using Puppeteer
    const menuData = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      // Extract date, location, and meal from text
      const dateMatch = bodyText.match(/\b\d{1,2}\/\d{1,2}\/\d{2}\b/);
      const date = dateMatch ? dateMatch[0] : null;

      // Extract location and meal from the filter selectors
      const locationMatch = bodyText.match(/Location\s+([\w\s]+)\s+Menu/);
      const location = locationMatch ? locationMatch[1].trim() : null;

      const mealMatch = bodyText.match(/Menu\s+([\w\s]+)\s+Location details/);
      const meal = mealMatch ? mealMatch[1].trim() : null;

      // Find all tables with menu items
      const tables = Array.from(document.querySelectorAll('table'));
      const sections = [];

      tables.forEach(table => {
        // Check if this is a menu table by looking at headers
        const headerRow = table.querySelector('tr');
        if (!headerRow) return;

        const headerText = headerRow.innerText.toLowerCase();
        if (!headerText.includes('menu item') || !headerText.includes('portion') || !headerText.includes('calories')) {
          return;
        }

        // Find the section title - it's in the grandparent's previous sibling
        let sectionTitle = 'Unknown Section';

        // Navigate to table -> parent -> grandparent -> previous sibling
        const parent = table.parentElement;
        const grandparent = parent?.parentElement;
        const grandparentPrevSibling = grandparent?.previousElementSibling;

        if (grandparentPrevSibling && grandparentPrevSibling.innerText) {
          const text = grandparentPrevSibling.innerText.trim();
          // Section titles are short text like "FLAME BREAKFAST", "OMELET", etc.
          if (text && text.length > 0 && text.length < 100 &&
              !text.includes('Click any item') &&
              !text.includes('nutritional')) {
            sectionTitle = text.split('\n')[0].trim();
          }
        }

        const items = [];
        const rows = Array.from(table.querySelectorAll('tr')).slice(1); // Skip header row

        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          if (cells.length < 3) return;

          let itemName = cells[0]?.innerText?.trim() || '';
          const portion = cells[1]?.innerText?.trim() || '';
          const calories = cells[2]?.innerText?.trim() || '';

          // Clean up item name (remove "Favorite" button text, etc.)
          itemName = itemName.split('\n')[0].trim();
          if (itemName.startsWith('Add ')) return; // Skip "Add to favorites" rows
          if (!itemName || itemName === 'Favorite') return;

          items.push({
            name: itemName,
            portion,
            calories,
          });
        });

        if (items.length > 0) {
          sections.push({
            name: sectionTitle,
            items,
          });
        }
      });

      return { date, location, meal, sections };
    });

    console.log("Successfully fetched and parsed menu for:", url);

    return {
      url,
      ...menuData,
    };
  } finally {
    await browser.close();
  }
}
