import { prisma } from "../prisma";
import {
  VehicleType,
  AvailabilityStatus,
  AvailabilitySource,
  SpaceStatus,
  VehicleAvailabilityData,
} from "../types";

export class AvailabilityService {
  /**
   * Derives facility availability status from available spaces and capacity.
   * If available or capacity is null, returns UNKNOWN.
   */
  static deriveStatus(
    available: number | null | undefined,
    capacity: number | null | undefined
  ): AvailabilityStatus {
    if (available === null || available === undefined || capacity === null || capacity === undefined) {
      return "UNKNOWN";
    }
    if (available <= 0) return "FULL";
    const ratio = capacity > 0 ? available / capacity : 1;
    if (ratio <= 0.2 || available <= 3) return "LIMITED";
    return "AVAILABLE";
  }

  /**
   * Retrieves availability information separated for the specific vehicle type.
   */
  static async getAvailability(
    parkingLocationId: string,
    vehicleType: VehicleType
  ): Promise<VehicleAvailabilityData> {
    const loc = await prisma.parkingLocation.findUnique({
      where: { id: parkingLocationId },
    });

    if (!loc) {
      throw new Error(`Parking location ${parkingLocationId} not found`);
    }

    const is2W = vehicleType === "TWO_WHEELER";
    const available = is2W ? loc.availableTwoWheelerSpaces : loc.availableCarSpaces;
    const capacity = is2W ? loc.twoWheelerCapacity : loc.carCapacity;
    const status = (is2W ? loc.twoWheelerAvailabilityStatus : loc.carAvailabilityStatus) as AvailabilityStatus;

    return {
      available,
      capacity,
      status: status || this.deriveStatus(available, capacity),
      source: loc.availabilitySource as AvailabilitySource,
      confidence: loc.confidence as any,
      lastUpdated: loc.lastUpdated.toISOString(),
    };
  }

  /**
   * Marks a spot as occupied upon user arrival.
   * Decrements vehicle-specific available capacity safely (never negative).
   * If isSharedCapacity is true, decrements both.
   */
  static async occupySpot(params: {
    parkingLocationId: string;
    vehicleType: VehicleType;
    spaceId?: string | null;
    sessionId?: string;
    source?: AvailabilitySource;
  }) {
    const { parkingLocationId, vehicleType, spaceId, sessionId, source = "user_confirmation" } = params;

    return await prisma.$transaction(async (tx) => {
      const location = await tx.parkingLocation.findUnique({
        where: { id: parkingLocationId },
        include: { spaces: true },
      });

      if (!location) {
        throw new Error(`Parking location ${parkingLocationId} not found`);
      }

      let updatedSpace = null;
      if (spaceId) {
        updatedSpace = await tx.parkingSpace.update({
          where: { id: spaceId },
          data: {
            status: "occupied" as SpaceStatus,
            lastUpdated: new Date(),
            lastUpdatedBy: sessionId || "user",
            source,
          },
        });
      }

      const is2W = vehicleType === "TWO_WHEELER";
      let prevAvailable: number | null = null;
      let newAvailable: number | null = null;

      let newCarSpaces = location.availableCarSpaces;
      let new2WSpaces = location.availableTwoWheelerSpaces;

      if (is2W) {
        prevAvailable = location.availableTwoWheelerSpaces;
        if (location.availableTwoWheelerSpaces !== null) {
          new2WSpaces = Math.max(0, location.availableTwoWheelerSpaces - 1);
          newAvailable = new2WSpaces;
        }
        if (location.isSharedCapacity && location.availableCarSpaces !== null) {
          newCarSpaces = Math.max(0, location.availableCarSpaces - 1);
        }
      } else {
        prevAvailable = location.availableCarSpaces;
        if (location.availableCarSpaces !== null) {
          newCarSpaces = Math.max(0, location.availableCarSpaces - 1);
          newAvailable = newCarSpaces;
        }
        if (location.isSharedCapacity && location.availableTwoWheelerSpaces !== null) {
          new2WSpaces = Math.max(0, location.availableTwoWheelerSpaces - 1);
        }
      }

      const newCarStatus = this.deriveStatus(newCarSpaces, location.carCapacity);
      const new2WStatus = this.deriveStatus(new2WSpaces, location.twoWheelerCapacity);

      // Determine overall status
      let overallStatus: AvailabilityStatus = "UNKNOWN";
      if (newCarStatus === "FULL" && new2WStatus === "FULL") overallStatus = "FULL";
      else if (newCarStatus === "LIMITED" || new2WStatus === "LIMITED") overallStatus = "LIMITED";
      else if (newCarStatus === "AVAILABLE" || new2WStatus === "AVAILABLE") overallStatus = "AVAILABLE";

      const updatedLocation = await tx.parkingLocation.update({
        where: { id: parkingLocationId },
        data: {
          availableCarSpaces: newCarSpaces,
          availableTwoWheelerSpaces: new2WSpaces,
          carAvailabilityStatus: newCarStatus,
          twoWheelerAvailabilityStatus: new2WStatus,
          availabilityStatus: overallStatus,
          availabilitySource: source,
          confidence: "high",
          lastUpdated: new Date(),
        },
        include: { spaces: true },
      });

      // Record audit event
      await tx.availabilityEvent.create({
        data: {
          parkingLocationId,
          spaceId: spaceId || null,
          vehicleType,
          eventType: "parked",
          previousAvailable: prevAvailable,
          newAvailable: newAvailable,
          deltaSpaces: -1,
          sessionId: sessionId || null,
          source,
          metadata: JSON.stringify({ spaceIdentifier: updatedSpace?.spaceIdentifier }),
        },
      });

      return { location: updatedLocation, space: updatedSpace };
    });
  }

