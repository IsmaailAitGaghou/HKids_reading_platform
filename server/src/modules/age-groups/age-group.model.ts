import { InferSchemaType, Schema, Types, model } from "mongoose";

const ageGroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    minAge: { type: Number, required: true, min: 0, max: 17 },
    maxAge: { type: Number, required: true, min: 0, max: 17 },
    description: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ageGroupSchema.index({ name: 1 }, { unique: true });
ageGroupSchema.index({ minAge: 1, maxAge: 1, isActive: 1 });

export type AgeGroupDocument = InferSchemaType<typeof ageGroupSchema> & {
  _id: Types.ObjectId;
};

export const AgeGroupModel = model("AgeGroup", ageGroupSchema);
