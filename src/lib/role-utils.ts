import Admin from "@/models/admin-model.js";
import User from "@/models/user-model.js";
import type { IAdminDoc } from "@/types/admin-types.js";
import type { IUserDoc } from "@/types/user-type.js";
import type { Model } from "mongoose";

export type Roles = "USER" | "ADMIN";

export type AllModels = IUserDoc | IAdminDoc;

type ModelSelect<T> = Model<Extract<AllModels, { role: T }>>;

export type RoleConfig<T extends string, K> = {
  [P in T]: Model<Extract<K, { role: P }>>;
};

export const roleModelMap: RoleConfig<Roles, AllModels> = {
  USER: User,
  ADMIN: Admin,
};

export function selectModel<R extends Roles>(role: R): ModelSelect<R> {
  return roleModelMap[role] as ModelSelect<R>;
}
