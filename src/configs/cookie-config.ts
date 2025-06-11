import { ENV } from "@/configs/env-config.js";
import { COOKIE_MAX_AGE } from "@/constants/auth-constants.js";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

const cookieOptions = {
  httpOnly: true,
  secure: ENV.ENV === "production",
  sameSite: ENV.ENV === "production" ? "none" : "lax",
  partitioned: ENV.ENV === "production",
} as const;

export async function setRefreshCookie(c: Context, refreshToken: string) {
  return setSignedCookie(c, "session", refreshToken, ENV.COOKIE_SECRET, {
    maxAge: COOKIE_MAX_AGE,
    ...cookieOptions,
  });
}

export function deleteRefreshCookie(c: Context) {
  deleteCookie(c, "session");
}

export async function getRefreshCookie(c: Context) {
  return getSignedCookie(c, ENV.COOKIE_SECRET, "session");
}
