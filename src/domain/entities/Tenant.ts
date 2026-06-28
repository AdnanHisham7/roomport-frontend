export type TenantStatus = 'active' | 'inactive' | 'blacklisted' | 'pending';
export type RentType     = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'custom';

export interface IEmergencyContact {
  name:         string;
  phone:        string;
  relationship: string;
}

export interface ITenant {
  _id?:              string;
  firstName:         string;
  lastName:          string;
  email:             string;
  phone:             string;
  document?:         string[];
  addressId?:        string;
  status:            TenantStatus;
  unitId?:           string;
  buildingId?:       string;
  userId?:           string;
  createdBy?:        string;
  notes?:            string;
  job?:              string;
  emergencyContact?: IEmergencyContact;
  rentType:          RentType;
  rentAmount:        number;
  dueDate:           number;
  paidAt?:           Date;
  vacateDate?:       Date;
  moveInDate?:       Date;
  renewedFromTenantId?: string;
  terms?:            string;
  createdAt?:        Date;
  updatedAt?:        Date;
}
