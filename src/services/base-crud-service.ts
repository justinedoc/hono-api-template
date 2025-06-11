import { AuthError } from "@/errors/auth-error.js";
import { excludePrivateFields } from "@/services/base-user-service.js";
import type { selectModel } from "@/lib/role-utils.js";
import type { IUserLean } from "@/types/user-type.js";
import { BAD_REQUEST, NOT_FOUND } from "stoker/http-status-codes";

type Model = ReturnType<typeof selectModel>;

export class BaseUserCrud {
  readonly model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  async create<T>(userDetails: T) {
    return this.model.create(userDetails);
  }

  async update<T>(id: string, userDetails: Partial<T>) {
    const user = await this.model
      .findByIdAndUpdate(id, userDetails, {
        new: true,
        runValidators: true,
      })
      .select(excludePrivateFields)
      .lean();

    if (!user) throw new AuthError("User not found", NOT_FOUND);

    return user;
  }

  async delete(id: string) {
    const user = await this.model
      .findOneAndDelete({ _id: id })
      .select(excludePrivateFields)
      .lean();

    if (!user)
      throw new AuthError(
        "User not found or user already deleted",
        BAD_REQUEST
      );

    return user;
  }
}
