import Admin from "@/models/admin-model.js";
import User from "@/models/user-model.js";

import type { IAdminDoc } from "@/types/admin-types.js";
import type { IUserDoc } from "@/types/user-type.js";
import type { Model } from "mongoose";

export type Roles = "GUEST" | "USER" | "MODERATOR" | "ADMIN" | "SUPERADMIN";

export type AllModels = IUserDoc | IAdminDoc;

export type RoleConfig<T extends string, K> = {
  [P in T]?: Model<Extract<K, { role: P }>>;
};

export const roleModelMap: RoleConfig<Roles, AllModels> = {
  USER: User,
  ADMIN: Admin,
};

export function selectModel<R extends Roles>(
  role: R
): Model<Extract<AllModels, { role: R }>> {
  const model = roleModelMap[role];

  if (!model) {
    throw new Error(`No model registered for role: ${role}`);
  }

  return model as Model<Extract<AllModels, { role: R }>>;
}
