import { PaginatedResult } from "../../dtos/super-admin/super-admin.dto";
import { PublicBuildingCardDTO, PublicBuildingDetailDTO, PublicFiltersDTO, PublicUnitDetailDTO } from "../../dtos/public/public.dto";
import { UnitResponseDTO } from "../../dtos/unit/unit.dto";

export interface PublicBuildingListFilter {
  city?:       string;
  state?:      string;
  type?:       string;
  search?:     string;
  minRent?:    number;
  maxRent?:    number;
  bedrooms?:   number;
  sort?:       'newest' | 'rent_low' | 'rent_high';
}

export interface IPublicUseCases {
  listBuildings(filter: PublicBuildingListFilter, page: number, limit: number): Promise<PaginatedResult<PublicBuildingCardDTO>>;
  getFeaturedBuildings(limit: number): Promise<PublicBuildingCardDTO[]>;
  getBuildingDetail(id: string): Promise<PublicBuildingDetailDTO>;
  listUnitsForBuilding(buildingId: string): Promise<UnitResponseDTO[]>;
  getUnitDetail(id: string): Promise<PublicUnitDetailDTO>;
  getFilters(): Promise<PublicFiltersDTO>;
}
