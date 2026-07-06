import mongoose, { Document, Schema } from 'mongoose';
import { IBuilding } from '../../../domain/entities/Building';

export interface IBuildingDocument extends Omit<IBuilding, '_id'>, Document {}

const LocationSchema = new Schema(
  {
    address:   { type: String, required: true, trim: true },
    city:      { type: String, required: true, trim: true },
    state:     { type: String, required: true, trim: true },
    pincode:   { type: String, required: true, trim: true },
    landmark:  { type: String, default: null, trim: true },
    country:   { type: String, required: true, trim: true, default: 'India' },
    latitude:  { type: Number, default: null },
    longitude: { type: Number, default: null },
    street:    { type: String, default: null, trim: true },
  },
  { _id: false }
);

const BuildingSchema = new Schema<IBuildingDocument>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, default: null, trim: true, index: true, sparse: true },
    type:        { type: String, required: true, enum: ['residential', 'commercial', 'mixed', 'industrial'] },
    status:      { type: String, enum: ['active','inactive','under_maintenance','archived'], default: 'active', index: true },
    location:    { type: LocationSchema, required: true },
    ownerId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    managerId:   { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true } as any,
    totalUnits:  { type: Number, required: true, min: 0 },
    totalFloors: { type: Number, required: true, min: 0 },
    sqft:        { type: Number, default: null },
    lift:        { type: Boolean, default: false },
    helipad:     { type: Boolean, default: false },
    nearAirport:         { type: String, default: null, trim: true },
    nearRailwayStation:  { type: String, default: null, trim: true },
    nearBusStand:        { type: String, default: null, trim: true },
    nearPark:            { type: String, default: null, trim: true },
    amenities:   { type: [String], default: [] },
    images:      { type: [String], default: [] },
    documents:   { type: [Schema.Types.ObjectId], ref: 'Document', default: [] } as any,
    description: { type: String, default: null, trim: true },
    yearOfBuild: { type: String, default: null, trim: true },
    isPublished: { type: Boolean, default: true, index: true },
    isFeatured:  { type: Boolean, default: false, index: true },
    viewCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BuildingModel = mongoose.model<IBuildingDocument>('Building', BuildingSchema);
