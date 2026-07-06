import { RegisterRequestDTO, RegisterResponseDTO } from "../../dtos/user-usecaase/register.dto";

export interface IRegisterUseCase {
  register(data: RegisterRequestDTO): Promise<RegisterResponseDTO>;
}
