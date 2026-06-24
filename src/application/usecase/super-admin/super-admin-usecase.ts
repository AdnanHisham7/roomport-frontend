import { IUserRepository } from "../../../domain/repository/user-repository-impl";
import { IBuildingRepository } from "../../../domain/repository/building-repository-impl";
import { ISubscriptionRepository } from "../../../domain/repository/subscription-repository-impl";
import { IUnitRepository } from "../../../domain/repository/unit-repository-impl";
import { IInquiryRepository } from "../../../domain/repository/inquiry-repository-impl";
import { IPlatformSettingRepository } from "../../../domain/repository/platform-setting-repository-impl";
import { IActivityLogUsecase } from "../activity-log/activity-log-usecase";
import { ISuperAdminUseCases } from "../../interface/super-admin/super-admin-usecase.impl";
import { BuilderDetailDTO, BuilderListItemDTO, PlatformStatsDTO } from "../../dtos/super-admin/super-admin.dto";
import { BadRequestError, NotFoundError } from "../../../shared/error/app-error";
import { IPlatformSetting } from "../../../domain/entities/PlatformSetting";
import { BuildingResponseDTO } from "../../dtos/building/building.dto";
import { AdminUpdateSubscriptionDTO, SubscriptionResponseDTO } from "../../dtos/subscription/subscription.dto";
import { ISubscription } from "../../../domain/entities/Subscription";

function toSubscriptionResponse(s: ISubscription): SubscriptionResponseDTO {
  return {
    _id: s._id!.toString(), userId: s.userId.toString(), amount: s.amount,
    numberOfBuildings: s.numberOfBuildings, numberOfUnits: s.numberOfUnits,
    dueDate: s.dueDate, paidAt: s.paidAt, status: s.status,
    paymentMethod: s.paymentMethod, invoicenumber: s.invoicenumber,
    createdAt: s.createdAt, updatedAt: s.updatedAt,
  };
}

