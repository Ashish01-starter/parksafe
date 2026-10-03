import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const reports = await prisma.userReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        location: {
          select: {
            name: true,
            area: true,
            availabilityStatus: true,
            availableCarSpaces: true,
            availableTwoWheelerSpaces: true,
          },
        },
      },
      take: 50,
    });

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
