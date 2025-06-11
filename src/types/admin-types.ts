import type { Types } from "mongoose";
import type { z } from "zod";
import type { Document } from "mongoose";
import type { AdminZodSchema } from "@/schemas/admin-schema.js";

type BaseAdmin = z.infer<typeof AdminZodSchema> & {
  comparePassword: (password: string) => Promise<boolean>;
  _id: Types.ObjectId;
};

export type IAdminLean = BaseAdmin;
export type IAdminDoc = BaseAdmin & Document;
