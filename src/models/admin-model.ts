import { model } from "mongoose";
import bcrypt from "bcryptjs";
import { AdminSchema } from "@/schemas/admin-schema.js";
import type { IAdminDoc } from "@/types/admin-types.js";

AdminSchema.methods.comparePassword = async function (
  this: IAdminDoc,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

AdminSchema.pre("save", async function (next) {
  if (!this.username && this.email) {
    const base = this.email.split("@")[0];
    let candidate = base;
    let count = 1;

    while (await model<IAdminDoc>("Admin").exists({ username: candidate })) {
      candidate = `${base}${count++}`;
    }
    this.username = candidate;
  }

  next();
});

/* 
DO SOMETHING ON ADMIN DELETE EVENT (eg cleanups)

AdminSchema.post("findOneAndDelete", async function (deletedAdmin: IAdminDoc) {
  if (deletedAdmin) {
    await SOME_MODEL.deleteMany({ owner: deletedAdmin._id });
  }
});
*/

const Admin = model<IAdminDoc>("Admin", AdminSchema);

export default Admin;
