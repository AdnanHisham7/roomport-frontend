import type { IBuilding } from "../../domain/entities/Building";
import type { IBuildingRepository } from "../../domain/repository/building-repository-impl";
import { BuildingModel } from "../db/model/building-model";

export class BuildingRepository implements IBuildingRepository {

  private toStringId(doc: { _id: unknown }): string {
    return (doc._id as { toString(): string }).toString();
  }

  private toEntity(doc: any): IBuilding {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    return {
      ...obj,
      _id:       this.toStringId(obj),
      ownerId:   obj.ownerId?.toString()   ?? '',
      managerId: obj.managerId?.toString() ?? undefined,
      addressId: obj.addressId?.toString() ?? undefined,
      documents: (obj.documents ?? []).map((d: any) => d?.toString()),
    };
  }

  async findById(id: string): Promise<IBuilding | null> {
    const doc = await BuildingModel.findById(id).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(
    filter?: Partial<Pick<IBuilding, 'ownerId' | 'managerId' | 'status' | 'type'>>
  ): Promise<IBuilding[]> {
    const query: Record<string, any> = {};
    if (filter?.ownerId)   query.ownerId   = filter.ownerId;
    if (filter?.managerId) query.managerId = filter.managerId;
    if (filter?.status)    query.status    = filter.status;
    if (filter?.type)      query.type      = filter.type;

    const docs = await BuildingModel.find(query).lean();
    return docs.map((d) => this.toEntity(d));
  }

  async findByOwnerId(ownerId: string): Promise<IBuilding[]> {
    const docs = await BuildingModel.find({ ownerId }).lean();
    return docs.map((d) => this.toEntity(d));
  }

  async create(data: Omit<IBuilding, '_id' | 'createdAt' | 'updatedAt'>): Promise<IBuilding> {
    const doc = await BuildingModel.create(data);
    return this.toEntity(doc);
  }

  async update(id: string, data: Partial<IBuilding>): Promise<IBuilding | null> {
    const doc = await BuildingModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await BuildingModel.findByIdAndDelete(id);
    return !!result;
  }

  async existsById(id: string): Promise<boolean> {
    return !!(await BuildingModel.exists({ _id: id }));
  }
}
