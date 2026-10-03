# parkSafe — Smart Public Parking Discovery Platform (Chennai, India)

> *"Find parking before parking finds you."*

**parkSafe** is a complete, map-first, privacy-conscious public parking discovery platform built specifically for urban drivers and riders in Chennai, Tamil Nadu, India. It connects two-wheeler riders (🏍) and four-wheeler drivers (🚗) directly to available public parking facilities, individual bay grids, and turn-by-turn navigation.

---

## 🚗 v2 Architecture & Features

The platform is designed around a **Truthful Hybrid Availability Architecture**:
1. **Real Chennai OpenStreetMap Facility Dataset:** Integrated with 278 real public parking locations across Chennai Metropolitan Area (T. Nagar, Anna Nagar, Adyar, Velachery, Guindy, Marina Beach, OMR, Tambaram, Egmore, Vadapalani, Central, Porur, etc.) via `npm run import:parking`.
2. **Dedicated 2W vs 4W Separation:** Two-wheeler capacity and availability are completely independent from Four-wheeler capacity and availability. A two-wheeler parking or departing never modifies car availability (unless explicitly marked as shared capacity).
3. **Truthful UNKNOWN Live Availability:** Real OSM locations are never assigned fake availability numbers. If no live sensor or recent driver confirmation exists, the UI clearly displays *"Availability unknown"* rather than fabricating numbers.
4. **Automatic 60-Second Refresh:** Client synchronizes with our backend every 60 seconds while active, with automatic pause when the browser tab is hidden and immediate refresh upon returning.
5. **Leaflet Marker Clustering:** Smoothly clusters 300+ markers across Chennai with zoom-in capability and high-performance rendering.
6. **On-Site Driver Confirmations & Geofencing:** When within geofence (~80m), the driver confirms arrival, which decrements the appropriate vehicle capacity in a thread-safe database transaction.
7. **Departure Releases & Reporting:** Drivers release spots upon leaving, and can submit crowdsourced discrepancy reports with confidence scores.
8. **Pluggable Detection Interface (`ParkingDetectionService`):** Prepared so manual confirmations can later be swapped for Computer Vision camera streams or IoT geomagnetic bay sensors.

---

## 🛠 Tech Stack

- **Frontend & Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling & UI:** Tailwind CSS (Mobile-first responsive layout with Google Maps-inspired UX and responsive bottom sheet)
- **Maps & Clustering:** Leaflet + React-Leaflet + Leaflet.markercluster + OpenStreetMap (100% free, no Google Maps API keys or billing required)
- **Database & ORM:** Prisma ORM with SQLite for zero-config instant local execution
- **Testing:** Node.js native test runner (`node --test`) with 17 automated unit and end-to-end integration tests

---

## 🚀 1. How to Run Locally

### Prerequisites
- Node.js (v18+ or v24+ recommended)
- npm (v9+)

### Installation Steps

1. Navigate to the project directory:
   ```bash
   cd C:\Users\Ashish\.gemini\antigravity\scratch\parksafe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate the Prisma database client:
   ```bash
   npx prisma generate
   ```

4. Push schema to database:
   ```bash
   npx prisma db push
   ```

5. Seed realistic Chennai demo parking facilities:
   ```bash
   node prisma/seed.js
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## ⚙️ 2. Required Environment Variables

Environment variables are located in `.env`:

```env
# Database connection string (SQLite for local dev, PostgreSQL for cloud)
DATABASE_URL="file:./dev.db"

# Geofence arrival detection radius in meters (default: 80m)
NEXT_PUBLIC_GEOFENCE_RADIUS_METERS=80

# Default map center coordinates (Chennai Central Station)
NEXT_PUBLIC_DEFAULT_LAT=13.0827
NEXT_PUBLIC_DEFAULT_LNG=80.2707

# Polling interval for live availability updates in ms (default: 10s)
NEXT_PUBLIC_POLL_INTERVAL_MS=10000

# Admin passcode for facility management operations
ADMIN_PASSCODE="chennai2025"
```

---

## 🗄 3. Database Setup & PostgreSQL Migration

By default, parkSafe is configured with **SQLite** (`dev.db`) for immediate zero-dependency testing on any computer without needing a running PostgreSQL daemon.

### Migrating to PostgreSQL (e.g. Supabase, Neon, Railway)
1. In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-host.neon.tech/neondb?sslmode=require"
   ```
3. Run:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

---

## 🧪 4. How to Test the Complete User Flow

The application comes with an interactive **Demo & Testing Panel** (accessible via the `SlidersHorizontal` icon in the top header) built specifically for college presentations and project evaluations.

### Step-by-Step Test Walkthrough:

1. **Welcome & Vehicle Selection:**
   - Open `http://localhost:3000`.
   - The landing dialog opens: *"Find parking before parking finds you."*
   - Click **"Find Parking"**.
   - Choose **🏍 Two Wheeler** or **🚗 Four Wheeler**.
   - Notice the vehicle filter badge dynamically updates in the top header.

2. **Location Discovery & Geocoding:**
   - Click the search bar or location chip.
   - Click **"T. Nagar (Pondy Bazaar)"** from the quick presets, or type *"Anna Nagar"* to test live geocoding.
   - The map smoothly flies to that locality and lists compatible parking facilities within the selected radius (e.g. 8 km).

3. **Selecting a Facility & Viewing Individual Bays:**
   - Click **"Pondy Bazaar Multi-Level Public Parking"**.
   - Review facility details: Available capacity (e.g. 21 / 50), distance, travel time (~4 mins), confidence score.
   - Examine the visual bay grid (A1 🔴, A2 🟢, A3 🟢, B1 🟢, M1 🟢).
   - Click an available bay (e.g., **A2**). Notice it highlights as your target space.

