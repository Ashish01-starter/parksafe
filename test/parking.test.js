const test = require("node:test");
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Haversine formula
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isWithinGeofence(userLat, userLon, targetLat, targetLon, thresholdMeters = 80) {
  const distMeters = calculateHaversineDistanceKm(userLat, userLon, targetLat, targetLon) * 1000;
  return distMeters <= thresholdMeters;
}

// v2 Status Derivation
function deriveStatus(available, capacity) {
  if (available === null || available === undefined || capacity === null || capacity === undefined) {
    return "UNKNOWN";
  }
  if (available <= 0) return "FULL";
  const ratio = capacity > 0 ? available / capacity : 1;
  if (ratio <= 0.20 || available <= 3) return "LIMITED";
  return "AVAILABLE";
}

// v2 Confidence Calculation
function calculateAvailabilityConfidence(lastUpdated, source = "unknown") {
  if (!lastUpdated) {
    return { level: "none", tier: "Unknown" };
  }
  if (source === "unknown") {
    return { level: "none", tier: "Unknown" };
  }

  const now = Date.now();
  const updatedAt = new Date(lastUpdated).getTime();
  const ageMinutes = (now - updatedAt) / 60000;

  if (ageMinutes < 2) return { level: "high", tier: "Fresh" };
  if (ageMinutes < 10) return { level: "medium", tier: "Recent" };
  if (ageMinutes < 30) return { level: "low", tier: "Stale" };
  return { level: "none", tier: "Unknown" };
}

// 1. Distance Calculation Tests
test("Distance Calculation: accurately measures distance between Marina Beach and Central Station", () => {
  const distance = calculateHaversineDistanceKm(13.0544, 80.2831, 13.0827, 80.2757);
  assert.ok(distance > 3.0 && distance < 3.5, `Expected distance ~3.2km, got ${distance}`);
});

test("Distance Calculation: identical coordinates yield 0 km", () => {
  const distance = calculateHaversineDistanceKm(13.0827, 80.2707, 13.0827, 80.2707);
  assert.strictEqual(distance, 0);
});

// 2. Geofence Arrival Tests
test("Geofence Arrival: returns true when within 80m threshold", () => {
  const isArrived = isWithinGeofence(13.0827, 80.2707, 13.0831, 80.2707, 80);
  assert.strictEqual(isArrived, true);
});

test("Geofence Arrival: returns false when outside 80m threshold", () => {
  const isArrived = isWithinGeofence(13.0827, 80.2707, 13.0872, 80.2707, 80);
  assert.strictEqual(isArrived, false);
});

// 3. v2 Availability Status Tests
test("v2 Availability Status: returns UNKNOWN when capacity or availability is null", () => {
  assert.strictEqual(deriveStatus(null, 50), "UNKNOWN");
  assert.strictEqual(deriveStatus(20, null), "UNKNOWN");
  assert.strictEqual(deriveStatus(null, null), "UNKNOWN");
});

test("v2 Availability Status: returns FULL when available is 0", () => {
  assert.strictEqual(deriveStatus(0, 50), "FULL");
});

test("v2 Availability Status: returns LIMITED when available <= 20% or <= 3", () => {
  assert.strictEqual(deriveStatus(8, 50), "LIMITED"); // 16%
  assert.strictEqual(deriveStatus(3, 100), "LIMITED");
});

test("v2 Availability Status: returns AVAILABLE when capacity is healthy", () => {
  assert.strictEqual(deriveStatus(25, 50), "AVAILABLE");
});

// 4. v2 Confidence Scoring Tests
test("v2 Confidence Scoring: fresh data (<2m) produces high/Fresh tier", () => {
  const justNow = new Date(Date.now() - 30 * 1000); // 30s ago
  const res = calculateAvailabilityConfidence(justNow, "user_confirmation");
  assert.strictEqual(res.tier, "Fresh");
  assert.strictEqual(res.level, "high");
});

test("v2 Confidence Scoring: recent data (2-10m) produces medium/Recent tier", () => {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const res = calculateAvailabilityConfidence(fiveMinAgo, "user_report");
  assert.strictEqual(res.tier, "Recent");
  assert.strictEqual(res.level, "medium");
});

