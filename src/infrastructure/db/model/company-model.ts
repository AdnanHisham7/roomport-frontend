import mongoose, { Document, Schema } from 'mongoose';
import { ICompany } from '../../../domain/entities/Company';

export interface ICompanyDocument extends Omit<ICompany, '_id'>, Document {}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },

    address: {
      city:       { type: String, required: true, trim: true },
      country:    { type: String, required: true, trim: true },
      line1:      { type: String, required: true, trim: true },
      line2:      { type: String, default: null,  trim: true },
      postalCode: { type: String, required: true, trim: true },
      state:      { type: String, required: true, trim: true },
    },

    contact: {
      email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
      phone:   { type: String, required: true, trim: true },
      website: { type: String, default: null,  trim: true },
    },

    companySize: {
      type:    String,
      default: null,
    },

    legal: {
      CIN:       { type: String, default: null, trim: true },
      GSTIN:     { type: String, default: null, trim: true },
      legalName: { type: String, required: true, trim: true },
    },

    branding: {
      brandColor: { type: String, default: null },
      logoUrl:    { type: String, default: null },
    },

    industryType: {
      type:     String,
      required: true,
      enum:     ['Residential', 'Commercial', 'Infrastructure', 'Industrial', 'Mixed'],
    },

    isActive: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CompanyModel = mongoose.model<ICompanyDocument>('Company', CompanySchema);