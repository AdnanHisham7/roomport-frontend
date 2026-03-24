import { IBuilding } from "../entities/Building";

export interface IBuildingRepository {
  findById(id: string): Promise<IBuilding | null>;
  findAll(filter?: Partial<Pick<IBuilding, 'ownerId' | 'managerId' | 'status' | 'type'>>): Promise<IBuilding[]>;
  findByOwnerId(ownerId: string): Promise<IBuilding[]>;
  create(data: Omit<IBuilding, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBuilding>;
  update(id: string, data: Partial<IBuilding>): Promise<IBuilding | null>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
