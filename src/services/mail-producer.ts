import { ENV } from "@/configs/env-config.js";
import { Queue } from "bullmq";

const connection = {
  host: ENV.REDIS_URL,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASS,
};
export const mailQueue = new Queue("mail", { connection });

class MailScheduler {
  async scheduleEmailVerification({
    userId,
    email,
    username,
  }: {
    userId: string;
    email: string;
    username: string;
  }) {
    await mailQueue.add(
      "send-verification",
      { userId, email, username },
      {
        delay: 0,
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
      }
    );
  }
}

const mailScheduler = new MailScheduler();
export default mailScheduler;
