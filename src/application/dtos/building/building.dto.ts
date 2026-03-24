import { BuildingStatus, BuildingType, IBuildingLocation } from "../../../domain/entities/Building";

export interface CreateBuildingDTO {
  name:          string;
  type:          BuildingType;
  ownerId:       string;
  managerId?:    string;
  location:      IBuildingLocation;
  totalUnits:    number;
  totalFloors:   number;
  sqft?:         number;
  lift?:         boolean;
  helipad?:      boolean;
  nearAirport?:        string;
  nearRailwayStation?: string;
  nearBusStand?:       string;
  nearPark?:           string;
  amenities?:    string[];
  images?:       string[];
  description?:  string;
  yearOfBuild?:  string;
}

export interface UpdateBuildingDTO {
  name?:         string;
  type?:         BuildingType;
  status?:       BuildingStatus;
  managerId?:    string;
  location?:     Partial<IBuildingLocation>;
  totalUnits?:   number;
  totalFloors?:  number;
  sqft?:         number;
  lift?:         boolean;
  helipad?:      boolean;
  nearAirport?:        string;
  nearRailwayStation?: string;
  nearBusStand?:       string;
  nearPark?:           string;
  amenities?:    string[];
  images?:       string[];
  description?:  string;
  yearOfBuild?:  string;
}

export interface BuildingResponseDTO {
  _id:           string;
  name:          string;
  type:          BuildingType;
  status:        BuildingStatus;
  location:      IBuildingLocation;
  ownerId:       string;
  managerId?:    string;
  totalUnits:    number;
  totalFloors:   number;
  sqft?:         number;
  lift:          boolean;
  helipad:       boolean;
  nearAirport?:        string;
  nearRailwayStation?: string;
  nearBusStand?:       string;
  nearPark?:           string;
  amenities?:    string[];
  images?:       string[];
  documents?:    string[];
  description?:  string;
  yearOfBuild?:  string;
  createdAt?:    Date;
  updatedAt?:    Date;
}

export interface BuildingOccupancyStatsDTO {
  totalBuildings: number;
  totalUnits:     number;
  occupiedUnits:  number;
  vacantUnits:    number;
  occupancyRate:  number;
  byBuilding: { _id: string; name: string; totalUnits: number; occupiedUnits: number; vacantUnits: number; occupancyRate: number; }[];
}
