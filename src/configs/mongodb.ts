import mongoose from "mongoose";
import { ENV } from "./env-config.js";
import logger from "@/lib/logger.js";

export async function connectToDb(): Promise<void> {
  try {
    if (mongoose.connection.readyState >= 1) {
      logger.info("Database is already connected.");
      return;
    }
    logger.info("⚡ Connecting to database...");
    await mongoose.connect(ENV.MONGODB_URI);
    logger.info("✅ Connected to database!");
  } catch (err) {
    logger.error(err, "❌ Database connection error");
    process.exit(1);
  }
}
