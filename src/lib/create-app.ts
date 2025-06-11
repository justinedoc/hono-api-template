import { OpenAPIHono } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { secureHeaders } from "hono/secure-headers";
import { prettyJSON as pretty } from "hono/pretty-json";
import { rateLimiter } from "hono-rate-limiter";
import serveEmojiFavicon from "stoker/middlewares/serve-emoji-favicon";

import { onError } from "@/middlewares/on-error.js";
import { defaultHook } from "stoker/openapi";
import { connectToDb } from "@/configs/mongodb.js";
import { createSuperAdmin } from "@/lib/super-admin.js";

import "@/workers/mail-workers.js";

export function createRouter() {
  return new OpenAPIHono({
    strict: false,
    defaultHook,
  }).basePath("/api");
}

export default async function createApp() {
  await connectToDb();
  await createSuperAdmin();
  const app = createRouter();

  app.use(serveEmojiFavicon("🔥"));

  app.use(
    rateLimiter({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-7",
      keyGenerator: (c) =>
        c.req.header("CF-Connecting-IP") ||
        c.req.header("X-Forwarded-For") ||
        "unknown",
      handler: (c, next, options) => {
        c.status(429);
        c.header("Retry-After", Math.ceil(options.windowMs / 1000).toString());
        return c.json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      },
    })
  );

  app.use(cors({ origin: "*", credentials: true }));
  app.use(compress());
  app.use(secureHeaders());
  app.use(pretty());
  app.use(logger());

  app.onError(onError);

  return app;
}
