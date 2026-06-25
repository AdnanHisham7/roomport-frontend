<<<<<<< Updated upstream
export type UnitStatus = 'available' | 'occupied' | 'under maintenance' | 'reserved';

export interface IUnit {
  _id?: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}
=======
export type UnitStatus = 'available' | 'occupied' | 'under maintenance' | 'reserved';

export interface IUnit {
  _id?:         string;
  unitNumber:   string;
  floorNumber:  string;
  buildingId:   string;
  title?:       string;
  description?: string;
  images?:      string[];
  rentAmount:   number;
  isOccupied:   boolean;
  amenities?:   string[];
  bedrooms:     number;
  bathrooms:    number;
  status:       UnitStatus;
  tokenAmount?: number;   // reservation deposit
  viewCount?:   number;
  createdAt?:   Date;
  updatedAt?:   Date;
}
>>>>>>> Stashed changes
