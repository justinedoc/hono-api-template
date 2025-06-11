import { BaseUserCrud } from "@/services/base-crud-service.js";
import { BaseUserService } from "@/services/base-user-service.js";
import type { IAdminLean } from "@/types/admin-types.js";
import type { Roles } from "@/lib/role-utils.js";

type IncomingAdmin = Omit<
  IAdminLean,
  "comparePassword" | "_id" | "refreshToken" | "role"
>;

export class AdminService extends BaseUserService {
  private crud: BaseUserCrud;

  constructor(role: Roles) {
    super(role);
    this.crud = new BaseUserCrud(this.model);
  }

  async create(userDetails: IncomingAdmin) {
    return this.crud.create(userDetails);
  }

  async update(id: string, userDetails: Partial<IncomingAdmin>) {
    return this.crud.update(id, userDetails);
  }

  async delete(id: string) {
    return this.crud.delete(id);
  }
}

const adminService = new AdminService("ADMIN");

export default adminService;
