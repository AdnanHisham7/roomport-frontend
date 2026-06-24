import { IActivityLog } from "../../../domain/entities/ActivityLog";

export interface IActivityLogUsecase {
  logActivity(data: Omit<IActivityLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<IActivityLog>;
  getActivities(filter?: Partial<IActivityLog>): Promise<IActivityLog[]>;
  getActivitiesPaginated(filter: Partial<IActivityLog> | undefined, page: number, limit: number): Promise<{ data: IActivityLog[]; total: number; page: number; limit: number }>;
  getActivityById(id: string): Promise<IActivityLog | null>;
  getActivitiesByBuilding(buildingId: string): Promise<IActivityLog[]>;
  getActivitiesByUser(userId: string): Promise<IActivityLog[]>;
}
