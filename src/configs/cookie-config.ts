import { ENV } from "@/configs/env-config.js";
import type { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

const ACCESS_COOKIE_MAX_AGE = 15 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: ENV.ENV === "production",
  sameSite: ENV.ENV === "production" ? "none" : "lax",
} as const;

export async function setAccessCookie(c: Context, accessToken: string) {
  return await setSignedCookie(
    c,
    "access_token",
    accessToken,
    ENV.ACCESS_COOKIE_SECRET,
    {
      ...cookieOptions,
      maxAge: ACCESS_COOKIE_MAX_AGE,
    }
  );
}

export async function setRefreshCookie(c: Context, refreshToken: string) {
  return await setSignedCookie(
    c,
    "refresh_token",
    refreshToken,
    ENV.REFRESH_COOKIE_SECRET,
    {
      ...cookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    }
  );
}

export async function setAuthCookies(
  c: Context,
  { refreshToken, accessToken }: { refreshToken: string; accessToken: string }
) {
  await Promise.all([
    setAccessCookie(c, accessToken),
    setRefreshCookie(c, refreshToken),
  ]);
}

export function deleteRefreshCookie(c: Context) {
  deleteCookie(c, "refresh_token");
}

export function deleteAccessCookie(c: Context) {
  deleteCookie(c, "access_token");
}

export function deleteAuthCookies(c: Context) {
  deleteAccessCookie(c);
  deleteRefreshCookie(c);
}

export async function getRefreshCookie(c: Context) {
  return getSignedCookie(c, ENV.REFRESH_COOKIE_SECRET, "refresh_token");
}

export async function getAccessCookie(c: Context) {
  return getSignedCookie(c, ENV.ACCESS_COOKIE_SECRET, "access_token");
}
