import { ENV } from "@/configs/env-config.js";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: 587,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});
