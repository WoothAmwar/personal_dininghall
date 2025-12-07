const puppeteer = require("puppeteer");

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

    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Analyze DOM structure around tables
    const structure = await page.evaluate(() => {
      const tables = Array.from(document.querySelectorAll('table'));
      const result = [];

      tables.forEach((table, idx) => {
        const headerRow = table.querySelector('tr');
        if (!headerRow) return;

        const headerText = headerRow.innerText.toLowerCase();
        if (!headerText.includes('menu item')) return;

        // Get information about elements before the table
        let currentEl = table;
        const siblings = [];

        for (let i = 0; i < 10 && currentEl; i++) {
          currentEl = currentEl.previousElementSibling;
          if (!currentEl) break;

          siblings.push({
            tagName: currentEl.tagName,
            className: currentEl.className,
            text: currentEl.innerText?.substring(0, 100) || '',
            textLength: currentEl.innerText?.length || 0
          });
        }

        // Check parent
        const parent = table.parentElement;
        const parentInfo = {
          tagName: parent?.tagName,
          className: parent?.className,
          childCount: parent?.children?.length
        };

        // Check grandparent
        const grandparent = parent?.parentElement;
        const grandparentInfo = {
          tagName: grandparent?.tagName,
          className: grandparent?.className,
          childCount: grandparent?.children?.length,
          hasH2: grandparent?.querySelector('h2') ? true : false,
          h2Text: grandparent?.querySelector('h2')?.innerText || null
        };

        // Check grandparent's siblings
        const grandparentSiblings = [];
        let currentGP = grandparent;
        for (let i = 0; i < 3 && currentGP; i++) {
          currentGP = currentGP.previousElementSibling;
          if (!currentGP) break;

          grandparentSiblings.push({
            tagName: currentGP.tagName,
            className: currentGP.className,
            text: currentGP.innerText?.substring(0, 100) || '',
            textLength: currentGP.innerText?.length || 0,
            hasH2: currentGP.querySelector('h2') ? true : false,
            h2Text: currentGP.querySelector('h2')?.innerText || null
          });
        }

        // Check parent's siblings - go deeper
        const parentSiblings = [];
        let currentParent = parent;
        for (let i = 0; i < 5 && currentParent; i++) {
          currentParent = currentParent.previousElementSibling;
          if (!currentParent) break;

          parentSiblings.push({
            tagName: currentParent.tagName,
            className: currentParent.className,
            text: currentParent.innerText?.substring(0, 200) || '',
            textLength: currentParent.innerText?.length || 0,
            hasH2: currentParent.querySelector('h2') ? true : false,
            h2Text: currentParent.querySelector('h2')?.innerText || null
          });
        }

        result.push({
          tableIndex: idx,
          siblings,
          parentInfo,
          grandparentInfo,
          grandparentSiblings,
          parentSiblings
        });
      });

      return result;
    });

    console.log(JSON.stringify(structure, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await browser.close();
  }
})();
