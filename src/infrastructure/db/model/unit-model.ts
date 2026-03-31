import mongoose, { Schema, Document } from 'mongoose';
import { IUnit, UnitStatus } from '../../../domain/entities/Unit';

export interface IUnitDocument extends Omit<IUnit, '_id'>, Document {}

const UnitSchema: Schema = new Schema(
  {
    unitNumber: { type: String, required: true },
    floorNumber: { type: String, required: true },
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
    rentAmount: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    amenities: { type: [String], default: [] },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    status: {
      type: String,
      enum: ['available', 'occupied', 'under maintenance', 'reserved'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

export const UnitModel = mongoose.model<IUnitDocument>('Unit', UnitSchema);
