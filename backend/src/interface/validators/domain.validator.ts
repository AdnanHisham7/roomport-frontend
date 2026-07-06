import { z } from 'zod';

// ── Expense ───────────────────────────────────────────────────────────────────

const expenseCategories = ['repair','utility','salary','tax','renovation','cleaning','insurance','security','commission','legal','marketing','other'] as const;
const expenseStatuses   = ['pending','paid','cancelled'] as const;
const expenseMethods    = ['cash','bank_transfer','upi','cheque','card'] as const;
const expensePeriods    = ['daily','weekly','monthly','yearly'] as const;

export const createExpenseSchema = z.object({
  buildingId: z.string().trim().min(1, 'buildingId is required.'),
  unitId:     z.string().trim().optional(),
  category:   z.enum(expenseCategories, { message: `category must be one of: ${expenseCategories.join(', ')}.` }),
  title:      z.string().trim().min(1, 'title is required.'),
  amount:     z.coerce.number().positive('amount must be a positive number.'),
  date:       z.string().min(1, 'date is required.'),
  method:     z.enum(expenseMethods, { message: `method must be one of: ${expenseMethods.join(', ')}.` }),
  notes:      z.string().trim().optional(),
  status:     z.enum(expenseStatuses).optional(),
});

export const expenseSummaryQuerySchema = z.object({
  period: z.enum(expensePeriods).default('monthly'),
  year:   z.coerce.number().int().optional(),
  month:  z.coerce.number().int().min(1).max(12).optional(),
  week:   z.coerce.number().int().min(1).max(53).optional(),
});

export const expenseDateRangeQuerySchema = z.object({
  from:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD.'),
  to:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD.'),
  category: z.enum(expenseCategories).optional(),
});

// ── Floor ─────────────────────────────────────────────────────────────────────

export const createFloorSchema = z.object({
  floorNumber: z.coerce.number({ message: 'floorNumber is required and must be a number.' }),
  name:        z.string().trim().min(1, 'name is required.'),
  totalUnits:  z.coerce.number().int().min(0, 'totalUnits must be >= 0.'),
  description: z.string().trim().optional(),
});

export const updateFloorSchema = createFloorSchema.partial();

// ── Document ──────────────────────────────────────────────────────────────────

const documentTypes = ['rental_agreement','building_license','insurance','lease_document','tenant_id','maintenance_invoice','police_verification','noc','tax_document','other'] as const;

export const createDocumentSchema = z.object({
  type:       z.enum(documentTypes, { message: `type must be one of: ${documentTypes.join(', ')}.` }),
  title:      z.string().trim().min(1, 'title is required.'),
  fileUrl:    z.string().trim().url('fileUrl must be a valid URL.'),
  uploadedBy: z.string().trim().min(1, 'uploadedBy is required.'),
  buildingId: z.string().trim().optional(),
  tenantId:   z.string().trim().optional(),
  unitId:     z.string().trim().optional(),
  leaseId:    z.string().trim().optional(),
  notes:      z.string().trim().optional(),
});

// ── Subscription ──────────────────────────────────────────────────────────────

const billingCycles = ['monthly', 'yearly'] as const;

export const bookDemoSchema = z.object({
  firstName:         z.string().trim().min(1, 'firstName is required.'),
  lastName:          z.string().trim().min(1, 'lastName is required.'),
  email:             z.string().trim().toLowerCase().email('A valid email is required.'),
  phone:             z.string().trim().optional(),
  companyName:       z.string().trim().optional(),
  numberOfBuildings: z.coerce.number().int().min(1, 'numberOfBuildings must be at least 1.'),
  numberOfUnits:     z.coerce.number().int().min(1, 'numberOfUnits must be at least 1.'),
  message:           z.string().trim().optional(),
});

export const createBuilderSubscriptionSchema = z.object({
  userId:            z.string().trim().min(1, 'userId is required.'),
  billingCycle:      z.enum(billingCycles, { message: 'billingCycle must be monthly or yearly.' }),
  numberOfBuildings: z.coerce.number().int().min(1),
  numberOfUnits:     z.coerce.number().int().min(1),
  amount:            z.coerce.number().nonnegative(),
  notes:             z.string().trim().optional(),
});

export const requestUpgradeSchema = z.object({
  additionalBuildings:   z.coerce.number().int().min(0).optional(),
  additionalUnits:       z.coerce.number().int().min(0).optional(),
  additionalBuildingData: z.array(z.object({ name: z.string(), rooms: z.number() })).optional(),
  message:               z.string().trim().optional(),
});

// ── Super-admin upgrade resolution ────────────────────────────────────────────

export const resolveUpgradeRequestSchema = z.discriminatedUnion('status', [
  z.object({
    status:            z.literal('rejected'),
    adminNotes:        z.string().trim().optional(),
    newTotalBuildings: z.number().optional(),
    newTotalUnits:     z.number().optional(),
  }),
  z.object({
    status:            z.literal('approved'),
    adminNotes:        z.string().trim().optional(),
    newTotalBuildings: z.coerce.number().int().min(1, 'newTotalBuildings must be at least 1.'),
    newTotalUnits:     z.coerce.number().int().min(1, 'newTotalUnits must be at least 1.'),
  }),
]);

// ── Agreement ─────────────────────────────────────────────────────────────────

export const createAgreementSchema = z.object({
  tenantId:    z.string().trim().min(1, 'tenantId is required.'),
  buildingId:  z.string().trim().min(1, 'buildingId is required.'),
  unitId:      z.string().trim().optional(),
  title:       z.string().trim().min(1, 'title is required.'),
  body:        z.string().trim().min(1, 'body is required.'),
  terms:       z.string().trim().optional(),
  monthlyRent: z.coerce.number({ message: 'monthlyRent must be a number.' }),
  startDate:   z.string().min(1, 'startDate is required.'),
  endDate:     z.string().min(1, 'endDate is required.'),
});
