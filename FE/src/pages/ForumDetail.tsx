import Comments from "@components/Comments";
import PostDetail from "@components/PostDetail";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchForumPostById,
  reactToPostAction,
  resetCurrentPost,
} from "../store/postSlice";
import { fetchComments } from "../store/commentSlice";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Axios from "@utils/Axios";
import SummaryApi from "@common/SummarryAPI";
import LoadingSpinner from "@components/LoadingSpinner";
import toast from "react-hot-toast";

const ForumDetail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { currentPost, loading: postLoading } = useSelector(
    (state: RootState) => state.posts
  );
  const { comments, loading: commentsLoading } = useSelector(
    (state: RootState) => state.comments
  );
  const user = useSelector((state: RootState) => state.user);
  const [userDetails, setUserDetails] = useState<any>(null);

  const checkLogin = () => {
    if (!user.userId) {
      toast.error("Please login to perform this action!");
      return false;
    }
    return true;
  };

  // Chỉ fetch post và comment khi id thay đổi
  useEffect(() => {
    if (!id) return;
    dispatch(resetCurrentPost());
    const fetchData = async () => {
      try {
        await dispatch(fetchForumPostById(id));
        await dispatch(fetchComments(id));
      } catch (err) {}
    };
    fetchData();
  }, [id, dispatch]);

  // Fetch user details khi currentPost thay đổi
  useEffect(() => {
    if (currentPost?.userId?._id) {
      const fetchUserDetails = async () => {
        try {
          const userRes = await Axios({
            ...SummaryApi.userDetails(currentPost.userId._id),
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accesstoken")}`,
            },
          });
          setUserDetails(userRes.data.data);
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
      };
      fetchUserDetails();
    }
  }, [currentPost?.userId?._id]);

  if (postLoading || commentsLoading) return <LoadingSpinner />;

  if (!postLoading && !commentsLoading && !currentPost) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Post not found</h2>
        <Link
          to="/general"
          state={{ category: "forum" }}
          className="text-blue-600 hover:underline"
        >
          Back to General Forum
        </Link>
      </div>
    );
  }

  const postComments = comments[id] || [];

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto p-2 pt-24">
      <div className="flex-1">
        <PostDetail
          post={{
            title: currentPost.title,
            content: currentPost.content,
            author: currentPost.userId.fullName,
            userId: currentPost.userId._id,
            date: new Date(currentPost.createdAt).toLocaleString(),
            comments: postComments.length.toString(),
            views: currentPost.views?.toString() || "0",
            reactions: currentPost.reactions || [],
            reactionCounts: currentPost.reactionCounts || {},
            totalReactions: currentPost.totalReactions || 0,
            images: currentPost.images || [],
            avatar: userDetails?.avatar,
            tags: currentPost.tags || [],
          }}
          breadcrumb={["Home", "Forum", currentPost.title]}
          postId={currentPost._id}
          type="forum"
          onReaction={() => checkLogin()}
          onComment={() => checkLogin()}
        />
        <Comments
          comments={postComments}
          postId={currentPost._id}
          onReaction={() => checkLogin()}
          onReply={() => checkLogin()}
        />
      </div>
    </div>
  );
};

export default ForumDetail;
