export type UnitStatus = 'available' | 'occupied' | 'under maintenance' | 'reserved';

export interface IUnit {
  _id?: string;
  unitNumber: string;
  floorNumber: string;
  buildingId: string;
  rentAmount: number;
  isOccupied: boolean;
  amenities?: string[];
  bedrooms: number;
  bathrooms: number;
  status: UnitStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
