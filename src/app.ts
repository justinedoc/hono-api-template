import createApp from "@/lib/create-app.js";

import adminRoutes from "@/routes/admin-routes.js";
import authRoutes from "@/routes/auth-routes.js";
import userRoutes from "@/routes/user-routes.js";
import refreshRoute from "@/routes/refresh-route.js";
import passwordRoutes from "@/routes/password-routes.js";

import { NOT_FOUND, OK } from "stoker/http-status-codes";
import "dotenv/config";

const app = await createApp();

app.get(`/health`, (c) => {
  return c.json(
    {
      status: "OK",
      uptime: process.uptime(),
      message: "Server is running",
    },
    OK
  );
});

app.route("/v1", adminRoutes);
app.route("/v1", authRoutes);
app.route("/v1", userRoutes);
app.route("/v1", refreshRoute);
app.route("/v1", passwordRoutes);

app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "Hono API Template", version: "1.0.0" },
});

app.notFound((c) => {
  return c.json({ message: `Route not found - ${c.req.path}` }, NOT_FOUND);
});

export type AppType = typeof app;

export default app;
