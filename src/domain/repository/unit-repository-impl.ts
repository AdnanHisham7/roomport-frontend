import { IUnit } from "../entities/Unit";

export interface IUnitRepository {
  findById(id: string): Promise<IUnit | null>;
  findAll(filter?: Partial<Pick<IUnit, 'buildingId' | 'status' | 'isOccupied'>>): Promise<IUnit[]>;
  findByBuildingId(buildingId: string): Promise<IUnit[]>;
  create(data: Omit<IUnit, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUnit>;
  update(id: string, data: Partial<IUnit>): Promise<IUnit | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
