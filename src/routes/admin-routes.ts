import { setAuthCookies } from "@/configs/cookie-config.js";
import { ADMIN_CACHE_PREFIX } from "@/constants/cache-constants.js";
import { AuthError } from "@/errors/auth-error.js";
import { getCacheKey, getCacheOrFetch } from "@/lib/get-cache.js";
import logger from "@/lib/logger.js";
import { wildCardDelCacheKey } from "@/lib/node-cache.js";
import { Permission } from "@/lib/permissions.js";
import { responseFormater } from "@/lib/response-fmt.js";
import { zValidator } from "@/lib/zod-validator-wrapper.js";
import { adminProtected } from "@/middlewares/admin-protected.js";
import { authMiddleware } from "@/middlewares/auth-middleware.js";
import { requirePermission } from "@/middlewares/require-permission.js";
import {
  AdminZodSchema,
  GetAdminByIdZodSchema,
  UpdateAdminZodSchema,
} from "@/schemas/admin-schema.js";
import {
  UserLoginZodSchema,
  UserPasswordUpdateZodSchema,
} from "@/schemas/user-schema.js";
import adminService from "@/services/admin-services.js";
import type { AppBindings } from "@/types/hono-types.js";
import { Hono } from "hono";
import { CONFLICT, NOT_FOUND, OK } from "stoker/http-status-codes";

const app = new Hono<AppBindings>().basePath("/admin");

// login admins
app.post("/login", zValidator("json", UserLoginZodSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const admin = await adminService.findByEmail(email);

  if (!admin) throw new AuthError("Invalid credentials");

  const isPasswordMatch = await admin.comparePassword(password);

  if (!isPasswordMatch) throw new AuthError("Invalid credentials");

  const { accessToken, refreshToken } = await adminService.getAuthTokens(admin);

  const updatedAdmin = await adminService.updateRefreshToken(
    admin._id,
    refreshToken
  );

  if (!updatedAdmin) throw new AuthError("Failed to update refresh token");

  await setAuthCookies(c, { refreshToken, accessToken });

  logger.info(`Admin ${admin.fullname} logged in`);

  const response = responseFormater("Login Successful", {
    user: adminService.publicProfile(updatedAdmin),
  });

  return c.json(response, OK);
});

/* 

////// PROTECTED ROUTES  /////

*/

app.use(authMiddleware);
app.use(adminProtected);

// register admins
app.post(
  "/register",
  zValidator("json", AdminZodSchema.omit({ role: true, refreshToken: true })),
  async (c) => {
    const adminDetails = c.req.valid("json");

    const adminExists = await adminService.existsByEmail(adminDetails.email);

    if (adminExists) throw new AuthError("Admin already exists", CONFLICT);

    const hashedPassword = await adminService.hashPassword(
      adminDetails.password
    );

    const admin = await adminService.create({
      ...adminDetails,
      password: hashedPassword,
    });

    const { refreshToken } = await adminService.getAuthTokens(admin);

    const updatedAdmin = await adminService.updateRefreshToken(
      admin._id,
      refreshToken
    );

    if (!updatedAdmin) throw new AuthError("Failed to update refresh token");

    logger.info(`Admin ${admin.fullname} has been registered`);

    const response = responseFormater("Registeration successful", {
      user: adminService.publicProfile(updatedAdmin),
    });

    return c.json(response, OK);
  }
);

// get admin by ID
app.get(
  "/:id",
  zValidator("param", GetAdminByIdZodSchema),
  requirePermission(Permission.ADMIN_READ),
  async (c) => {
    const { id: userId } = c.req.valid("param");
    const cacheKey = getCacheKey("admin", { userId });

    const user = await getCacheOrFetch(
      cacheKey,
      async () => await adminService.findById(userId)
    );

    if (!user) throw new AuthError("Admin not found", NOT_FOUND);

    const response = responseFormater("Admin info retrieved successfully", {
      user: adminService.publicProfile(user),
    });

    return c.json(response, OK);
  }
);

// update admin password
app.patch(
  "/reset-password",
  zValidator("json", UserPasswordUpdateZodSchema),
  requirePermission(Permission.ADMIN_MANAGE),
  async (c) => {
    const { id: userId } = c.get("user");
    const { newPassword, oldPassword } = c.req.valid("json");

    const user = await adminService.updatePassword(
      userId,
      newPassword,
      oldPassword
    );

    const response = responseFormater("Password reset successfully", {
      user: adminService.publicProfile(user),
    });

    return c.json(response, OK);
  }
);

// update admin
app.patch(
  "/:id",
  zValidator("param", GetAdminByIdZodSchema),
  zValidator("json", UpdateAdminZodSchema.shape.data),
  requirePermission(Permission.ADMIN_MANAGE),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const user = await adminService.update(id, data);

    wildCardDelCacheKey(ADMIN_CACHE_PREFIX);

    const response = responseFormater("Update Successful", {
      user: adminService.publicProfile(user),
    });

    return c.json(response, OK);
  }
);

export default app;
