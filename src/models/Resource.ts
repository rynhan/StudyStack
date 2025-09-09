import mongoose, { Schema, Document, Model } from "mongoose";

export interface Resource extends Document {
  studyStackId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  resourceType: "youtube" | "webpage" | "document" | "image";
  // status to track user's progress on this resource
  // 'reference' means not intended to be learned (default)
  status: "reference" | "todo" | "inprogress" | "done";
  resourceUrl: string;
  embedUrl?: string;
  filePath?: string;
  userNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<Resource>(
  {
    studyStackId: { type: Schema.Types.ObjectId, ref: "StudyStack", required: true },
    title: { type: String, required: true },
    description: { type: String },
    resourceType: { type: String, enum: ["youtube", "webpage", "document", "image"], required: true },
  status: { type: String, enum: ["reference", "todo", "inprogress", "done"], default: "reference" },
    resourceUrl: { type: String, required: true },
    embedUrl: { type: String },
    filePath: { type: String },
    userNotes: { type: String },
  },
  { timestamps: true }
);

const ResourceModel: Model<Resource> =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

export default ResourceModel;
