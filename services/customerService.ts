import { apiService, ApiResponse } from './api';
import { Customer } from '@/types';
import { Contract } from '@/types';

export interface CustomerPaginationParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerPaginationResponse {
  content: Customer[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ApiCustomer {
  id: number;
  customerCode: string;
  username?: string;
  password?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  contactInfo?: string;          // Map to contactPerson
  taxCode?: string;
  company?: string;
  status?: string;
  description?: string;
  roleId?: number;
  createdAt?: string;
  updatedAt?: string;
}

class CustomerService {
  // Convert API customer to frontend Customer model
  private mapApiCustomerToCustomer(apiCustomer: ApiCustomer): Customer {
    return {
      id: apiCustomer.id.toString(),
      code: apiCustomer.customerCode,
      username: apiCustomer.username,
      name: apiCustomer.name,
      address: apiCustomer.address,
      phone: apiCustomer.phone,
      email: apiCustomer.email,
      contactPerson: apiCustomer.contactInfo,  // Map contactInfo -> contactPerson
      taxCode: apiCustomer.taxCode,
      company: apiCustomer.company,
      status: apiCustomer.status,
      description: apiCustomer.description,
      createdAt: apiCustomer.createdAt ? new Date(apiCustomer.createdAt) : new Date(),
      updatedAt: apiCustomer.updatedAt ? new Date(apiCustomer.updatedAt) : new Date(),
    };
  }

  async getAll(params?: CustomerPaginationParams): Promise<CustomerPaginationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    queryParams.append('page', (params?.page ?? 0).toString());
    queryParams.append('pageSize', (params?.pageSize ?? 10).toString());
    
    const response = await apiService.get<any>(`/customers/filter?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      const customers = response.data.content.map((cust: ApiCustomer) => this.mapApiCustomerToCustomer(cust));
      
      return {
        content: customers,
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

  async getById(id: string): Promise<Customer | null> {
    try {
      const response = await apiService.get<ApiCustomer>(`/customers/${id}`);
      
      if (response.success && response.data) {
        return this.mapApiCustomerToCustomer(response.data);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  }

  async create(customer: Partial<Customer>): Promise<ApiResponse<ApiCustomer>> {
    const apiCustomer = {
      customerCode: customer.code,
      // Use the customer code as the login username (same as employees)
      username: customer.code,
      password: customer.password,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      contactInfo: customer.contactPerson,  // Map contactPerson -> contactInfo
      taxCode: customer.taxCode,
      company: customer.company,
      status: customer.status || 'ACTIVE',
      description: customer.description,
      roleId: 1,  // Fixed roleId for customer
    };

    return await apiService.post<ApiCustomer>('/customers', apiCustomer);
  }

  async update(id: string, customer: Partial<Customer>): Promise<ApiResponse<ApiCustomer>> {
    const apiCustomer = {
      customerCode: customer.code,
      // Keep username synced to code
      username: customer.code,
      password: customer.password || '123456',  // Default password if not provided
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      contactInfo: customer.contactPerson,  // Map contactPerson -> contactInfo
      taxCode: customer.taxCode,
      company: customer.company,
      status: customer.status || 'ACTIVE',
      description: customer.description,
      roleId: 1,  // Fixed roleId for customer
    };

    return await apiService.put<ApiCustomer>(`/customers/${id}`, apiCustomer);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/customers/${id}`);
  }

  // Xuất danh sách khách hàng và hợp đồng ra file Excel với merge cells
  async exportCustomersWithContractsToExcel(): Promise<void> {
    try {
      const blob = await apiService.getFile(`/customers/export/excel`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Danh sách khách hàng.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting customers to Excel:', error);
      throw error;
    }
  }

  // Generate mã khách hàng tự động
  async generateCustomerCode(): Promise<string> {
    try {
      const response = await apiService.get<string>('/customers/generate-code');
      if (response.success && response.data) {
        return response.data;
      }
      return "";
    } catch (error) {
      console.error("Error generating customer code:", error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();
