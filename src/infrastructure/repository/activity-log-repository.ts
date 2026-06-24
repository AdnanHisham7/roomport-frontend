import { IActivityLog } from "../../domain/entities/ActivityLog";
import { IActivityLogRepository } from "../../domain/repository/activity-log-repository";
import { ActivityLogModel } from "../db/model/activity-log-model";

export class ActivityLogRepositoryImpl implements IActivityLogRepository {
  private toStringId(doc: { _id: unknown }): string {
    return (doc._id as { toString(): string }).toString();
  }

  private toEntity(doc: any): IActivityLog {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    return {
      ...obj,
      _id: this.toStringId(obj),
      buildingId: obj.buildingId?.toString(),
      entityId: obj.entityId?.toString(),
      unitId: obj.unitId?.toString(),
      userId: obj.userId?.toString(),
    };
  }

  async create(data: Omit<IActivityLog, "_id" | "createdAt" | "updatedAt">): Promise<IActivityLog> {
    const doc = await ActivityLogModel.create(data);
    return this.toEntity(doc);
  }

  async findAll(filter?: Partial<IActivityLog>): Promise<IActivityLog[]> {
    const query: Record<string, any> = {};
    if (filter?.action) query.action = filter.action;
    if (filter?.entityType) query.entityType = filter.entityType;
    if (filter?.buildingId) query.buildingId = filter.buildingId;
    if (filter?.entityId) query.entityId = filter.entityId;
    if (filter?.unitId) query.unitId = filter.unitId;
    if (filter?.userId) query.userId = filter.userId;

    const docs = await ActivityLogModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toEntity(d));
  }

  async findAllPaginated(filter: Partial<IActivityLog> | undefined, skip: number, limit: number): Promise<{ data: IActivityLog[]; total: number }> {
    const query: Record<string, any> = {};
    if (filter?.action) query.action = filter.action;
    if (filter?.entityType) query.entityType = filter.entityType;
    if (filter?.buildingId) query.buildingId = filter.buildingId;
    if (filter?.entityId) query.entityId = filter.entityId;
    if (filter?.unitId) query.unitId = filter.unitId;
    if (filter?.userId) query.userId = filter.userId;

    const [docs, total] = await Promise.all([
      ActivityLogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ActivityLogModel.countDocuments(query),
    ]);
    return { data: docs.map(d => this.toEntity(d)), total };
  }

  async findById(id: string): Promise<IActivityLog | null> {
    const doc = await ActivityLogModel.findById(id).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByBuildingId(buildingId: string): Promise<IActivityLog[]> {
    const docs = await ActivityLogModel.find({ buildingId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toEntity(d));
  }

  async findByUserId(userId: string): Promise<IActivityLog[]> {
    const docs = await ActivityLogModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return docs.map(d => this.toEntity(d));
  }
}
