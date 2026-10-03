const https = require("https");

const query = `[out:json][timeout:30];
(
  node["amenity"="parking"](12.85,80.05,13.20,80.32);
  way["amenity"="parking"](12.85,80.05,13.20,80.32);
  node["amenity"="motorcycle_parking"](12.85,80.05,13.20,80.32);
  way["amenity"="motorcycle_parking"](12.85,80.05,13.20,80.32);
);
out center 250;`;

const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);

console.log("Querying Overpass API for Chennai parking facilities...");

https.get(url, { headers: { "User-Agent": "parkSafe-Chennai-OSM-Importer/2.0" } }, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      console.log("Status:", res.statusCode);
      console.log("Total OSM elements returned:", json.elements ? json.elements.length : 0);
      if (json.elements && json.elements.length > 0) {
        console.log("Sample element:", JSON.stringify(json.elements[0], null, 2));
      }
    } catch (e) {
      console.log("Status:", res.statusCode, "Error:", e.message, "Response preview:", data.slice(0, 300));
    }
  });
}).on("error", (e) => console.log("Request error:", e.message));
