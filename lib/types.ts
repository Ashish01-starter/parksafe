export type VehicleType = 'TWO_WHEELER' | 'FOUR_WHEELER';

export type AvailabilityStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'UNKNOWN';

export type AvailabilitySource =
  | 'official'
  | 'sensor'
  | 'camera'
  | 'user_report'
  | 'user_confirmation'
  | 'manual'
  | 'estimated'
  | 'unknown';

export type ParkingStatus = AvailabilityStatus;

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export type ConfidenceTier = 'Fresh' | 'Recent' | 'Stale' | 'Unknown';

export type ParkingType =
  | 'street'
  | 'parking_lot'
  | 'surface'
  | 'multi_storey'
  | 'underground'
  | 'mall'
  | 'metro'
  | 'railway'
  | 'college_university'
  | 'institutional';

export type AccessType = 'public' | 'customers' | 'private' | 'permit' | 'unknown';

export type SpaceStatus = 'available' | 'occupied' | 'reserved' | 'out_of_service';

export interface ParkingSpaceDto {
  id: string;
  spaceIdentifier: string;
  section?: string | null;
  parkingLocationId: string;
  vehicleType: string;
  status: SpaceStatus;
  latitude?: number | null;
  longitude?: number | null;
  lastUpdated: string;
  lastUpdatedBy?: string | null;
  source: string;
}

export interface ParkingLocationDto {
  id: string;
  osmId?: string | null;
  name: string;
  address?: string | null;
  area: string;
  city: string;
  parkingType: ParkingType;
  accessType: AccessType;
  latitude: number;
  longitude: number;
  supportedVehicleTypes: string; // comma-separated: "TWO_WHEELER,FOUR_WHEELER" | "TWO_WHEELER" | "FOUR_WHEELER"

  // Capacity (null = unknown)
  capacity?: number | null;
  carCapacity?: number | null;
  twoWheelerCapacity?: number | null;
  isSharedCapacity: boolean;

  // Live availability — SEPARATED by vehicle type
  availableCarSpaces?: number | null;         // null = UNKNOWN
  availableTwoWheelerSpaces?: number | null;  // null = UNKNOWN

  // Per-vehicle status
  availabilityStatus: AvailabilityStatus;         // overall
  carAvailabilityStatus: AvailabilityStatus;
  twoWheelerAvailabilityStatus: AvailabilityStatus;

  availabilitySource: AvailabilitySource;
  confidence: ConfidenceLevel;
  confidenceTier?: ConfidenceTier;  // computed on the client
  dataSource: string;

  hasIndividualSpaces: boolean;
  isDemoData: boolean;
  fee?: string | null;
  operator?: string | null;
  lastUpdated: string;

  spaces?: ParkingSpaceDto[];

  // Computed by server
  distanceKm?: number;
  estimatedMinutes?: number;
}

export interface UserReportDto {
  id: string;
  parkingLocationId: string;
  spaceId?: string | null;
  vehicleType: string;
  reportType:
    | 'space_available'
    | 'space_occupied'
    | 'location_full'
    | 'location_closed'
    | 'wrong_info'
    | 'other';
  reportedAvailability?: number | null;
  details?: string | null;
  createdAt: string;
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ActiveParkingSession {
  parkingLocationId: string;
  parkingName: string;
  spaceId?: string | null;
  spaceIdentifier?: string | null;
  vehicleType: VehicleType;
  parkedAt: string;
  latitude: number;
  longitude: number;
}

/** Availability data returned from the AvailabilityService per vehicle type */
export interface VehicleAvailabilityData {
  available: number | null;
  capacity: number | null;
  status: AvailabilityStatus;
  source: AvailabilitySource;
  confidence: ConfidenceLevel;
  lastUpdated: string;
}
