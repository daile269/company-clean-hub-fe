import { apiService, ApiResponse } from './api';
import { ApiEmployee, Employee, EmployeeType } from '@/types';

const CLOUDINARY_CLOUD_NAME = 'dcewns7zp';

export interface EmployeePaginationParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface EmployeePaginationResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class EmployeeService {
  // Convert API employee to frontend Employee model
  private mapApiEmployeeToEmployee(apiEmployee: ApiEmployee): Employee {
    // Map backend employmentType to frontend EmployeeType
    let employeeType = EmployeeType.TEMPORARY;
    if (apiEmployee.employmentType === 'FIXED_BY_CONTRACT') {
      employeeType = EmployeeType.FIXED_BY_CONTRACT;
    } else if (apiEmployee.employmentType === 'FIXED_BY_DAY') {
      employeeType = EmployeeType.FIXED_BY_DAY;
    }

    return {
      id: apiEmployee.id.toString(),
      employeeCode: apiEmployee.employeeCode,
      username: apiEmployee.username, // map username from API
      name: apiEmployee.name,
      address: apiEmployee.address,
      phone: apiEmployee.phone,
      email: apiEmployee.email,
      bankAccount: apiEmployee.bankAccount,
      bankName: apiEmployee.bankName,
      idCard: apiEmployee.cccd,
      employeeType,
      status: apiEmployee.status,
      roleName: apiEmployee.roleName,
      monthlySalary: apiEmployee.baseSalary,
      dailySalary: apiEmployee.dailySalary,
      socialInsurance: apiEmployee.socialInsurance,
      healthInsurance: apiEmployee.healthInsurance,
      description: apiEmployee.description || undefined,
      joinDate: apiEmployee.createdAt ? new Date(apiEmployee.createdAt) : new Date(),
      createdAt: apiEmployee.createdAt ? new Date(apiEmployee.createdAt) : new Date(),
      updatedAt: apiEmployee.updatedAt ? new Date(apiEmployee.updatedAt) : new Date(),
    };
  }

  async getAll(params?: EmployeePaginationParams): Promise<EmployeePaginationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    queryParams.append('page', (params?.page ?? 0).toString());
    queryParams.append('pageSize', (params?.pageSize ?? 10).toString());
    
    const response = await apiService.get<any>(`/employees/filter?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      const employees = response.data.content.map((emp: ApiEmployee) => this.mapApiEmployeeToEmployee(emp));
      
      return {
        content: employees,
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

  async getById(id: string): Promise<Employee | null> {
    try {
      const response = await apiService.get<ApiEmployee>(`/employees/${id}`);
      
      if (response.success && response.data) {
        return this.mapApiEmployeeToEmployee(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  }

  async create(employee: Partial<Employee>): Promise<ApiResponse<ApiEmployee>> {
    // Map frontend model to backend EmployeeRequest DTO
    const apiEmployee = {
      username: employee.employeeCode,
      password: employee.password,
      employeeCode: employee.employeeCode,
      roleId: employee.roleId || 2,
      status: employee.status || 'ACTIVE',
      name: employee.name,
      phone: employee.phone,
      cccd: employee.idCard,
      address: employee.address,
      bankAccount: employee.bankAccount,
      bankName: employee.bankName,
      description: employee.description || '',
    };

    return await apiService.post<ApiEmployee>('/employees', apiEmployee);
  }

  async update(id: string, employee: Partial<Employee>): Promise<ApiResponse<ApiEmployee>> {
    // Map frontend model to backend EmployeeRequest DTO
    const apiEmployee = {
      username: employee.username,
      password: employee.password || '123456',
      employeeCode: employee.employeeCode,
      roleId: employee.roleId || 2,
      status: employee.status || 'ACTIVE',
      name: employee.name,
      phone: employee.phone,
      cccd: employee.idCard,
      address: employee.address,
      bankAccount: employee.bankAccount,
      bankName: employee.bankName,
      description: employee.description || '',
    };

    return await apiService.put<ApiEmployee>(`/employees/${id}`, apiEmployee);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/employees/${id}`);
  }

  async getEmployeeImages(id: string): Promise<EmployeeImage[]> {
    try {
      const response = await apiService.get<EmployeeImage[]>(`/employees/${id}/images`);
      
      if (response.success && response.data) {
        console.log('Fetched employee images:', response.data);
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching employee images:', error);
      return [];
    }
  }

  async deleteImage(employeeId: string, imageId: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/employees/${employeeId}/images/${imageId}`);
  }

  async uploadImages(employeeId: string, formData: FormData): Promise<ApiResponse<EmployeeImage[]>> {


    return apiService.postFormData<EmployeeImage[]>(`/employees/${employeeId}/images`, formData);
  }
}

export interface EmployeeImage {
  id: number;
  cloudinaryPublicId: string;
  uploadedAt: string;
}

// Helper functions for Cloudinary image URLs
export const buildCloudinaryUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};

export const getCloudinaryCloudName = (): string => {
  return CLOUDINARY_CLOUD_NAME;
};

export const employeeService = new EmployeeService();
