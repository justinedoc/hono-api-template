import { ENV } from "@/configs/env-config.js";
import logger from "@/lib/logger.js";
import { transporter } from "@/lib/mailer.js";

interface SendMailToEmailParams {
  recipientEmail: string;
  html?: string;
  text: string;
  mailSubject: string;
}

export async function sendMail({
  recipientEmail,
  html,
  text,
  mailSubject,
}: SendMailToEmailParams) {
  const mailOptions = {
    from: ENV.EMAIL_ADDR,
    to: recipientEmail,
    subject: mailSubject,
    html,
    text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    logger.info(`Sending email sent to ${recipientEmail}`);
    return result;
  } catch (error) {
    logger.error(`Error sending email to ${recipientEmail}:`, error);

    if (error instanceof Error) {
      error.message = `Failed to send email to ${recipientEmail}: ${error.message}`;
    }
    throw error;
  }
}
