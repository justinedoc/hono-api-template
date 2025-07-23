import { getAccessCookie } from "@/configs/cookie-config.js";
import { AuthError } from "@/errors/auth-error.js";
import logger from "@/lib/logger.js";
import { selectService } from "@/lib/select-service.js";
import { verifyAccessToken } from "@/lib/token-utils.js";
import type { Context, Next } from "hono";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import { FORBIDDEN, UNAUTHORIZED } from "stoker/http-status-codes";

export async function authMiddleware(c: Context, next: Next) {
  const accessToken = await getAccessCookie(c);

  if (!accessToken) {
    throw new AuthError("Missing access token", UNAUTHORIZED, "NO_TOKEN");
  }

  try {
    const decoded = await verifyAccessToken(accessToken);

    if (!decoded) {
      throw new AuthError(
        "Invalid access token",
        UNAUTHORIZED,
        "INVALID_TOKEN"
      );
    }

    const service = selectService(decoded.role);
    const exists = await service.existsById(decoded.id);

    if (!exists) {
      throw new AuthError(
        "Access denied: user not found",
        FORBIDDEN,
        "USER_NOT_FOUND"
      );
    }

    c.set("user", decoded);
    logger.info(`User ${decoded.id} authenticated as ${decoded.role}`);
    await next();
  } catch (err) {
    if (err instanceof JwtTokenExpired) {
      logger.warn("Access token expired");
      return c.json(
        {
          success: false,
          message: "Access token has expired",
          code: "TOKEN_EXPIRED",
        },
        UNAUTHORIZED
      );
    }
    throw err;
  }
}
