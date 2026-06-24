export type BuildingType = 'residential' | 'commercial' | 'mixed' | 'industrial';
export type BuildingStatus = 'active' | 'inactive' | 'under_construction' | 'maintenance';

export interface BuildingLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  street?: string;
}

export interface Building {
  _id: string;
  name: string;
  type: BuildingType;
  status: BuildingStatus;
  location: BuildingLocation;
  ownerId: string;
  managerId?: string;
  totalUnits: number;
  totalFloors: number;
  sqft?: number;
  lift: boolean;
  helipad: boolean;
  nearAirport?: string;
  nearRailwayStation?: string;
  nearBusStand?: string;
  nearPark?: string;
  amenities?: string[];
  images?: string[];
  documents?: string[];
  description?: string;
  yearOfBuild?: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OccupancyStats {
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  byBuilding: { _id: string; name: string; totalUnits: number; occupiedUnits: number; vacantUnits: number; occupancyRate: number }[];
}

export type FloorStatus = 'active' | 'inactive' | 'under_maintenance';

export interface Floor {
  _id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  totalUnits: number;
  status: FloorStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UnitStatus = 'available' | 'occupied' | 'under maintenance' | 'reserved';

export interface Unit {
  _id: string;
  unitNumber: string;
  floorNumber: string;
  buildingId: string;
  title?: string;
  description?: string;
  images?: string[];
  rentAmount: number;
  isOccupied: boolean;
  amenities?: string[];
  bedrooms: number;
  bathrooms: number;
  status: UnitStatus;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
