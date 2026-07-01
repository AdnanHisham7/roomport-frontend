import { z } from 'zod';

const rentTypes   = ['monthly', 'quarterly', 'half_yearly', 'yearly', 'custom'] as const;
const mongoId     = z.string().trim().min(1);
const optionalId  = mongoId.optional();

const emergencyContact = z.object({
  name:         z.string().trim().min(1),
  phone:        z.string().trim().min(1),
  relationship: z.string().trim().min(1),
}).optional();

export const createTenantSchema = z.object({
  firstName:   z.string().trim().min(1, 'firstName is required.'),
  lastName:    z.string().trim().min(1, 'lastName is required.'),
  email:       z.string().trim().toLowerCase().email('A valid email is required.'),
  phone:       z.string().trim().min(1, 'phone is required.'),
  rentType:    z.enum(rentTypes, { message: `rentType must be one of: ${rentTypes.join(', ')}.` }),
  rentAmount:  z.coerce.number({ message: 'rentAmount must be a number.' }),
  dueDate:     z.coerce.number().int().min(1).max(31, 'dueDate must be between 1 and 31.'),
  unitId:      optionalId,
  buildingId:  optionalId,
  job:         z.string().trim().optional(),
  notes:       z.string().trim().optional(),
  terms:       z.string().trim().optional(),
  moveInDate:  z.coerce.date().optional(),
  emergencyContact,
  agreementStartDate: z.string().optional(),
  agreementEndDate:   z.string().optional(),
}).refine(data => {
  if (data.agreementStartDate && !data.agreementEndDate) return false;
  if (!data.agreementStartDate && data.agreementEndDate) return false;
  return true;
}, 'agreementStartDate and agreementEndDate must both be provided together.')
  .refine(data => {
    if (!data.agreementStartDate || !data.agreementEndDate) return true;
    return new Date(data.agreementEndDate) > new Date(data.agreementStartDate);
  }, 'agreementEndDate must be after agreementStartDate.');

export const transferTenantSchema = z.object({
  targetUnitId: z.string().trim().min(1, 'targetUnitId is required.'),
});
