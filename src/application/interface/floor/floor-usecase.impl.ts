import { CreateFloorDTO, FloorResponseDTO, UpdateFloorDTO } from "../../dtos/floor/floor.dto";


export interface IFloorUseCases {
  create(data: CreateFloorDTO): Promise<FloorResponseDTO>;
  getByBuilding(buildingId: string): Promise<FloorResponseDTO[]>;
  getById(id: string): Promise<FloorResponseDTO>;
  update(id: string, data: UpdateFloorDTO): Promise<FloorResponseDTO>;
  delete(id: string): Promise<void>;
}
