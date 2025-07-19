import { ENV } from "@/configs/env-config.js";
import { AuthError } from "@/errors/auth-error.js";
import { handleZodError } from "@/lib/handle-zod-error.js";
import logger from "@/lib/logger.js";
import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  OK,
} from "stoker/http-status-codes";
import { ZodError } from "zod";

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    const { error, message } = handleZodError(err);

    return c.json(
      {
        success: false,
        message: message || "Invalid request data",
        error,
      },
      { status: BAD_REQUEST }
    );
  }

  if (err instanceof AuthError) {
    logger.warn(err.message, {
      url: c.req.url,
      method: c.req.method,
      userId: c.get("user")?.id,
      errorName: err.name,
      ...(ENV.ENV !== "production" && { stack: err.stack }),
    });

    return c.json(
      {
        success: false,
        message: err.message,
        code: err?.code,
        stack: ENV.ENV !== "production" && err.stack,
      },
      err.status
    );
  }

  const currentStatus: number =
    "status" in err ? (err.status as number) : c.newResponse(null).status;

  const statusCode: StatusCode =
    currentStatus !== OK
      ? (currentStatus as StatusCode)
      : INTERNAL_SERVER_ERROR;

  const payload: Record<string, unknown> = {
    success: false,
    name: err?.name,
    message: err.message,
  };

  if (ENV.ENV !== "production" && err.stack) {
    payload.stack = err.stack;
  }

  logger.error(err.message, err, {
    url: c.req.url,
    method: c.req.method,
    userId: c.get("user")?.id,
    errorName: err?.name,
  });

  return c.json(payload, {
    status: statusCode as unknown as ContentfulStatusCode,
  });
};
