import { ITenant } from "../../../domain/entities/Tenant";
import { ITenantRepository } from "../../../domain/repository/tenant-repository-impl";
import { BadRequestError, NotFoundError } from "../../../shared/error/app-error";
import { CreateTenantDTO, TenantResponseDTO, UpdateTenantDTO } from "../../dtos/tenant/tenant.dto";
import { ITenantUseCases } from "../../interface/tenant/tenant-usecase-impl";
import { IUnitRepository } from "../../../domain/repository/unit-repository-impl";
import { IActivityLogUsecase } from "../../usecase/activity-log/activity-log-usecase";
import { ActivityLogAction, ActivityLogEntityType } from "../../../domain/entities/ActivityLog";

function toResponse(t: ITenant): TenantResponseDTO {
  return {
    _id:              t._id!,
    firstName:        t.firstName,
    lastName:         t.lastName,
    fullName:         `${t.firstName} ${t.lastName}`,
    email:            t.email,
    phone:            t.phone,
    status:           t.status,
    unitId:           t.unitId,
    buildingId:       t.buildingId,
    job:              t.job,
    notes:            t.notes,
    emergencyContact: t.emergencyContact,
    rentType:         t.rentType,
    rentAmount:       t.rentAmount,
    dueDate:          t.dueDate,
    moveInDate:       t.moveInDate,
    vacateDate:       t.vacateDate,
    terms:            t.terms,
    createdAt:        t.createdAt,
    updatedAt:        t.updatedAt,
  };
}

export class TenantUseCases implements ITenantUseCases {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly unitRepo: IUnitRepository,
    private readonly activityLogUc: IActivityLogUsecase
  ) {}

  async create(data: CreateTenantDTO): Promise<TenantResponseDTO> {
    if (data.dueDate < 1 || data.dueDate > 31) {
      throw new BadRequestError('dueDate must be between 1 and 31.', 'Enter a valid day of the month for rent due date.');
    }
    if (data.rentAmount < 0) {
      throw new BadRequestError('rentAmount must be a positive number.', 'Enter a valid rent amount.');
    }

    const tenant = await this.tenantRepository.create({
      ...data,
      status: 'pending',
    });

    if (tenant.unitId) {
      await this.unitRepo.update(tenant.unitId, { isOccupied: true, status: 'occupied' });
    }

    this.activityLogUc.logActivity({
      action: ActivityLogAction.TENANT_CREATED,
      entityType: ActivityLogEntityType.TENANT,
      entityId: tenant._id,
      buildingId: tenant.buildingId,
      unitId: tenant.unitId,
      userId: tenant.userId as any,
      metadata: { firstName: tenant.firstName, rentAmount: tenant.rentAmount }
    }).catch(console.error);

    return toResponse(tenant);
  }

  async getAll(filter?: { buildingId?: string; unitId?: string; status?: string }): Promise<TenantResponseDTO[]> {
    const tenants = await this.tenantRepository.findAll(filter as any);
    return tenants.map(toResponse);
  }

  async getById(id: string): Promise<TenantResponseDTO> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');
    return toResponse(tenant);
  }

  async update(id: string, data: UpdateTenantDTO): Promise<TenantResponseDTO> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');

    if (data.unitId && data.unitId !== existing.unitId) {
       if (existing.unitId) await this.unitRepo.update(existing.unitId, { isOccupied: false, status: 'available' });
       await this.unitRepo.update(data.unitId, { isOccupied: true, status: 'occupied' });
    } else if (data.status === 'inactive' || data.status === 'blacklisted') {
       if (existing.unitId) await this.unitRepo.update(existing.unitId, { isOccupied: false, status: 'available' });
    }

    const updated = await this.tenantRepository.update(id, data as any);

    if ((data.paidAt && data.paidAt !== existing.paidAt) || (data.status === 'active' && existing.status !== 'active')) {
       this.activityLogUc.logActivity({
          action: ActivityLogAction.RENT_PAYMENT_COMPLETED,
          entityType: ActivityLogEntityType.PAYMENT,
          entityId: updated!._id,
          buildingId: updated!.buildingId,
          unitId: updated!.unitId,
          userId: updated!.userId as any,
          metadata: { rentAmount: updated!.rentAmount }
       }).catch(console.error);
    } else {
       this.activityLogUc.logActivity({
          action: ActivityLogAction.TENANT_UPDATED,
          entityType: ActivityLogEntityType.TENANT,
          entityId: updated!._id,
          buildingId: updated!.buildingId,
          unitId: updated!.unitId,
          userId: updated!.userId as any,
       }).catch(console.error);
    }

    return toResponse(updated!);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');
    
    if (existing.unitId) {
       await this.unitRepo.update(existing.unitId, { isOccupied: false, status: 'available' });
    }

    await this.tenantRepository.delete(id);

    this.activityLogUc.logActivity({
       action: ActivityLogAction.TENANT_DELETED,
       entityType: ActivityLogEntityType.TENANT,
       entityId: existing._id,
       buildingId: existing.buildingId,
       unitId: existing.unitId,
       userId: existing.userId as any,
    }).catch(console.error);
  }

  // ── GET TENANT LEASES ──────────────────────────────────────────────────────────
  // Placeholder — will be populated when Lease module is built
  async getTenantLeases(tenantId: string): Promise<any[]> {
    const exists = await this.tenantRepository.existsById(tenantId);
    if (!exists) {
      throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');
    }
    // Lease repo will be injected here in the Lease module
    return [];
  }
}
