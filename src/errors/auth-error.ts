import type { ContentfulStatusCode } from "hono/utils/http-status";
import { UNAUTHORIZED } from "stoker/http-status-codes";

export class AuthError extends Error {
  public status: ContentfulStatusCode;

  constructor(message: string, status = UNAUTHORIZED) {
    super(message);
    this.name = "AuthError";
    this.status = status as unknown as ContentfulStatusCode;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