4. **Simulating Arrival & Geofence Detection:**
   - Click the **"Simulate Arrival"** button (or open the top-right Demo Panel and click *"Simulate Arriving at Nearest Lot"*).
   - The geofence trigger detects you are within ~80m of the parking entrance.
   - Modal prompts: *"You've arrived at your parking location. Did you park here?"*
   - Click **"Yes, I parked"**.

5. **Observing Capacity Decrement & Parked State:**
   - Space A2 switches from **🟢 Available** to **🔴 Occupied**.
   - Overall available capacity decrements by 1 (e.g. 21 → 20).
   - An active floating session banner appears: *"Active Parking Session: Pondy Bazaar MLCP • Bay A2"*.
   - If you open a second tab at `http://localhost:3000`, you will see the updated capacity immediately reflected.

6. **Departure & Spot Release:**
   - On the floating session banner, click **"Mark Available & Leave"**.
   - The space switches back to **🟢 Available**.
   - Available spots increment by 1 (e.g. 20 → 21).

7. **Crowdsourced Discrepancy Reporting:**
   - Click any parking card → click *"Report incorrect availability or issue"*.
   - Select *"Entire parking location is full"*, add optional notes, and click *"Submit Report"*.
   - Visit the Admin Console at `http://localhost:3000/admin` to see the report logged with timestamp and status.

---

## 🧪 5. Automated Unit Tests

Run the automated test suite verifying distance algorithms, geofence thresholding, capacity boundary checks, and vehicle filtering:

```bash
npm test
```

Test results:
- ✔ Distance calculation (Haversine formula Marina Beach ↔ Central Station)
- ✔ Geofence arrival detection (inside 80m vs outside 80m)
- ✔ Occupancy status derivation (`available`, `limited`, `full`)
- ✔ Vehicle compatibility filtering (excludes 2W-only when driving 4W)
- ✔ Search radius and distance sorting (closest first)
- ✔ Capacity boundary safety (prevents negative available spots or exceeding total capacity)

---

## ☁️ 6. Deployment Guide (Vercel)

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete parkSafe Chennai platform"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Connect your repo in [Vercel](https://vercel.com/new).
3. Create a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
4. In Vercel Project Settings > **Environment Variables**, add:
   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `NEXT_PUBLIC_GEOFENCE_RADIUS_METERS`: `80`
   - `NEXT_PUBLIC_POLL_INTERVAL_MS`: `10000`
5. In `prisma/schema.prisma`, ensure provider is set to `"postgresql"`.
6. Deploy! Vercel will automatically build Next.js App Router and Prisma client.

---

## 🔍 7. Which Parts Are Currently Simulated vs Real

| Feature | Current MVP Implementation | Notes |
| :--- | :--- | :--- |
| **GPS Location & Distance** | **GENUINE** (HTML5 Geolocation API + Haversine formula) | Calculates actual distance from device to facility. Fallback coords provided if permission denied. |
| **Mapping & Pins** | **GENUINE** (Leaflet + OpenStreetMap) | Interactive zooming, custom SVG marker pins, dynamic status colors. |
| **External Navigation** | **GENUINE** (Native Google Maps / Apple Maps deep link) | Opens device navigation app with destination coordinates. |
| **Database Persistence** | **GENUINE** (Prisma ORM + SQLite/Postgres) | Every park/vacate/report transaction is saved to the DB. |
| **Multi-client Synchronization** | **GENUINE** (Configurable periodic polling hook) | Automatically fetches latest state every 10s without page reloads. |
| **Bay-Level Occupancy Detection** | **HYBRID / SIMULATED** (Manual Driver Confirmation + Demo Panel) | Relies on driver confirmation upon arrival within 80m geofence. **No fake browser AI is claimed.** |
| **Hardware Sensors / Cameras** | **ARCHITECTURAL PLACEHOLDER** (`CameraParkingDetectionService`, `IoTParkingDetectionService`) | Clean software interfaces ready to plug into real RTSP camera feeds or LoRaWAN gateways. |

---

## 🔮 8. Moving from MVP to Production: Real-Time & AI Upgrade Roadmap

When ready to say:
> *"Now make parkSafe production-ready with real-time parking detection"*

The existing architecture requires **zero rewriting**—only plugging in production services:

1. **Replace Polling with WebSockets / Server-Sent Events (SSE):**
   - The database already generates structured `AvailabilityEvent` records for every occupancy change.
   - Connect Redis Pub/Sub or Supabase Realtime to broadcast `parking.updated` events directly to the `MapView` and `NearbyParking` components.

2. **Activate Computer Vision Pipeline (`CameraParkingDetectionService`):**
   - Place cameras covering municipal parking bays or MLCP decks.
   - Run YOLOv8 / YOLO-NAS on edge devices (NVIDIA Jetson) to output bounding box centroids.
   - Map centroids to bay polygons.
   - The model calls `AvailabilityService.occupySpot({ source: 'camera' })`.

3. **Deploy IoT Magnetic Sensors (`IoTParkingDetectionService`):**
   - Install wireless surface geomagnetic sensors in outdoor street spots.
   - Ingest LoRaWAN / MQTT uplinks directly to `AvailabilityService`.

4. **Integration with Chennai Smart City / GCC (Greater Chennai Corporation):**
   - Ingest live feeds from Smart City automated parking management systems across Pondy Bazaar and T. Nagar.
