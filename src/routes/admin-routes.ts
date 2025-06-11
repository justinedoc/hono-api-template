import { zValidator } from "@/lib/zod-validator-wrapper.js";
import logger from "@/lib/logger.js";
import { getRefreshCookie, setRefreshCookie } from "@/configs/cookie-config.js";
import { CONFLICT, CREATED, FORBIDDEN, OK } from "stoker/http-status-codes";
import { AuthError } from "@/errors/auth-error.js";
import { adminProtected } from "@/middlewares/admin-protected.js";
import {
  authMiddleware,
  isSelfOrAdmin,
} from "@/middlewares/auth-middleware.js";
import adminService from "@/services/admin-services.js";
import type { AppBindings } from "@/types/hono-types.js";
import { Hono } from "hono";
import {
  AdminZodSchema,
  GetAdminByIdZodSchema,
  UpdateAdminZodSchema,
} from "@/schemas/admin-schema.js";
import {
  UserLoginZodSchema,
  UserPasswordUpdateZodSchema,
} from "@/schemas/user-schema.js";
import { getCacheKey, getCacheOrFetch } from "@/lib/get-cache.js";
import { unauthorizedRes } from "@/routes/user-routes.js";
import { wildCardDelCacheKey } from "@/lib/node-cache.js";
import { ADMIN_CACHE_PREFIX } from "@/constants/cache-constants.js";
import { responseFormater } from "@/lib/response-fmt.js";

const app = new Hono<AppBindings>().basePath("/admin");

// login admins
app.post("/login", zValidator("json", UserLoginZodSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const refCookie = await getRefreshCookie(c);

  if (refCookie) throw new AuthError("Already logged in", CONFLICT);

  const admin = await adminService.findByEmail(email);

  const isPasswordMatch = await admin.comparePassword(password);

  if (!isPasswordMatch) throw new AuthError("Incorrect credentials");

  const { accessToken, refreshToken } = await adminService.getAuthTokens(
    admin._id
  );

  const updatedAdmin = await adminService.updateRefreshToken(
    admin._id,
    refreshToken
  );

  if (!updatedAdmin) throw new AuthError("Failed to update refresh token");

  await setRefreshCookie(c, refreshToken);

  logger.info(`Admin ${admin.fullname} logged in`);

  const response = responseFormater(
    "Login Successful",
    {
      user: adminService.publicProps(updatedAdmin),
    },
    { accessToken }
  );

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

    const { accessToken, refreshToken } = await adminService.getAuthTokens(
      admin._id
    );

    const updatedAdmin = await adminService.updateRefreshToken(
      admin._id,
      refreshToken
    );

    if (!updatedAdmin) throw new AuthError("Failed to update refresh token");

    logger.info(`Admin ${admin.fullname} has been registered`);

    const metaData = { accessToken };

    const response = responseFormater(
      "Registeration successful",
      {
        user: adminService.publicProps(updatedAdmin),
      },
      metaData
    );

    return c.json(response, OK);
  }
);

// get admin by ID
app.get("/:id", zValidator("param", GetAdminByIdZodSchema), async (c) => {
  const { id } = c.req.valid("param");
  const { id: userId, role } = c.get("user");
  const cacheKey = getCacheKey("admin", { userId });

  if (!isSelfOrAdmin({ userId, id, role })) {
    throw new AuthError(unauthorizedRes.message, FORBIDDEN);
  }

  const user = await getCacheOrFetch(
    cacheKey,
    async () => await adminService.findById(userId)
  );

  const response = responseFormater("Admin fetched successfully", {
    user: adminService.publicProps(user),
  });

  return c.json(response, OK);
});

// update admin password
app.patch(
  "/reset-password",
  zValidator("json", UserPasswordUpdateZodSchema),
  async (c) => {
    const { id: userId } = c.get("user");
    const { newPassword, oldPassword } = c.req.valid("json");

    const user = await adminService.updatePassword(
      userId,
      newPassword,
      oldPassword
    );

    const response = responseFormater("Password reset successfully", {
      user: adminService.publicProps(user),
    });

    return c.json(response, OK);
  }
);

// update admin
app.patch(
  "/:id",
  zValidator("param", GetAdminByIdZodSchema),
  zValidator("json", UpdateAdminZodSchema.shape.data),
  async (c) => {
    const { id: userId, role } = c.get("user");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    if (!isSelfOrAdmin({ userId, id, role })) {
      throw new AuthError(unauthorizedRes.message, FORBIDDEN);
    }

    const user = await adminService.update(id, data);

    wildCardDelCacheKey(ADMIN_CACHE_PREFIX);

    const response = responseFormater("Update Successful", {
      user: adminService.publicProps(user),
    });

    return c.json(response, OK);
  }
);

export default app;
