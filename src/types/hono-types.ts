import type { AuthPayload } from "@/lib/token-utils.js";

export type AppBindings = {
  Variables: {
    user: AuthPayload;
  };
};