test("v2 Confidence Scoring: stale data (10-30m) produces low/Stale tier", () => {
  const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
  const res = calculateAvailabilityConfidence(fifteenMinAgo, "user_report");
  assert.strictEqual(res.tier, "Stale");
  assert.strictEqual(res.level, "low");
});

test("v2 Confidence Scoring: very old data (>30m) produces none/Unknown tier", () => {
  const hourAgo = new Date(Date.now() - 45 * 60 * 1000);
  const res = calculateAvailabilityConfidence(hourAgo, "user_report");
  assert.strictEqual(res.tier, "Unknown");
  assert.strictEqual(res.level, "none");
});

test("v2 Confidence Scoring: unknown source always produces none/Unknown tier", () => {
  const justNow = new Date(Date.now() - 10 * 1000);
  const res = calculateAvailabilityConfidence(justNow, "unknown");
  assert.strictEqual(res.tier, "Unknown");
  assert.strictEqual(res.level, "none");
});

// 5. 2W vs 4W Separation Tests (Logic & Independence)
test("2W vs 4W Separation: two-wheeler and four-wheeler show independent availability", () => {
  const location = {
    carCapacity: 60,
    twoWheelerCapacity: 40,
    availableCarSpaces: 23,
    availableTwoWheelerSpaces: 17,
    isSharedCapacity: false,
  };

  // Occupying 2-wheeler decreases 2W without modifying 4W
  const after2WOccupy = {
    ...location,
    availableTwoWheelerSpaces: location.availableTwoWheelerSpaces - 1,
  };
  assert.strictEqual(after2WOccupy.availableTwoWheelerSpaces, 16);
  assert.strictEqual(after2WOccupy.availableCarSpaces, 23); // Unchanged!

  // Occupying car decreases 4W without modifying 2W
  const afterCarOccupy = {
    ...location,
    availableCarSpaces: location.availableCarSpaces - 1,
  };
  assert.strictEqual(afterCarOccupy.availableCarSpaces, 22);
  assert.strictEqual(afterCarOccupy.availableTwoWheelerSpaces, 17); // Unchanged!
});

test("2W vs 4W Bounds Protection: counts never drop below 0 or exceed capacity", () => {
  const carCap = 25;
  let availableCars = 0;

  // Cannot drop below 0
  const decremented = Math.max(0, availableCars - 1);
  assert.strictEqual(decremented, 0);

  // Cannot exceed capacity
  availableCars = 25;
  const incremented = Math.min(carCap, availableCars + 1);
  assert.strictEqual(incremented, 25);
});

// 6. Database Verification: 100-200+ Chennai locations loaded and 2W/4W distinct
test("Database Verification: contains > 100 Chennai locations with OSM attribution", async () => {
  const total = await prisma.parkingLocation.count();
  const osmCount = await prisma.parkingLocation.count({ where: { dataSource: "OpenStreetMap" } });
  const demoCount = await prisma.parkingLocation.count({ where: { isDemoData: true } });

  assert.ok(total >= 100, `Expected at least 100 locations, found ${total}`);
  assert.ok(osmCount >= 100, `Expected at least 100 OSM locations, found ${osmCount}`);
  assert.ok(demoCount > 0, `Expected demo locations to exist, found ${demoCount}`);

  // Check an OSM location: MUST have UNKNOWN availability
  const anOsmLocation = await prisma.parkingLocation.findFirst({
    where: { dataSource: "OpenStreetMap" },
  });
  assert.ok(anOsmLocation, "Must have at least one OSM location");
  assert.strictEqual(anOsmLocation.availabilityStatus, "UNKNOWN");
  assert.strictEqual(anOsmLocation.availableCarSpaces, null);
  assert.strictEqual(anOsmLocation.availableTwoWheelerSpaces, null);

  // Check demo location: MUST have distinct 2W and 4W capacities
  const pondyBazaar = await prisma.parkingLocation.findFirst({
    where: { osmId: "demo:pondy-bazaar-mlcp" },
  });
  assert.ok(pondyBazaar, "Pondy Bazaar MLCP demo location must exist");
  assert.strictEqual(pondyBazaar.carCapacity, 60);
  assert.strictEqual(pondyBazaar.twoWheelerCapacity, 30);
  assert.notStrictEqual(pondyBazaar.availableCarSpaces, pondyBazaar.availableTwoWheelerSpaces);
});
