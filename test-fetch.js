const axios = require("axios");

const url = "https://new.dineoncampus.com/uchicago/whats-on-the-menu/woodlawn-dining-commons/2025-12-07/breakfast";

console.log("Testing URL fetch...");
console.log("URL:", url);

axios.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
})
  .then(response => {
    console.log("\n✓ Success! Status:", response.status);
    console.log("Content-Type:", response.headers['content-type']);
    console.log("HTML length:", response.data.length);
    console.log("\nFirst 500 characters of HTML:");
    console.log(response.data.substring(0, 500));
  })
  .catch(error => {
    console.log("\n✗ Error occurred!");
    console.log("Error message:", error.message);
    if (error.response) {
      console.log("Status code:", error.response.status);
      console.log("Status text:", error.response.statusText);
    } else if (error.request) {
      console.log("No response received");
    }
  });
