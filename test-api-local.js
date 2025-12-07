// Test the local API endpoint
const url = "http://localhost:3001/api/menu?url=https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2025-12-07/breakfast";

console.log("Testing API at:", url);
console.log("");

fetch(url)
  .then(response => {
    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  })
  .then(data => {
    console.log("\n✓ API Success!");
    console.log("\nMenu Data:");
    console.log("- Date:", data.date);
    console.log("- Location:", data.location);
    console.log("- Meal:", data.meal);
    console.log("- Sections:", data.sections?.length || 0);

    if (data.sections && data.sections.length > 0) {
      console.log("\nFirst section:");
      console.log("- Name:", data.sections[0].name);
      console.log("- Items:", data.sections[0].items.length);
    }
  })
  .catch(error => {
    console.error("\n✗ Error:", error.message);
  });
