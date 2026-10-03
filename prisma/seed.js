/**
 * parkSafe v2 - Demo Seed Script
 *
 * Seeds ~30 representative demo parking locations across Chennai
 * with REALISTIC 2W/4W split availability data for immediate demo use.
 *
 * OSM-imported locations will have UNKNOWN availability.
 * Only these demo locations will have initial known availability.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEMO_LOCATIONS = [
  // ── T. NAGAR ────────────────────────────────────────────────────────────
  {
    osmId: 'demo:pondy-bazaar-mlcp',
    name: 'Pondy Bazaar Multi-Level Car Park',
    address: 'Sir Thyagaraya Road, T. Nagar',
    area: 'T. Nagar',
    parkingType: 'multi_storey',
    accessType: 'public',
    latitude: 13.0405, longitude: 80.2337,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 90,  carCapacity: 60,  twoWheelerCapacity: 30,
    isSharedCapacity: false,
    availableCarSpaces: 23, availableTwoWheelerSpaces: 17,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true,
    hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'A1', section: 'Ground – Cars', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'A2', section: 'Ground – Cars', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'A3', section: 'Ground – Cars', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'A4', section: 'Ground – Cars', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'B1', section: 'Level 1 – Cars', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'B2', section: 'Level 1 – Cars', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'B3', section: 'Level 1 – Cars', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'B4', section: 'Level 1 – Cars', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'M1', section: 'Bike Bay Ground', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'M2', section: 'Bike Bay Ground', vehicleType: 'TWO_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'M3', section: 'Bike Bay Ground', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'M4', section: 'Bike Bay Ground', vehicleType: 'TWO_WHEELER', status: 'available' },
    ],
  },
  {
    osmId: 'demo:panagal-park-street',
    name: 'Panagal Park Street Parking',
    address: 'Usman Road, T. Nagar',
    area: 'T. Nagar',
    parkingType: 'street',
    accessType: 'public',
    latitude: 13.0441, longitude: 80.2308,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 40, carCapacity: 25, twoWheelerCapacity: 15,
    isSharedCapacity: false,
    availableCarSpaces: 4, availableTwoWheelerSpaces: 6,
    carAvailabilityStatus: 'LIMITED', twoWheelerAvailabilityStatus: 'LIMITED',
    availabilityStatus: 'LIMITED',
    availabilitySource: 'user_report', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },
  {
    osmId: 'demo:ranganathan-2w-stand',
    name: 'Ranganathan Street Two-Wheeler Stand',
    address: 'Usman Road Corner, T. Nagar',
    area: 'T. Nagar',
    parkingType: 'street',
    accessType: 'public',
    latitude: 13.0375, longitude: 80.2312,
    supportedVehicleTypes: 'TWO_WHEELER',
    capacity: 60, carCapacity: null, twoWheelerCapacity: 60,
    isSharedCapacity: false,
    availableCarSpaces: null, availableTwoWheelerSpaces: 9,
    carAvailabilityStatus: 'UNKNOWN', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_report', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'R1', section: 'Front Row', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'R2', section: 'Front Row', vehicleType: 'TWO_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'R3', section: 'Front Row', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'R4', section: 'Front Row', vehicleType: 'TWO_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'R5', section: 'Back Row',  vehicleType: 'TWO_WHEELER', status: 'available' },
    ],
  },

  // ── ANNA NAGAR ──────────────────────────────────────────────────────────
  {
    osmId: 'demo:anna-nagar-2nd-avenue',
    name: 'Anna Nagar 2nd Avenue Smart Parking',
    address: '2nd Avenue, Near Roundtana, Anna Nagar',
    area: 'Anna Nagar',
    parkingType: 'street',
    accessType: 'public',
    latitude: 13.0850, longitude: 80.2155,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 40, carCapacity: 24, twoWheelerCapacity: 16,
    isSharedCapacity: false,
    availableCarSpaces: 12, availableTwoWheelerSpaces: 8,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'S1', section: 'North Kerb', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'S2', section: 'North Kerb', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'S3', section: 'North Kerb', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'S4', section: 'North Kerb', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'BK1', section: 'Two Wheeler Bay', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'BK2', section: 'Two Wheeler Bay', vehicleType: 'TWO_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'BK3', section: 'Two Wheeler Bay', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'BK4', section: 'Two Wheeler Bay', vehicleType: 'TWO_WHEELER', status: 'occupied' },
    ],
  },
  {
    osmId: 'demo:anna-nagar-tower-park',
    name: 'Anna Nagar Tower Park Public Stand',
    address: 'Tower Park Gate 2, 3rd Main Road, Anna Nagar',
    area: 'Anna Nagar',
    parkingType: 'parking_lot',
    accessType: 'public',
    latitude: 13.0886, longitude: 80.2104,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 60, carCapacity: 40, twoWheelerCapacity: 20,
    isSharedCapacity: false,
    availableCarSpaces: 28, availableTwoWheelerSpaces: 11,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── ADYAR / BESANT NAGAR ─────────────────────────────────────────────────
  {
    osmId: 'demo:besant-nagar-beach',
    name: "Besant Nagar Elliot's Beach Parking",
    address: '6th Avenue, Elliot\'s Beach Promenade, Besant Nagar',
    area: 'Besant Nagar',
    parkingType: 'surface',
    accessType: 'public',
    latitude: 13.0003, longitude: 80.2694,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 80, carCapacity: 50, twoWheelerCapacity: 30,
    isSharedCapacity: false,
    availableCarSpaces: 12, availableTwoWheelerSpaces: 18,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'E1', section: 'Seaside Row', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'E2', section: 'Seaside Row', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'E3', section: 'Seaside Row', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'E4', section: 'Seaside Row', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'MB1', section: 'Bike Strip', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'MB2', section: 'Bike Strip', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'MB3', section: 'Bike Strip', vehicleType: 'TWO_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'MB4', section: 'Bike Strip', vehicleType: 'TWO_WHEELER', status: 'available' },
    ],
  },
  {
    osmId: 'demo:adyar-gandhi-nagar',
    name: 'Adyar Gandhi Nagar Community Parking',
    address: '1st Main Road, Gandhi Nagar, Adyar',
    area: 'Adyar',
    parkingType: 'parking_lot',
    accessType: 'public',
    latitude: 13.0071, longitude: 80.2546,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 30, carCapacity: 20, twoWheelerCapacity: 10,
    isSharedCapacity: false,
    availableCarSpaces: 0, availableTwoWheelerSpaces: 0,
    carAvailabilityStatus: 'FULL', twoWheelerAvailabilityStatus: 'FULL',
    availabilityStatus: 'FULL',
    availabilitySource: 'user_report', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── VELACHERY ────────────────────────────────────────────────────────────
  {
    osmId: 'demo:phoenix-velachery',
    name: 'Phoenix Marketcity Outer Public Parking',
    address: '142 Velachery Road, Next to Phoenix Mall',
    area: 'Velachery',
    parkingType: 'mall',
    accessType: 'customers',
    latitude: 12.9915, longitude: 80.2170,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 120, carCapacity: 80, twoWheelerCapacity: 40,
    isSharedCapacity: false,
    availableCarSpaces: 45, availableTwoWheelerSpaces: 22,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'P1', section: 'Deck A', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'P2', section: 'Deck A', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'P3', section: 'Deck A', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'P4', section: 'Deck A', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'P5', section: 'Deck A', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'TB1', section: 'Two Wheeler Zone', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'TB2', section: 'Two Wheeler Zone', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'TB3', section: 'Two Wheeler Zone', vehicleType: 'TWO_WHEELER', status: 'occupied' },
    ],
  },
  {
    osmId: 'demo:velachery-mrts',
    name: 'Velachery MRTS Railway Station Parking',
    address: 'Velachery Bypass Road, MRTS Station',
    area: 'Velachery',
    parkingType: 'railway',
    accessType: 'public',
    latitude: 12.9782, longitude: 80.2185,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 150, carCapacity: 90, twoWheelerCapacity: 60,
    isSharedCapacity: false,
    availableCarSpaces: 32, availableTwoWheelerSpaces: 28,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── GUINDY ──────────────────────────────────────────────────────────────
  {
    osmId: 'demo:kathipara-guindy',
    name: 'Kathipara Urban Square Transit Parking',
    address: 'Kathipara Junction, Guindy Metro Interchange',
    area: 'Guindy',
    parkingType: 'parking_lot',
    accessType: 'public',
    latitude: 13.0076, longitude: 80.2036,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 100, carCapacity: 65, twoWheelerCapacity: 35,
    isSharedCapacity: false,
    availableCarSpaces: 54, availableTwoWheelerSpaces: 19,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'K1', section: 'Zone 1', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'K2', section: 'Zone 1', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'K3', section: 'Zone 1', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'K4', section: 'Zone 1', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'KB1', section: 'Two Wheeler Tier', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'KB2', section: 'Two Wheeler Tier', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'KB3', section: 'Two Wheeler Tier', vehicleType: 'TWO_WHEELER', status: 'occupied' },
    ],
  },
  {
    osmId: 'demo:guindy-industrial-estate',
    name: 'Guindy Industrial Estate Visitors Parking',
    address: 'SIDCO Industrial Estate, Guindy',
    area: 'Guindy',
    parkingType: 'institutional',
    accessType: 'public',
    latitude: 13.0118, longitude: 80.2078,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 45, carCapacity: 30, twoWheelerCapacity: 15,
    isSharedCapacity: false,
    availableCarSpaces: 3, availableTwoWheelerSpaces: 2,
    carAvailabilityStatus: 'LIMITED', twoWheelerAvailabilityStatus: 'LIMITED',
    availabilityStatus: 'LIMITED',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── CENTRAL CHENNAI / MARINA ─────────────────────────────────────────────
  {
    osmId: 'demo:marina-beach',
    name: 'Marina Beach Public Parking Stand',
    address: 'Kamarajar Salai, Marina Beach Service Road',
    area: 'Marina',
    parkingType: 'surface',
    accessType: 'public',
    latitude: 13.0544, longitude: 80.2831,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 110, carCapacity: 70, twoWheelerCapacity: 40,
    isSharedCapacity: false,
    availableCarSpaces: 38, availableTwoWheelerSpaces: 22,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'M01', section: 'Lighthouse Bay', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'M02', section: 'Lighthouse Bay', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'M03', section: 'Lighthouse Bay', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'MB1', section: 'Two Wheeler Strip', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'MB2', section: 'Two Wheeler Strip', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'MB3', section: 'Two Wheeler Strip', vehicleType: 'TWO_WHEELER', status: 'occupied' },
    ],
  },
  {
    osmId: 'demo:central-station',
    name: 'Chennai Central Station Public Lot',
    address: 'Wall Tax Road, Park Town',
    area: 'Central Chennai',
    parkingType: 'railway',
    accessType: 'public',
    latitude: 13.0827, longitude: 80.2757,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 90, carCapacity: 55, twoWheelerCapacity: 35,
    isSharedCapacity: false,
    availableCarSpaces: 18, availableTwoWheelerSpaces: 14,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── OMR / SHOLINGANALLUR ─────────────────────────────────────────────────
  {
    osmId: 'demo:tidel-park-omr',
    name: 'Tidel Park Public Overflow Parking',
    address: 'Rajiv Gandhi Salai (OMR), Taramani',
    area: 'OMR',
    parkingType: 'institutional',
    accessType: 'public',
    latitude: 12.9897, longitude: 80.2476,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 80, carCapacity: 50, twoWheelerCapacity: 30,
    isSharedCapacity: false,
    availableCarSpaces: 29, availableTwoWheelerSpaces: 16,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: true,
    spaces: [
      { spaceIdentifier: 'T1', section: 'IT Zone A', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'T2', section: 'IT Zone A', vehicleType: 'FOUR_WHEELER', status: 'available' },
      { spaceIdentifier: 'T3', section: 'IT Zone A', vehicleType: 'FOUR_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'TB1', section: 'Bike Shed', vehicleType: 'TWO_WHEELER', status: 'available' },
      { spaceIdentifier: 'TB2', section: 'Bike Shed', vehicleType: 'TWO_WHEELER', status: 'occupied' },
      { spaceIdentifier: 'TB3', section: 'Bike Shed', vehicleType: 'TWO_WHEELER', status: 'available' },
    ],
  },
  {
    osmId: 'demo:sholinganallur-omr',
    name: 'Sholinganallur OMR Public Parking',
    address: 'OMR Service Road, Sholinganallur',
    area: 'Sholinganallur',
    parkingType: 'surface',
    accessType: 'public',
    latitude: 12.9003, longitude: 80.2285,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 60, carCapacity: 40, twoWheelerCapacity: 20,
    isSharedCapacity: false,
    availableCarSpaces: null, availableTwoWheelerSpaces: null,
    carAvailabilityStatus: 'UNKNOWN', twoWheelerAvailabilityStatus: 'UNKNOWN',
    availabilityStatus: 'UNKNOWN',
    availabilitySource: 'unknown', confidence: 'none',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── TAMBARAM ─────────────────────────────────────────────────────────────
  {
    osmId: 'demo:tambaram-west-railway',
    name: 'Tambaram West Railway Public Parking',
    address: 'GST Road, Tambaram West, Chennai',
    area: 'Tambaram',
    parkingType: 'railway',
    accessType: 'public',
    latitude: 12.9254, longitude: 80.1174,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 75, carCapacity: 45, twoWheelerCapacity: 30,
    isSharedCapacity: false,
    availableCarSpaces: 14, availableTwoWheelerSpaces: 10,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── MYLAPORE ─────────────────────────────────────────────────────────────
  {
    osmId: 'demo:mylapore-kapali',
    name: 'Mylapore Kapaleeshwarar Temple Parking',
    address: 'Kutchery Road, Mylapore',
    area: 'Mylapore',
    parkingType: 'surface',
    accessType: 'public',
    latitude: 13.0339, longitude: 80.2692,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 80, carCapacity: 50, twoWheelerCapacity: 30,
    isSharedCapacity: false,
    availableCarSpaces: 21, availableTwoWheelerSpaces: 13,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── EGMORE / NUNGAMBAKKAM ─────────────────────────────────────────────────
  {
    osmId: 'demo:egmore-railway',
    name: 'Egmore Railway Station Public Parking',
    address: 'Egmore Station Road, Egmore',
    area: 'Egmore',
    parkingType: 'railway',
    accessType: 'public',
    latitude: 13.0786, longitude: 80.2619,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 100, carCapacity: 65, twoWheelerCapacity: 35,
    isSharedCapacity: false,
    availableCarSpaces: null, availableTwoWheelerSpaces: null,
    carAvailabilityStatus: 'UNKNOWN', twoWheelerAvailabilityStatus: 'UNKNOWN',
    availabilityStatus: 'UNKNOWN',
    availabilitySource: 'unknown', confidence: 'none',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },
  {
    osmId: 'demo:nungambakkam-high-road',
    name: 'Nungambakkam High Road Street Parking',
    address: 'Nungambakkam High Road, Chennai',
    area: 'Nungambakkam',
    parkingType: 'street',
    accessType: 'public',
    latitude: 13.0595, longitude: 80.2425,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 50, carCapacity: 30, twoWheelerCapacity: 20,
    isSharedCapacity: false,
    availableCarSpaces: 8, availableTwoWheelerSpaces: 12,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_report', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── VADAPALANI ───────────────────────────────────────────────────────────
  {
    osmId: 'demo:vadapalani-metro',
    name: 'Vadapalani Metro Station Parking',
    address: 'Vadapalani Metro, Arcot Road',
    area: 'Vadapalani',
    parkingType: 'metro',
    accessType: 'public',
    latitude: 13.0490, longitude: 80.2121,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 120, carCapacity: 70, twoWheelerCapacity: 50,
    isSharedCapacity: false,
    availableCarSpaces: 35, availableTwoWheelerSpaces: 22,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_confirmation', confidence: 'medium',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },
  {
    osmId: 'demo:koyambedu-cmbt',
    name: 'Koyambedu CMBT Bus Terminal Parking',
    address: 'CMBT Complex, Koyambedu',
    area: 'Vadapalani',
    parkingType: 'institutional',
    accessType: 'public',
    latitude: 13.0694, longitude: 80.1948,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 200, carCapacity: 130, twoWheelerCapacity: 70,
    isSharedCapacity: false,
    availableCarSpaces: null, availableTwoWheelerSpaces: null,
    carAvailabilityStatus: 'UNKNOWN', twoWheelerAvailabilityStatus: 'UNKNOWN',
    availabilityStatus: 'UNKNOWN',
    availabilitySource: 'unknown', confidence: 'none',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── PORUR / AMBATTUR ────────────────────────────────────────────────────
  {
    osmId: 'demo:porur-roundabout',
    name: 'Porur Junction Public Parking',
    address: 'Porur Roundabout, Trunk Road',
    area: 'Porur',
    parkingType: 'surface',
    accessType: 'public',
    latitude: 13.0368, longitude: 80.1595,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 60, carCapacity: 40, twoWheelerCapacity: 20,
    isSharedCapacity: false,
    availableCarSpaces: null, availableTwoWheelerSpaces: null,
    carAvailabilityStatus: 'UNKNOWN', twoWheelerAvailabilityStatus: 'UNKNOWN',
    availabilityStatus: 'UNKNOWN',
    availabilitySource: 'unknown', confidence: 'none',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },

  // ── CHROMEPET / PALLAVARAM ───────────────────────────────────────────────
  {
    osmId: 'demo:chromepet-market',
    name: 'Chromepet Market Street Parking',
    address: 'Market Street, Chromepet',
    area: 'Chromepet',
    parkingType: 'street',
    accessType: 'public',
    latitude: 12.9512, longitude: 80.1418,
    supportedVehicleTypes: 'TWO_WHEELER,FOUR_WHEELER',
    capacity: 40, carCapacity: 25, twoWheelerCapacity: 15,
    isSharedCapacity: false,
    availableCarSpaces: 7, availableTwoWheelerSpaces: 5,
    carAvailabilityStatus: 'AVAILABLE', twoWheelerAvailabilityStatus: 'AVAILABLE',
    availabilityStatus: 'AVAILABLE',
    availabilitySource: 'user_report', confidence: 'low',
    dataSource: 'ManualVerification', isDemoData: true, hasIndividualSpaces: false,
  },
];

async function seed() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  parkSafe v2 – Demo Seed Locations             ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  // Clear only demo data (preserve OSM-imported data)
  console.log('→ Clearing old demo-flagged records...');
  await prisma.userReport.deleteMany({ where: { location: { isDemoData: true } } });
  await prisma.availabilityEvent.deleteMany({ where: { location: { isDemoData: true } } });
  await prisma.parkingSpace.deleteMany({ where: { location: { isDemoData: true } } });
  await prisma.parkingLocation.deleteMany({ where: { isDemoData: true } });
  console.log('  Cleared existing demo locations.\n');

  let created = 0;
  for (const item of DEMO_LOCATIONS) {
    const { spaces, ...locationData } = item;

    // Validate capacity bounds
    if (locationData.availableCarSpaces !== null && locationData.carCapacity !== null) {
      locationData.availableCarSpaces = Math.min(locationData.availableCarSpaces, locationData.carCapacity);
      locationData.availableCarSpaces = Math.max(0, locationData.availableCarSpaces);
    }
    if (locationData.availableTwoWheelerSpaces !== null && locationData.twoWheelerCapacity !== null) {
      locationData.availableTwoWheelerSpaces = Math.min(locationData.availableTwoWheelerSpaces, locationData.twoWheelerCapacity);
      locationData.availableTwoWheelerSpaces = Math.max(0, locationData.availableTwoWheelerSpaces);
    }

    const loc = await prisma.parkingLocation.upsert({
      where: { osmId: locationData.osmId },
      update: locationData,
      create: locationData,
    });

    if (spaces) {
      for (const space of spaces) {
        await prisma.parkingSpace.upsert({
          where: { parkingLocationId_spaceIdentifier: { parkingLocationId: loc.id, spaceIdentifier: space.spaceIdentifier } },
          update: space,
          create: { ...space, parkingLocationId: loc.id },
        });
      }
    }
    created++;
    process.stdout.write(`  ✓ ${loc.name}\n`);
  }

  const totalLocations = await prisma.parkingLocation.count();
  const demoLocations = await prisma.parkingLocation.count({ where: { isDemoData: true } });
  const osmLocations = await prisma.parkingLocation.count({ where: { isDemoData: false } });

  console.log(`\n✅ Seed complete! ${created} demo locations seeded.`);
  console.log(`   Demo locations : ${demoLocations}`);
  console.log(`   OSM locations  : ${osmLocations}`);
  console.log(`   TOTAL          : ${totalLocations}`);
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
