export type BuildingType   = 'residential' | 'commercial' | 'mixed' | 'industrial';
export type BuildingStatus = 'active' | 'inactive' | 'under_maintenance' | 'archived';

export interface IBuildingLocation {
  address:   string;
  city:      string;
  state:     string;
  pincode:   string;
  landmark?: string;
  country:   string;
  latitude?:  number;
  longitude?: number;
  street?:    string;
}

export interface IBuilding {
  _id?:             string;
  name:             string;
  type:             BuildingType;
  status:           BuildingStatus;
  location:         IBuildingLocation;   // embedded — replaces addressId
  ownerId:          string;
  managerId?:       string;
  totalUnits:       number;
  totalFloors:      number;
  sqft?:            number;
  lift:             boolean;
  helipad:          boolean;
  nearAirport?:     string;
  nearRailwayStation?: string;
  nearBusStand?:    string;
  nearPark?:        string;
  amenities?:       string[];
  images?:          string[];
  documents?:       string[];
  description?:     string;
  yearOfBuild?:     string;
  isPublished:      boolean;   // controls public marketplace visibility (builder-controlled)
  isFeatured:       boolean;   // controls homepage spotlight (super-admin-controlled)
  viewCount?:       number;
  createdAt?:       Date;
  updatedAt?:       Date;
}
