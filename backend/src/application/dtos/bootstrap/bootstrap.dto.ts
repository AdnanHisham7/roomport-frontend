import { UserRole } from "../../../domain/entities/User";

export interface BootstrapRequestDTO {
  email:         string;
  password:      string;
  first_name:    string;
  last_name:     string;
  phone_number?: string;
}

export interface BootstrapResponseDTO {
  message:    string;
  superAdmin: {
    _id:        string;
    email:      string;
    first_name: string;
    last_name:  string;
    role:       UserRole;
  };
}
