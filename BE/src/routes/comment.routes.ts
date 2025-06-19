import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middlewares";
import {
  createComment,
  deleteComment,
  getCommentsByPost,
  reactToComment,
  updateComment,
} from "../controllers/comment.controller";

const router = Router();

router.get("/view-comments/:postId", getCommentsByPost);
router.post("/create-comment/:postId", isAuthenticated, createComment);
router.put("/update-comment/:commentId", isAuthenticated, updateComment);
router.delete("/delete-comment/:commentId", isAuthenticated, deleteComment);
router.post("/reaction-comment/:commentId", isAuthenticated, reactToComment);

export default router;
