import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [locationsCount, demoCount, spacesCount, occupiedSpacesCount, reportsCount, recentEvents] =
      await Promise.all([
        prisma.parkingLocation.count(),
        prisma.parkingLocation.count({ where: { isDemoData: true } }),
        prisma.parkingSpace.count(),
        prisma.parkingSpace.count({ where: { status: "occupied" } }),
        prisma.userReport.count(),
        prisma.availabilityEvent.findMany({
          take: 10,
          orderBy: { timestamp: "desc" },
          include: { location: { select: { name: true, area: true } } },
        }),
      ]);

    const locations = await prisma.parkingLocation.findMany({
      include: {
        _count: { select: { spaces: true, reports: true } },
      },
      orderBy: { area: "asc" },
    });

    const totalCarCapacity = locations.reduce((sum, loc) => sum + (loc.carCapacity || 0), 0);
    const total2WCapacity = locations.reduce((sum, loc) => sum + (loc.twoWheelerCapacity || 0), 0);
    const totalCarAvailable = locations.reduce((sum, loc) => sum + (loc.availableCarSpaces || 0), 0);
    const total2WAvailable = locations.reduce((sum, loc) => sum + (loc.availableTwoWheelerSpaces || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalFacilities: locationsCount,
        demoFacilities: demoCount,
        osmFacilities: locationsCount - demoCount,
        totalCarCapacity,
        total2WCapacity,
        totalCarAvailable,
        total2WAvailable,
        mappedSpaces: spacesCount,
        occupiedMappedSpaces: occupiedSpacesCount,
        totalReports: reportsCount,
      },
      locations,
      recentEvents,
    });
  } catch (error: any) {
    console.error("GET /api/admin error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Reset / re-seed data
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, locationData } = body;

    if (action === "reset_seed") {
      const { execSync } = require("child_process");
      execSync("node prisma/seed.js", { cwd: process.cwd() });
      return NextResponse.json({ success: true, message: "Demo data reset successfully" });
    }

    if (action === "create_location" && locationData) {
      const carCap = parseInt(locationData.carCapacity || "0", 10) || null;
      const twCap = parseInt(locationData.twoWheelerCapacity || "0", 10) || null;
      const totalCap = (carCap || 0) + (twCap || 0) || null;

      const created = await prisma.parkingLocation.create({
        data: {
          name: locationData.name,
          address: locationData.address || null,
          area: locationData.area || "Chennai",
          city: "Chennai",
          parkingType: locationData.parkingType || "parking_lot",
          accessType: locationData.accessType || "public",
          latitude: parseFloat(locationData.latitude),
          longitude: parseFloat(locationData.longitude),
          supportedVehicleTypes: locationData.supportedVehicleTypes || "TWO_WHEELER,FOUR_WHEELER",
          capacity: totalCap,
          carCapacity: carCap,
          twoWheelerCapacity: twCap,
          availableCarSpaces: carCap !== null ? parseInt(locationData.availableCarSpaces || String(carCap), 10) : null,
          availableTwoWheelerSpaces: twCap !== null ? parseInt(locationData.availableTwoWheelerSpaces || String(twCap), 10) : null,
          availabilityStatus: "AVAILABLE",
          carAvailabilityStatus: carCap ? "AVAILABLE" : "UNKNOWN",
          twoWheelerAvailabilityStatus: twCap ? "AVAILABLE" : "UNKNOWN",
          availabilitySource: "user_confirmation",
          confidence: "medium",
          dataSource: "ManualVerification",
          hasIndividualSpaces: false,
          isDemoData: true,
        },
      });
      return NextResponse.json({ success: true, data: created });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
