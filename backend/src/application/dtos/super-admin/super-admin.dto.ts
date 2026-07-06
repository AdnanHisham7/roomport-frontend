export interface PlatformStatsDTO {
  totalBuilders:        number;
  totalManagers:        number;
  totalBuildings:       number;
  publishedBuildings:   number;
  totalRooms:           number;
  occupiedRooms:        number;
  vacantRooms:          number;
  occupancyRate:        number;
  totalRevenue:         number;
  activeSubscriptions:  number;
  pendingSubscriptions: number;
  newBuildersLast30Days: number;
  totalInquiries:       number;
  newInquiriesLast30Days: number;
}

export interface BuilderListItemDTO {
  _id:            string;
  email:          string;
  first_name:     string;
  last_name:      string;
  phone_number?:  string;
  status:         string;
  role:           string;
  paymentStatus:  boolean;
  email_verified: boolean;
  buildingsCount: number;
  unitsCount:     number;
  createdAt?:     Date;
  lastLoginAt?:   Date;
}

export interface BuilderDetailDTO extends BuilderListItemDTO {
  managers: { _id: string; first_name: string; last_name: string; email: string; status: string }[];
  buildings: { _id: string; name: string; totalUnits: number; totalFloors: number; status: string; isPublished: boolean; }[];
  subscription: { _id: string; amount: number; numberOfBuildings: number; numberOfUnits: number; status: string; dueDate: Date; } | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
