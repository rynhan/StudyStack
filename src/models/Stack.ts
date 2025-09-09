import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStack extends Document {
  title: string;
  description: string;
  emoji: string;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const StackSchema = new Schema<IStack>(
  {
    title: { type: String, required: true },
    description: { type: String },
    emoji: { type: String },
    isPublic: { type: Boolean, default: false },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

const StackModel: Model<IStack> =
  mongoose.models.Stack || mongoose.model("Stack", StackSchema);

export default StackModel;
