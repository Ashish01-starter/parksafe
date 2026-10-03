import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// High-speed, guaranteed-accurate preset coordinates for Chennai localities
const CHENNAI_LOCALITY_PRESETS: Record<string, { lat: number; lng: number; displayName: string }> = {
  "t nagar": { lat: 13.0405, lng: 80.2337, displayName: "T. Nagar (Thyagaraya Nagar), Chennai" },
  "pondy bazaar": { lat: 13.0405, lng: 80.2337, displayName: "Pondy Bazaar, T. Nagar, Chennai" },
  "anna nagar": { lat: 13.0850, lng: 80.2155, displayName: "Anna Nagar Roundtana, Chennai" },
  "adyar": { lat: 13.0071, lng: 80.2546, displayName: "Adyar, South Chennai" },
  "besant nagar": { lat: 13.0003, lng: 80.2694, displayName: "Besant Nagar (Elliot's Beach), Chennai" },
  "velachery": { lat: 12.9815, lng: 80.2180, displayName: "Velachery, Chennai" },
  "phoenix mall": { lat: 12.9915, lng: 80.2170, displayName: "Phoenix Marketcity, Velachery, Chennai" },
  "guindy": { lat: 13.0076, lng: 80.2036, displayName: "Guindy (Kathipara Junction), Chennai" },
  "marina beach": { lat: 13.0544, lng: 80.2831, displayName: "Marina Beach Promenade, Central Chennai" },
  "chennai central": { lat: 13.0827, lng: 80.2757, displayName: "Puratchi Thalaivar Dr. MGR Central Station, Chennai" },
  "omr": { lat: 12.9897, lng: 80.2476, displayName: "Old Mahabalipuram Road (OMR / IT Expressway), Chennai" },
  "tidel park": { lat: 12.9897, lng: 80.2476, displayName: "Tidel Park, Taramani, Chennai" },
  "tambaram": { lat: 12.9254, lng: 80.1174, displayName: "Tambaram Railway Station, Chennai" },
  "mylapore": { lat: 13.0339, lng: 80.2692, displayName: "Mylapore (Kapaleeshwarar Temple area), Chennai" },
  "nungambakkam": { lat: 13.0595, lng: 80.2425, displayName: "Nungambakkam, Chennai" },
  "koyambedu": { lat: 13.0694, lng: 80.1948, displayName: "Koyambedu (CMBT), Chennai" },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    const results: Array<{ lat: number; lng: number; displayName: string; source: string }> = [];

    // Check presets first
    for (const [key, preset] of Object.entries(CHENNAI_LOCALITY_PRESETS)) {
      if (query.includes(key) || key.includes(query)) {
        results.push({
          lat: preset.lat,
          lng: preset.lng,
          displayName: preset.displayName,
          source: "preset",
        });
      }
    }

    // If query is broad or not in presets, query OpenStreetMap Nominatim with Chennai bounding box
    if (results.length < 3) {
      try {
        const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
        nominatimUrl.searchParams.set("q", `${query}, Chennai, India`);
        nominatimUrl.searchParams.set("format", "json");
        nominatimUrl.searchParams.set("limit", "4");
        nominatimUrl.searchParams.set("addressdetails", "1");
        // Chennai bounding box viewbox (lon_min, lat_min, lon_max, lat_max)
        nominatimUrl.searchParams.set("viewbox", "79.9,12.8,80.4,13.3");

        const response = await fetch(nominatimUrl.toString(), {
          headers: {
            "User-Agent": "parkSafe-Chennai-App/1.0 (academic-mvp)",
            "Accept-Language": "en",
          },
          next: { revalidate: 3600 },
        });

        if (response.ok) {
          const data = await response.json();
          for (const item of data) {
            results.push({
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              displayName: item.display_name,
              source: "nominatim",
            });
          }
        }
      } catch (nomErr) {
        console.warn("Nominatim fetch warning:", nomErr);
      }
    }

    return NextResponse.json({
      success: true,
      query,
      results: results.slice(0, 5),
    });
  } catch (error: any) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { success: false, message: "Geocoding failed" },
      { status: 500 }
    );
  }
}
