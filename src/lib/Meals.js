import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://anwar09102005_db_user:loWPghkNOckAIXzL@cluster0.tu8or27.mongodb.net/?appName=Cluster0";
let client;

async function getMongoClient() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client;
}

export async function fetchDineOnCampusMenu(url) {
  console.log("Launching browser to fetch:", url);

  // For local development, use local Chrome; for production (Vercel/Lambda), use chromium
  const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

  let browser;

  if (isProduction) {
    // Use puppeteer-core with @sparticuz/chromium for Vercel/Lambda
    const puppeteerCore = (await import("puppeteer-core")).default;
    const chromium = (await import("@sparticuz/chromium")).default;

    browser = await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Use regular puppeteer for local development (includes bundled Chrome)
    const puppeteer = (await import("puppeteer")).default;

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  try {
    const page = await browser.newPage();

    // Intercept the API response to get the complete JSON data with nutrition
    let apiMenuData = null;
    page.on('response', async response => {
      // The DineOnCampus API URL contains 'menu?date='
      if (response.url().includes('menu?date=')) {
        try {
          apiMenuData = await response.json();
        } catch (e) {
          console.error("Failed to parse intercepted menu JSON", e);
        }
      }
    });

    // Set a realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate to the page and wait for content to load
    await page.goto(url, {
      waitUntil: 'networkidle0', // Wait until 0 network connections for at least 500ms
      timeout: 60000 // Increase total timeout to 60s
    });

    // Wait for the menu content to be rendered (the page loads via JavaScript)
    console.log("Waiting for JavaScript to render menu content...");

    // Wait for menu tables to appear (more efficient than fixed 5s delay)
    try {
      // Wait specifically for the menu table wrapper or the table itself
      await page.waitForSelector('table tbody tr', { timeout: 15000 });
      // Give a bit more time for all content to finish rendering (images, interactions)
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (err) {
      // Fallback to fixed delay if selector doesn't appear
      console.log("Table selector not found, using fixed delay");
      await new Promise(resolve => setTimeout(resolve, 8000));
    }

    // Extract metadata and fallback menu data directly from the page using Puppeteer
    const pageData = await page.evaluate(() => {
      const bodyText = document.body.innerText;

      // Extract date, location, and meal from text
      const dateMatch = bodyText.match(/\b\d{1,2}\/\d{1,2}\/\d{2}\b/);
      const date = dateMatch ? dateMatch[0] : null;

      // Extract location and meal from the filter selectors
      const locationMatch = bodyText.match(/Location\s+([\w\s]+)\s+Menu/);
      const location = locationMatch ? locationMatch[1].trim() : null;

      const mealMatch = bodyText.match(/Menu\s+([\w\s]+)\s+Location details/);
      const meal = mealMatch ? mealMatch[1].trim() : null;

      // Find all tables with menu items for fallback
      const tables = Array.from(document.querySelectorAll('table'));
      const fallbackSections = [];

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
            nutrition: [] // Fallback doesn't easily scrape nutrition
          });
        });

        if (items.length > 0) {
          fallbackSections.push({
            name: sectionTitle,
            items,
          });
        }
      });

      return { date, location, meal, fallbackSections };
    });

    // Use intercepted API data if available, otherwise use fallback scraped sections
    let sections = [];
    if (apiMenuData && apiMenuData.period && apiMenuData.period.categories) {
      console.log("Using intercepted API JSON for robust data & nutrition information.");
      sections = apiMenuData.period.categories.map(category => {
        return {
          name: category.name,
          items: category.items.map(item => {
            return {
              name: item.name,
              portion: item.portion || '',
              calories: item.calories != null ? String(item.calories) : '',
              nutrition: item.nutrients || []
            };
          })
        };
      });
    } else {
      console.log("API JSON not intercepted, using fallback DOM scraped generic data without nutrition details.");
      sections = pageData.fallbackSections;
    }

    const menuData = {
      date: pageData.date,
      location: pageData.location,
      meal: pageData.meal,
      sections: sections
    };

    console.log("Successfully fetched and parsed menu for:", url);
    menuData.meal = url.split("/")[7];
    console.log(menuData);
    // Save to MongoDB
    if (menuData.date && menuData.meal) {
      try {
        const mongo = await getMongoClient();
        const db = mongo.db('dininghall');
        const collection = db.collection('meals');

        // Map scanned meal name to schema key (breakfast/lunch/dinner)
        // Ensure strictly one of 'breakfast', 'lunch', 'dinner'
        let mealKey = menuData.meal.toLowerCase();
        if (mealKey.includes('breakfast')) mealKey = 'breakfast';
        else if (mealKey.includes('lunch')) mealKey = 'lunch';
        else if (mealKey.includes('dinner')) mealKey = 'dinner';

        await collection.updateOne(
          { date: menuData.date },
          {
            $set: {
              [mealKey]: menuData.sections,
              last_updated: new Date()
            }
          },
          { upsert: true }
        );
        console.log(`Saved ${menuData.meal} data to MongoDB for date ${menuData.date}`);
      } catch (dbError) {
        console.error("Error saving to MongoDB:", dbError);
      }
    }

    return {
      url,
      ...menuData,
    };
  } finally {
    if (browser) await browser.close();
  }
}

// AWS Lambda Handler
export const handler = async (event) => {
  // Use 'America/Chicago' timezone to match the dining hall's location
  const dateOptions = { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', dateOptions); // en-CA gives YYYY-MM-DD format
  const formattedDate = formatter.format(new Date());

  const allMealData = [];
  const meals = ["breakfast", "lunch", "dinner"];

  console.log(`Starting Scrape Job for ${formattedDate} (Chicago Time)`);

  // Process sequentially to prevent crashing Lambda memory (1 browser at a time)
  for (const meal_time of meals) {
    const url = `https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/${formattedDate}/${meal_time}`;
    try {
      console.log(`Fetching ${meal_time}...`);
      const data = await fetchDineOnCampusMenu(url);
      allMealData.push(data);
    } catch (error) {
      console.error(`Error fetching ${meal_time}:`, error);
      allMealData.push({ error: error.message, meal: meal_time, failed: true });
    }
  }

  return { statusCode: 200, body: JSON.stringify(allMealData) };
};
