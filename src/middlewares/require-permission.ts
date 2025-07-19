import { AuthError } from "@/errors/auth-error.js";
import { Permission, hasPermission } from "@/lib/permissions.js";
import type { AuthPayload } from "@/lib/token-utils.js";
import type { Context, Next } from "hono";
import { FORBIDDEN } from "stoker/http-status-codes";

export function requirePermission(...requiredPermissions: Permission[]) {
  return async (c: Context, next: Next) => {
    const { role, permissions } = c.get("user") as AuthPayload;

    if (!hasPermission({ role, permissions }, requiredPermissions)) {
      throw new AuthError(
        "Insufficient permission to access this resource",
        FORBIDDEN
      );
    }

    return next();
  };
}
