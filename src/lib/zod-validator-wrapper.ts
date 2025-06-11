import { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator as zv } from "@hono/zod-validator";
import { handleZodError } from "@/lib/handle-zod-error.js";

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T
) =>
  zv(target, schema, (result) => {
    if (!result.success) {
      const { error, message } = handleZodError(result.error);
      throw new HTTPException(400, { message, cause: error });
    }
  });
