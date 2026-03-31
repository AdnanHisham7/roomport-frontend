import { UnitStatus } from "../../../domain/entities/Unit";

export interface CreateUnitDTO {
  unitNumber: string;
  floorNumber: string;
  buildingId: string;
  rentAmount: number;
  isOccupied?: boolean;
  amenities?: string[];
  bedrooms: number;
  bathrooms: number;
  status?: UnitStatus;
}

export interface UpdateUnitDTO extends Partial<CreateUnitDTO> {}

export interface UnitResponseDTO extends CreateUnitDTO {
  _id: string;
  isOccupied: boolean;
  status: UnitStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
