export type DocumentType =
  | 'rental_agreement'
  | 'building_license'
  | 'insurance'
  | 'lease_document'
  | 'tenant_id'
  | 'maintenance_invoice'
  | 'police_verification'
  | 'noc'
  | 'tax_document'
  | 'other';

export interface IDocument {
  _id?:              string;
  unitId?:           string;         
  buildingId?:       string;        
  tenantId?:         string;         
  leaseId?:          string;        
  type:              DocumentType;
  title:             string;
  description?:      string;
  fileSize?:         number;         
  fileUrl:           string;         
  expiryDate?:       Date;
  uploadedBy:        string;        
  documentVersions?: string[];       
  createdAt?:        Date;
  updatedAt?:        Date;
}
