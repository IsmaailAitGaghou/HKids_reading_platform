import { InferSchemaType, Schema, Types, model } from "mongoose";

const scheduleWindowSchema = new Schema(
  {
    start: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    end: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }
  },
  { _id: false }
);

const childPolicySchema = new Schema(
  {
    childId: { type: Schema.Types.ObjectId, ref: "Child", required: true, unique: true },
    allowedCategoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    allowedAgeGroupIds: [{ type: Schema.Types.ObjectId, ref: "AgeGroup" }],
    dailyLimitMinutes: { type: Number, min: 1, max: 600, default: 20 },
    schedule: { type: scheduleWindowSchema }
  },
  { timestamps: true }
);

export type ChildPolicyDocument = InferSchemaType<typeof childPolicySchema> & {
  _id: Types.ObjectId;
};

export const ChildPolicyModel = model("ChildPolicy", childPolicySchema);
