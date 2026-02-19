import { InferSchemaType, Schema, Types, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: Types.ObjectId;
};

export const CategoryModel = model("Category", categorySchema);
