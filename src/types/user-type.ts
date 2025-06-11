import type { Types } from "mongoose";
import type { z } from "zod";
import type { UserZodSchema } from "@/schemas/user-schema.js";
import type { Document } from "mongoose";

type BaseUser = z.infer<typeof UserZodSchema> & {
  comparePassword: (password: string) => Promise<boolean>;
  _id: Types.ObjectId;
};

export type IUserLean = BaseUser;
export type IUserDoc = BaseUser & Document;
