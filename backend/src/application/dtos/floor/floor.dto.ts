import { FloorStatus } from "../../../domain/entities/Floor";

export interface CreateFloorDTO {
  buildingId:   string;
  floorNumber:  number;
  name:         string;
  totalUnits:   number;
  description?: string;
}

export interface UpdateFloorDTO {
  name?:         string;
  floorNumber?:  number;
  totalUnits?:   number;
  status?:       FloorStatus;
  description?:  string;
}

export interface FloorResponseDTO {
  _id:          string;
  buildingId:   string;
  floorNumber:  number;
  name:         string;
  totalUnits:   number;
  status:       FloorStatus;
  description?: string;
  createdAt?:   Date;
  updatedAt?:   Date;
}
