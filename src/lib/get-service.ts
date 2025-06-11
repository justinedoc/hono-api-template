import { AuthError } from "@/errors/auth-error.js";
import type { Roles } from "@/lib/role-utils.js";
import { selectService } from "@/lib/select-service.js";
import { decode } from "hono/jwt";

export function getServiceFromCookie(cookie: string) {
  const {
    payload: { role },
  } = decode(cookie);

  if (!role) throw new AuthError("Action Forbiden");

  const service = selectService(role as Roles);
  return { service };
}
