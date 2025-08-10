import type { Roles } from "@/lib/role-utils.js";
import { toPascalCase } from "@/lib/to-pascal-case.js";
import { isValidObjectId } from "mongoose";
import z from "zod";

// login schema
export function LoginZodSchemaFactory() {
  return z.object({
    email: z.string().trim().email(),
    password: z.string(),
  });
}

// Zod schema for getting a user by ID
export function GetByIdZodSchemaFactory(role: Roles) {
  return z.object({
    id: z
      .string({ message: `${toPascalCase(role)} ID is required` })
      .refine(isValidObjectId, {
        message: `Invalid ${toPascalCase(role)} ID format`,
      }),
  });
}

// Zod schema for updating user data
export function UpdateUserDataZodSchemaFactory() {
  return z
    .object({
      fullname: z.string().min(1).max(50),
      username: z.string().min(1).max(50),
      email: z.string().email("Invalid email"),
    })
    .partial();
}

export function UsersZodSchemaFactory() {
  return z.object({
    fullname: z.string().min(1).max(50),
    username: z.string().max(50).optional(),
    email: z.string().email("Invalid email"),
    permissions: z.array(z.string()).optional(),
    refreshToken: z.array(z.string()).optional(),
    profileImg: z.string().optional(),
    passwordResetToken: z.string().optional(),
    passwordResetTokenExp: z.date().optional(),
    password: z
      .string()
      .min(8)
      .max(50)
      .refine((val) => {
        return (
          /[a-zA-Z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*]/.test(val)
        );
      }, "Password must contain at least one letter, one number, and one special character"),
  });
}

export function PasswordUpdateZodSchemaFactory() {
  return z.object({
    oldPassword: UsersZodSchemaFactory().shape.password,
    newPassword: UsersZodSchemaFactory().shape.password,
  });
}
