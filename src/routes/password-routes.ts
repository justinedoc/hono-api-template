import { validateUserArr } from "@/lib/validate-user.js";
import { selectService } from "@/lib/select-service.js";
import { zValidator } from "@/lib/zod-validator-wrapper.js";
import adminService from "@/services/admin-services.js";
import userService from "@/services/user-service.js";
import { Hono } from "hono";
import { BAD_REQUEST, OK } from "stoker/http-status-codes";
import { z } from "zod";
import mailScheduler from "@/services/mail-producer.js";
import logger from "@/lib/logger.js";
import crypto from "crypto";
import { AuthError } from "@/errors/auth-error.js";
import { isValidObjectId } from "mongoose";

const app = new Hono().basePath("/password");

const response = {
  success: true,
  message:
    "If that email is registered with us, you’ll receive a password reset email shortly.",
};

const ResetPasswordZodSchema = z.object({
  token: z.string().min(1),
  id: z.string().refine(isValidObjectId, {
    message: "Invalid user ID",
  }),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/\d/, "Must contain a number"),
});

app.post(
  "/forgot",
  zValidator("json", z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid("json");

    const result = await Promise.all([
      userService.find("email", email),
      adminService.find("email", email),
    ]);

    const { valid, user } = validateUserArr(...result);

    if (!valid || !user) {
      return c.json(response, OK);
    }

    const service = selectService(user.role);

    const proto = c.req.header("x-forwarded-proto") || "https";
    const host = c.req.header("host")!;
    const origin = `${proto}://${host}`;

    let resetLink: string | undefined;

    try {
      const rawToken = await service.initForgotPassword(user);
      const qp = new URLSearchParams({
        token: rawToken,
        id: user._id.toString(),
      });
      resetLink = `${origin}/password/reset?${qp.toString()}`;
      await mailScheduler.scheduleForgotPasswordEmail(user, resetLink);
    } catch (err) {
      logger.error("Failed scheduling password email", err);
    }

    return c.json(
      {
        ...response,
        data: { email, resetLink },
      },
      OK
    );
  }
);

app.post("/reset", zValidator("json", ResetPasswordZodSchema), async (c) => {
  const { token, newPassword, id } = c.req.valid("json");

  const result = await Promise.all([
    userService.find("_id", id),
    adminService.find("_id", id),
  ]);

  const { valid, user } = validateUserArr(...result);
  if (!valid || !user) {
    throw new AuthError("Invalid password reset link", BAD_REQUEST);
  }

  const service = selectService(user.role);

  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const record = await service.model
    .findOne({
      _id: id,
      passwordResetToken: hashed,
      passwordResetTokenExp: { $gt: Date.now() },
    })
    .select("+passwordResetToken +passwordResetTokenExp");

  if (!record) {
    throw new AuthError("Invalid or expired reset token", BAD_REQUEST);
  }

  await service.resetPasswordByToken(record, newPassword);

  return c.json(
    { success: true, message: "Your password has been reset." },
    OK
  );
});

export default app;
