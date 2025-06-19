import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummarryAPI";

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
}

export const fetchReviews = async (): Promise<Review[]> => {
  const res = await axios.get(baseURL + SummaryApi.review.getAll.url);
  // Kiểm tra response thực tế
  if (Array.isArray(res.data)) {
    return res.data;
  }
  if (Array.isArray(res.data.data)) {
    return res.data.data;
  }
  if (Array.isArray(res.data.reviews)) {
    return res.data.reviews;
  }
  return [];
};