import mongoose, { Schema, Model, Document } from "mongoose";

// Notification interface
export interface INotification {
  _id?: mongoose.Types.ObjectId;
  message: string;
  type: "claim" | "unclaim" | "funding" | "item_edit" | "group_invite";
  itemId?: mongoose.Types.ObjectId;
  wishlistId?: mongoose.Types.ObjectId;
  groupId?: mongoose.Types.ObjectId;
  fromUserId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

// User interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  image?: string;
  groups: mongoose.Types.ObjectId[];
  wishlist?: mongoose.Types.ObjectId;
  notifications: INotification[];
  settings: {
    emailNotifications: boolean;
    reduceMotion: boolean;
  };
  paymentInfo?: {
    venmo?: string;
    paypal?: string;
    zelle?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Notification schema
const NotificationSchema = new Schema<INotification>({
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["claim", "unclaim", "funding", "item_edit", "group_invite"],
    required: true,
  },
  itemId: { type: Schema.Types.ObjectId, ref: "Item" },
  wishlistId: { type: Schema.Types.ObjectId, ref: "Wishlist" },
  groupId: { type: Schema.Types.ObjectId, ref: "Group" },
  fromUserId: { type: Schema.Types.ObjectId, ref: "User" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true },
    image: { type: String },
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    wishlist: { type: Schema.Types.ObjectId, ref: "Wishlist" },
    notifications: [NotificationSchema],
    settings: {
      emailNotifications: { type: Boolean, default: false },
      reduceMotion: { type: Boolean, default: false },
    },
    paymentInfo: {
      venmo: { type: String },
      paypal: { type: String },
      zelle: { type: String },
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  (mongoose.models?.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
