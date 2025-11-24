import { apiService, ApiResponse } from './api';

export interface AssignmentCreateRequest {
  employeeId: number;
  customerId: number;
  startDate: string;
  status: string;
  salaryAtTime: number;
  workDays: number;
  description?: string;
}

export interface Assignment {
  id: number;
  employeeId: number;
  employeeName?: string;
  customerId: number;
  customerName?: string;
  startDate: string;
  endDate?: string;
  status: string;
  salaryAtTime: number;
  workDays: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentPaginationParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface AssignmentPaginationResponse {
  content: Assignment[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class AssignmentService {
  async getAll(params?: AssignmentPaginationParams): Promise<AssignmentPaginationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    queryParams.append('page', (params?.page ?? 0).toString());
    queryParams.append('pageSize', (params?.pageSize ?? 10).toString());
    
    const response = await apiService.get<any>(`/assignments/filter?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      return {
        content: Array.isArray(response.data.content) ? response.data.content : [],
        totalElements: response.data.totalElements || 0,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.number || 0,
        pageSize: response.data.size || 10,
      };
    }
    
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10,
    };
  }

  async getById(id: number): Promise<Assignment | null> {
    try {
      const response = await apiService.get<Assignment>(`/assignments/${id}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return null;
    }
  }

  async create(data: AssignmentCreateRequest): Promise<ApiResponse<Assignment>> {
    const payload = {
      employeeId: data.employeeId,
      customerId: data.customerId,
      startDate: data.startDate,
      status: data.status || 'ACTIVE',
      salaryAtTime: data.salaryAtTime,
      workDays: data.workDays,
      description: data.description || '',
    };

    return await apiService.post<Assignment>('/assignments', payload);
  }

  async getByCustomerId(customerId: string): Promise<Assignment[]> {
    try {
      const response = await apiService.get<any>(`/assignments/customer/${customerId}`);
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  async getByEmployeeId(employeeId: string): Promise<Assignment[]> {
    try {
      const response = await apiService.get<any>(`/assignments/employee/${employeeId}`);
      
      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }

  async update(id: number, data: Partial<AssignmentCreateRequest>): Promise<ApiResponse<Assignment>> {
    return await apiService.put<Assignment>(`/assignments/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/assignments/${id}`);
  }
}

export const assignmentService = new AssignmentService();
