import SummaryApi, { baseURL } from "../common/SummarryAPI";


export interface Service {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  link: string;
  price:number;
  clinicId: string;
  category: string;
}


/* Hàm fetch tất cả dịch vụ từ Backend */
export const fetchServiceCarousel = async (): Promise<Service[]> => {
  try {
    const response = await fetch(baseURL + SummaryApi.services.getAll.url);
    const result = await response.json();


    if (result.success) {
      return result.data.map((service: any) => ({
        id: service._id,
        name: service.name,
        description: service.description,
        imageUrl: service.imageUrl,
        category: service.category,
        price: service.price,
        link: `/service/view-detail-service/${service._id}`,
      }));
    } else {
      console.error("Failed to fetch services:", result.message);
      return [];
    }
  } catch {
    return [];
  }
};


export const fetchServiceById = async (id: string): Promise<Service | null> => {
  try {
    const { url, method } = SummaryApi.services.getById(id);
    const response = await fetch(baseURL + url, { method });
    const result = await response.json();


    if (result.success) {
      const service = result.data;
      return {
        id: service._id,
        name: service.name,
        description: service.description,
        imageUrl: service.imageUrl,
        link: `/service/view-detail-service/${service._id}`,
        clinicId: service.clinicId,
        price: service.price,
        category: service.category,
      };
    } else {
      return null;
    }
  } catch {
    return null;
  }
};