  /**
   * Marks a spot as vacated / available upon user departure.
   * Increments vehicle-specific available capacity without exceeding capacity.
   */
  static async vacateSpot(params: {
    parkingLocationId: string;
    vehicleType: VehicleType;
    spaceId?: string | null;
    sessionId?: string;
    source?: AvailabilitySource;
  }) {
    const { parkingLocationId, vehicleType, spaceId, sessionId, source = "user_confirmation" } = params;

    return await prisma.$transaction(async (tx) => {
      const location = await tx.parkingLocation.findUnique({
        where: { id: parkingLocationId },
        include: { spaces: true },
      });

      if (!location) {
        throw new Error(`Parking location ${parkingLocationId} not found`);
      }

      let updatedSpace = null;
      if (spaceId) {
        updatedSpace = await tx.parkingSpace.update({
          where: { id: spaceId },
          data: {
            status: "available" as SpaceStatus,
            lastUpdated: new Date(),
            lastUpdatedBy: sessionId || "user",
            source,
          },
        });
      }

      const is2W = vehicleType === "TWO_WHEELER";
      let prevAvailable: number | null = null;
      let newAvailable: number | null = null;

      let newCarSpaces = location.availableCarSpaces;
      let new2WSpaces = location.availableTwoWheelerSpaces;

      if (is2W) {
        prevAvailable = location.availableTwoWheelerSpaces;
        if (location.availableTwoWheelerSpaces !== null) {
          const cap = location.twoWheelerCapacity ?? 9999;
          new2WSpaces = Math.min(cap, location.availableTwoWheelerSpaces + 1);
          newAvailable = new2WSpaces;
        }
        if (location.isSharedCapacity && location.availableCarSpaces !== null) {
          const cap = location.carCapacity ?? 9999;
          newCarSpaces = Math.min(cap, location.availableCarSpaces + 1);
        }
      } else {
        prevAvailable = location.availableCarSpaces;
        if (location.availableCarSpaces !== null) {
          const cap = location.carCapacity ?? 9999;
          newCarSpaces = Math.min(cap, location.availableCarSpaces + 1);
          newAvailable = newCarSpaces;
        }
        if (location.isSharedCapacity && location.availableTwoWheelerSpaces !== null) {
          const cap = location.twoWheelerCapacity ?? 9999;
          new2WSpaces = Math.min(cap, location.availableTwoWheelerSpaces + 1);
        }
      }

      const newCarStatus = this.deriveStatus(newCarSpaces, location.carCapacity);
      const new2WStatus = this.deriveStatus(new2WSpaces, location.twoWheelerCapacity);

      let overallStatus: AvailabilityStatus = "UNKNOWN";
      if (newCarStatus === "FULL" && new2WStatus === "FULL") overallStatus = "FULL";
      else if (newCarStatus === "LIMITED" || new2WStatus === "LIMITED") overallStatus = "LIMITED";
      else if (newCarStatus === "AVAILABLE" || new2WStatus === "AVAILABLE") overallStatus = "AVAILABLE";

      const updatedLocation = await tx.parkingLocation.update({
        where: { id: parkingLocationId },
        data: {
          availableCarSpaces: newCarSpaces,
          availableTwoWheelerSpaces: new2WSpaces,
          carAvailabilityStatus: newCarStatus,
          twoWheelerAvailabilityStatus: new2WStatus,
          availabilityStatus: overallStatus,
          availabilitySource: source,
          confidence: "high",
          lastUpdated: new Date(),
        },
        include: { spaces: true },
      });

      await tx.availabilityEvent.create({
        data: {
          parkingLocationId,
          spaceId: spaceId || null,
          vehicleType,
          eventType: "vacated",
          previousAvailable: prevAvailable,
          newAvailable: newAvailable,
          deltaSpaces: 1,
          sessionId: sessionId || null,
          source,
        },
      });

      return { location: updatedLocation, space: updatedSpace };
    });
  }