export class SuperAdminUseCases implements ISuperAdminUseCases {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly buildingRepo: IBuildingRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly unitRepo: IUnitRepository,
    private readonly inquiryRepo: IInquiryRepository,
    private readonly settingRepo: IPlatformSettingRepository,
    private readonly activityLogUc: IActivityLogUsecase
  ) {}

  // ── PLATFORM STATS ──────────────────────────────────────────────────────────
  async getPlatformStats(): Promise<PlatformStatsDTO> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalBuilders, totalManagers, totalBuildings, publishedBuildings,
      allBuildings, totalRevenue,
      activeSubscriptions, pendingSubscriptions,
      totalInquiries, recentInquiries,
    ] = await Promise.all([
      this.userRepo.countAll({ role: 'admin' }),
      this.userRepo.countAll({ role: 'manager' }),
      this.buildingRepo.countAll(),
      this.buildingRepo.countAll({ isPublished: true }),
      this.buildingRepo.findAll(),
      this.subscriptionRepo.getRevenueTotal(),
      this.subscriptionRepo.countAll({ status: 'active' }),
      this.subscriptionRepo.countAll({ status: 'pending' }),
      this.inquiryRepo.countAll(),
      this.inquiryRepo.findAllPaginated({}, 0, 100000),
    ]);

    const recentBuildersList = await this.userRepo.findAllPaginated({ role: 'admin' }, 0, 100000);
    const newBuildersLast30Days = recentBuildersList.data.filter(u => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo).length;
    const newInquiriesLast30Days = recentInquiries.data.filter(i => i.createdAt && new Date(i.createdAt) >= thirtyDaysAgo).length;

    const totalRooms = allBuildings.reduce((sum, b) => sum + b.totalUnits, 0);
    const occupiedCounts = await Promise.all(allBuildings.map(b => this.unitRepo.countByBuildingId(b._id!, { isOccupied: true })));
    const occupiedRooms = occupiedCounts.reduce((s, c) => s + c, 0);
    const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0;

    return {
      totalBuilders, totalManagers, totalBuildings, publishedBuildings,
      totalRooms, occupiedRooms, vacantRooms, occupancyRate,
      totalRevenue, activeSubscriptions, pendingSubscriptions,
      newBuildersLast30Days, totalInquiries, newInquiriesLast30Days,
    };
  }

  // ── BUILDERS ─────────────────────────────────────────────────────────────────
  async listBuilders(filter: { search?: string; status?: string; role?: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { data, total } = await this.userRepo.findAllPaginated(
      { search: filter.search, status: filter.status as any, role: (filter.role as any) || 'admin' },
      skip, limit
    );

    const enriched: BuilderListItemDTO[] = await Promise.all(data.map(async (u) => {
      const buildings = await this.buildingRepo.findByOwnerId(u._id!);
      return {
        _id: u._id!, email: u.email, first_name: u.first_name, last_name: u.last_name,
        phone_number: u.phone_number, status: u.status, role: u.role,
        paymentStatus: u.paymentStatus, email_verified: u.email_verified,
        buildingsCount: buildings.length,
        unitsCount: buildings.reduce((s, b) => s + b.totalUnits, 0),
        createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
      };
    }));

    return { data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async getBuilderDetail(id: string): Promise<BuilderDetailDTO> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('Builder not found.');

    const [buildings, managers, subscription] = await Promise.all([
      this.buildingRepo.findByOwnerId(id),
      this.userRepo.findByOwnerId(id),
      this.subscriptionRepo.findByUserId(id),
    ]);

    return {
      _id: user._id!, email: user.email, first_name: user.first_name, last_name: user.last_name,
      phone_number: user.phone_number, status: user.status, role: user.role,
      paymentStatus: user.paymentStatus, email_verified: user.email_verified,
      buildingsCount: buildings.length,
      unitsCount: buildings.reduce((s, b) => s + b.totalUnits, 0),
      createdAt: user.createdAt, lastLoginAt: user.lastLoginAt,
      managers: managers.map(m => ({ _id: m._id!, first_name: m.first_name, last_name: m.last_name, email: m.email, status: m.status })),
      buildings: buildings.map(b => ({ _id: b._id!, name: b.name, totalUnits: b.totalUnits, totalFloors: b.totalFloors, status: b.status, isPublished: b.isPublished })),
      subscription: subscription ? {
        _id: subscription._id!, amount: subscription.amount, numberOfBuildings: subscription.numberOfBuildings,
        numberOfUnits: subscription.numberOfUnits, status: subscription.status, dueDate: subscription.dueDate,
      } : null,
    };
  }

  async updateBuilderStatus(id: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('Builder not found.');
    if (user.role === 'super_admin') throw new BadRequestError('Cannot modify another super admin from here.');
    await this.userRepo.updateStatus(id, status);
  }

  async deleteBuilder(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError('Builder not found.');
    if (user.role === 'super_admin') throw new BadRequestError('Cannot delete a super admin account.');

    const buildings = await this.buildingRepo.findByOwnerId(id);
    const hasOccupied = (await Promise.all(buildings.map(b => this.unitRepo.countByBuildingId(b._id!, { isOccupied: true })))).some(c => c > 0);
    if (hasOccupied) {
      throw new BadRequestError('This builder still has occupied rooms.', 'All tenants must be vacated before deleting this account.');
    }

    for (const b of buildings) {
      const units = await this.unitRepo.findByBuildingId(b._id!);
      await Promise.all(units.map(u => this.unitRepo.delete(u._id!)));
      await this.buildingRepo.delete(b._id!);
    }
    const managers = await this.userRepo.findByOwnerId(id);
    await Promise.all(managers.map(m => this.userRepo.delete(m._id!)));
    await this.userRepo.delete(id);
  }

  // ── BUILDINGS ────────────────────────────────────────────────────────────────
  async listBuildings(filter: { search?: string; status?: string; isPublished?: boolean; isFeatured?: boolean }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { data, total } = await this.buildingRepo.findAllPaginated(filter as any, skip, limit);

    const ownerCache = new Map<string, string>();
    const enriched = await Promise.all(data.map(async (b) => {
      let ownerName = ownerCache.get(b.ownerId);
      if (!ownerName) {
        const owner = await this.userRepo.findById(b.ownerId);
        ownerName = owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown';
        ownerCache.set(b.ownerId, ownerName);
      }
      return { ...(b as unknown as BuildingResponseDTO), ownerName };
    }));

    return { data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async toggleFeatureBuilding(id: string, isFeatured: boolean): Promise<BuildingResponseDTO> {
    const settings = await this.settingRepo.get();
    if (isFeatured) {
      const currentlyFeatured = await this.buildingRepo.countAll({ isFeatured: true });
      if (currentlyFeatured >= settings.maxFeaturedBuildings) {
        throw new BadRequestError(`You can feature at most ${settings.maxFeaturedBuildings} buildings at once.`, 'Un-feature another listing first, or raise the limit in Settings.');
      }
    }
    const updated = await this.buildingRepo.update(id, { isFeatured });
    if (!updated) throw new NotFoundError('Building not found.');
    return updated as unknown as BuildingResponseDTO;
  }

  async togglePublishBuilding(id: string, isPublished: boolean): Promise<BuildingResponseDTO> {
    const updated = await this.buildingRepo.update(id, { isPublished });
    if (!updated) throw new NotFoundError('Building not found.');
    return updated as unknown as BuildingResponseDTO;
  }

  async deleteBuildingAsAdmin(id: string): Promise<void> {
    const occupied = await this.unitRepo.countByBuildingId(id, { isOccupied: true });
    if (occupied > 0) throw new BadRequestError(`This building has ${occupied} occupied room(s).`, 'Vacate every tenant first.');
    const units = await this.unitRepo.findByBuildingId(id);
    await Promise.all(units.map(u => this.unitRepo.delete(u._id!)));
    await this.buildingRepo.delete(id);
  }

  // ── ACTIVITY LOGS ────────────────────────────────────────────────────────────
  async listActivityLogs(filter: Record<string, any>, page: number, limit: number) {
    const result = await this.activityLogUc.getActivitiesPaginated(filter, page, limit);
    return { data: result.data, total: result.total, page, limit, totalPages: Math.ceil(result.total / limit) || 1 };
  }

  // ── SETTINGS ─────────────────────────────────────────────────────────────────
  async getSettings(): Promise<IPlatformSetting> {
    return this.settingRepo.get();
  }

  async updateSettings(data: Partial<IPlatformSetting>, updatedBy: string): Promise<IPlatformSetting> {
    return this.settingRepo.update(data, updatedBy);
  }

  // ── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
  async listSubscriptions(filter: { userId?: string; status?: string }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { data, total } = await this.subscriptionRepo.findAllPaginated(filter, skip, limit);

    const ownerCache = new Map<string, string>();
    const enriched = await Promise.all(data.map(async (s) => {
      const userId = s.userId.toString();
      let ownerName = ownerCache.get(userId);
      if (!ownerName) {
        const owner = await this.userRepo.findById(userId);
        ownerName = owner ? `${owner.first_name} ${owner.last_name} (${owner.email})` : 'Unknown';
        ownerCache.set(userId, ownerName);
      }
      return { ...toSubscriptionResponse(s), ownerName };
    }));

    return { data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async updateSubscription(id: string, data: AdminUpdateSubscriptionDTO): Promise<SubscriptionResponseDTO> {
    const existing = await this.subscriptionRepo.findById(id);
    if (!existing) throw new NotFoundError('Subscription not found.');
    const updated = await this.subscriptionRepo.update(id, data as Partial<ISubscription>);
    return toSubscriptionResponse(updated!);
  }
}
