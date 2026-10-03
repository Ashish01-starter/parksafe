import { ParkingDetectionService, OccupancyResult } from "./ParkingDetectionService";
import { AvailabilitySource, SpaceStatus } from "../../types";

/**
 * ManualParkingDetectionService (MVP Active Implementation)
 * 
 * In this MVP stage, occupancy relies on explicit driver confirmations:
 * 1. Driver arrives within geofence of parking location
 * 2. Driver explicitly confirms "Yes, I parked here"
 * 3. Driver marks space available upon departure
 * 
 * No continuous background tracking or fake camera AI is used.
 */
export class ManualParkingDetectionService implements ParkingDetectionService {
  readonly providerName = "Manual Driver Confirmation Service (MVP)";
  readonly providerType: AvailabilitySource = "manual";

  async detectOccupancy(
    parkingLocationId: string,
    parkingSpaceId: string,
    statusOverride?: SpaceStatus
  ): Promise<OccupancyResult> {
    return {
      parkingSpaceId,
      parkingLocationId,
      status: statusOverride || 'occupied',
      confidence: 0.95, // High confidence since user directly reported on-site
      source: 'manual',
      detectedAt: new Date(),
      metadata: {
        sensorReadingRssi: undefined,
      }
    };
  }

  async detectFacilityOccupancy(
    parkingLocationId: string
  ): Promise<OccupancyResult[]> {
    // In manual mode, batch scans are not automated without user input
    return [];
  }
}

export const activeDetectionService = new ManualParkingDetectionService();
