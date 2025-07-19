import { deleteAuthCookies } from "@/configs/cookie-config.js";
import { USER_CACHE_PREFIX } from "@/constants/cache-constants.js";
import { getCacheKey, getCacheOrFetch } from "@/lib/get-cache.js";
import { wildCardDelCacheKey } from "@/lib/node-cache.js";
import { enforcePermission, Permission } from "@/lib/permissions.js";
import { responseFormater } from "@/lib/response-fmt.js";
import { zValidator } from "@/lib/zod-validator-wrapper.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requirePermission } from "@/middlewares/require-permission.js";
import {
  GetUserByIdZodSchema,
  UpdateUserZodSchema,
  UserPasswordUpdateZodSchema,
} from "@/schemas/user-schema.js";
import userService from "@/services/user-service.js";
import type { AppBindings } from "@/types/hono-types.js";
import { Hono } from "hono";
import { OK } from "stoker/http-status-codes";

const app = new Hono<AppBindings>().basePath("/user");

app.use(authMiddleware);

// get user by id
app.get(
  "/:id",
  zValidator("param", GetUserByIdZodSchema),
  requirePermission(Permission.SELF_READ, Permission.USER_READ),
  async (c) => {
    const { id: targetUserId } = c.req.valid("param");
    const currentUser = c.get("user");

    enforcePermission(
      currentUser,
      targetUserId,
      Permission.SELF_READ,
      Permission.USER_READ
    );

    const cacheKey = getCacheKey("user", { userId: targetUserId });

    const user = await getCacheOrFetch(
      cacheKey,
      async () => await userService.findById(targetUserId)
    );

    if (!user) {
      c.status(404);
      throw new Error("User not found");
    }

    const response = responseFormater(
      "User information retrieved successfully",
      userService.publicProfile(user)
    );

    return c.json(response, OK);
  }
);

// update user password
app.patch(
  "/reset-password",
  zValidator("json", UserPasswordUpdateZodSchema),
  requirePermission(Permission.SELF_UPDATE),
  async (c) => {
    const { id: userId } = c.get("user");
    const { newPassword, oldPassword } = c.req.valid("json");

    const user = await userService.updatePassword(
      userId,
      newPassword,
      oldPassword
    );

    const response = responseFormater("Password reset successfully", {
      user: userService.publicProfile(user),
    });

    return c.json(response, OK);
  }
);

// update user
app.patch(
  "/:id",
  zValidator("param", UpdateUserZodSchema.pick({ id: true })),
  zValidator("json", UpdateUserZodSchema.shape.data),
  requirePermission(Permission.SELF_UPDATE, Permission.USER_UPDATE),
  async (c) => {
    const { id: targetUserId } = c.req.valid("param");
    const data = c.req.valid("json");
    const currentUser = c.get("user");

    enforcePermission(
      currentUser,
      targetUserId,
      Permission.SELF_UPDATE,
      Permission.USER_UPDATE
    );

    const user = await userService.update(targetUserId, data);

    wildCardDelCacheKey(USER_CACHE_PREFIX);

    const response = responseFormater(
      "User updated successfully",
      userService.publicProfile(user)
    );
    return c.json(response, OK);
  }
);

// delete user
app.delete(
  "/:id",
  zValidator("param", GetUserByIdZodSchema),
  requirePermission(Permission.SELF_DELETE, Permission.USER_DELETE),
  async (c) => {
    const { id: targetUserId } = c.req.valid("param");
    const currentUser = c.get("user");

    enforcePermission(
      currentUser,
      targetUserId,
      Permission.SELF_DELETE,
      Permission.USER_DELETE
    );

    const user = await userService.delete(targetUserId);

    deleteAuthCookies(c);

    wildCardDelCacheKey(USER_CACHE_PREFIX);

    const response = responseFormater(
      "Account deleted successfully",
      userService.publicProfile(user)
    );

    return c.json(response, OK);
  }
);

export default app;
