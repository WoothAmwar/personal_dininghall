import { fetchDineOnCampusMenu } from "./src/lib/Meals.js";

const url = "https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2025-12-07/breakfast";

console.log("Testing full scraper function...");
console.log("URL:", url, "\n");

try {
  const result = await fetchDineOnCampusMenu(url);

  console.log("\n✓ Success! Scraped menu data:");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n=== Summary ===");
  console.log(`Date: ${result.date}`);
  console.log(`Location: ${result.location}`);
  console.log(`Meal: ${result.meal}`);
  console.log(`Sections found: ${result.sections.length}`);

  result.sections.forEach((section, i) => {
    console.log(`\n${i + 1}. ${section.name} (${section.items.length} items)`);
  });
} catch (error) {
  console.error("\n✗ Error:", error.message);
  console.error(error);
}
