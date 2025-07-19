import { zValidator } from "@/lib/zod-validator-wrapper.js";
import { Hono } from "hono";
import { CONFLICT, CREATED, OK } from "stoker/http-status-codes";

import {
  deleteAuthCookies,
  getRefreshCookie,
  setAuthCookies,
} from "@/configs/cookie-config.js";
import { AuthError } from "@/errors/auth-error.js";
import { getServiceFromCookie } from "@/lib/get-service.js";
import logger from "@/lib/logger.js";
import { responseFormater } from "@/lib/response-fmt.js";
import { UserLoginZodSchema, UserZodSchema } from "@/schemas/user-schema.js";
import mailScheduler from "@/services/mail-producer.js";
import userService from "@/services/user-service.js";

const app = new Hono().basePath("/auth");

// register users
app.post(
  "/signup",
  zValidator("json", UserZodSchema.omit({ role: true, refreshToken: true })),
  async (c) => {
    const userDetails = c.req.valid("json");

    const userExists = await userService.existsByEmail(userDetails.email);

    if (userExists) throw new AuthError("User already exists", CONFLICT);

    const hashedPassword = await userService.hashPassword(userDetails.password);

    const user = await userService.create({
      ...userDetails,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = await userService.getAuthTokens(user);

    const updatedUser = await userService.updateRefreshToken(
      user._id,
      refreshToken
    );

    if (!updatedUser) throw new AuthError("Failed to update refresh token");

    await setAuthCookies(c, { refreshToken, accessToken });

    logger.info(`User ${user.fullname} has been registered`);

    // TODO: construct a verification link here

    const verificationLink = "link here";

    await mailScheduler.scheduleEmailVerification(user, verificationLink);

    const response = responseFormater(
      "Signup successful",
      userService.publicProfile(updatedUser)
    );

    return c.json(response, CREATED);
  }
);

//login users
app.post("/login", zValidator("json", UserLoginZodSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await userService.findByEmail(email);

  if (!user) throw new AuthError("Invalid credentials");

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) throw new AuthError("Invalid credentials");

  const { accessToken, refreshToken } = await userService.getAuthTokens(user);

  const updatedUser = await userService.updateRefreshToken(
    user._id,
    refreshToken
  );

  if (!updatedUser) throw new AuthError("Failed to update refresh token");

  await setAuthCookies(c, { refreshToken, accessToken });

  logger.info(`${user.fullname} logged in`);

  const response = responseFormater(
    "Login successful",
    userService.publicProfile(updatedUser)
  );

  return c.json(response, OK);
});

// logout user
app.post("/logout", async (c) => {
  const refreshToken = await getRefreshCookie(c);

  if (refreshToken) {
    const { service } = getServiceFromCookie(refreshToken);
    const user = await service.getByRefreshToken(refreshToken);

    if (user) {
      await service.clearRefreshToken(user._id.toString(), refreshToken);
    }
  }

  deleteAuthCookies(c);
  logger.info(`A user logged out`);
  return c.json({ success: true, message: "Logout successful" }, OK);
});

export default app;
