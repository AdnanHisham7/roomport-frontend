// Roles stored as plain strings in the User document — no separate Role collection

export enum SystemRole {
  SUPER_ADMIN = 'super_admin',  // platform owner — bootstrap only
  ADMIN       = 'admin',        // building owner — registers publicly
  MANAGER     = 'manager',      // property manager — created by admin
}

// Alias used in router authorize() calls
export { SystemRole as UserRole };

// super_admin is the only bootstrap-protected role
export const PROTECTED_ROLES = [SystemRole.SUPER_ADMIN] as const;
