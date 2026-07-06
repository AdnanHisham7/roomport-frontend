import { BuildingResponseDTO } from "../building/building.dto";
import { FloorResponseDTO } from "../floor/floor.dto";
import { UnitResponseDTO } from "../unit/unit.dto";

export interface PublicBuildingCardDTO extends BuildingResponseDTO {
  availableUnitsCount: number;
  occupiedUnitsCount:  number;
  minRent:             number | null;
  maxRent:             number | null;
}

export interface PublicBuildingDetailDTO extends PublicBuildingCardDTO {
  floors: (FloorResponseDTO & { availableUnitsCount: number; occupiedUnitsCount: number })[];
}

export interface PublicUnitDetailDTO extends UnitResponseDTO {
  building: { _id: string; name: string; slug?:string; type: string; location: BuildingResponseDTO['location']; amenities?: string[]; images?: string[] };
}

export interface PublicFiltersDTO {
  cities: string[];
  types: string[];
}
