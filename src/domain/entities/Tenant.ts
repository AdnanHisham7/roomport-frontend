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
  document?:         string[];       // array of Document ObjectIds
  addressId?:        string;         // ObjectId ref to Address
  status:            TenantStatus;
  unitId?:           string;         // current unit ObjectId
  buildingId?:       string;         // current building ObjectId
  userId?:           string;         // linked user account (optional)
  notes?:            string;
  job?:              string;
  emergencyContact?: IEmergencyContact;
  rentType:          RentType;
  rentAmount:        number;
  dueDate:           number;         // day of month e.g. 5
  paidAt?:           Date;
  vacateDate?:       Date;
  moveInDate?:       Date;
  renewedFromTenantId?: string;
  terms?:            string;
  createdAt?:        Date;
  updatedAt?:        Date;
}
