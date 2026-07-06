import mongoose, { Document, Schema } from 'mongoose';

export interface IDemoRequest {
  _id?:              string;
  firstName:         string;
  lastName:          string;
  email:             string;
  phone?:            string;
  companyName?:      string;
  numberOfBuildings: number;
  numberOfUnits:     number;
  message?:          string;
  status:            'new' | 'contacted' | 'converted' | 'closed';
  adminNotes?:       string;
  createdAt?:        Date;
  updatedAt?:        Date;
}

export interface IDemoRequestDocument extends Omit<IDemoRequest, '_id'>, Document {}

const DemoRequestSchema = new Schema<IDemoRequestDocument>(
  {
    firstName:         { type: String, required: true, trim: true },
    lastName:          { type: String, required: true, trim: true },
    email:             { type: String, required: true, lowercase: true, trim: true, index: true },
    phone:             { type: String, default: null, trim: true },
    companyName:       { type: String, default: null, trim: true },
    numberOfBuildings: { type: Number, required: true, min: 1 },
    numberOfUnits:     { type: Number, required: true, min: 1 },
    message:           { type: String, default: null },
    status:            { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new', index: true },
    adminNotes:        { type: String, default: null },
  },
  { timestamps: true }
);

export const DemoRequestModel = mongoose.model<IDemoRequestDocument>('DemoRequest', DemoRequestSchema);
