import { Request, Response } from "express";
import Comment from "../models/comment.model";
import { AuthRequest } from "../middlewares/auth.middlewares";

// 1. Create a new comment
export const createComment = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { content, parentCommentId } = req.body;
  const userId = req.user?.id;

  try {
    const comment = await Comment.create({
      postId,
      userId: userId,
      content,
      parentCommentId: parentCommentId || null,
    });

    res
      .status(201)
      .json({
        success: true,
        error: false,
        message: "Comment created successfully",
        data: comment,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: true,
        message: "Failed to create comment",
      });
      console.log("lõi", error);
  }
};

//2 . Get all comments by post ID
export const getCommentsByPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    res.json({
      success: true,
      error: false,
      message: "Comments fetched successfully",
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Failed to fetch comments",
    });
  }
};

//3. Get a single comment by ID
export const getCommentById = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
       res.status(404).json({
        success: false,
        error: true,
        message: "Comment not found",
      });
      return;
    }
    res.json({
      success: true,
      error: false,
      message: "Comment fetched successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Failed to fetch comment",
    });
  }
};

//4. Update a comment
export const updateComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;

  try {
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    );
    if (!comment) {
       res.status(404).json({
        success: false,
        error: true,
        message: "Comment not found",
      });
      return;
    }
    res.json({
      success: true,
      error: false,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Failed to update comment",
    });
  }
};

//5. Delete a comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
       res.status(404).json({
        success: false,
        error: true,
        message: "Comment not found",
      });
      return;
    }
    res.json({
      success: true,
      error: false,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Failed to delete comment",
    });
  }
};

//6. React to a comment
export const reactToComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const { action } = req.body;
  const userId = req.user?._id ?? null;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
     res.status(404).json({
        success: false,
        error: true,
        message: "Comment not found",
      });
      return;
    }
    const existingReaction = (comment.reactions ?? []).find(
      (reaction) => reaction.userId.toString() === userId?.toString()
    );

    if (existingReaction) {
      existingReaction.action = action;
    } else {
      if (!comment.reactions) {
        comment.reactions = [];
      }
      comment.reactions.push({
        userId,
        action,
        createdAt: new Date(),
      });
    }
    await comment.save();
    res.json({
      success: true,
      error: false,
      message: "Comment reacted successfully",
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: true,
      message: "Failed to react to comment",
    });
  }
};
