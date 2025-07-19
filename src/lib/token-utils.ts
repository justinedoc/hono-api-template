import { ENV } from "@/configs/env-config.js";
import {
  ACCESS_TOKEN_EXP,
  REFRESH_TOKEN_EXP,
} from "@/constants/auth-constants.js";
import type { Permission } from "@/lib/permissions.js";
import type { Roles } from "@/lib/role-utils.js";
import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import type { Types } from "mongoose";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthPayload extends JWTPayload {
  id: string;
  role: Roles;
  permissions: string[] | Permission[]
}

async function verifyToken(
  token: string,
  secret: string
): Promise<AuthPayload | null> {
  return (await verify(token, secret)) as AuthPayload;
}

export async function generateAuthTokens(
  id: Types.ObjectId,
  role: Roles,
  permissions: string[] | undefined
): Promise<AuthTokens> {
  const accessPayload = {
    id: id.toString(),
    role,
    exp: ACCESS_TOKEN_EXP,
    ...(permissions && { permissions }),
  };
  const refreshPayload = { ...accessPayload, exp: REFRESH_TOKEN_EXP };

  return {
    accessToken: await sign(accessPayload, ENV.ACCESS_TOKEN_SECRET),
    refreshToken: await sign(refreshPayload, ENV.REFRESH_TOKEN_SECRET),
  };
}

export const verifyAccessToken = (t: string) =>
  verifyToken(t, ENV.ACCESS_TOKEN_SECRET);

export const verifyRefreshToken = (t: string) =>
  verifyToken(t, ENV.REFRESH_TOKEN_SECRET);
