import { apiService } from './api';

// Interface cho Service từ API
export interface ApiService {
  id: number;
  title: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Interface cho query params phân trang
export interface ServicePaginationParams {
  keyword?: string;
  page: number;
  pageSize: number;
}

// Interface cho response phân trang từ backend
export interface ServicePaginationResponse {
  content: ApiService[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Lấy danh sách dịch vụ với phân trang và tìm kiếm
export const getAll = async (params: ServicePaginationParams): Promise<ServicePaginationResponse> => {
  try {
    const { keyword = '', page, pageSize } = params;
    
    const response = await apiService.get<any>(`/services/filter?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch services');
    }

    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.page,
      pageSize: response.data.pageSize,
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Lấy chi tiết dịch vụ theo ID
export const getById = async (id: string): Promise<ApiService> => {
  try {
    const response = await apiService.get<any>(`/services/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch service');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
};

// Interface cho ServiceRequest matching backend DTO
export interface ServiceRequest {
  title: string;
  description?: string;
  price: number;
}

// Tạo dịch vụ mới
export const create = async (serviceData: ServiceRequest): Promise<ApiService> => {
  try {
    const payload = {
      title: serviceData.title,
      description: serviceData.description || '',
      price: serviceData.price,
    };

    const response = await apiService.post<any>('/services', payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create service');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

// Cập nhật dịch vụ
export const update = async (id: string, serviceData: any): Promise<ApiService> => {
  try {
    const payload: any = {};
    
    if (serviceData.title !== undefined) {
      payload.title = serviceData.title;
    }
    
    if (serviceData.description !== undefined) {
      payload.description = serviceData.description;
    }
    
    if (serviceData.price !== undefined) {
      payload.price = serviceData.price;
    }
    const response = await apiService.put<any>(`/services/${id}`, payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update service');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

// Xóa dịch vụ
export const delete_ = async (id: string): Promise<void> => {
  try {
    const response = await apiService.delete<any>(`/services/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete service');
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

const serviceService = {
  getAll,
  getById,
  create,
  update,
  delete: delete_,
};

export default serviceService;
