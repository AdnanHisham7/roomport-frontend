import mongoose, { Document, Schema } from 'mongoose';
import { IFloor } from '../../../domain/entities/Floor';

export interface IFloorDocument extends Omit<IFloor, '_id'>, Document {}

const FloorSchema = new Schema<IFloorDocument>(
  {
    buildingId: {
      type:     Schema.Types.ObjectId,
      ref:      'Building',
      required: true,
      index:    true,
    } as any,
    floorNumber: {
      type:     Number,
      required: true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    totalUnits: {
      type:     Number,
      required: true,
      min:      0,
    },
    status: {
      type:    String,
      enum:    ['active', 'inactive', 'under_maintenance'],
      default: 'active',
    },
    description: {
      type:    String,
      default: null,
      trim:    true,
    },
  },
  { timestamps: true }
);

// A building cannot have duplicate floor numbers
FloorSchema.index({ buildingId: 1, floorNumber: 1 }, { unique: true });

export const FloorModel = mongoose.model<IFloorDocument>('Floor', FloorSchema);
