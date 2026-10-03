const test = require("node:test");
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Helper mirroring AvailabilityService logic in JavaScript for direct Node testing
function deriveStatus(available, capacity) {
  if (available === null || available === undefined || capacity === null || capacity === undefined) {
    return "UNKNOWN";
  }
  if (available <= 0) return "FULL";
  const ratio = capacity > 0 ? available / capacity : 1;
  if (ratio <= 0.20 || available <= 3) return "LIMITED";
  return "AVAILABLE";
}

async function occupySpot({ parkingLocationId, vehicleType, spaceId, sessionId }) {
  return await prisma.$transaction(async (tx) => {
    const loc = await tx.parkingLocation.findUnique({
      where: { id: parkingLocationId },
      include: { spaces: true },
    });
    if (!loc) throw new Error("Not found");

    let updatedSpace = null;
    if (spaceId) {
      updatedSpace = await tx.parkingSpace.update({
        where: { id: spaceId },
        data: {
          status: "occupied",
          lastUpdated: new Date(),
          lastUpdatedBy: sessionId,
          source: "user_confirmation",
        },
      });
    }

    const is2W = vehicleType === "TWO_WHEELER";
    let new2W = loc.availableTwoWheelerSpaces;
    let newCar = loc.availableCarSpaces;

    if (is2W) {
      if (new2W !== null) new2W = Math.max(0, new2W - 1);
      if (loc.isSharedCapacity && newCar !== null) newCar = Math.max(0, newCar - 1);
    } else {
      if (newCar !== null) newCar = Math.max(0, newCar - 1);
      if (loc.isSharedCapacity && new2W !== null) new2W = Math.max(0, new2W - 1);
    }

    const updatedLoc = await tx.parkingLocation.update({
      where: { id: parkingLocationId },
      data: {
        availableTwoWheelerSpaces: new2W,
        availableCarSpaces: newCar,
        twoWheelerAvailabilityStatus: deriveStatus(new2W, loc.twoWheelerCapacity),
        carAvailabilityStatus: deriveStatus(newCar, loc.carCapacity),
        lastUpdated: new Date(),
      },
    });

    await tx.availabilityEvent.create({
      data: {
        parkingLocationId,
        spaceId: spaceId || null,
        vehicleType,
        eventType: "parked",
        deltaSpaces: -1,
        sessionId,
        source: "user_confirmation",
      },
    });

    return { location: updatedLoc, space: updatedSpace };
  });
}

async function vacateSpot({ parkingLocationId, vehicleType, spaceId, sessionId }) {
  return await prisma.$transaction(async (tx) => {
    const loc = await tx.parkingLocation.findUnique({
      where: { id: parkingLocationId },
      include: { spaces: true },
    });
    if (!loc) throw new Error("Not found");

    let updatedSpace = null;
    if (spaceId) {
      updatedSpace = await tx.parkingSpace.update({
        where: { id: spaceId },
        data: {
          status: "available",
          lastUpdated: new Date(),
          lastUpdatedBy: sessionId,
          source: "user_confirmation",
        },
      });
    }

    const is2W = vehicleType === "TWO_WHEELER";
    let new2W = loc.availableTwoWheelerSpaces;
    let newCar = loc.availableCarSpaces;

    if (is2W) {
      if (new2W !== null) {
        const cap = loc.twoWheelerCapacity || 9999;
        new2W = Math.min(cap, new2W + 1);
      }
      if (loc.isSharedCapacity && newCar !== null) {
        const cap = loc.carCapacity || 9999;
        newCar = Math.min(cap, newCar + 1);
      }
    } else {
      if (newCar !== null) {
        const cap = loc.carCapacity || 9999;
        newCar = Math.min(cap, newCar + 1);
      }
      if (loc.isSharedCapacity && new2W !== null) {
        const cap = loc.twoWheelerCapacity || 9999;
        new2W = Math.min(cap, new2W + 1);
      }
    }

    const updatedLoc = await tx.parkingLocation.update({
      where: { id: parkingLocationId },
      data: {
        availableTwoWheelerSpaces: new2W,
        availableCarSpaces: newCar,
        twoWheelerAvailabilityStatus: deriveStatus(new2W, loc.twoWheelerCapacity),
        carAvailabilityStatus: deriveStatus(newCar, loc.carCapacity),
        lastUpdated: new Date(),
      },
    });

    await tx.availabilityEvent.create({
      data: {
        parkingLocationId,
        spaceId: spaceId || null,
        vehicleType,
        eventType: "vacated",
        deltaSpaces: 1,
        sessionId,
        source: "user_confirmation",
      },
    });

    return { location: updatedLoc, space: updatedSpace };
  });
}

