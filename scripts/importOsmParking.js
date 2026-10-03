#!/usr/bin/env node
/**
 * parkSafe v2 - OpenStreetMap Chennai Parking Import Script
 *
 * Usage:
 *   node scripts/importOsmParking.js
 *
 * This script:
 * 1. Reads the cached OSM dump (scripts/osm_chennai_dump.json) OR
 *    fetches a fresh dump from Overpass API if no cache exists.
 * 2. Normalises each OSM element into the v2 ParkingLocation schema.
 * 3. Upserts into the database keyed on osmId (no duplicate runs).
 * 4. Never invents capacity or availability data not present in OSM tags.
 * 5. Labels unknown availability as UNKNOWN.
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ─── Chennai bounding box (lat_min, lon_min, lat_max, lon_max) ────────────────
const BBOX = '12.75,79.95,13.25,80.35';

// ─── Chennai area geocoder (lat/lon → area name) ──────────────────────────────
function deriveArea(lat, lon) {
  // Rough bounding boxes for major Chennai areas
  const areas = [
    { name: 'George Town',      minLat: 13.08, maxLat: 13.12, minLon: 80.27, maxLon: 80.30 },
    { name: 'Egmore',           minLat: 13.07, maxLat: 13.10, minLon: 80.25, maxLon: 80.28 },
    { name: 'Central Chennai',  minLat: 13.04, maxLat: 13.08, minLon: 80.26, maxLon: 80.30 },
    { name: 'Mylapore',         minLat: 13.02, maxLat: 13.05, minLon: 80.26, maxLon: 80.29 },
    { name: 'T. Nagar',         minLat: 13.02, maxLat: 13.06, minLon: 80.21, maxLon: 80.25 },
    { name: 'Nungambakkam',     minLat: 13.05, maxLat: 13.08, minLon: 80.23, maxLon: 80.26 },
    { name: 'Vadapalani',       minLat: 13.04, maxLat: 13.07, minLon: 80.18, maxLon: 80.22 },
    { name: 'Saidapet',         minLat: 13.00, maxLat: 13.03, minLon: 80.21, maxLon: 80.24 },
    { name: 'Adyar',            minLat: 12.98, maxLat: 13.02, minLon: 80.24, maxLon: 80.27 },
    { name: 'Besant Nagar',     minLat: 12.98, maxLat: 13.01, minLon: 80.26, maxLon: 80.29 },
    { name: 'Anna Nagar',       minLat: 13.07, maxLat: 13.11, minLon: 80.19, maxLon: 80.23 },
    { name: 'Guindy',           minLat: 12.99, maxLat: 13.02, minLon: 80.20, maxLon: 80.24 },
    { name: 'Velachery',        minLat: 12.96, maxLat: 12.99, minLon: 80.21, maxLon: 80.24 },
    { name: 'Alandur',          minLat: 12.98, maxLat: 13.01, minLon: 80.17, maxLon: 80.21 },
    { name: 'Porur',            minLat: 13.02, maxLat: 13.06, minLon: 80.15, maxLon: 80.19 },
    { name: 'Ambattur',         minLat: 13.09, maxLat: 13.13, minLon: 80.13, maxLon: 80.18 },
    { name: 'Avadi',            minLat: 13.09, maxLat: 13.14, minLon: 79.96, maxLon: 80.10 },
    { name: 'Chromepet',        minLat: 12.94, maxLat: 12.97, minLon: 80.13, maxLon: 80.17 },
    { name: 'Pallavaram',       minLat: 12.95, maxLat: 12.98, minLon: 80.14, maxLon: 80.18 },
    { name: 'Tambaram',         minLat: 12.90, maxLat: 12.94, minLon: 80.10, maxLon: 80.15 },
    { name: 'Sholinganallur',   minLat: 12.89, maxLat: 12.93, minLon: 80.22, maxLon: 80.25 },
    { name: 'Perungudi',        minLat: 12.95, maxLat: 12.98, minLon: 80.23, maxLon: 80.26 },
    { name: 'Thoraipakkam',     minLat: 12.92, maxLat: 12.95, minLon: 80.23, maxLon: 80.26 },
    { name: 'Sholinganallur',   minLat: 12.89, maxLat: 12.94, minLon: 80.22, maxLon: 80.26 },
    { name: 'OMR',              minLat: 12.85, maxLat: 12.95, minLon: 80.22, maxLon: 80.27 },
    { name: 'Kodambakkam',      minLat: 13.04, maxLat: 13.07, minLon: 80.21, maxLon: 80.25 },
    { name: 'Marina',           minLat: 13.03, maxLat: 13.07, minLon: 80.27, maxLon: 80.30 },
  ];

  for (const area of areas) {
    if (lat >= area.minLat && lat <= area.maxLat && lon >= area.minLon && lon <= area.maxLon) {
      return area.name;
    }
  }
  return 'Greater Chennai';
}

// ─── Map OSM parking tag to our parkingType ───────────────────────────────────
function mapParkingType(tags) {
  const amenity = tags.amenity || '';
  const parkingTag = tags.parking || '';

  if (amenity === 'motorcycle_parking') return 'street';
  if (parkingTag === 'multi-storey' || parkingTag === 'multi_storey') return 'multi_storey';
  if (parkingTag === 'underground') return 'underground';
  if (parkingTag === 'surface') return 'surface';
  if (parkingTag === 'rooftop') return 'surface';
  if (parkingTag === 'street_side' || parkingTag === 'lane' || parkingTag === 'on_street') return 'street';

  // Infer from operator/name
  const name = (tags.name || '').toLowerCase();
  if (name.includes('mall') || name.includes('cinema') || name.includes('theatre')) return 'mall';
  if (name.includes('railway') || name.includes('station')) return 'railway';
  if (name.includes('metro')) return 'metro';
  if (name.includes('college') || name.includes('university') || name.includes('iit') || name.includes('anna university')) return 'college_university';
  if (name.includes('hospital') || name.includes('court') || name.includes('govt') || name.includes('government')) return 'institutional';

  return 'parking_lot';
}

// ─── Map OSM access tag to our accessType ────────────────────────────────────
function mapAccessType(tags) {
  const access = tags.access || '';
  if (access === 'yes' || access === 'public') return 'public';
  if (access === 'customers') return 'customers';
  if (access === 'private') return 'private';
  if (access === 'permissive') return 'public'; // permissive = effectively public
  if (access === 'permit') return 'permit';
  return 'unknown';
}

// ─── Determine supported vehicle types ───────────────────────────────────────
function determineSupportedVehicleTypes(tags) {
  const amenity = tags.amenity || '';
  if (amenity === 'motorcycle_parking') return 'TWO_WHEELER';

  // Explicit tags
  const motorcycle = tags.motorcycle || '';
  const bicycle = tags.bicycle || '';

  if (motorcycle === 'only') return 'TWO_WHEELER';
  if (motorcycle === 'no') return 'FOUR_WHEELER';

  const name = (tags.name || '').toLowerCase();
  if (name.includes('two wheeler') || name.includes('motorcycle') || name.includes('bike stand') || name.includes('bike parking') || name.includes('two-wheeler')) {
    // Check if it also mentions car
    if (name.includes('car') || name.includes('vehicle') || name.includes('parking lot')) return 'TWO_WHEELER,FOUR_WHEELER';
    return 'TWO_WHEELER';
  }

  return 'TWO_WHEELER,FOUR_WHEELER';
}

// ─── Generate a meaningful name if OSM lacks one ─────────────────────────────
let unnamedCounter = 1;
function generateName(tags, lat, lon) {
  if (tags.name) return tags.name;
  if (tags.operator) return `${tags.operator} Parking`;

  const amenity = tags.amenity || '';
  const area = deriveArea(lat, lon);

  if (amenity === 'motorcycle_parking') {
    return `Two-Wheeler Stand – ${area} #${unnamedCounter++}`;
  }

  const parkingTag = tags.parking || '';
  if (parkingTag === 'multi-storey') return `Multi-Level Parking – ${area} #${unnamedCounter++}`;
  if (parkingTag === 'surface') return `Surface Lot – ${area} #${unnamedCounter++}`;
  if (parkingTag === 'street_side' || parkingTag === 'lane') return `Street Parking – ${area} #${unnamedCounter++}`;

  return `Public Parking – ${area} #${unnamedCounter++}`;
}

// ─── Parse capacity tags safely ───────────────────────────────────────────────
function parseCapacity(val) {
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) || n <= 0 ? null : Math.min(n, 2000); // sanity cap
}

// ─── Fetch fresh data from Overpass API ───────────────────────────────────────
function fetchOverpass() {
  return new Promise((resolve, reject) => {
    const query = `[out:json][timeout:45];
(
  node["amenity"="parking"](${BBOX});
  way["amenity"="parking"](${BBOX});
  node["amenity"="motorcycle_parking"](${BBOX});
  way["amenity"="motorcycle_parking"](${BBOX});
);
out center 500;`;

    const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
    console.log('  Querying Overpass API (this may take ~20 seconds)...');

    https.get(url, { headers: { 'User-Agent': 'parkSafe-Chennai-OSM-Importer/2.0' } }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          resolve(json.elements || []);
        } catch (e) {
          reject(new Error('Failed to parse Overpass response: ' + e.message));
        }
      });
    }).on('error', reject);
  });
}

// ─── Main Import Logic ────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  parkSafe v2 – OSM Chennai Parking Data Import  ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // 1. Load OSM elements (prefer cached dump, fetch if not available)
  const dumpPath = path.join(__dirname, 'osm_chennai_dump.json');
  let elements = [];

  if (fs.existsSync(dumpPath)) {
    console.log('✓ Loading cached OSM dump from scripts/osm_chennai_dump.json...');
    elements = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
    console.log(`  Loaded ${elements.length} cached OSM elements.`);
  } else {
    console.log('  No cached dump found. Fetching from Overpass API...');
    elements = await fetchOverpass();
    fs.writeFileSync(dumpPath, JSON.stringify(elements, null, 2));
    console.log(`  Saved ${elements.length} elements to cache.`);
  }

  // 2. Normalise elements
  console.log('\n→ Normalising OSM elements...');

  const normalised = [];
  for (const el of elements) {
    const tags = el.tags || {};

    // Skip elements without amenity tag
    if (!tags.amenity) continue;

    // Get coordinates
    const lat = el.lat || (el.center && el.center.lat);
    const lon = el.lon || (el.center && el.center.lon);

    // Skip elements with missing or invalid coordinates
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) continue;

    // Skip clearly private-only entries (private with no public access)
    const access = tags.access || '';
    if (access === 'private' && !tags.name) continue; // Skip unnamed private lots

    const osmId = `osm:${el.type}:${el.id}`;
    const name = generateName(tags, lat, lon);
    const area = deriveArea(lat, lon);
    const parkingType = mapParkingType(tags);
    const accessType = mapAccessType(tags);
    const supportedVehicleTypes = determineSupportedVehicleTypes(tags);

    // Capacities from OSM tags (only real values)
    const totalCapacity = parseCapacity(tags.capacity);
    const carCapacity = parseCapacity(tags['capacity:car'] || tags['capacity:hgv']);
    const twoWheelerCapacity = parseCapacity(tags['capacity:motorcycle'] || tags['capacity:bicycle']);

    // Derive car/2W split if only total is known
    let derivedCarCap = carCapacity;
    let derived2WCap = twoWheelerCapacity;

    if (totalCapacity && !carCapacity && !twoWheelerCapacity) {
      if (supportedVehicleTypes === 'TWO_WHEELER') {
        derived2WCap = totalCapacity;
      } else if (supportedVehicleTypes === 'FOUR_WHEELER') {
        derivedCarCap = totalCapacity;
      }
      // For mixed, leave as null – we don't want to invent the split
    }

    normalised.push({
      osmId,
      name,
      area,
      city: 'Chennai',
      parkingType,
      accessType,
      latitude: lat,
      longitude: lon,
      supportedVehicleTypes,
      capacity: totalCapacity,
      carCapacity: derivedCarCap,
      twoWheelerCapacity: derived2WCap,
      isSharedCapacity: false,
      // ─── IMPORTANT: We never invent live availability ─────────────────
      availableCarSpaces: null,
      availableTwoWheelerSpaces: null,
      availabilityStatus: 'UNKNOWN',
      carAvailabilityStatus: 'UNKNOWN',
      twoWheelerAvailabilityStatus: 'UNKNOWN',
      availabilitySource: 'unknown',
      confidence: 'none',
      // ──────────────────────────────────────────────────────────────────
      dataSource: 'OpenStreetMap',
      hasIndividualSpaces: false,
      isDemoData: false,
      fee: tags.fee || null,
      operator: tags.operator || null,
    });
  }

  console.log(`  ${normalised.length} valid locations normalised from ${elements.length} OSM elements.`);

  // 3. Deduplicate by osmId
  const uniqueByOsmId = new Map();
  for (const loc of normalised) {
    if (!uniqueByOsmId.has(loc.osmId)) {
      uniqueByOsmId.set(loc.osmId, loc);
    }
  }
  console.log(`  ${uniqueByOsmId.size} unique locations after deduplication.`);

  // 4. Upsert into database
  console.log('\n→ Upserting into database (using osmId as unique key)...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const loc of uniqueByOsmId.values()) {
    try {
      const existing = await prisma.parkingLocation.findUnique({
        where: { osmId: loc.osmId },
      });

      if (existing) {
        // Update only non-availability fields (preserve user-confirmed availability)
        await prisma.parkingLocation.update({
          where: { osmId: loc.osmId },
          data: {
            name: loc.name,
            area: loc.area,
            parkingType: loc.parkingType,
            accessType: loc.accessType,
            latitude: loc.latitude,
            longitude: loc.longitude,
            supportedVehicleTypes: loc.supportedVehicleTypes,
            capacity: loc.capacity,
            carCapacity: loc.carCapacity,
            twoWheelerCapacity: loc.twoWheelerCapacity,
            fee: loc.fee,
            operator: loc.operator,
            dataSource: 'OpenStreetMap',
          },
        });
        updated++;
      } else {
        await prisma.parkingLocation.create({ data: loc });
        created++;
      }
    } catch (err) {
      console.warn(`  ⚠ Skipped ${loc.osmId} (${loc.name}): ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Created  : ${created}`);
  console.log(`   Updated  : ${updated}`);
  console.log(`   Skipped  : ${skipped}`);
  console.log(`   Total DB : ${created + updated}`);

  const total = await prisma.parkingLocation.count();
  console.log(`\n   Total parking locations in database: ${total}`);
  console.log('\n  Remember: All OSM-imported locations show AVAILABILITY UNKNOWN.');
  console.log('  Only user-confirmed locations will show live availability data.\n');
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
