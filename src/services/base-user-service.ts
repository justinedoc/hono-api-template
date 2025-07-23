import { SALT_ROUNDS } from "@/constants/auth-constants.js";
import { AuthError } from "@/errors/auth-error.js";
import type { AllModels, Roles } from "@/lib/role-utils.js";
import { selectModel } from "@/lib/role-utils.js";
import { generateAuthTokens, verifyRefreshToken } from "@/lib/token-utils.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Types } from "mongoose";
import { BAD_REQUEST, NOT_FOUND } from "stoker/http-status-codes";

export const excludePrivateFields =
  "-refreshToken -comparePassword -password -__v";

type FindableFields = "email" | "username" | "_id";

export class BaseUserService {
  readonly model: ReturnType<typeof selectModel>;
  public role: Roles;

  constructor(role: Roles) {
    this.model = selectModel(role);
    this.role = role;
  }

  async existsByEmail(email: string) {
    return this.model.exists({ email });
  }

  async existsById(id: string) {
    return this.model.exists({ _id: id });
  }

  publicProfile(user: AllModels) {
    const { _id, fullname, email, role, username, profileImg } = user;
    return { id: _id, fullname, email, role, username, profileImg };
  }

  // user queries

  async find(field: FindableFields, value: string) {
    return this.model.findOne({ [field]: value }).select(excludePrivateFields);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).select("-refreshToken -__v");
  }

  async findById(id: string) {
    return this.model.findById(id).select(excludePrivateFields);
  }

  // Password actions

  async hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  get createPasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = Date.now() + 10 * 60 * 1000;

    return { resetToken, resetTokenExp };
  }

  async canResetPassword(id: string, oldPassword: string) {
    const user = await this.model
      .findById(id)
      .select("comparePassword password");

    if (!user) throw new AuthError("User not found", NOT_FOUND);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new AuthError("Incorrect credentials", BAD_REQUEST);

    return user;
  }

  async updatePassword(id: string, newPassword: string, oldPassword: string) {
    await this.canResetPassword(id, oldPassword);

    const hashedPassword = await this.hashPassword(newPassword);

    const user = await this.model
      .findByIdAndUpdate(id, { password: hashedPassword }, { new: true })
      .select(excludePrivateFields);

    if (!user) throw new AuthError("User not found", NOT_FOUND);
    return user;
  }

  async initForgotPassword(user: AllModels) {
    const { resetToken, resetTokenExp } = this.createPasswordResetToken;
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetTokenExp = new Date(resetTokenExp);
    await user.save({ validateBeforeSave: false });
    return resetToken;
  }

  async resetPasswordByToken(user: AllModels, newPassword: string) {
    user.password = await this.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExp = undefined;
    user.refreshToken = [];
    await user.save({ validateBeforeSave: false });
    return this.publicProfile(user);
  }

  // token actions

  async getAuthTokens(user: AllModels) {
    return generateAuthTokens(user._id, user.role, user.permissions);
  }

  async getByIdAndRefreshToken(id: string, token: string) {
    return this.model
      .findOne({ _id: id, refreshToken: token })
      .select(excludePrivateFields);
  }

  async getByRefreshToken(refreshToken: string) {
    return this.model.findOne({
      refreshToken: { $in: [refreshToken] },
    });
  }

  async updateRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string
  ) {
    return this.model.findByIdAndUpdate(
      userId,
      { $addToSet: { refreshToken } },
      { new: true, upsert: true }
    );
  }

  async clearRefreshToken(
    userId: string | Types.ObjectId,
    refreshToken: string
  ) {
    return this.model.findByIdAndUpdate(userId, { $pull: { refreshToken } });
  }

  // refresh token func

  async refreshAuth(refreshToken: string) {
    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      throw new AuthError("Invalid refresh token, please login again");
    }

    const user = await this.getByIdAndRefreshToken(decoded.id, refreshToken);

    if (!user) {
      await this.clearRefreshToken(decoded.id, refreshToken);
      throw new AuthError(
        "Invalid refresh token, please login again. user not found"
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.getAuthTokens(user);

    await Promise.all([
      this.clearRefreshToken(user._id, refreshToken),
      this.updateRefreshToken(user._id, newRefreshToken),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
