import { NextRequest, NextResponse } from "next/server";
import { AvailabilityService } from "@/lib/services/AvailabilityService";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { reportType, details, spaceId, sessionId, vehicleType, reportedAvailability } = body;

    if (!reportType) {
      return NextResponse.json(
        { success: false, message: "reportType is required" },
        { status: 400 }
      );
    }

    const report = await AvailabilityService.recordUserReport({
      parkingLocationId: id,
      spaceId: spaceId || null,
      vehicleType: vehicleType || "ALL",
      reportType,
      reportedAvailability: typeof reportedAvailability === "number" ? reportedAvailability : undefined,
      details: details ? details.slice(0, 500) : undefined, // sanitize length
      sessionId: sessionId || "anonymous",
    });

    return NextResponse.json({
      success: true,
      message: "Report submitted. Thank you for keeping Chennai parking data accurate!",
      data: report,
    });
  } catch (error: any) {
    console.error("POST /api/parking/[id]/report error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit report" },
      { status: 500 }
    );
  }
}
