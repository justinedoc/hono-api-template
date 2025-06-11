import type { AllModels } from "@/lib/role-utils.js";

export function validateUserArr(...users: (AllModels | null)[]): {
  valid: boolean;
  user: AllModels | null;
} {
  
  if (users.length === 0) {
    return {
      valid: false,
      user: null,
    };
  }

  for (const u of users) {
    if (u && u.email) {
      return {
        valid: true,
        user: u,
      };
    }
  }
  return {
    valid: false,
    user: null,
  };
}
