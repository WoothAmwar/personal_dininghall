const axios = require("axios");

const apiUrl = "http://localhost:3001/api/menu?url=https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2025-12-07/breakfast";

console.log("Testing API endpoint...");
console.log("URL:", apiUrl, "\n");

axios.get(apiUrl, { timeout: 60000 })
  .then(response => {
    console.log("\n✓ Success! API returned data:");
    console.log(JSON.stringify(response.data, null, 2));

    const result = response.data;
    console.log("\n=== Summary ===");
    console.log(`Date: ${result.date}`);
    console.log(`Location: ${result.location}`);
    console.log(`Meal: ${result.meal}`);
    console.log(`Sections found: ${result.sections?.length || 0}`);

    if (result.sections) {
      result.sections.forEach((section, i) => {
        console.log(`\n${i + 1}. ${section.name} (${section.items?.length || 0} items)`);
        if (section.items && section.items.length > 0) {
          console.log(`   First item: ${section.items[0].name}`);
        }
      });
    }
  })
  .catch(error => {
    console.error("\n✗ Error:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  });
