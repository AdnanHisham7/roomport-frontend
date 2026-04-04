import { IUnitRepository } from "../../../domain/repository/unit-repository-impl";
import { CreateUnitDTO, UnitResponseDTO, UpdateUnitDTO } from "../../dtos/unit/unit.dto";
import { IUnitUseCases } from "../../interface/unit/unit-usecase-impl";
import { ISubscriptionRepository } from "../../../domain/repository/subscription-repository-impl";
import { IBuildingRepository } from "../../../domain/repository/building-repository-impl";
import { PaymentRequiredError, NotFoundError } from "../../../shared/error/app-error";

export class UnitUseCases implements IUnitUseCases {
  constructor(
    private readonly unitRepository: IUnitRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly buildingRepo: IBuildingRepository
  ) {}

  async create(data: CreateUnitDTO): Promise<UnitResponseDTO> {
    const building = await this.buildingRepo.findById(data.buildingId);
    if (!building) throw new NotFoundError('Building not found');

    const subscription = await this.subscriptionRepo.findByUserId(building.ownerId);
    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'paid')) {
      throw new PaymentRequiredError('Active subscription required.', 'Please subscribe to a plan to add units.');
    }

    const userBuildings = await this.buildingRepo.findByOwnerId(building.ownerId);
    const currentUnitCount = userBuildings.reduce((sum, b) => sum + b.totalUnits, 0);

    if (currentUnitCount > subscription.numberOfUnits) {
       throw new PaymentRequiredError('Unit limit exceeded.', 'Please upgrade your plan unit limits to add more units.');
    }

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
    const existingUnit = await this.unitRepository.findById(id);
    if (!existingUnit) throw new NotFoundError('Unit not found');

    const building = await this.buildingRepo.findById(existingUnit.buildingId);
    if (building) {
      const subscription = await this.subscriptionRepo.findByUserId(building.ownerId);
      if (!subscription || (subscription.status !== 'active' && subscription.status !== 'paid')) {
        throw new PaymentRequiredError('Active subscription required.', 'Please subscribe to a plan to edit units.');
      }
    }

    const unit = await this.unitRepository.update(id, data);
    if (!unit) throw new Error("Unit not found");
    return unit as UnitResponseDTO;
  }

  async bulkUpdate(unitIds: string[], data: UpdateUnitDTO): Promise<UnitResponseDTO[]> {
    const promises = unitIds.map(id => this.update(id, data).catch(err => {
      console.error(`Failed to update unit ${id}:`, err);
      return null;
    }));
    const results = await Promise.all(promises);
    return results.filter(Boolean) as UnitResponseDTO[];
  }

  async delete(id: string): Promise<void> {
    const exists = await this.unitRepository.existsById(id);
    if (!exists) throw new Error("Unit not found");
    await this.unitRepository.delete(id);
  }
}
