import { handle } from "@hono/node-server/vercel";

// @ts-expect-error: Importing app from a compiled JavaScript file

import app from "../dist/src/app.js";

export default handle(app);
