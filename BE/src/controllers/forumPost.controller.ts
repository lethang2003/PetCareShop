import { Request, Response } from "express";
import ForumPost from "../models/forumPost.model";
import { AuthRequest } from "../middlewares/auth.middlewares";
import userModel from "../models/user.model";
import Comment from "../models/comment.model"; // Import the Comment model
// Create a new post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, images, isPublic, tags } = req.body;
    const userId = req.user?.id;

    if (!title || !content) {
      res.status(400).json({ message: " title, and content are required" });
      return;
    }

    const newPost = new ForumPost({
      userId: userId,
      userRole: req.user?.role,
      title,
      content,
      images,
      isPublic,
      tags,
    });

    await newPost.save();
    res.status(201).json({
      message: "Post created successfully",
      success: true,
      error: false,
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while creating post",
      error: true,
      success: false,
    });
  }
};

export const getForumPosts = async (req: Request, res: Response) => {
  try {
    const posts = await ForumPost.find({
      userRole: "customer",
      isDeleted: false,
    })
      .populate("userId", "fullName")
      .lean();
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const latestComment = await Comment.findOne({ postId: post._id })
          .sort({ createdAt: -1 })
          .populate("userId", "fullName")
          .lean();

        return {
          ...post,
          latestCommentUserName:
            (latestComment?.userId as any)?.fullName || null,
          latestCommentTime: latestComment?.createdAt || null,
        };
      })
    );

    res.json({
      message: "Posts fetched successfully",
      success: true,
      error: false,
      data: enrichedPosts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching posts",
      error: true,
      success: false,
    });
  }
};

// GET /view-knowledge-posts
export const getKnowledgePosts = async (req: Request, res: Response) => {
  try {
    const posts = await ForumPost.find({ userRole: "staff", isDeleted: false })
      .populate("userId", "fullName") 
      .select("title content createdAt userId") 
      .lean(); 
    ;
    res.json({
      message: "Posts fetched successfully",
      success: true,
      error: false,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching posts",
      error: true,
      success: false,
    });
  }
};

// Get a post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    // Tăng lượt xem bài viết và lấy thông tin người đăng bài
    const post = await ForumPost.findByIdAndUpdate(
      req.params.postId,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("userId", "fullName"); // Lấy tên người đăng bài

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    // Tìm comment mới nhất liên kết với bài viết
    const latestComment = await Comment.findOne({ postId: post._id })
      .sort({ createdAt: -1 }) // Lấy comment mới nhất
      .populate("userId", "fullName") // Lấy tên người comment
      .lean();

    res.json({
      message: "Post fetched successfully",
      success: true,
      error: false,
      data: {
        ...post.toObject(),
        latestCommentUserName: (latestComment?.userId as any)?.fullName || null, // Tên người comment cuối cùng
        latestCommentTime: latestComment?.createdAt || null, // Thời gian comment cuối cùng
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching the post",
      error: true,
      success: false,
    });
  }
};

// Update a post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content, images, isPublic, tags } = req.body;
    const post = await ForumPost.findByIdAndUpdate(
      req.params.postId,
      {
        title,
        content,
        images,
        isPublic,
        tags,
      },
      { new: true }
    );

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.json({
      message: "Post updated successfully",
      success: true,
      error: false,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while updating the post",
      error: true,
      success: false,
    });
  }
};

// Delete a post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    const userId = req.user?._id ?? null;

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    if (post.userId.toString() !== userId.toString()) {
      res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
      return;
    }

    post.isDeleted = true;
    await post.save();

    res.json({
      message: "Post deleted successfully (soft delete)",
      success: true,
      error: false,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while deleting the post",
      error: true,
      success: false,
    });
  }
};

export const reactToPost = async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;
  const { action } = req.body;
  const userId = req.user?._id ?? null;

  try {
    const post = await ForumPost.findById(postId);
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }

    const existingIndex = post.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIndex !== -1) {
      if (post.reactions[existingIndex].action === action) {
        post.reactions.splice(existingIndex, 1);
      } else {
        post.reactions[existingIndex].action = action;
      }
    } else {
      post.reactions.push({ userId, action, createdAt: new Date() });
    }

    await post.save();
    res.json({
      success: true,
      message: "Reaction updated",
      data: post.reactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const savePost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    const userId = req.user?._id ?? null;

    if (!post) {
      res
        .status(404)
        .json({ success: false, error: true, message: "Not found" });
      return;
    }
    const isSaved = post.savedBy.includes(userId);
    if (isSaved) {
      post.savedBy = post.savedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      post.savedBy.push(userId);
    }
    await post.save();
    res.json({ success: true, error: false, data: post.savedBy });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: true, message: "Failed to save post" });
  }
};

export const reportPost = async (req: AuthRequest, res: Response) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    const userId = req.user?._id ?? null;

    if (!post || post.isDeleted) {
      res
        .status(404)
        .json({ success: false, error: true, message: "Not found" });
      return;
    }
    if (!post.reports.includes(userId)) {
      post.reports.push(userId);
      if (post.reports.length >= 5) {
        post.isDeleted = true;
      }

      await post.save();
    }

    res.json({ success: true, error: false, message: "Reported" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: true, message: "Failed to report" });
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const totalPosts = await ForumPost.countDocuments({
      isDeleted: false,
      userRole: "customer",
    });
    const totalUsers = await userModel.countDocuments({ role: "customer" });
    const newestUser = await userModel
      .findOne({ role: "customer" })
      .sort({ createdAt: -1 })
      .select("fullName");
    res.json({
      message: "Statistics fetched successfully",
      success: true,
      error: false,
      data: {
        totalPosts,
        totalUsers,
        newestUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching statistics",
      error: true,
      success: false,
    });
  }
};
