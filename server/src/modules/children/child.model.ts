import { InferSchemaType, Schema, Types, model } from "mongoose";

const childSchema = new Schema(
  {
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 2, max: 17 },
    avatar: { type: String, default: "", trim: true },
    ageGroupId: { type: Schema.Types.ObjectId, ref: "AgeGroup" },
    pinHash: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

childSchema.index({ parentId: 1, name: 1 });

export type ChildDocument = InferSchemaType<typeof childSchema> & {
  _id: Types.ObjectId;
};

export const ChildModel = model("Child", childSchema);
