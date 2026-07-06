import mongoose, { Document, Schema } from 'mongoose';
import { IAgreement } from '../../../domain/entities/Agreement';

export interface IAgreementDocument extends Omit<IAgreement, '_id'>, Document {}

const AuditSchema = new Schema(
  {
    sentAt:          { type: Date, default: null },
    viewedAt:        { type: Date, default: null },
    signedAt:        { type: Date, default: null },
    verifiedAt:      { type: Date, default: null },
    completedAt:     { type: Date, default: null },
    signerIp:        { type: String, default: null },
    signerUserAgent: { type: String, default: null },
  },
  { _id: false }
);

const AgreementSchema = new Schema<IAgreementDocument>(
  {
    // ── parties ──────────────────────────────────────────────────────────────
    tenantId:   { type: Schema.Types.ObjectId, ref: 'Tenant',   required: true, index: true } as any,
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true } as any,
    unitId:     { type: Schema.Types.ObjectId, ref: 'Unit',     default: null  } as any,
    createdBy:  { type: Schema.Types.ObjectId, ref: 'User',     required: true } as any,

    // ── content ──────────────────────────────────────────────────────────────
    title:       { type: String, required: true, trim: true },
    body:        { type: String, required: true },
    terms:       { type: String, default: null },
    monthlyRent: { type: Number, required: true, min: 0 },
    startDate:   { type: Date,   required: true },
    endDate:     { type: Date,   required: true },

    // ── workflow ──────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['draft','sent','viewed','otp_sent','verified','completed','expired','cancelled'],
      default: 'draft',
      index:   true,
    },

    // ── signing token (SHA-256 hash stored — raw sent to tenant) ─────────────
    signingTokenHash: { type: String, default: null, select: false }, 
    tokenExpiresAt:   { type: Date,   default: null },

    // ── OTP (bcrypt hash stored — plain sent via email) ───────────────────────
    otpHash:      { type: String, default: null, select: false },
    otpExpiresAt: { type: Date,   default: null },

    // ── signature ─────────────────────────────────────────────────────────────
    typedSignatureName: { type: String, default: null, trim: true },

    // ── audit ─────────────────────────────────────────────────────────────────
    audit: { type: AuditSchema, default: () => ({}) },

    // ── outcome ───────────────────────────────────────────────────────────────
    finalPdfUrl: { type: String, default: null },
    documentId:  { type: Schema.Types.ObjectId, ref: 'Document', default: null } as any,
  },
  { timestamps: true }
);

// Index for fast token lookup
AgreementSchema.index({ signingTokenHash: 1 }, { sparse: true });

export const AgreementModel = mongoose.model<IAgreementDocument>('Agreement', AgreementSchema);
