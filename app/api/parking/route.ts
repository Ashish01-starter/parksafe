import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateHaversineDistanceKm, estimateTravelTimeMinutes } from "@/lib/distance";
import { calculateAvailabilityConfidence } from "@/lib/confidence";
import {
  VehicleType,
  ParkingLocationDto,
  ParkingType,
  AccessType,
  AvailabilityStatus,
  AvailabilitySource,
  ConfidenceLevel,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const radiusKmStr = searchParams.get("radiusKm");
    const vehicleType = searchParams.get("vehicleType") as VehicleType | null;

    const userLat = latStr ? parseFloat(latStr) : 13.0827; // default Chennai Central
    const userLng = lngStr ? parseFloat(lngStr) : 80.2707;
    const radiusKm = radiusKmStr ? parseFloat(radiusKmStr) : 8.0;

    // Fetch all locations with their spaces
    const locations = await prisma.parkingLocation.findMany({
      include: {
        spaces: true,
      },
    });

    // Filter by vehicle type compatibility and distance
    const enriched: ParkingLocationDto[] = locations
      .filter((loc) => {
        // Vehicle type filter
        if (vehicleType) {
          const supported = loc.supportedVehicleTypes.split(",");
          if (!supported.includes(vehicleType)) {
            return false;
          }
        }
        return true;
      })
      .map((loc) => {
        const distanceKm = calculateHaversineDistanceKm(
          userLat,
          userLng,
          loc.latitude,
          loc.longitude
        );
        const estimatedMinutes = estimateTravelTimeMinutes(
          distanceKm,
          vehicleType || "FOUR_WHEELER"
        );
        const confidenceInfo = calculateAvailabilityConfidence(
          loc.lastUpdated,
          loc.availabilitySource as AvailabilitySource
        );

        return {
          id: loc.id,
          osmId: loc.osmId,
          name: loc.name,
          address: loc.address,
          area: loc.area,
          city: loc.city,
          parkingType: loc.parkingType as ParkingType,
          accessType: loc.accessType as AccessType,
          latitude: loc.latitude,
          longitude: loc.longitude,
          supportedVehicleTypes: loc.supportedVehicleTypes,
          capacity: loc.capacity,
          carCapacity: loc.carCapacity,
          twoWheelerCapacity: loc.twoWheelerCapacity,
          isSharedCapacity: loc.isSharedCapacity,
          availableCarSpaces: loc.availableCarSpaces,
          availableTwoWheelerSpaces: loc.availableTwoWheelerSpaces,
          availabilityStatus: loc.availabilityStatus as AvailabilityStatus,
          carAvailabilityStatus: loc.carAvailabilityStatus as AvailabilityStatus,
          twoWheelerAvailabilityStatus: loc.twoWheelerAvailabilityStatus as AvailabilityStatus,
          availabilitySource: loc.availabilitySource as AvailabilitySource,
          confidence: confidenceInfo.level as ConfidenceLevel,
          confidenceTier: confidenceInfo.tier,
          dataSource: loc.dataSource,
          hasIndividualSpaces: loc.hasIndividualSpaces,
          isDemoData: loc.isDemoData,
          fee: loc.fee,
          operator: loc.operator,
          lastUpdated: loc.lastUpdated.toISOString(),
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          estimatedMinutes,
          spaces: loc.spaces.map((s) => ({
            id: s.id,
            spaceIdentifier: s.spaceIdentifier,
            section: s.section,
            parkingLocationId: s.parkingLocationId,
            vehicleType: s.vehicleType,
            status: s.status as any,
            latitude: s.latitude,
            longitude: s.longitude,
            lastUpdated: s.lastUpdated.toISOString(),
            lastUpdatedBy: s.lastUpdatedBy,
            source: s.source,
          })),
        };
      })
      // Filter by user search radius
      .filter((loc) => (loc.distanceKm ?? 0) <= radiusKm)
      // Sort: closest first. If close, sort by available spaces for selected vehicle type
      .sort((a, b) => {
        const distA = a.distanceKm ?? 0;
        const distB = b.distanceKm ?? 0;
        if (Math.abs(distA - distB) < 0.3) {
          const availA =
            vehicleType === "TWO_WHEELER"
              ? (a.availableTwoWheelerSpaces ?? -1)
              : (a.availableCarSpaces ?? -1);
          const availB =
            vehicleType === "TWO_WHEELER"
              ? (b.availableTwoWheelerSpaces ?? -1)
              : (b.availableCarSpaces ?? -1);
          return availB - availA;
        }
        return distA - distB;
      });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      userCenter: { latitude: userLat, longitude: userLng },
      radiusKm,
      vehicleType,
      data: enriched,
    });
  } catch (error: any) {
    console.error("GET /api/parking error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch parking locations" },
      { status: 500 }
    );
  }
}
