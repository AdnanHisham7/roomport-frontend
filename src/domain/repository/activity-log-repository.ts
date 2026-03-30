import { IActivityLog } from "../entities/ActivityLog";

export interface IActivityLogRepository {
  create(data: Omit<IActivityLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<IActivityLog>;
  findAll(filter?: Partial<IActivityLog>): Promise<IActivityLog[]>;
  findById(id: string): Promise<IActivityLog | null>;
  findByBuildingId(buildingId: string): Promise<IActivityLog[]>;
  findByUserId(userId: string): Promise<IActivityLog[]>;
}
