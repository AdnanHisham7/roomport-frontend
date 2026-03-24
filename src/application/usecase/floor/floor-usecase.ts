import { IFloor } from "../../../domain/entities/Floor";
import { IBuildingRepository } from "../../../domain/repository/building-repository-impl";
import { IFloorRepository } from "../../../domain/repository/floor-repository-impl";
import { BadRequestError, NotFoundError } from "../../../shared/error/app-error";
import { CreateFloorDTO, FloorResponseDTO, UpdateFloorDTO } from "../../dtos/floor/floor.dto";
import { IFloorUseCases } from "../../interface/floor/floor-usecase.impl";


function toResponse(f: IFloor): FloorResponseDTO {
  return {
    _id:          f._id!,
    buildingId:   f.buildingId,
    floorNumber:  f.floorNumber,
    name:         f.name,
    totalUnits:   f.totalUnits,
    status:       f.status,
    description:  f.description,
    createdAt:    f.createdAt,
    updatedAt:    f.updatedAt,
  };
}

export class FloorUseCases implements IFloorUseCases {
  constructor(
    private readonly floorRepo:    IFloorRepository,
    private readonly buildingRepo: IBuildingRepository,
  ) {}

  // ── CREATE ────────────────────────────────────────────────────────────────────
  async create(data: CreateFloorDTO): Promise<FloorResponseDTO> {
    // Validate building exists
    const building = await this.buildingRepo.findById(data.buildingId);
    if (!building) {
      throw new NotFoundError('Building not found.', 'Check the buildingId and try again.');
    }

    // Validate floor number doesn't exceed totalFloors
    if (data.floorNumber > building.totalFloors) {
      throw new BadRequestError(
        `Floor number ${data.floorNumber} exceeds building's totalFloors (${building.totalFloors}).`,
        'Use a floor number within the building range.'
      );
    }

    // Prevent duplicate floor numbers in same building
    const duplicate = await this.floorRepo.existsByBuildingAndFloorNumber(
      data.buildingId, data.floorNumber
    );
    if (duplicate) {
      throw new BadRequestError(
        `Floor number ${data.floorNumber} already exists in this building.`,
        'Use a different floor number.'
      );
    }

    const floor = await this.floorRepo.create({ ...data, status: 'active' });
    return toResponse(floor);
  }

  // ── GET BY BUILDING ────────────────────────────────────────────────────────────
  async getByBuilding(buildingId: string): Promise<FloorResponseDTO[]> {
    const exists = await this.buildingRepo.existsById(buildingId);
    if (!exists) throw new NotFoundError('Building not found.', 'Check the buildingId and try again.');

    const floors = await this.floorRepo.findByBuildingId(buildingId);
    return floors.map(toResponse);
  }

  // ── GET BY ID ──────────────────────────────────────────────────────────────────
  async getById(id: string): Promise<FloorResponseDTO> {
    const floor = await this.floorRepo.findById(id);
    if (!floor) throw new NotFoundError('Floor not found.', 'Check the floor ID and try again.');
    return toResponse(floor);
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────────
  async update(id: string, data: UpdateFloorDTO): Promise<FloorResponseDTO> {
    const existing = await this.floorRepo.findById(id);
    if (!existing) throw new NotFoundError('Floor not found.', 'Check the floor ID and try again.');

    // If changing floorNumber, check for conflicts
    if (data.floorNumber !== undefined && data.floorNumber !== existing.floorNumber) {
      const conflict = await this.floorRepo.existsByBuildingAndFloorNumber(
        existing.buildingId, data.floorNumber
      );
      if (conflict) {
        throw new BadRequestError(
          `Floor number ${data.floorNumber} already exists in this building.`,
          'Choose a different floor number.'
        );
      }
    }

    const updated = await this.floorRepo.update(id, data as any);
    return toResponse(updated!);
  }

  // ── DELETE ─────────────────────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    const exists = await this.floorRepo.existsById(id);
    if (!exists) throw new NotFoundError('Floor not found.', 'Check the floor ID and try again.');
    await this.floorRepo.delete(id);
  }
}
