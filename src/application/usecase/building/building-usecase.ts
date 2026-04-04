import { IBuilding } from "../../../domain/entities/Building";
import { IBuildingRepository } from "../../../domain/repository/building-repository-impl";
import { IFloorUseCases } from "../../interface/floor/floor-usecase.impl";
import { IBuildingUseCases } from "../../interface/building/building-usecase.impl";
import { BadRequestError, NotFoundError, PaymentRequiredError } from "../../../shared/error/app-error";
import { ISubscriptionRepository } from "../../../domain/repository/subscription-repository-impl";
import { BuildingOccupancyStatsDTO, BuildingResponseDTO, CreateBuildingDTO, UpdateBuildingDTO } from "../../dtos/building/building.dto";
import { IActivityLogUsecase } from "../../usecase/activity-log/activity-log-usecase";
import { ActivityLogAction, ActivityLogEntityType } from "../../../domain/entities/ActivityLog";

function toResponse(b: IBuilding): BuildingResponseDTO {
  return { _id: b._id!, name: b.name, type: b.type, status: b.status, location: b.location, ownerId: b.ownerId, managerId: b.managerId, totalUnits: b.totalUnits, totalFloors: b.totalFloors, sqft: b.sqft, lift: b.lift, helipad: b.helipad, nearAirport: b.nearAirport, nearRailwayStation: b.nearRailwayStation, nearBusStand: b.nearBusStand, nearPark: b.nearPark, amenities: b.amenities, images: b.images, documents: b.documents, description: b.description, yearOfBuild: b.yearOfBuild, createdAt: b.createdAt, updatedAt: b.updatedAt };
}

export class BuildingUseCases implements IBuildingUseCases {
  constructor(
    private readonly buildingRepo: IBuildingRepository,
    private readonly floorUc: IFloorUseCases,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly activityLogUc: IActivityLogUsecase
  ) {}

  async createFloors(floorData: { buildingId: string; floorNumber: number; name: string; totalUnits: number; }[]): Promise<void> {
    for (const data of floorData) {
      await this.floorUc.create({ ...data, description: '' });
    }
  }

  async create(data: CreateBuildingDTO): Promise<BuildingResponseDTO> {
    if (data.totalUnits < 1)  throw new BadRequestError('totalUnits must be at least 1.');
    if (data.totalFloors < 1) throw new BadRequestError('totalFloors must be at least 1.');
    if (!data.location?.address || !data.location?.city || !data.location?.state || !data.location?.pincode) throw new BadRequestError('location (address, city, state, pincode) is required.');
    
    // Subscription Check

    console.log("ownerId",data.ownerId);
    const subscription = await this.subscriptionRepo.findByUserId(data.ownerId);
    console.log("subscription",subscription);
    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'paid')) {
      throw new PaymentRequiredError('Active subscription required to create a building.', 'Please subscribe to a plan.');
    }
    const userBuildings = await this.buildingRepo.findByOwnerId(data.ownerId);
    const currentBuildingCount = userBuildings.length;
    const currentUnitCount = userBuildings.reduce((sum, b) => sum + b.totalUnits, 0);

    if (currentBuildingCount + 1 > subscription.numberOfBuildings) {
      throw new PaymentRequiredError('Building limit exceeded.', 'Please upgrade your plan to create more buildings.');
    }
    if (currentUnitCount + data.totalUnits > subscription.numberOfUnits) {
       throw new PaymentRequiredError('Unit limit exceeded.', 'Please upgrade your plan unit limits to support this newly created building.');
    }

    const b = await this.buildingRepo.create({ ...data, lift: data.lift ?? false, helipad: data.helipad ?? false, status: 'active' });
    
    this.activityLogUc.logActivity({
      action: ActivityLogAction.BUILDING_CREATED,
      entityType: ActivityLogEntityType.BUILDING,
      entityId: b._id,
      buildingId: b._id,
      userId: b.ownerId as any,
      metadata: { name: b.name, totalUnits: b.totalUnits }
    }).catch(console.error);

    return toResponse(b);
  }

  async getAll(filter?: any): Promise<BuildingResponseDTO[]> {
    return (await this.buildingRepo.findAll(filter)).map(toResponse);
  }

  async getById(id: string): Promise<BuildingResponseDTO> {
    const b = await this.buildingRepo.findById(id);
    if (!b) throw new NotFoundError('Building not found.');
    return toResponse(b);
  }

  async update(id: string, data: UpdateBuildingDTO): Promise<BuildingResponseDTO> {
    const prev = await this.buildingRepo.findById(id);
    if (!prev) throw new NotFoundError('Building not found.');

    const updated = await this.buildingRepo.update(id, data as any);

    this.activityLogUc.logActivity({
      action: ActivityLogAction.BUILDING_UPDATED,
      entityType: ActivityLogEntityType.BUILDING,
      entityId: updated!._id,
      buildingId: updated!._id,
      userId: updated!.ownerId as any,
      metadata: { action: 'update', changes_keys: Object.keys(data) }
    }).catch(console.error);

    return toResponse(updated!);
  }

  async delete(id: string): Promise<void> {
    const prev = await this.buildingRepo.findById(id);
    if (!prev) throw new NotFoundError('Building not found.');

    await this.buildingRepo.delete(id);

    this.activityLogUc.logActivity({
      action: ActivityLogAction.BUILDING_DELETED,
      entityType: ActivityLogEntityType.BUILDING,
      entityId: id,
      buildingId: id,
      userId: prev.ownerId as any,
    }).catch(console.error);
  }

  async getOccupancyStats(ownerId?: string): Promise<BuildingOccupancyStatsDTO> {
    const buildings = await this.buildingRepo.findAll(ownerId ? { ownerId } : undefined);
    const totalUnits = buildings.reduce((s, b) => s + b.totalUnits, 0);
    return { totalBuildings: buildings.length, totalUnits, occupiedUnits: 0, vacantUnits: totalUnits, occupancyRate: 0, byBuilding: buildings.map(b => ({ _id: b._id!, name: b.name, totalUnits: b.totalUnits, occupiedUnits: 0, vacantUnits: b.totalUnits, occupancyRate: 0 })) };
  }
}
