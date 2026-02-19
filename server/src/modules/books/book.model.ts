import { InferSchemaType, Schema, Types, model } from "mongoose";

const pageSchema = new Schema(
  {
    pageNumber: { type: Number, required: true, min: 1 },
    title: { type: String, trim: true, default: "" },
    text: { type: String, required: true, trim: true, maxlength: 3000 },
    imageUrl: { type: String, trim: true, default: "" },
    narrationUrl: { type: String, trim: true, default: "" }
  },
  { _id: false }
);

const bookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    summary: { type: String, default: "", trim: true, maxlength: 800 },
    coverImageUrl: { type: String, default: "", trim: true },
    ageGroupId: { type: Schema.Types.ObjectId, ref: "AgeGroup", required: true, index: true },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    pages: [pageSchema],
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    visibility: { type: String, enum: ["private", "public"], default: "private" },
    isApproved: { type: Boolean, default: false },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

bookSchema.index({ status: 1, isApproved: 1, visibility: 1 });
bookSchema.index({ slug: 1 }, { unique: true });
bookSchema.index({ title: "text", summary: "text" });

export type BookDocument = InferSchemaType<typeof bookSchema> & {
  _id: Types.ObjectId;
};

export const BookModel = model("Book", bookSchema);
