import { Schema } from "mongoose";
import z from "zod";
import { isValidObjectId } from "mongoose";
import type { IUserDoc } from "@/types/user-type.js";
import {
  GetByIdZodSchemaFactory,
  LoginZodSchemaFactory,
  PasswordUpdateZodSchemaFactory,
  UpdateUserDataZodSchemaFactory,
  UsersZodSchemaFactory,
} from "@/schemas/schema-factory.js";

// User login schema
export const UserLoginZodSchema = LoginZodSchemaFactory();

// Zod schema for getting user by ID
export const GetUserByIdZodSchema = GetByIdZodSchemaFactory("USER");

// Zod schema for updating user data
const UpdateUserDataZodSchema = UpdateUserDataZodSchemaFactory();

export const UpdateUserZodSchema = z.object({
  id: z.string().refine(isValidObjectId, {
    message: "Invalid user ID format",
  }),
  data: UpdateUserDataZodSchema,
});

// Zod schema for creating a user
export const UserZodSchema = UsersZodSchemaFactory().extend({
  role: z.enum(["USER"]).default("USER"),
});

export const UserPasswordUpdateZodSchema = PasswordUpdateZodSchemaFactory();

// User schema for MongoDB
export const UserSchema = new Schema<IUserDoc>(
  {
    role: { type: String, required: true, enum: ["USER"], default: "USER" },
    fullname: { type: String, required: true },
    username: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImg: String,
    passwordResetToken: String,
    passwordResetTokenExp: String,
    refreshToken: { type: [String], default: [] },
  },
  { timestamps: true }
);
