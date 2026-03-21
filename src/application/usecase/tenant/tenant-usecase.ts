import { ITenant } from "../../../domain/entities/Tenant";
import { ITenantRepository } from "../../../domain/repository/tenant-repository-impl";
import { BadRequestError, NotFoundError } from "../../../shared/error/app-error";
import { CreateTenantDTO, TenantResponseDTO, UpdateTenantDTO } from "../../dtos/tenant/tenant.dto";
import { ITenantUseCases } from "../../interface/tenant/tenant-usecase-impl";


// ── helper: entity → response DTO ─────────────────────────────────────────────
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
  constructor(private readonly tenantRepository: ITenantRepository) {}

  // ── CREATE ────────────────────────────────────────────────────────────────────
  async create(data: CreateTenantDTO): Promise<TenantResponseDTO> {
    if (data.dueDate < 1 || data.dueDate > 31) {
      throw new BadRequestError(
        'dueDate must be between 1 and 31.',
        'Enter a valid day of the month for rent due date.'
      );
    }
    if (data.rentAmount < 0) {
      throw new BadRequestError('rentAmount must be a positive number.', 'Enter a valid rent amount.');
    }

    const tenant = await this.tenantRepository.create({
      ...data,
      status: 'pending',
    });
    return toResponse(tenant);
  }

  // ── GET ALL ───────────────────────────────────────────────────────────────────
  async getAll(filter?: { buildingId?: string; unitId?: string; status?: string }): Promise<TenantResponseDTO[]> {
    const tenants = await this.tenantRepository.findAll(filter as any);
    return tenants.map(toResponse);
  }

  // ── GET BY ID ─────────────────────────────────────────────────────────────────
  async getById(id: string): Promise<TenantResponseDTO> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');
    }
    return toResponse(tenant);
  }

  // ── UPDATE ────────────────────────────────────────────────────────────────────
  async update(id: string, data: UpdateTenantDTO): Promise<TenantResponseDTO> {
    const existing = await this.tenantRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');
    }
    const updated = await this.tenantRepository.update(id, data as any);
    return toResponse(updated!);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    const exists = await this.tenantRepository.existsById(id);
    if (!exists) {
      throw new NotFoundError('Tenant not found.', 'Check the tenant ID and try again.');
    }
    await this.tenantRepository.delete(id);
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
