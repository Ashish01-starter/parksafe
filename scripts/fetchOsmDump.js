const https = require("https");
const fs = require("fs");
const path = require("path");

const query = `[out:json][timeout:45];
(
  node["amenity"="parking"](12.82,80.00,13.22,80.32);
  way["amenity"="parking"](12.82,80.00,13.22,80.32);
  node["amenity"="motorcycle_parking"](12.82,80.00,13.22,80.32);
  way["amenity"="motorcycle_parking"](12.82,80.00,13.22,80.32);
);
out center 400;`;

const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
console.log("Fetching real OSM parking elements for Chennai bounding box...");

https.get(url, { headers: { "User-Agent": "parkSafe-Chennai-OSM-Importer/2.0" } }, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      const elements = json.elements || [];
      console.log(`Successfully received ${elements.length} OSM elements from Overpass API.`);
      
      const dumpPath = path.join(__dirname, "osm_chennai_dump.json");
      fs.writeFileSync(dumpPath, JSON.stringify(elements, null, 2));
      console.log(`Saved snapshot to ${dumpPath}`);
    } catch (e) {
      console.error("Failed to parse JSON response:", e.message);
    }
  });
}).on("error", (e) => {
  console.error("Network error fetching from Overpass API:", e.message);
});
