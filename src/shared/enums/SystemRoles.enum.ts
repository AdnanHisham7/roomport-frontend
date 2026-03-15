export enum SystemRole {
  SUPER_ADMIN = 'superAdmin',
  ADMIN       = 'admin',
}

// These two can NEVER be created on the fly — bootstrap only
export const PROTECTED_ROLES = [
  SystemRole.SUPER_ADMIN,
  SystemRole.ADMIN,
] as const;

export const SYSTEM_ROLES_SEED = [
  {
    name:         SystemRole.SUPER_ADMIN,
    description:  'Full platform access. Cannot be deleted or modified.',
    isSystemRole: true,
  },
  {
    name:         SystemRole.ADMIN,
    description:  'Building owner / company admin. Manages properties and staff.',
    isSystemRole: true,
  },
] as const;
