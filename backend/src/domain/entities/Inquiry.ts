export type InquiryStatus = 'new' | 'contacted' | 'closed' | 'spam';

export interface IInquiry {
  _id?:        string;
  buildingId:  string;
  unitId?:     string;
  ownerId:     string;   // builder (admin) who owns the building — used for scoping
  name:        string;
  email:       string;
  phone?:      string;
  message?:    string;
  status:      InquiryStatus;
  createdAt?:  Date;
  updatedAt?:  Date;
}
