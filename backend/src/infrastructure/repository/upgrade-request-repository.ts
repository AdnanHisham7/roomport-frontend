import { IUpgradeRequest, UpgradeRequestModel } from '../db/model/upgrade-request-model';

export class UpgradeRequestRepository {
  private toEntity(doc: any): IUpgradeRequest {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    return {
      ...obj,
      _id:            obj._id?.toString(),
      userId:         obj.userId?._id ? { ...obj.userId, _id: obj.userId._id.toString() } : obj.userId?.toString(),
      subscriptionId: obj.subscriptionId?.toString() ?? undefined,
      resolvedBy:     obj.resolvedBy?.toString() ?? undefined,
    };
  }

  async create(data: Omit<IUpgradeRequest, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<IUpgradeRequest> {
    const doc = await UpgradeRequestModel.create({ ...data, status: 'pending' });
    return this.toEntity(doc);
  }

  async findAll(filter?: { status?: string; userId?: string }): Promise<IUpgradeRequest[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.userId) query.userId = filter.userId;
    const docs = await UpgradeRequestModel.find(query)
      .populate('userId', 'first_name last_name email phone_number')
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(d => this.toEntity(d));
  }

  async findAllPaginated(
    filter: { status?: string; userId?: string },
    skip: number,
    limit: number
  ): Promise<{ data: IUpgradeRequest[]; total: number }> {
    const query: Record<string, any> = {};
    if (filter.status) query.status = filter.status;
    if (filter.userId) query.userId = filter.userId;
    const [docs, total] = await Promise.all([
      UpgradeRequestModel.find(query)
        .populate('userId', 'first_name last_name email phone_number')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UpgradeRequestModel.countDocuments(query),
    ]);
    return { data: docs.map(d => this.toEntity(d)), total };
  }

  async findById(id: string): Promise<IUpgradeRequest | null> {
    const doc = await UpgradeRequestModel.findById(id)
      .populate('userId', 'first_name last_name email phone_number')
      .lean();
    return doc ? this.toEntity(doc) : null;
  }

  async update(id: string, data: Partial<IUpgradeRequest>): Promise<IUpgradeRequest | null> {
    const doc = await UpgradeRequestModel.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate('userId', 'first_name last_name email phone_number')
      .lean();
    return doc ? this.toEntity(doc) : null;
  }
}
