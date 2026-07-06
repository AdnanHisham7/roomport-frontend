export type AgreementStatus =
  | 'draft'       
  | 'sent'        
  | 'viewed'      
  | 'otp_sent'    
  | 'verified'    
  | 'completed'   
  | 'expired'     
  | 'cancelled';  

export interface IAgreementAudit {
  sentAt?:       Date;
  viewedAt?:     Date;
  signedAt?:     Date;   
  verifiedAt?:   Date;   
  completedAt?:  Date;   
  signerIp?:     string;
  signerUserAgent?: string;
}

export interface IAgreement {
  _id?:                string;
  // ── parties ──────────────────────────────────────────────────────────────
  tenantId:            string;
  buildingId:          string;   // ref to Building
  unitId?:             string;
  createdBy:           string;   // admin userId
  // ── content ──────────────────────────────────────────────────────────────
  title:               string;
  body:                string;   // rich text / HTML body of the agreement
  terms?:              string;   // summary of key terms
  monthlyRent:         number;
  startDate:           Date;
  endDate:             Date;
  // ── workflow state ────────────────────────────────────────────────────────
  status:              AgreementStatus;
  // ── signing token (hashed in DB) ──────────────────────────────────────────
  signingTokenHash?:   string;
  tokenExpiresAt?:     Date;
  // ── OTP (hashed in DB) ───────────────────────────────────────────────────
  otpHash?:            string;
  otpExpiresAt?:       Date;
  // ── signature capture ─────────────────────────────────────────────────────
  typedSignatureName?: string;   // tenant's full legal name typed at signing
  // ── audit trail ──────────────────────────────────────────────────────────
  audit:               IAgreementAudit;
  // ── outcome ──────────────────────────────────────────────────────────────
  finalPdfUrl?:        string;   // URL after PDF is generated
  documentId?:         string;   // ref to Document collection
  // ── timestamps ────────────────────────────────────────────────────────────
  createdAt?:          Date;
  updatedAt?:          Date;
}
