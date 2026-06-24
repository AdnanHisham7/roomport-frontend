import { InquiryStatus } from "../../../domain/entities/Inquiry";

export interface CreateInquiryDTO {
  buildingId: string;
  unitId?:    string;
  name:       string;
  email:      string;
  phone?:     string;
  message?:   string;
}

export interface InquiryResponseDTO {
  _id:         string;
  buildingId:  string;
  unitId?:     string;
  ownerId:     string;
  name:        string;
  email:       string;
  phone?:      string;
  message?:    string;
  status:      InquiryStatus;
  createdAt?:  Date;
  updatedAt?:  Date;
}
