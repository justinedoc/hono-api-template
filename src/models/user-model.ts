import { model } from "mongoose";
import bcrypt from "bcryptjs";
import { UserSchema } from "@/schemas/user-schema.js";
import type { IUserDoc } from "@/types/user-type.js";

UserSchema.methods.comparePassword = async function (
  this: IUserDoc,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre("save", async function (next) {
  if (!this.username && this.email) {
    const base = this.email.split("@")[0];
    let candidate = base;
    let count = 1;

    while (await model<IUserDoc>("User").exists({ username: candidate })) {
      candidate = `${base}${count++}`;
    }
    this.username = candidate;
  }

  next();
});

/* 
DO SOMETHING ON USER DELETE EVENT (eg cleanups)

UserSchema.post("findOneAndDelete", async function (deletedUser: IUserDoc) {
  if (deletedUser) {
    await SOME_MODEL.deleteMany({ user: deletedUser._id });
  }
});
*/

const User = model<IUserDoc>("User", UserSchema);

export default User;
