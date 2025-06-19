import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCommentsByPostId, createComment, reactToComment, updateComment, deleteComment } from "../utils/fetchComment";
import { RootState } from "./store";

interface Comment {
  id: string;
  author: string;
  time: string;
  content: string;
  avatar?: string;
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  replies?: Comment[];
  reactions?: {
    userId: string;
    fullName?: string;
    action: string;
    createdAt: string;
  }[];
  reactionCounts?: {
    like: number;
    love: number;
    haha: number;
    angry: number;
    sad: number;
    wow: number;
  };
  totalReactions?: number;
  userReaction?: string;
}

interface CommentState {
  comments: { [postId: string]: Comment[] };
  loading: boolean;
  error: string | null;
}

const initialState: CommentState = {
  comments: {},
  loading: false,
  error: null
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async (postId: string) => {
    const response = await getCommentsByPostId(postId);
    return { postId, comments: response.data };
  }
);

export const addComment = createAsyncThunk(
  "comments/addComment",
  async (
    { postId, content, parentCommentId }: { postId: string; content: string; parentCommentId?: string },
    { getState }
  ) => {
    const response = await createComment(postId, content, parentCommentId);
    // Lấy user từ state
    const user = (getState() as RootState).user;
    // Gán thông tin user vào comment nếu thiếu
    const comment = {
      ...response.data,
      userId: response.data.userId || {
        _id: user.userId,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      author: response.data.author || user.fullName,
      avatar: response.data.avatar || user.avatar,
    };
    return { postId, comment };
  }
);

export const reactToCommentAction = createAsyncThunk(
  "comments/reactToComment",
  async ({ commentId, action }: { commentId: string; action: string }) => {
    const response = await reactToComment(commentId, action);
    return { commentId, reaction: response.data };
  }
);

export const updateCommentAction = createAsyncThunk(
  "comments/updateComment",
  async ({ commentId, content }: { commentId: string; content: string }) => {
    const response = await updateComment(commentId, content);
    return { commentId, comment: response.data };
  }
);

export const deleteCommentAction = createAsyncThunk(
  "comments/deleteComment",
  async (commentId: string) => {
    await deleteComment(commentId);
    return commentId;
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments[action.payload.postId] = action.payload.comments;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch comments";
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        if (!state.comments[postId]) {
          state.comments[postId] = [];
        }
        state.comments[postId].push(comment);
      })
      .addCase(reactToCommentAction.fulfilled, (state, action) => {
        const { commentId, reaction } = action.payload;
        Object.values(state.comments).forEach(comments => {
          const updateCommentReactions = (comments: Comment[]) => {
            comments.forEach(comment => {
              if (comment.id === commentId) {
                comment.reactions = reaction.reactions;
                comment.reactionCounts = reaction.reactionCounts;
                comment.totalReactions = reaction.totalReactions;
                comment.userReaction = reaction.userReaction;
              }
              if (comment.replies) {
                updateCommentReactions(comment.replies);
              }
            });
          };
          updateCommentReactions(comments);
        });
      })
      .addCase(updateCommentAction.fulfilled, (state, action) => {
        const { commentId, comment } = action.payload;
        Object.values(state.comments).forEach(comments => {
          const updateCommentContent = (comments: Comment[]) => {
            comments.forEach(c => {
              if (c.id === commentId) {
                c.content = comment.content;
              }
              if (c.replies) {
                updateCommentContent(c.replies);
              }
            });
          };
          updateCommentContent(comments);
        });
      })
      .addCase(deleteCommentAction.fulfilled, (state, action) => {
        const commentId = action.payload;
        Object.keys(state.comments).forEach(postId => {
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments.filter(comment => {
              if (comment.id === commentId) {
                return false;
              }
              if (comment.replies) {
                comment.replies = removeComment(comment.replies);
              }
              return true;
            });
          };
          state.comments[postId] = removeComment(state.comments[postId]);
        });
      });
  }
});

export default commentSlice.reducer; 