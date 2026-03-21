import mongoose, { Document, Schema } from 'mongoose';
import { ITenant } from '../../../domain/entities/Tenant';

export interface ITenantDocument extends Omit<ITenant, '_id'>, Document {}

const EmergencyContactSchema = new Schema(
  {
    name:         { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const TenantSchema = new Schema<ITenantDocument>(
  {
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone:       { type: String, required: true, trim: true },
    document:    { type: [Schema.Types.ObjectId], ref: 'Document', default: [] } as any,
    addressId:   { type: Schema.Types.ObjectId, ref: 'Address', default: null } as any,
    status: {
      type:    String,
      enum:    ['active', 'inactive', 'blacklisted', 'pending'],
      default: 'pending',
    },
    unitId:      { type: Schema.Types.ObjectId, ref: 'Unit',     default: null } as any,
    buildingId:  { type: Schema.Types.ObjectId, ref: 'Property', default: null, index: true } as any,
    userId:      { type: Schema.Types.ObjectId, ref: 'User',     default: null } as any,
    notes:       { type: String, default: null },
    job:         { type: String, default: null, trim: true },
    emergencyContact: { type: EmergencyContactSchema, default: null },
    rentType: {
      type:     String,
      enum:     ['monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'],
      required: true,
    },
    rentAmount:  { type: Number, required: true, min: 0 },
    dueDate:     { type: Number, required: true, min: 1, max: 31 },
    paidAt:      { type: Date, default: null },
    vacateDate:  { type: Date, default: null },
    moveInDate:  { type: Date, default: null },
    renewedFromTenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null } as any,
    terms:       { type: String, default: null },
  },
  { timestamps: true }
);

export const TenantModel = mongoose.model<ITenantDocument>('Tenant', TenantSchema);
