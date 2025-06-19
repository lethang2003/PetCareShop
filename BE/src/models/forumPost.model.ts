import { Schema, model, Types, Document } from "mongoose";

interface Reaction {
  userId: Types.ObjectId;
  action: "like" | "love" | "haha" | "angry" | "sad" | "wow";
  createdAt: Date;
}

export interface ForumPost extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  images: string[];
  isPublic: boolean;
  tags: string[];
  reactions: Reaction[];
  savedBy: Types.ObjectId[];
  reports: Types.ObjectId[];
  userRole: string;
  isDeleted: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const reactionSchema = new Schema<Reaction>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    action: {
      type: String,
      required: true,
      enum: ["like", "love", "haha", "angry", "sad", "wow"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const forumPostSchema = new Schema<ForumPost>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    isPublic: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    reactions: { type: [reactionSchema], default: [] },
    savedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reports: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    userRole: { type: String, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<ForumPost>("ForumPost", forumPostSchema);
