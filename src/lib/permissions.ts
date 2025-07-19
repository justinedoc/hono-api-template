import { AuthError } from "@/errors/auth-error.js";
import type { Roles } from "@/lib/role-utils.js";
import type { AuthPayload } from "@/lib/token-utils.js";
import { FORBIDDEN } from "stoker/http-status-codes";

export enum Permission {
  READ = "read",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",

  SELF_READ = "self:read",
  SELF_UPDATE = "self:update",
  SELF_DELETE = "self:delete",

  USER_READ = "user:read",
  USER_UPDATE = "user:update",
  USER_DELETE = "user:delete",

  ADMIN_READ = "admin:read",
  ADMIN_DELETE = "admin:delete",
  ADMIN_MANAGE = "admin:manage",

  // Moderation
  BAN_USER = "user:ban",
  UNBAN_USER = "user:unban",

  LOGS_VIEW = "logs:view",

  FULL_ACCESS = "*",
}

export const RolePermissions = {
  guest: [Permission.READ],
  user: [
    Permission.READ,
    Permission.CREATE,
    Permission.UPDATE,
    Permission.DELETE,

    Permission.SELF_READ,
    Permission.SELF_UPDATE,
    Permission.SELF_DELETE,
  ],

  admin: [
    Permission.READ,
    Permission.CREATE,
    Permission.UPDATE,
    Permission.DELETE,

    Permission.ADMIN_READ,
    Permission.ADMIN_DELETE,
    Permission.ADMIN_MANAGE,

    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.BAN_USER,
    Permission.UNBAN_USER,

    Permission.LOGS_VIEW,
  ],
  superadmin: [Permission.FULL_ACCESS],
};

type RoleKey = keyof typeof RolePermissions;

export function hasPermission(
  user: { role: Roles; permissions?: string[] },
  required: Permission[]
): boolean {
  const roleKey = user.role.toLowerCase() as RoleKey;

  const rolePerms = RolePermissions[roleKey] || [];
  const customPerms = user.permissions || [];

  const combined = new Set([...rolePerms, ...customPerms]);
  return (
    combined.has(Permission.FULL_ACCESS) ||
    required.some((perm) => combined.has(perm))
  );
}

/**
 * Enforces that a user has the appropriate permission to access a resource,
 * distinguishing between self and other resource access.
 *
 * @param user - The authenticated user payload.
 * @param targetId - The ID of the resource being accessed.
 * @param selfPermission - Permission required for accessing own resource.
 * @param otherPermission - Permission required for accessing others' resources.
 * @param opts - Optional custom error messages and codes.
 * @throws AuthError if the user lacks the required permission.
 * @returns true if permission is granted.
 */
export function enforcePermission(
  user: AuthPayload,
  targetId: string,
  selfPermission: Permission,
  otherPermission: Permission,
  opts?: {
    selfErrorMessage?: string;
    selfErrorCode?: string;
    otherErrorMessage?: string;
    otherErrorCode?: string;
  }
): true {
  const isSelf = user.id === targetId;
  const permission = isSelf ? selfPermission : otherPermission;
  const errorMessage = isSelf
    ? (opts?.selfErrorMessage ??
      "You do not have permission to access your own resource.")
    : (opts?.otherErrorMessage ??
      "You do not have permission to access this resource.");
  const errorCode = isSelf
    ? (opts?.selfErrorCode ?? "NO_SELF_PERMISSION")
    : (opts?.otherErrorCode ?? "NO_OTHER_PERMISSION");

  if (!hasPermission(user, [permission])) {
    throw new AuthError(errorMessage, FORBIDDEN, errorCode);
  }

  return true;
}
