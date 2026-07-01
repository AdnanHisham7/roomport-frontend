import { z } from 'zod';

const buildingTypes   = ['residential', 'commercial', 'mixed', 'industrial'] as const;
const buildingStatuses = ['active', 'inactive', 'under_maintenance', 'archived'] as const;

const locationSchema = z.object({
  address: z.string().trim().min(1, 'location.address is required.'),
  city:    z.string().trim().min(1, 'location.city is required.'),
  state:   z.string().trim().min(1, 'location.state is required.'),
  pincode: z.string().trim().min(1, 'location.pincode is required.'),
  country: z.string().trim().optional(),
  street:  z.string().trim().optional(),
});

export const createBuildingSchema = z.object({
  name:        z.string().trim().min(1, 'name is required.'),
  type:        z.enum(buildingTypes, { message: `type must be one of: ${buildingTypes.join(', ')}.` }),
  totalUnits:  z.coerce.number().int().min(1, 'totalUnits must be at least 1.'),
  floors: z.any().superRefine((v, ctx) => {
    if (!v || (typeof v === 'object' && Object.keys(v).length === 0) || (Array.isArray(v) && v.length === 0)) {
      ctx.addIssue({ code: 'custom', message: 'At least one floor must be provided.' });
    }
  }),
  location:    locationSchema,
  description: z.string().trim().optional(),
  amenities:   z.array(z.string()).optional(),
  images:      z.array(z.string()).optional(),
  ownerId:     z.string().trim().optional(),
  managerId:   z.string().trim().optional(),
});

export const updateBuildingSchema = z.object({
  name:        z.string().trim().min(1).optional(),
  type:        z.enum(buildingTypes).optional(),
  status:      z.enum(buildingStatuses).optional(),
  description: z.string().trim().optional(),
  amenities:   z.array(z.string()).optional(),
  location:    locationSchema.partial().optional(),
}).strict();
