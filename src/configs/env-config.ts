import logger from "@/lib/logger.js";
import dotenv from "dotenv";
import { z } from "zod/v4";

dotenv.config();

const envSchema = z.object({
  ENV: z.enum(["development", "production"]),
  PORT: z.string().transform(Number),
  MONGODB_URI: z.url({ message: "DB_URL must be a valid URL" }),
  SUPERADMIN_EMAIL: z.string(),
  SUPERADMIN_PASS: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_COOKIE_SECRET: z.string(),
  ACCESS_COOKIE_SECRET: z.string(),
  SMTP_USER: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_ADDR: z.string(),
  REDIS_URL: z.string(),
  REDIS_PORT: z.string().transform(Number),
  REDIS_PASS: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  logger.error(
    z.prettifyError(parsedEnv.error),
    "❌ Invalid environment variables: "
  );
  process.exit(1);
}

export const ENV = parsedEnv.data;
