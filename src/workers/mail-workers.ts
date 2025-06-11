/* eslint-disable no-console */
import { ENV } from "@/configs/env-config.js";
import { VERIFY_EMAIL_SUBJECT, VERIFY_EMAIL_TEXT } from "@/configs/messages.js";
import { verifyEmailHtml } from "@/configs/verifyEmailHtml.js";
import logger from "@/lib/logger.js";
import { sendMail } from "@/lib/send-mail.js";
import { Worker } from "bullmq";

const connection = {
  host: ENV.REDIS_URL,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASS,
};

export const mailWorker = new Worker(
  "mail",
  async (job) => {
    switch (job.name) {
      case "send-verification":
        await sendMail({
          recipientEmail: job.data.email,
          mailSubject: VERIFY_EMAIL_SUBJECT,
          text: VERIFY_EMAIL_TEXT("link"),
          html: verifyEmailHtml(job.data.username, "link"),
        });
        break;
    }
  },
  { connection }
);

mailWorker.on("completed", (job) => {
  logger.info(`✅ Job ${job.id} (${job.name}) completed`);
});

mailWorker.on("failed", (job, err) => {
  logger.error(`❌ Job ${job?.id} failed:`);
  console.error("ERR:", err);
});
