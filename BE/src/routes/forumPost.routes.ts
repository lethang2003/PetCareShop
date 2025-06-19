import { Router } from "express";
import {
  createPost,
  getKnowledgePosts,
  getForumPosts,
  getPostById,
  updatePost,
  deletePost,
  reactToPost,
  savePost,
  reportPost,
  getStatistics,
} from "../controllers/forumPost.controller";
import { isAuthenticated } from "../middlewares/auth.middlewares";

const router = Router();

router.get("/view-forum-post", getForumPosts);
router.get("/view-knowledge-post", getKnowledgePosts);
router.get("/view-detail-post/:postId", getPostById);
router.post("/create-post", isAuthenticated, createPost);
router.put("/update-post/:postId", isAuthenticated, updatePost);
router.delete("/delete-post/:postId", isAuthenticated, deletePost);
router.post("/reaction-post/:postId", isAuthenticated, reactToPost);
router.post("/save-post/:postId", isAuthenticated, savePost);
router.post("/report-post/:postId", isAuthenticated, reportPost);
router.get("/statistics-forum", getStatistics);
export default router;