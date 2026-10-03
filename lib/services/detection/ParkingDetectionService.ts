import { AvailabilitySource, SpaceStatus } from "../../types";

export interface OccupancyResult {
  parkingSpaceId: string;
  parkingLocationId: string;
  status: SpaceStatus;
  confidence: number; // 0.0 to 1.0
  source: AvailabilitySource;
  detectedAt: Date;
  metadata?: {
    licensePlateDetected?: boolean;
    vehicleClass?: 'TWO_WHEELER' | 'FOUR_WHEELER';
    sensorReadingRssi?: number;
    boundingBox?: [number, number, number, number];
  };
}

/**
 * Service interface for parking occupancy detection.
 * Designed to support pluggable providers:
 * - Manual confirmation (Current MVP)
 * - Camera / Computer Vision inference pipeline
 * - Ultrasonic / Magnetic IoT sensors
 * - Simulated demo provider
 */
export interface ParkingDetectionService {
  readonly providerName: string;
  readonly providerType: AvailabilitySource;
  
  /**
   * Detects or verifies occupancy for a specific space
   */
  detectOccupancy(
    parkingLocationId: string,
    parkingSpaceId: string
  ): Promise<OccupancyResult>;

  /**
   * Batch verification for all spaces within a facility
   */
  detectFacilityOccupancy(
    parkingLocationId: string
  ): Promise<OccupancyResult[]>;
}
