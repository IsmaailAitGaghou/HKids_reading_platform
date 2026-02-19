import { InferSchemaType, Schema, Types, model } from "mongoose";
import { ROLES } from "../../types/auth";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: [ROLES.ADMIN, ROLES.PARENT], default: ROLES.PARENT },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export const UserModel = model("User", userSchema);
