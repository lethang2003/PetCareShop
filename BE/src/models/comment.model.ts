import { Schema, model, Types, Document } from "mongoose";

interface Reaction {
  userId: Types.ObjectId;
  action: "like" | "love" | "haha" | "angry" | "sad" | "wow";
  createdAt: Date;
}

export interface Comment extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  parentCommentId?: Types.ObjectId;
  reactions?: Reaction[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<Comment>(
  {
    postId: { type: Schema.Types.ObjectId, required: true, ref: "ForumPost" },
    userId: { type: Schema.Types.ObjectId,  ref: "User" },
    content: { type: String, required: true },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        action: {
          type: String,
          enum: ["like", "love", "haha", "angry", "sad", "wow"],
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model<Comment>("Comment", commentSchema);
