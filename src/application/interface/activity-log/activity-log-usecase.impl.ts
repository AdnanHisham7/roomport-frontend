import { IActivityLog } from "../../../domain/entities/ActivityLog";
import { IActivityLogRepository } from "../../../domain/repository/activity-log-repository";
import { IActivityLogUsecase } from "../../usecase/activity-log/activity-log-usecase";

export class ActivityLogUsecaseImpl implements IActivityLogUsecase {
  constructor(private activityLogRepository: IActivityLogRepository) {}

  async logActivity(data: Omit<IActivityLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<IActivityLog> {
    return this.activityLogRepository.create(data);
  }

  async getActivities(filter?: Partial<IActivityLog>): Promise<IActivityLog[]> {
    return this.activityLogRepository.findAll(filter);
  }

  async getActivityById(id: string): Promise<IActivityLog | null> {
    return this.activityLogRepository.findById(id);
  }

  async getActivitiesByBuilding(buildingId: string): Promise<IActivityLog[]> {
    return this.activityLogRepository.findByBuildingId(buildingId);
  }

  async getActivitiesByUser(userId: string): Promise<IActivityLog[]> {
    return this.activityLogRepository.findByUserId(userId);
  }
}
