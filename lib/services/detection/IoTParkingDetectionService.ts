import { ParkingDetectionService, OccupancyResult } from "./ParkingDetectionService";
import { AvailabilitySource, SpaceStatus } from "../../types";

/**
 * IoTParkingDetectionService (Future Architecture)
 * 
 * Ingests telemetry from surface-mounted geomagnetic / ultrasonic sensors (LoRaWAN / NB-IoT)
 * Installed per parking bay to report magnetic flux disturbance when metal chassis is present.
 */
export class IoTParkingDetectionService implements ParkingDetectionService {
  readonly providerName = "Surface IoT Sensor Gateway (LoRaWAN / MQTT)";
  readonly providerType: AvailabilitySource = "sensor";

  async detectOccupancy(
    parkingLocationId: string,
    parkingSpaceId: string
  ): Promise<OccupancyResult> {
    return {
      parkingSpaceId,
      parkingLocationId,
      status: 'occupied' as SpaceStatus,
      confidence: 0.98,
      source: 'sensor',
      detectedAt: new Date(),
      metadata: {
        sensorReadingRssi: -78,
      }
    };
  }

  async detectFacilityOccupancy(
    parkingLocationId: string
  ): Promise<OccupancyResult[]> {
    return [];
  }
}
