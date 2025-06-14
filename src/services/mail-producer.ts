import { redisConnection } from "@/configs/redis-config.js";
import type { AllModels } from "@/lib/role-utils.js";
import { Queue } from "bullmq";

export const mailQueue = new Queue("mail", { connection: redisConnection });

class MailScheduler {
  async scheduleEmailVerification(user: AllModels, verificationLink: string) {
    await mailQueue.add(
      "send-verification",
      { email: user.email, username: user.fullname, verificationLink },
      {
        delay: 0,
        attempts: 5,
        backoff: { type: "exponential", delay: 1000 },
      }
    );
  }

  async scheduleForgotPasswordEmail(user: AllModels, resetLink: string) {
    await mailQueue.add(
      "send-forgot-password",
      { email: user.email, username: user.fullname.split(" ")[0], resetLink },
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
