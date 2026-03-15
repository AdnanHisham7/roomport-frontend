// ─── Register ─────────────────────────────────────────────────────────────────
export interface RegisterRequestDTO {
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  phone?:    string;
}

export interface RegisterResponseDTO {
  message: string;
  user: {
    _id:       string;
    email:     string;
    firstName: string;
    lastName:  string;
  };
}
