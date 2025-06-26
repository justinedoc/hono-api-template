import { ENV } from "@/configs/env-config.js";

export const redisConnection = {
  host: ENV.REDIS_URL,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASS,
};
