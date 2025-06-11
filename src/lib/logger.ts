import pino from "pino";
import "dotenv/config";

const isDev = process.env.ENV === "development";

const logger = pino.default({
  ...(!isDev && {
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: true,
        ignore: "pid,hostname",
        hideObject: false,
        supportEmoji: true,
      },
    },
  }),
});

export default logger;
