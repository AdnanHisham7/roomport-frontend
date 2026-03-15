import mongoose, { Document, Schema } from 'mongoose';
import type { IUser } from '../../../domain/entities/User.js';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    roleId:          { type: Schema.Types.ObjectId, ref: 'Role', default: null },
    password:        { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt:     { type: Date,   default: null },
    avatarUrl:       { type: String, default: null },
    companyId:       { type: Schema.Types.ObjectId, ref: 'Company', default: null },
    phone:           { type: String, default: null },
    firstName:       { type: String, required: true },
    lastName:        { type: String, required: true },
    email:           { type: String, required: true, unique: true, lowercase: true },
    otp:             { type: String, default: null },
    otpExpiresAt:    { type: Date,   default: null },
    refreshToken:    { type: String, default: null },
    isActive:        { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);