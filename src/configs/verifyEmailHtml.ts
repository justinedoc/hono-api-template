import { APP_NAME } from "@/constants/app-constants.js";

export function verifyEmailHtml(username: string, link: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Email Verification</title>
        <style>
          body {
            margin: 0;
            padding: 1rem;
            background: #f5f5f5;
            font-family: "Segoe UI", system-ui, sans-serif;
          }
          .container {
            max-width: 600px;
            margin: 2rem auto;
            padding: 2rem;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          h2 {
            text-align: center;
            color: #2c7a5b;
            margin-bottom: 1.5rem;
            font-size: 1.8rem;
            font-weight: 600;
            letter-spacing: -0.5px;
          }
          p {
            line-height: 1.6;
            font-size: 1.05rem;
            color: #424242;
            margin: 1rem 0;
          }
          .button-container {
            text-align: center;
            margin: 2rem 0;
          }
          .btn {
            display: inline-block;
            background-color: #2c7a5b;
            color: #ffffff !important;
            text-decoration: none;
            padding: 0.8rem 2rem;
            border-radius: 8px;
            font-weight: 500;
            transition: transform 0.1s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .footer {
            text-align: center;
            font-size: 0.9rem;
            color: #757575;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #eeeeee;
          }
          .footer small {
            display: block;
            font-size: 0.85em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Welcome to ${APP_NAME}, ${username}!</h2>
          <p>
            Thank you for joining ${APP_NAME}! To activate your account and start using
            our services, please verify your email address by clicking the
            button below:
          </p>
          <div class="button-container">
            <a
              href="${link}"
              class="btn"
              role="button"
              aria-label="Verify Email Address"
              >Verify Email</a
            >
          </div>
          <p style="font-size: 0.95rem;">
            If you didn’t create this account, you can safely ignore this email.
            This link will expire in 10&nbsp;minutes.
          </p>
          <div class="footer">
            <p>
              &copy; ${new Date().getFullYear()} ${APP_NAME}. All
              rights reserved.
            </p>
            <small>This is an automated message; please do not reply.</small>
          </div>
        </div>
      </body>
    </html>
  `;
}
