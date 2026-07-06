export type FloorStatus = 'active' | 'inactive' | 'under_maintenance';

export interface IFloor {
  _id?:         string;
  buildingId:   string;        // ObjectId → Building
  floorNumber:  number;        // 0 = Ground, 1 = First, -1 = Basement
  name:         string;        // e.g. "Ground Floor", "First Floor", "Basement 1"
  totalUnits:   number;        // total units on this floor
  status:       FloorStatus;
  description?: string;
  createdAt?:   Date;
  updatedAt?:   Date;
}
