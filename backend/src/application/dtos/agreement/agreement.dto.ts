import { AgreementStatus, IAgreementAudit } from "../../../domain/entities/Agreement";

// ── Admin: create draft ───────────────────────────────────────────────────────
export interface CreateAgreementDTO {
  tenantId:    string;
  buildingId:  string;
  unitId?:     string;
  createdBy:   string;
  title:       string;
  body:        string;
  terms?:      string;
  monthlyRent: number;
  startDate:   Date | string;
  endDate:     Date | string;
}

// ── Admin: send signing link ──────────────────────────────────────────────────
export interface SendAgreementDTO {
  agreementId: string;
  expiresInHours?: number; // default: 72
}

// ── Tenant: view agreement by token ──────────────────────────────────────────
export interface ViewAgreementDTO {
  rawToken:    string;
  signerIp?:   string;
  signerUserAgent?: string;
}

// ── Tenant: initiate signing (type name → send OTP) ──────────────────────────
export interface InitiateSigningDTO {
  rawToken:          string;
  typedSignatureName: string;
  signerIp?:          string;
  signerUserAgent?:   string;
}

// ── Tenant: verify OTP → complete agreement ───────────────────────────────────
export interface VerifySigningOtpDTO {
  rawToken:  string;
  otp:       string;
  signerIp?: string;
  signerUserAgent?: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────
export interface AgreementResponseDTO {
  _id:                 string;
  tenantId:            string;
  buildingId:          string;
  unitId?:             string;
  createdBy:           string;
  title:               string;
  body:                string;
  terms?:              string;
  monthlyRent:         number;
  startDate:           Date;
  endDate:             Date;
  status:              AgreementStatus;
  typedSignatureName?: string;
  finalPdfUrl?:        string;
  documentId?:         string;
  audit:               IAgreementAudit;
  createdAt?:          Date;
  updatedAt?:          Date;
}

// ── Public view (tenant sees this — no internal token fields) ─────────────────
export interface PublicAgreementDTO {
  _id:         string;
  title:       string;
  body:        string;
  terms?:      string;
  monthlyRent: number;
  startDate:   Date;
  endDate:     Date;
  status:      AgreementStatus;
  tenantName?: string; // populated from Tenant collection
}
