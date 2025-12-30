import { apiService } from './api';
import { CustomerAssignment, CustomerAssignmentRequest, Customer } from '@/types';

/**
 * Service để quản lý phân công khách hàng cho managers
 */
const customerAssignmentService = {
    /**
     * Phân công khách hàng cho manager
     */
    assignCustomer: async (request: CustomerAssignmentRequest): Promise<CustomerAssignment> => {
        const response = await apiService.post<CustomerAssignment>('/customer-assignments', request);
        return response.data;
    },

    /**
     * Hủy phân công khách hàng
     */
    revokeAssignment: async (managerId: number, customerId: number): Promise<void> => {
        await apiService.delete(`/customer-assignments?managerId=${managerId}&customerId=${customerId}`);
    },

    /**
     * Lấy danh sách khách hàng được phân công cho một manager (có phân trang)
     */
    getAssignedCustomers: async (
        managerId: number,
        keyword?: string,
        page: number = 0,
        pageSize: number = 10
    ): Promise<{ content: Customer[]; totalElements: number; totalPages: number; currentPage: number; pageSize: number; first: boolean; last: boolean }> => {
        let queryString = `/customer-assignments/manager/${managerId}/customers?page=${page}&pageSize=${pageSize}`;
        if (keyword) {
            queryString += `&keyword=${encodeURIComponent(keyword)}`;
        }
        const response = await apiService.get<any>(queryString);
        return response.data;
    },

    /**
     * Lấy danh sách khách hàng của user hiện tại (có phân trang)
     */
    getMyAssignedCustomers: async (params?: {
        keyword?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{ content: Customer[]; totalElements: number; totalPages: number; currentPage: number; pageSize: number; first: boolean; last: boolean }> => {
        const { keyword = '', page = 0, pageSize = 10 } = params || {};
        let queryString = `/customer-assignments/my-customers?page=${page}&pageSize=${pageSize}`;
        if (keyword) {
            queryString += `&keyword=${encodeURIComponent(keyword)}`;
        }
        const response = await apiService.get<any>(queryString);
        return response.data;
    },

    /**
     * Lấy danh sách phân công của một manager
     */
    getAssignmentsByManager: async (managerId: number): Promise<CustomerAssignment[]> => {
        const response = await apiService.get<CustomerAssignment[]>(`/customer-assignments/manager/${managerId}`);
        return response.data;
    },

    /**
     * Lấy danh sách manager được phân công cho một customer
     */
    getAssignmentsByCustomer: async (customerId: number): Promise<CustomerAssignment[]> => {
        const response = await apiService.get<CustomerAssignment[]>(`/customer-assignments/customer/${customerId}`);
        return response.data;
    },
};

export default customerAssignmentService;
