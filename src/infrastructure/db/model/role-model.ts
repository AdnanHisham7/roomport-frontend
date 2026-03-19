import mongoose, { Document, Schema } from 'mongoose';
import type { IRole } from '../../../domain/entities/Role';

export interface IRoleDocument extends Omit<IRole, '_id'>, Document {}

const RoleSchema = new Schema<IRoleDocument>(
  {
    name: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    description: {
      type:     String,
      required: true,
      trim:     true,
    },
    isSystemRole: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);

export const RoleModel = mongoose.model<IRoleDocument>('Role', RoleSchema);