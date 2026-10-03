import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const location = await prisma.parkingLocation.findUnique({
      where: { id },
      include: {
        spaces: {
          orderBy: { spaceIdentifier: 'asc' },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Parking location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...location,
        lastUpdated: location.lastUpdated.toISOString(),
        spaces: location.spaces.map(s => ({
          ...s,
          lastUpdated: s.lastUpdated.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/parking/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch parking details" },
      { status: 500 }
    );
  }
}
