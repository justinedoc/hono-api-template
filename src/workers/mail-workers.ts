/* eslint-disable no-console */
import { forgotPasswordHtml } from "@/configs/forgot-password-html.js";
import {
  FORGOT_PASSWORD_EMAIL_TEXT,
  FORGOT_PASSWORD_SUBJECT,
  VERIFY_EMAIL_SUBJECT,
  VERIFY_EMAIL_TEXT,
} from "@/configs/messages.js";
import { redisConnection } from "@/configs/redis-config.js";
import { verifyEmailHtml } from "@/configs/verify-email-html.js";
import logger from "@/lib/logger.js";
import { sendMail } from "@/lib/send-mail.js";
import { Worker } from "bullmq";

export const mailWorker = new Worker(
  "mail",
  async (job) => {
    switch (job.name) {
      case "send-verification":
        await sendMail({
          recipientEmail: job.data.email,
          mailSubject: VERIFY_EMAIL_SUBJECT,
          text: VERIFY_EMAIL_TEXT(job.data.verificationLink),
          html: verifyEmailHtml(job.data.username, job.data.verificationLink),
        });
        break;
      case "send-forgot-password":
        await sendMail({
          recipientEmail: job.data.email,
          mailSubject: FORGOT_PASSWORD_SUBJECT,
          text: FORGOT_PASSWORD_EMAIL_TEXT(job.data.resetLink),
          html: forgotPasswordHtml(job.data.username, job.data.resetLink),
        });
        break;
    }
  },
  { connection: redisConnection }
);

mailWorker.on("completed", (job) => {
  logger.info(`✅ Job ${job.id} (${job.name}) completed`);
});

mailWorker.on("failed", (job, err) => {
  logger.error(`❌ Job ${job?.id} failed:`);
  console.error("ERR:", err.message);
});
