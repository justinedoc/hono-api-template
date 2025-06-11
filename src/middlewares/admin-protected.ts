import { AuthError } from "@/errors/auth-error.js";
import type { AppBindings } from "@/types/hono-types.js";
import type { Context, Next } from "hono";

export const adminProtected = async (
  c: Context<{ Variables: AppBindings["Variables"] }>,
  next: Next
) => {
  const user = c.get("user");

  if (user.role !== "ADMIN") throw new AuthError("UNAUTHORIZED")

  await next();
};