  /**
   * Submits a crowdsourced user report and updates confidence / availability.
   */
  static async recordUserReport(params: {
    parkingLocationId: string;
    spaceId?: string | null;
    vehicleType?: string;
    reportType: string;
    reportedAvailability?: number | null;
    details?: string;
    sessionId?: string;
  }) {
    const {
      parkingLocationId,
      spaceId,
      vehicleType = "ALL",
      reportType,
      reportedAvailability,
      details,
      sessionId,
    } = params;

    const report = await prisma.userReport.create({
      data: {
        parkingLocationId,
        spaceId: spaceId || null,
        vehicleType,
        reportType,
        reportedAvailability: reportedAvailability ?? null,
        details: details || null,
        reportedBySession: sessionId || null,
        status: "pending",
        source: "user_report",
      },
    });

    // If report says location is full, verify consensus from multiple recent reports
    if (reportType === "location_full") {
      const recentReports = await prisma.userReport.count({
        where: {
          parkingLocationId,
          reportType: "location_full",
          createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
        },
      });

      if (recentReports >= 2) {
        const updateData: any = {
          lastUpdated: new Date(),
          availabilitySource: "user_report",
          confidence: "medium",
        };

        if (vehicleType === "TWO_WHEELER") {
          updateData.availableTwoWheelerSpaces = 0;
          updateData.twoWheelerAvailabilityStatus = "FULL";
        } else if (vehicleType === "FOUR_WHEELER") {
          updateData.availableCarSpaces = 0;
          updateData.carAvailabilityStatus = "FULL";
        } else {
          updateData.availableCarSpaces = 0;
          updateData.availableTwoWheelerSpaces = 0;
          updateData.carAvailabilityStatus = "FULL";
          updateData.twoWheelerAvailabilityStatus = "FULL";
          updateData.availabilityStatus = "FULL";
        }

        await prisma.parkingLocation.update({
          where: { id: parkingLocationId },
          data: updateData,
        });
      }
    }

    return report;
  }
}
