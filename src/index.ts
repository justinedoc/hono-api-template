import app from "@/app.js";
import { ENV } from "@/configs/env-config.js";
import * as pino from "@/lib/logger.js";

import { serve } from "@hono/node-server";

const serverConfig = {
  fetch: app.fetch,
  port: ENV.PORT,
};

serve(serverConfig, (info) => {
  pino.default.info(`✅ Server is running on http://localhost:${info.port}`);
});