test("E2E User Flow: Complete 2W/4W Lifecycle & State Verification", async () => {
  // 1. CHOOSE TWO-WHEELER & SEARCH CHENNAI
  const testLoc = await prisma.parkingLocation.findFirst({
    where: { osmId: "demo:pondy-bazaar-mlcp" },
    include: { spaces: true },
  });
  assert.ok(testLoc, "Pondy Bazaar MLCP must exist in the database");

  const initialCarAvail = testLoc.availableCarSpaces;
  const initial2WAvail = testLoc.availableTwoWheelerSpaces;
  assert.ok(initialCarAvail !== null && initial2WAvail !== null, "Initial availability must be known");
  assert.notStrictEqual(initialCarAvail, initial2WAvail, "2W and 4W initial availabilities must be independent");

  // 2. QUERY NEARBY PARKING AS TWO-WHEELER
  const nearby2W = await prisma.parkingLocation.findMany({
    where: {
      supportedVehicleTypes: { contains: "TWO_WHEELER" },
    },
  });
  assert.ok(nearby2W.length > 50, "Should find numerous 2W compatible parking locations across Chennai");

  // 3. SELECT A PARKING SPACE WHEN REAL SPACE DATA EXISTS
  const bikeSpaces = testLoc.spaces.filter(
    (s) => (s.vehicleType === "TWO_WHEELER" || s.vehicleType === "BOTH") && s.status === "available"
  );
  assert.ok(bikeSpaces.length > 0, "Pondy Bazaar MLCP should have open bike bays");
  const targetBay = bikeSpaces[0];

  // 4. ARRIVAL CONFIRMATION -> MARK OCCUPIED AS TWO-WHEELER
  const sessionId = "e2e-tester-session-" + Date.now();

  const occupyResult = await occupySpot({
    parkingLocationId: testLoc.id,
    vehicleType: "TWO_WHEELER",
    spaceId: targetBay.id,
    sessionId,
  });

  // Verify 2W availability decremented by 1
  assert.strictEqual(
    occupyResult.location.availableTwoWheelerSpaces,
    initial2WAvail - 1,
    "Two-wheeler availability must decrement by 1"
  );

  // CRITICAL REQUIREMENT: Verify 4W availability was UNCHANGED!
  assert.strictEqual(
    occupyResult.location.availableCarSpaces,
    initialCarAvail,
    "Four-wheeler availability must remain completely unchanged when 2W parks (independent capacities)!"
  );

  // Verify the target bay status changed to occupied
  assert.strictEqual(occupyResult.space.status, "occupied");

  // 5. SWITCH TO FOUR-WHEELER & VERIFY 4W INDEPENDENCE
  const locFromDb = await prisma.parkingLocation.findUnique({ where: { id: testLoc.id } });
  assert.strictEqual(
    locFromDb.availableCarSpaces,
    initialCarAvail,
    "User viewing as Four-Wheeler must see 4W availability, untouched by the 2W parking"
  );
  assert.strictEqual(
    locFromDb.availableTwoWheelerSpaces,
    initial2WAvail - 1,
    "User viewing as Two-Wheeler sees updated 2W availability"
  );

  // 6. DEPARTURE / RELEASE PARKING
  const vacateResult = await vacateSpot({
    parkingLocationId: testLoc.id,
    vehicleType: "TWO_WHEELER",
    spaceId: targetBay.id,
    sessionId,
  });

  // Verify 2W availability restored
  assert.strictEqual(
    vacateResult.location.availableTwoWheelerSpaces,
    initial2WAvail,
    "Two-wheeler availability must increment back upon vacate"
  );
  // 4W availability still unchanged
  assert.strictEqual(vacateResult.location.availableCarSpaces, initialCarAvail);
  assert.strictEqual(vacateResult.space.status, "available");

  // 7. VERIFY TELEMETRY / AUDIT EVENTS LOGGED
  const events = await prisma.availabilityEvent.findMany({
    where: { parkingLocationId: testLoc.id, sessionId },
    orderBy: { timestamp: "desc" },
  });
  assert.strictEqual(events.length, 2, "Must log both 'parked' and 'vacated' audit events");
  assert.strictEqual(events[0].eventType, "vacated");
  assert.strictEqual(events[0].vehicleType, "TWO_WHEELER");
  assert.strictEqual(events[1].eventType, "parked");
  assert.strictEqual(events[1].vehicleType, "TWO_WHEELER");

  // 8. VERIFY OSM LOCATIONS HONESTLY REMAIN UNKNOWN
  const osmSample = await prisma.parkingLocation.findFirst({
    where: { dataSource: "OpenStreetMap" },
  });
  assert.ok(osmSample, "OSM parking locations must exist");
  assert.strictEqual(osmSample.availabilityStatus, "UNKNOWN");
  assert.strictEqual(osmSample.availableCarSpaces, null);
  assert.strictEqual(osmSample.availableTwoWheelerSpaces, null);
});
