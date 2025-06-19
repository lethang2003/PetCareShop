import axios from "axios";
import SummaryApi from "../common/SummarryAPI";
import { baseURL } from "../common/SummarryAPI";

export const getForumPostById = async (id: string) => {
  try {
    const config = SummaryApi.forumPost.getById(id);
    const res = await axios({
      baseURL,
      ...config,
    });
    return res.data;
  } catch (error) {

    throw error;
  }
};

export const getKnowledgePostById = async (id: string) => {
  try {
    const config = SummaryApi.knowledgePost.getById(id);
    const res = await axios({
      baseURL,
      ...config,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getAllForumPosts = async () => {
  try {
    const config = SummaryApi.forumPost.getAll;
    const res = await axios({
      baseURL,
      ...config,
    });
    return res.data;
  } catch (error) {

    throw error;
  }
};

export const getAllKnowledgePosts = async () => {
  try {
    const config = SummaryApi.knowledgePost.getAll;
    const res = await axios({
      baseURL,
      ...config,
    });
    return res.data;
  } catch (error) {
  
    throw error;
  }
};

export const getForumStatistics = async () => {
  try {
    const config = SummaryApi.forumPost.getStatistics;
    const res = await axios({
      baseURL,
      ...config,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const reactToPost = async (postId: string, action: string) => {
  try {
    const config = SummaryApi.forumPost.react(postId);
    const token = localStorage.getItem("accesstoken");
    const res = await axios({
      baseURL,
      ...config,
      data: { action },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {

    throw error;
  }
};

export const createPost = async (data: {
  title: string;
  content: string;
  images?: string[];
  isPublic?: boolean;
  tags?: string[];
}) => {
  try {
    const config = SummaryApi.forumPost.create;
    const token = localStorage.getItem("accesstoken");
    const res = await axios({
      baseURL,
      ...config,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {

    throw error;
  }
};

export const sharePost = async (postId: string, platform: 'facebook' | 'zalo') => {
  try {
    const config = SummaryApi.forumPost.share(postId);
    const token = localStorage.getItem("accesstoken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }
    const res = await axios({
      baseURL,
      ...config,
      data: { platform },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
    throw error;
  }
};

export const updatePost = async (postId: string, data: {
  title: string;
  content: string;
  images?: string[];
  isPublic?: boolean;
  tags?: string[];
}) => {
  try {
    const config = SummaryApi.forumPost.update(postId);
    const token = localStorage.getItem("accesstoken");
    const res = await axios({
      baseURL,
      ...config,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (postId: string) => {
  try {
    const config = SummaryApi.forumPost.delete(postId);
    const token = localStorage.getItem("accesstoken");
    const res = await axios({
      baseURL,
      ...config,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
