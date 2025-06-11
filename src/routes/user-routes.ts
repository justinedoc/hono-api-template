import { deleteRefreshCookie } from "@/configs/cookie-config.js";
import { USER_CACHE_PREFIX } from "@/constants/cache-constants.js";
import { AuthError } from "@/errors/auth-error.js";
import {
  authMiddleware,
  isSelfOrAdmin,
} from "@/middlewares/auth-middleware.js";
import {
  GetUserByIdZodSchema,
  UpdateUserZodSchema,
  UserPasswordUpdateZodSchema,
} from "@/schemas/user-schema.js";
import userService from "@/services/user-service.js";
import type { AppBindings } from "@/types/hono-types.js";
import { getCacheKey, getCacheOrFetch } from "@/lib/get-cache.js";
import { wildCardDelCacheKey } from "@/lib/node-cache.js";
import { zValidator } from "@/lib/zod-validator-wrapper.js";
import { Hono } from "hono";
import { FORBIDDEN, OK } from "stoker/http-status-codes";
import { responseFormater } from "@/lib/response-fmt.js";

export const unauthorizedRes = {
  success: false,
  message: "You are not allowed to perform this action",
};

const app = new Hono<AppBindings>().basePath("/user");

app.use(authMiddleware);

// get user by id
app.get("/:id", zValidator("param", GetUserByIdZodSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { id: userId, role } = c.get("user");
  const cacheKey = getCacheKey("user", { userId });

  if (!isSelfOrAdmin({ userId, id, role })) {
    throw new AuthError(unauthorizedRes.message, FORBIDDEN);
  }

  const user = await getCacheOrFetch(
    cacheKey,
    async () => await userService.findById(userId)
  );

  const response = responseFormater(
    "User fetched successfully",
    userService.publicProps(user)
  );

  return c.json(response, OK);
});

// update user password
app.patch(
  "/reset-password",
  zValidator("json", UserPasswordUpdateZodSchema),
  async (c) => {
    const { id: userId } = c.get("user");
    const { newPassword, oldPassword } = c.req.valid("json");

    const user = await userService.updatePassword(
      userId,
      newPassword,
      oldPassword
    );

    const response = responseFormater("Password reset successfully", {
      user: userService.publicProps(user),
    });

    return c.json(response, OK);
  }
);

// update user
app.patch(
  "/:id",
  zValidator("param", UpdateUserZodSchema.pick({ id: true })),
  zValidator("json", UpdateUserZodSchema.shape.data),
  async (c) => {
    const { id: userId, role } = c.get("user");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    if (!isSelfOrAdmin({ userId, id, role })) {
      throw new AuthError(unauthorizedRes.message, FORBIDDEN);
    }

    const user = await userService.update(id, data);

    wildCardDelCacheKey(USER_CACHE_PREFIX);

    const response = responseFormater(
      "User updated successfully",
      userService.publicProps(user)
    );
    return c.json(response, OK);
  }
);

// delete user
app.delete("/:id", zValidator("param", GetUserByIdZodSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { id: userId, role } = c.get("user");

  if (!isSelfOrAdmin({ userId, id, role })) {
    throw new AuthError(unauthorizedRes.message, FORBIDDEN);
  }

  const user = await userService.delete(id);

  deleteRefreshCookie(c);

  wildCardDelCacheKey(USER_CACHE_PREFIX);

  const response = responseFormater(
    "Account deleted successfully",
    userService.publicProps(user)
  );

  return c.json(response, OK);
});

export default app;
