/**
 * Post-auth navigation targets.
 *
 * - After a fresh login, officers must pick a portal mode at /role-select.
 * - When resuming an existing session (root `/` or visiting login while already
 *   authenticated), skip selection and go straight to the main app surface.
 */

export type PortalMode = "public" | "officer";

export function getAfterLoginPath(roles: string[]): string {
  if (roles.includes("super_admin")) return "/super-admin/dashboard";
  if (roles.includes("admin")) return "/agency-admin/inspections";
  if (roles.includes("officer")) return "/role-select";
  return "/home?entry=public";
}

/** Destination when the user already has a valid session. */
export function getResumeSessionPath(
  roles: string[],
  activePortalMode: PortalMode | null,
): string {
  if (roles.includes("super_admin")) return "/super-admin/dashboard";
  if (roles.includes("admin")) return "/agency-admin/inspections";
  if (roles.includes("officer")) {
    const mode = activePortalMode ?? "public";
    return `/home?entry=${mode}`;
  }
  return "/home?entry=public";
}

export function isAdminTier(roles: string[]): boolean {
  return roles.includes("super_admin") || roles.includes("admin");
}
