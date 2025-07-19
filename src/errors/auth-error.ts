import type { ContentfulStatusCode } from "hono/utils/http-status";
import { UNAUTHORIZED } from "stoker/http-status-codes";

export class AuthError extends Error {
  public status: ContentfulStatusCode;
  public code: string;

  constructor(
    message: string,
    status: ContentfulStatusCode = UNAUTHORIZED,
    code: string = "AUTH_ERROR"
  ) {
    super(message);
    this.name = "AuthError";

    this.status = status;
    this.code = code;

    Object.setPrototypeOf(this, AuthError.prototype);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
    };
  }
}
