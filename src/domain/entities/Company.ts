
export interface ICompanyAddress {
  city:        string;
  country:     string;
  line1:       string;
  line2?:      string;
  postalCode:  string;
  state:       string;
}

export interface ICompanyContact {
  email:    string;  
  phone:    string;
  website?: string;
}

export interface ICompanyLegal {
  CIN?:      string;  
  GSTIN?:    string;  
  legalName: string;  
}

export interface ICompanyBranding {
  brandColor?: string;
  logoUrl?:    string;
}

export type IndustryType =
  | 'Residential'
  | 'Commercial'
  | 'Infrastructure'
  | 'Industrial'
  | 'Mixed';

export interface ICompany {
  _id?:         string;
  name:         string;
  address:      ICompanyAddress;
  contact:      ICompanyContact;
  companySize?: string;  
  legal:        ICompanyLegal;
  branding?:    ICompanyBranding;
  industryType: IndustryType;
  isActive:     boolean;  
  createdAt?:   Date;
  updatedAt?:   Date;
}