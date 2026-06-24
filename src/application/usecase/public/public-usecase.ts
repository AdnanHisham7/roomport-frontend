import { IBuildingRepository } from "../../../domain/repository/building-repository-impl";
import { IUnitRepository } from "../../../domain/repository/unit-repository-impl";
import { IFloorRepository } from "../../../domain/repository/floor-repository-impl";
import { NotFoundError } from "../../../shared/error/app-error";
import { IPublicUseCases, PublicBuildingListFilter } from "../../interface/public/public-usecase.impl";
import { PublicBuildingCardDTO, PublicBuildingDetailDTO, PublicFiltersDTO, PublicUnitDetailDTO } from "../../dtos/public/public.dto";
import { PaginatedResult } from "../../dtos/super-admin/super-admin.dto";
import { IBuilding } from "../../../domain/entities/Building";
import { IUnit } from "../../../domain/entities/Unit";
import { UnitResponseDTO } from "../../dtos/unit/unit.dto";

function buildingCard(b: IBuilding, units: IUnit[]): PublicBuildingCardDTO {
  const available = units.filter(u => u.status === 'available' && !u.isOccupied);
  const rents = available.map(u => u.rentAmount).filter(r => r > 0);
  return {
    ...(b as any), _id: b._id!,
    availableUnitsCount: available.length,
    occupiedUnitsCount: units.filter(u => u.isOccupied || u.status === 'occupied').length,
    minRent: rents.length ? Math.min(...rents) : null,
    maxRent: rents.length ? Math.max(...rents) : null,
  };
}

export class PublicUseCases implements IPublicUseCases {
  constructor(
    private readonly buildingRepo: IBuildingRepository,
    private readonly unitRepo: IUnitRepository,
    private readonly floorRepo: IFloorRepository
  ) {}

  async listBuildings(filter: PublicBuildingListFilter, page: number, limit: number): Promise<PaginatedResult<PublicBuildingCardDTO>> {
    const candidates = await this.buildingRepo.findAll({
      isPublished: true, status: 'active',
      city: filter.city, state: filter.state, type: filter.type as any, search: filter.search,
    });

    const units = await this.unitRepo.findByBuildingIds(candidates.map(b => b._id!));
    const unitsByBuilding = new Map<string, IUnit[]>();
    for (const u of units) {
      const arr = unitsByBuilding.get(u.buildingId) ?? [];
      arr.push(u);
      unitsByBuilding.set(u.buildingId, arr);
    }

    let cards = candidates.map(b => buildingCard(b, unitsByBuilding.get(b._id!) ?? []));

    if (filter.minRent !== undefined) cards = cards.filter(c => c.minRent !== null && c.minRent! >= filter.minRent!);
    if (filter.maxRent !== undefined) cards = cards.filter(c => c.minRent !== null && c.minRent! <= filter.maxRent!);
    if (filter.bedrooms !== undefined) {
      cards = cards.filter(c => (unitsByBuilding.get(c._id) ?? []).some(u => u.status === 'available' && u.bedrooms === filter.bedrooms));
    }

    if (filter.sort === 'rent_low')  cards.sort((a, b) => (a.minRent ?? Infinity) - (b.minRent ?? Infinity));
    else if (filter.sort === 'rent_high') cards.sort((a, b) => (b.minRent ?? -1) - (a.minRent ?? -1));
    else cards.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

    const total = cards.length;
    const start = (page - 1) * limit;
    const data = cards.slice(start, start + limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  async getFeaturedBuildings(limit: number): Promise<PublicBuildingCardDTO[]> {
    const featured = await this.buildingRepo.findAll({ isPublished: true, isFeatured: true, status: 'active' });
    const units = await this.unitRepo.findByBuildingIds(featured.map(b => b._id!));
    const unitsByBuilding = new Map<string, IUnit[]>();
    for (const u of units) {
      const arr = unitsByBuilding.get(u.buildingId) ?? [];
      arr.push(u);
      unitsByBuilding.set(u.buildingId, arr);
    }
    return featured.slice(0, limit).map(b => buildingCard(b, unitsByBuilding.get(b._id!) ?? []));
  }

  async getBuildingDetail(id: string): Promise<PublicBuildingDetailDTO> {
    const building = await this.buildingRepo.findById(id);
    if (!building || !building.isPublished) throw new NotFoundError('Listing not found.');

    this.buildingRepo.incrementFields(id, { viewCount: 1 }).catch(() => {});

    const [floors, units] = await Promise.all([
      this.floorRepo.findByBuildingId(id),
      this.unitRepo.findByBuildingId(id),
    ]);

    const card = buildingCard(building, units);
    const floorsWithStats = floors
      .sort((a, b) => a.floorNumber - b.floorNumber)
      .map(f => {
        const floorUnits = units.filter(u => u.floorNumber === f.floorNumber.toString());
        return {
          _id: f._id!, buildingId: f.buildingId, floorNumber: f.floorNumber, name: f.name,
          totalUnits: f.totalUnits, status: f.status, description: f.description,
          createdAt: f.createdAt, updatedAt: f.updatedAt,
          availableUnitsCount: floorUnits.filter(u => u.status === 'available' && !u.isOccupied).length,
          occupiedUnitsCount: floorUnits.filter(u => u.isOccupied || u.status === 'occupied').length,
        };
      });

    return { ...card, floors: floorsWithStats };
  }

  async listUnitsForBuilding(buildingId: string): Promise<UnitResponseDTO[]> {
    const building = await this.buildingRepo.findById(buildingId);
    if (!building || !building.isPublished) throw new NotFoundError('Listing not found.');
    const units = await this.unitRepo.findByBuildingId(buildingId);
    return units as UnitResponseDTO[];
  }

  async getUnitDetail(id: string): Promise<PublicUnitDetailDTO> {
    const unit = await this.unitRepo.findById(id);
    if (!unit) throw new NotFoundError('Room not found.');

    const building = await this.buildingRepo.findById(unit.buildingId);
    if (!building || !building.isPublished) throw new NotFoundError('Room not found.');

    this.unitRepo.update(id, { viewCount: (unit.viewCount ?? 0) + 1 }).catch(() => {});

    return {
      ...(unit as UnitResponseDTO),
      building: { _id: building._id!, name: building.name, type: building.type, location: building.location, amenities: building.amenities, images: building.images },
    };
  }

  async getFilters(): Promise<PublicFiltersDTO> {
    const cities = await this.buildingRepo.distinctCities();
    return { cities, types: ['residential', 'commercial', 'mixed', 'industrial'] };
  }
}
