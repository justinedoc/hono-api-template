import { validateUserArr } from "@/lib/validate-user.js";
import { selectService } from "@/lib/select-service.js";
import { zValidator } from "@/lib/zod-validator-wrapper.js";
import adminService from "@/services/admin-services.js";
import userService from "@/services/user-service.js";
import { Hono } from "hono";
import { OK } from "stoker/http-status-codes";
import { z } from "zod";

const app = new Hono().basePath("/password");

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
      return c.json(
        {
          success: false,
          message: "Password reset email has been sent successfully",
        },
        OK
      );
    }

    const service = selectService(user.role);

    return c.json(
      {
        success: true,
        message: "Password reset email sent successfully",
        data: { email },
      },
      OK
    );
  }
);

export default app;
