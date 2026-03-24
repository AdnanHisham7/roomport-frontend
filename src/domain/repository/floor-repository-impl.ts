import { IFloor } from "../entities/Floor";

export interface IFloorRepository {
  findById(id: string): Promise<IFloor | null>;
  findByBuildingId(buildingId: string): Promise<IFloor[]>;
  findAll(filter?: Partial<Pick<IFloor, 'buildingId' | 'status'>>): Promise<IFloor[]>;
  create(data: Omit<IFloor, '_id' | 'createdAt' | 'updatedAt'>): Promise<IFloor>;
  update(id: string, data: Partial<IFloor>): Promise<IFloor | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  existsByBuildingAndFloorNumber(buildingId: string, floorNumber: number): Promise<boolean>;
}
