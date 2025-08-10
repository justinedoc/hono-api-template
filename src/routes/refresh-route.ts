import { getRefreshCookie, setAuthCookies } from "@/configs/cookie-config.js";
import { AuthError } from "@/errors/auth-error.js";
import { getServiceFromCookie } from "@/lib/get-service.js";
import type { AppBindings } from "@/types/hono-types.js";
import { Hono } from "hono";
import { OK } from "stoker/http-status-codes";

const app = new Hono<AppBindings>().basePath("/refresh");

app.post("/", async (c) => {
  const refreshCookie = await getRefreshCookie(c);

  if (!refreshCookie) {
    throw new AuthError("Session expired, please login again");
  }

  const { service } = getServiceFromCookie(refreshCookie);

  const { accessToken, refreshToken } =
    await service.refreshAuth(refreshCookie);

  await setAuthCookies(c, { accessToken, refreshToken });

  return c.json({ success: true }, OK);
});

export default app;
