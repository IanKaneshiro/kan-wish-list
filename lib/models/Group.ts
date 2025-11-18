import mongoose, { Schema, Model, Document } from "mongoose";

// Group interface
export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  members: mongoose.Types.ObjectId[];
  invites: string[]; // Email addresses of pending invites
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Group schema
const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    invites: [{ type: String }], // Array of email addresses
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Group: Model<IGroup> =
  (mongoose.models?.Group as Model<IGroup>) ||
  mongoose.model<IGroup>("Group", GroupSchema);
