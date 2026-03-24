import { BuildingStatus, BuildingType } from "../../../domain/entities/Building";
import { BuildingOccupancyStatsDTO, BuildingResponseDTO, CreateBuildingDTO, UpdateBuildingDTO } from "../../dtos/building/building.dto";


export interface IBuildingUseCases {
  create(data: CreateBuildingDTO): Promise<BuildingResponseDTO>;
  getAll(filter?: { ownerId?: string; managerId?: string; status?: BuildingStatus; type?: BuildingType }): Promise<BuildingResponseDTO[]>;
  getById(id: string): Promise<BuildingResponseDTO>;
  update(id: string, data: UpdateBuildingDTO): Promise<BuildingResponseDTO>;
  delete(id: string): Promise<void>;
  getOccupancyStats(ownerId?: string): Promise<BuildingOccupancyStatsDTO>;
}
