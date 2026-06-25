<<<<<<< Updated upstream
import mongoose, { Schema, Document } from 'mongoose';
import { IUnit, UnitStatus } from '../../../domain/entities/Unit';

export interface IUnitDocument extends Omit<IUnit, '_id'>, Document {}

const UnitSchema: Schema = new Schema(
  {
    unitNumber: { type: String, required: true },
    floorNumber: { type: String, required: true },
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
    title: { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
    images: { type: [String], default: [] },
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
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export const UnitModel = mongoose.model<IUnitDocument>('Unit', UnitSchema);
=======
import mongoose, { Schema, Document } from 'mongoose';
import { IUnit, UnitStatus } from '../../../domain/entities/Unit';

export interface IUnitDocument extends Omit<IUnit, '_id'>, Document {}

const UnitSchema: Schema = new Schema(
  {
    unitNumber:  { type: String, required: true },
    floorNumber: { type: String, required: true },
    buildingId:  { type: Schema.Types.ObjectId, ref: 'Building', required: true },
    title:       { type: String, default: null, trim: true },
    description: { type: String, default: null, trim: true },
    images:      { type: [String], default: [] },
    rentAmount:  { type: Number, required: true },
    isOccupied:  { type: Boolean, default: false },
    amenities:   { type: [String], default: [] },
    bedrooms:    { type: Number, required: true },
    bathrooms:   { type: Number, required: true },
    status: {
      type:    String,
      enum:    ['available', 'occupied', 'under maintenance', 'reserved'],
      default: 'available',
    },
    tokenAmount: { type: Number, default: null }, // reservation deposit amount
    viewCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UnitModel = mongoose.model<IUnitDocument>('Unit', UnitSchema);
>>>>>>> Stashed changes
