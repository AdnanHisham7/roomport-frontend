import mongoose, { Document, Schema } from 'mongoose';
import { IPlatformSetting } from '../../../domain/entities/PlatformSetting';

export interface IPlatformSettingDocument extends Omit<IPlatformSetting, '_id'>, Document {}

const PlatformSettingSchema = new Schema<IPlatformSettingDocument>(
  {
    platformName:         { type: String, default: 'Brift' },
    supportEmail:         { type: String, default: null },
    pricePerBuilding:     { type: Number, default: 10 },
    pricePerUnit:         { type: Number, default: 5 },
    currency:             { type: String, default: 'usd' },
    maintenanceMode:      { type: Boolean, default: false },
    maxFeaturedBuildings: { type: Number, default: 8 },
    updatedBy:            { type: Schema.Types.ObjectId, ref: 'User', default: null } as any,
  },
  { timestamps: true }
);

export const PlatformSettingModel = mongoose.model<IPlatformSettingDocument>(
  'PlatformSetting',
  PlatformSettingSchema
);
