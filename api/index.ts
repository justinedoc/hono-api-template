import app from "@/app.js";
import { handle } from "@hono/node-server/vercel";

export const config = {
  runtime: "edge",
};

export default handle(app);
