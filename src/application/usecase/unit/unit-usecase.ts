import { IUnitRepository } from "../../../domain/repository/unit-repository-impl";
import { CreateUnitDTO, UnitResponseDTO, UpdateUnitDTO } from "../../dtos/unit/unit.dto";
import { IUnitUseCases } from "../../interface/unit/unit-usecase-impl";

export class UnitUseCases implements IUnitUseCases {
  constructor(private readonly unitRepository: IUnitRepository) {}

  async create(data: CreateUnitDTO): Promise<UnitResponseDTO> {
    const unitData = {
      ...data,
      isOccupied: data.isOccupied ?? false,
      status: data.status ?? 'available',
    };
    const unit = await this.unitRepository.create(unitData);
    return unit as UnitResponseDTO;
  }

  async getAll(filter?: { buildingId?: string; status?: string; isOccupied?: boolean }): Promise<UnitResponseDTO[]> {
    const units = await this.unitRepository.findAll(filter as any);
    return units as UnitResponseDTO[];
  }

  async getById(id: string): Promise<UnitResponseDTO> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new Error("Unit not found");
    return unit as UnitResponseDTO;
  }

  async update(id: string, data: UpdateUnitDTO): Promise<UnitResponseDTO> {
    const unit = await this.unitRepository.update(id, data);
    if (!unit) throw new Error("Unit not found");
    return unit as UnitResponseDTO;
  }

  async delete(id: string): Promise<void> {
    const exists = await this.unitRepository.existsById(id);
    if (!exists) throw new Error("Unit not found");
    await this.unitRepository.delete(id);
  }
}
