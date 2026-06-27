import { IEmergencyContact, RentType, TenantStatus } from '../../../domain/entities/Tenant';

export interface CreateTenantDTO {
  firstName:            string;
  lastName:             string;
  email:                string;
  phone:                string;
  unitId?:              string;
  buildingId?:          string;
  job?:                 string;
  notes?:               string;
  emergencyContact?:    IEmergencyContact;
  rentType:             RentType;
  rentAmount:           number;
  dueDate:              number;
  moveInDate?:          Date;
  terms?:               string;
  // Pre-validation of agreement dates before tenant is persisted
  agreementStartDate?:  string;
  agreementEndDate?:    string;
}

export interface UpdateTenantDTO {
  firstName?:        string;
  lastName?:         string;
  email?:            string;
  phone?:            string;
  status?:           TenantStatus;
  unitId?:           string;
  buildingId?:       string;
  job?:              string;
  notes?:            string;
  emergencyContact?: IEmergencyContact;
  rentType?:         RentType;
  rentAmount?:       number;
  dueDate?:          number;
  vacateDate?:       Date;
  paidAt?:           Date;
  terms?:            string;
}

export interface TenantResponseDTO {
  _id:               string;
  firstName:         string;
  lastName:          string;
  fullName:          string;
  email:             string;
  phone:             string;
  status:            TenantStatus;
  unitId?:           string;
  buildingId?:       string;
  job?:              string;
  notes?:            string;
  emergencyContact?: IEmergencyContact;
  rentType:          RentType;
  rentAmount:        number;
  dueDate:           number;
  moveInDate?:       Date;
  vacateDate?:       Date;
  paidAt?:           Date;
  terms?:            string;
  createdAt?:        Date;
  updatedAt?:        Date;
}
