import { CreateTenantDTO, TenantResponseDTO, UpdateTenantDTO } from "../../dtos/tenant/tenant.dto";


export interface ITenantUseCases {
  create(data: CreateTenantDTO): Promise<TenantResponseDTO>;
  getAll(filter?: { buildingId?: string; unitId?: string; status?: string }): Promise<TenantResponseDTO[]>;
  getById(id: string): Promise<TenantResponseDTO>;
  update(id: string, data: UpdateTenantDTO): Promise<TenantResponseDTO>;
  delete(id: string): Promise<void>;
  getTenantLeases(tenantId: string): Promise<any[]>;
}
