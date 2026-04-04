import { CreateUnitDTO, UnitResponseDTO, UpdateUnitDTO } from "../../dtos/unit/unit.dto";

export interface IUnitUseCases {
  create(data: CreateUnitDTO): Promise<UnitResponseDTO>;
  getAll(filter?: { buildingId?: string; status?: string; isOccupied?: boolean }): Promise<UnitResponseDTO[]>;
  getById(id: string): Promise<UnitResponseDTO>;
  update(id: string, data: UpdateUnitDTO): Promise<UnitResponseDTO>;
  bulkUpdate(unitIds: string[], data: UpdateUnitDTO): Promise<UnitResponseDTO[]>;
  delete(id: string): Promise<void>;
}
