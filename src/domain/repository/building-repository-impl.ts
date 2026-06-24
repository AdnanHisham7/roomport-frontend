import { IBuilding } from "../entities/Building";

export interface BuildingListFilter {
  ownerId?:     string;
  managerId?:   string;
  status?:      IBuilding['status'];
  type?:        IBuilding['type'];
  isPublished?: boolean;
  isFeatured?:  boolean;
  city?:        string;
  state?:       string;
  search?:      string;     // matches name / city
}

export interface IBuildingRepository {
  findById(id: string): Promise<IBuilding | null>;
  findAll(filter?: BuildingListFilter): Promise<IBuilding[]>;
  findAllPaginated(filter: BuildingListFilter, skip: number, limit: number, sort?: Record<string, 1 | -1>): Promise<{ data: IBuilding[]; total: number }>;
  findByOwnerId(ownerId: string): Promise<IBuilding[]>;
  countAll(filter?: BuildingListFilter): Promise<number>;
  create(data: Omit<IBuilding, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBuilding>;
  update(id: string, data: Partial<IBuilding>): Promise<IBuilding | null>;
  incrementFields(id: string, fields: Partial<Record<'totalFloors' | 'totalUnits' | 'viewCount', number>>): Promise<void>;
  delete(id: string): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
  distinctCities(): Promise<string[]>;
}
