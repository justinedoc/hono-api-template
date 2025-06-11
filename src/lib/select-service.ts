import adminService, { AdminService } from "@/services/admin-services.js";
import userService, { UserService } from "@/services/user-service.js";
import type { Roles } from "@/lib/role-utils.js";

export function selectService(role: Roles) {
  let service: AdminService | UserService | null = null;

  switch (role) {
    case "ADMIN":
      service = adminService;
      break;
    case "USER":
      service = userService;
      break;
    default:
      throw new Error("Invalid role provided");
  }

  return service;
}
