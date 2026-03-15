export interface BootstrapRequestDTO {
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  phone?:    string;
}

export interface BootstrapResponseDTO {
  message:    string;
  superAdmin: {
    _id:       string;
    email:     string;
    firstName: string;
    lastName:  string;
    role:      string;
  };
}
