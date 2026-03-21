import mongoose, { Document as MongoDocument, Schema } from 'mongoose';
import { IDocument } from '../../../domain/entities/Document';

export interface IDocumentDocument extends Omit<IDocument, '_id'>, MongoDocument {}

const DocumentSchema = new Schema<IDocumentDocument>(
  {
    unitId:     { type: Schema.Types.ObjectId, ref: 'Unit',     default: null } as any,
    buildingId: { type: Schema.Types.ObjectId, ref: 'Property', default: null, index: true } as any,
    tenantId:   { type: Schema.Types.ObjectId, ref: 'Tenant',   default: null, index: true } as any,
    leaseId:    { type: Schema.Types.ObjectId, ref: 'Lease',    default: null } as any,
    type: {
      type:     String,
      required: true,
      enum: [
        'rental_agreement', 'building_license', 'insurance',
        'lease_document',   'tenant_id',        'maintenance_invoice',
        'police_verification', 'noc',            'tax_document', 'other',
      ],
    },
    title:             { type: String, required: true, trim: true },
    description:       { type: String, default: null },
    fileUrl:           { type: String, required: true },
    fileSize:          { type: Number, default: null },
    expiryDate:        { type: Date,   default: null },
    uploadedBy:        { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
    documentVersions:  { type: [String], default: [] },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocumentDocument>('Document', DocumentSchema);
