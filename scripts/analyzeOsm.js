const fs = require("fs");
const path = require("path");

const dump = JSON.parse(fs.readFileSync(path.join(__dirname, "osm_chennai_dump.json"), "utf8"));
console.log("Total elements in dump:", dump.length);

let withName = 0;
let withCapacity = 0;
let motorCycles = 0;
let areas = {};

dump.forEach(el => {
  const tags = el.tags || {};
  if (tags.name) withName++;
  if (tags.capacity || tags["capacity:car"] || tags["capacity:motorcycle"]) withCapacity++;
  if (tags.amenity === "motorcycle_parking" || tags.motorcycle === "yes" || tags.motorcycle === "only") motorCycles++;
});

console.log("With explicit name:", withName);
console.log("With explicit capacity tag:", withCapacity);
console.log("Two wheeler / motorcycle tagged:", motorCycles);

// Inspect 10 sample items
console.log("\nSample items from Chennai OSM dump:");
dump.filter(e => e.tags && e.tags.name).slice(0, 10).forEach(e => {
  const lat = e.lat || (e.center && e.center.lat);
  const lon = e.lon || (e.center && e.center.lon);
  console.log(`- [${e.tags.name}] (type: ${e.tags.parking || e.tags.amenity}, access: ${e.tags.access || "unspecified"}) @ ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
});
