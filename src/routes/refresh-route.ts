import { getRefreshCookie, setRefreshCookie } from "@/configs/cookie-config.js";
import type { AppBindings } from "@/types/hono-types.js";
import { AuthError } from "@/errors/auth-error.js";
import { Hono } from "hono";
import { OK } from "stoker/http-status-codes";
import { getServiceFromCookie } from "@/lib/get-service.js";

const app = new Hono<AppBindings>().basePath("/refresh");

app.get("/", async (c) => {
  const cookie = await getRefreshCookie(c);

  if (!cookie) throw new AuthError("No token provided");

  const { service } = getServiceFromCookie(cookie);

  const { accessToken, refreshToken } = await service.refreshAuth(cookie);
  await setRefreshCookie(c, refreshToken);

  return c.json({ success: true, data: { accessToken } }, OK);
});

export default app;
