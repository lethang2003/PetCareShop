import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageCircle,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchForumPosts,
  fetchKnowledgePosts,
  createPostAction,
  setNeedRefresh,
} from "../store/postSlice";
import SidebarForum from "@components/SidebarForum";
import CreatePostModal from "@components/CreatePostModal";

function formatCommentTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;
  return date.toLocaleDateString("en-GB");
}

const Forum: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { forumPosts, knowledgePosts, loading, lastFetchTime, needRefresh } =
    useSelector((state: RootState) => state.posts);
  const [activeCategory, setActiveCategory] = useState(
    location.state?.category || "forum"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const shouldFetch = () => {
      if (needRefresh) return true;
      if (activeCategory === "knowledge" && knowledgePosts.length === 0)
        return true;
      if (activeCategory === "forum" && forumPosts.length === 0) return true;
      if (lastFetchTime && Date.now() - lastFetchTime > 5 * 60 * 1000)
        return true;
      return false;
    };

    if (shouldFetch()) {
      if (activeCategory === "knowledge") {
        dispatch(fetchKnowledgePosts());
      } else {
        dispatch(fetchForumPosts());
      }
    }
  }, [
    activeCategory,
    dispatch,
    knowledgePosts.length,
    forumPosts.length,
    lastFetchTime,
    needRefresh,
  ]);

  const handleCreateSuccess = async (data: {
    title: string;
    content: string;
    images?: string[];
    isPublic?: boolean;
    tags?: string[];
  }) => {
    await dispatch(createPostAction(data));
    if (activeCategory === "knowledge") {
      dispatch(fetchKnowledgePosts());
    } else {
      dispatch(fetchForumPosts());
    }
    setShowCreateModal(false);
  };

  const getCurrentPosts = () => {
    const posts = activeCategory === "knowledge" ? knowledgePosts : forumPosts;
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return posts.slice(indexOfFirstPost, indexOfLastPost);
  };

  const totalPages = Math.ceil(
    (activeCategory === "knowledge"
      ? knowledgePosts.length
      : forumPosts.length) / postsPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5; // Số trang tối đa hiển thị
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Điều chỉnh startPage nếu endPage đạt đến totalPages
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Thêm nút Previous
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    );

    // Thêm nút trang đầu tiên nếu startPage > 1
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
      }
    }

    // Thêm các nút trang
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i ? "bg-[#ffb366] text-white" : "hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    // Thêm nút trang cuối cùng nếu endPage < totalPages
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    // Thêm nút Next
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    );

    return pages;
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto p-4 pt-24">
        <div className="flex-1">
          <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
            <div
              className="px-6 py-2 flex justify-between items-center"
              style={{ backgroundColor: "#ffb366" }}
            >
              <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
              <div className="h-8 w-32 bg-white/20 rounded animate-pulse"></div>
            </div>
            {[1, 2, 3].map((_, idx) => (
              <div
                key={idx}
                className="flex items-center px-6 py-6"
                style={{ backgroundColor: "#fffaf6" }}
              >
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse mr-6"></div>
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-64">
          <div className="border rounded-lg p-4 bg-white shadow-lg">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((_, idx) => (
                <div
                  key={idx}
                  className="h-6 w-full bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto p-4 pt-24">
      <div className="flex-1">
        {activeCategory === "knowledge" && (
          <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
            <div
              className="px-6 py-2 flex justify-between items-center"
              style={{ backgroundColor: "#ffb366" }}
            >
              <h2 className="text-lg font-semibold text-white">Notification</h2>
            </div>
            {getCurrentPosts().map((post, idx) => (
              <div key={post._id}>
                <div
                  className="flex items-center px-6 py-6"
                  style={{ backgroundColor: "#fffaf6" }}
                >
                  {post.userId?.avatar ? (
                    <img
                      src={post.userId.avatar}
                      alt={post.userId?.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 mr-6"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffa726] mr-6 flex items-center justify-center text-white font-bold text-lg">
                      {post.userId?.fullName?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <Link
                      to={`/general/knowledge/${post._id}`}
                      state={{ from: "detail" }}
                    >
                      <div className="text-lg font-medium text-blue-600 hover:underline mb-1">
                        {post.title}
                      </div>
                    </Link>
                    <div className="text-xs text-gray-500 mb-0.5">
                      {post.userId?.fullName} •{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-gray-500 text-sm ml-6">
                    <div
                      className="flex items-center text-gray-500"
                      title={`Views (${post.views || 0})`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views || 0}
                    </div>
                  </div>
                </div>
                {idx !== knowledgePosts.length - 1 && (
                  <div className="border-t" />
                )}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4 border-t">
                {renderPagination()}
              </div>
            )}
          </div>
        )}

        {activeCategory === "forum" && (
          <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
            <div
              className="px-6 py-2 flex justify-between items-center"
              style={{ backgroundColor: "#ffb366" }}
            >
              <h2 className="text-lg font-semibold text-white">
                General Forum
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-[#ffb366] px-4 py-1 rounded-full flex items-center gap-2 hover:bg-opacity-90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
            </div>
            {getCurrentPosts().map((post, idx) => (
              <div key={post._id}>
                <div
                  className="flex items-center px-6 py-6"
                  style={{ backgroundColor: "#fffaf6" }}
                >
                  {post.userId?.avatar ? (
                    <img
                      src={post.userId.avatar}
                      alt={post.userId?.fullName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 mr-6"
                    />
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffa726] mr-6 flex items-center justify-center text-white font-bold text-lg">
                      {post.userId?.fullName?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-center">
                    <Link
                      to={`/general/forum/${post._id}`}
                      state={{ from: "detail" }}
                    >
                      <div className="text-lg font-medium text-blue-600 hover:underline mb-1">
                        {post.title}
                      </div>
                    </Link>

                    <div className="flex items-center justify-between w-full text-xs text-gray-500 mb-0.5">
                      <div>
                        {post.userId?.fullName || "Anonymous"} •{" "}
                        {new Date(post.createdAt).toLocaleDateString("en-GB")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm ml-6">
                    <div className="flex items-center text-gray-500">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.totalComments || 0}
                    </div>
                    <div
                      className="flex items-center text-gray-500"
                      title={`Views (${post.views || 0})`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {post.views || 0}
                    </div>
                    {post.latestCommentUserName && post.latestCommentTime && (
                      <div className="flex flex-col items-center ml-6 min-w-[100px]">
                        <span className="font-bold text-base">
                          {post.latestCommentUserName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatCommentTime(post.latestCommentTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {idx !== forumPosts.length - 1 && <div className="border-t" />}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4 border-t">
                {renderPagination()}
              </div>
            )}
          </div>
        )}
      </div>
      <SidebarForum
        activeCategory={activeCategory}
        onChangeCategory={setActiveCategory}
      />

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        activeCategory={activeCategory}
      />
    </div>
  );
};

export default Forum;
