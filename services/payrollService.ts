import { apiService } from './api';

export interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  employmentType: string;
  month: number;
  year: number;
  totalDays: number;
  salaryBase: number;
  bonusTotal: number;
  penaltyTotal: number;
  advanceTotal: number;
  allowanceTotal: number;
  insuranceTotal: number;
  finalSalary: number;
  isPaid: boolean;
  paymentDate: string | null;
  accountantId: number | null;
  accountantName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollFilterParams {
  keyword?: string;
  month?: number;
  year?: number;
  isPaid?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PayrollResponse {
  content: Payroll[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

const payrollService = {
  // Lấy danh sách bảng lương với phân trang và filter
  getPayrolls: async (params: PayrollFilterParams = {}): Promise<PayrollResponse> => {
    try {
      const {
        keyword = "",
        month,
        year,
        isPaid,
        page = 0,
        pageSize = 10,
      } = params;

      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append("keyword", keyword);
      if (month !== undefined) queryParams.append("month", month.toString());
      if (year !== undefined) queryParams.append("year", year.toString());
      if (isPaid !== undefined) queryParams.append("isPaid", isPaid.toString());
      queryParams.append("page", page.toString());
      queryParams.append("pageSize", pageSize.toString());

      const response = await apiService.get<any>(`/payrolls/filter?${queryParams.toString()}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payrolls');
      }

      return {
        content: response.data.content,
        page: response.data.page,
        pageSize: response.data.pageSize,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        first: response.data.first,
        last: response.data.last,
      };
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      throw error;
    }
  },

  // Lấy chi tiết bảng lương
  getPayrollById: async (id: number): Promise<Payroll> => {
    try {
      const response = await apiService.get<any>(`/payrolls/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payroll');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching payroll:', error);
      throw error;
    }
  },

  // Tạo bảng lương mới
  createPayroll: async (data: Partial<Payroll>): Promise<Payroll> => {
    try {
      const response = await apiService.post<any>("/payrolls", data);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create payroll');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating payroll:', error);
      throw error;
    }
  },

  // Cập nhật bảng lương
  updatePayroll: async (id: number, data: Partial<Payroll>): Promise<Payroll> => {
    try {
      const response = await apiService.put<any>(`/payrolls/${id}`, data);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update payroll');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating payroll:', error);
      throw error;
    }
  },

  // Xóa bảng lương
  deletePayroll: async (id: number): Promise<void> => {
    try {
      const response = await apiService.delete<any>(`/payrolls/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete payroll');
      }
    } catch (error) {
      console.error('Error deleting payroll:', error);
      throw error;
    }
  },

  // Thanh toán lương
  markAsPaid: async (id: number): Promise<Payroll> => {
    try {
      const response = await apiService.put<any>(`/payrolls/${id}/pay`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to mark payroll as paid');
      }

      return response.data;
    } catch (error) {
      console.error('Error marking payroll as paid:', error);
      throw error;
    }
  },
};

export default payrollService;
