import { NextRequest, NextResponse } from "next/server";
import { AvailabilityService } from "@/lib/services/AvailabilityService";
import { VehicleType, AvailabilitySource } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { spaceId, sessionId, source, vehicleType } = body;

    const result = await AvailabilityService.vacateSpot({
      parkingLocationId: id,
      vehicleType: (vehicleType as VehicleType) || "FOUR_WHEELER",
      spaceId: spaceId || null,
      sessionId: sessionId || "anonymous",
      source: (source as AvailabilitySource) || "user_confirmation",
    });

    return NextResponse.json({
      success: true,
      message: "Spot marked as available successfully",
      data: {
        location: {
          ...result.location,
          lastUpdated: result.location.lastUpdated.toISOString(),
        },
        space: result.space
          ? {
              ...result.space,
              lastUpdated: result.space.lastUpdated.toISOString(),
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("POST /api/parking/[id]/vacate error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to vacate parking" },
      { status: 500 }
    );
  }
}
