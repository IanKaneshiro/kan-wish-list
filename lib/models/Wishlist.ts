import mongoose, { Schema, Model, Document } from "mongoose";

// Claim interface for item contributors
export interface IClaim {
  userId: mongoose.Types.ObjectId;
  pledge: number;
  isBuyer: boolean;
  paidAt?: Date;
  createdAt: Date;
}

// Item interface (embedded subdocument)
export interface IItem {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price?: number;
  link?: string;
  order: number;
  claims: IClaim[];
  status: "available" | "claimed" | "purchased";
  createdAt: Date;
  updatedAt: Date;
}

// Wishlist interface
export interface IWishlist extends Document {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  groupId: mongoose.Types.ObjectId;
  items: IItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Claim schema
const ClaimSchema = new Schema<IClaim>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pledge: { type: Number, default: 0 },
  isBuyer: { type: Boolean, default: false },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Item schema (embedded)
const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    link: { type: String },
    order: { type: Number, default: 0 },
    claims: [ClaimSchema],
    status: {
      type: String,
      enum: ["available", "claimed", "purchased"],
      default: "available",
    },
  },
  { timestamps: true }
);

// Wishlist schema
const WishlistSchema = new Schema<IWishlist>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: false,
      index: true,
    },
    items: [ItemSchema],
  },
  { timestamps: true }
);

export const Wishlist: Model<IWishlist> =
  (mongoose.models?.Wishlist as Model<IWishlist>) ||
  mongoose.model<IWishlist>("Wishlist", WishlistSchema);
