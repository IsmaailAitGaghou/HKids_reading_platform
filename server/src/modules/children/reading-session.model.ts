import { InferSchemaType, Schema, Types, model } from "mongoose";

const progressEventSchema = new Schema(
  {
    pageIndex: { type: Number, required: true, min: 0 },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const readingSessionSchema = new Schema(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true, index: true },
    startedAt: { type: Date, required: true, default: Date.now },
    endedAt: { type: Date },
    minutes: { type: Number, min: 0, default: 0 },
    pagesRead: [{ type: Number, min: 0 }],
    progressEvents: [progressEventSchema]
  },
  { timestamps: true }
);

readingSessionSchema.index({ childId: 1, startedAt: -1 });
readingSessionSchema.index({ bookId: 1, startedAt: -1 });

export type ReadingSessionDocument = InferSchemaType<typeof readingSessionSchema> & {
  _id: Types.ObjectId;
};

export const ReadingSessionModel = model("ReadingSession", readingSessionSchema);
