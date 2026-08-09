import { apiService } from './api';

export type PayrollStatus = 'UNPAID' | 'PARTIAL_PAID' | 'PAID';

export interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  employmentType?: string; month: number;
  year: number;
  totalDays: number;
  salaryBase?: number;
  bonusTotal: number;
  penaltyTotal: number;
  // [DEPRECATED] Replaced by advanceNoteSummary (compiled from Assignment.advanceNote)
  // advanceTotal: number;
  allowanceTotal: number;
  insuranceTotal: number;
  finalSalary: number;
  baseSalary?: number;
  monthlySupportTotal?: number; // Task 12: Tổng hỗ trợ hàng tháng
  advanceNoteSummary?: number; // Task 15: Tổng tiền ứng lương từ các assignment
  status: PayrollStatus;  // Changed from isPaid
  paidAmount: number;     // New field
  remainingAmount: number; // New field
  paymentDate: string | null;
  accountantId: number | null;
  accountantName: string | null;
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface PayrollCalculateRequest {
  employeeId?: number;  // Optional - if not provided, calculate for all employees
  month: number;
  year: number;
  insuranceAmount?: number;  // Bảo hiểm (có thể null)
  // [DEPRECATED] Replaced by advanceNoteSummary from Assignment.advanceNote
  // advanceSalary?: number;    // Tiền ứng lương (có thể null)
}

export interface PayrollUpdateRequest {
  insuranceTotal?: number;
  // [DEPRECATED] Replaced by advanceNoteSummary
  // advanceTotal?: number;
}

export interface PayrollFilterParams {
  keyword?: string;
  month?: number;
  year?: number;
  isPaid?: boolean;
  sortBy?: 'employeeName' | 'employeeCode' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PayrollAssignmentResponse {
  payrollId: number;
  employeeId: number;
  employeeName: string;
  bankName: string;
  bankAccount: string;
  phone: string;
  assignmentType: string | null;
  projectCompany: string | null;
  baseSalary: number | null;
  assignmentDays: number | null;
  assignmentPlanedDays: number | null;
  assignmentBonus: number | null;
  assignmentPenalty: number | null;
  assignmentAllowance: number | null;
  monthlySupport: number | null;
  assignmentInsurance: number | null;
  assignmentAdvance: number | null;
  assignmentSalary: number | null;
  companyAllowance: number | null;
  totalDays: number | null;
  totalPlanedDays: number | null;
  totalBonus: number | null;
  totalPenalty: number | null;
  totalAllowance: number | null;
  totalInsurance: number | null;
  totalAdvance: number | null;
  finalSalary: number | null;
  isTotalRow: boolean;
  note?: string;
}

export interface PayrollAssignmentFilterParams {
  keyword?: string;
  month?: number;
  year?: number;
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

// Payroll Summary (new API: GET /api/payrolls/summary)
export interface PayrollSummaryItem {
  payrollId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  month: number;
  year: number;
  updatedAt: string;
  advanceNote: number | null;
  totalSalary: number;
  paidAmount: number;
  remainingAmount: number;
}

// Payment Request (POST /api/payrolls/{id}/payment)
export interface PaymentRequest {
  amount: number;
}

export interface PayrollOverview {
  totalPayrolls: number;
  paidPayrolls: number;
  unpaidPayrolls: number;
  partialPaidPayrolls: number;
  totalFinalSalary: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
}

export interface PaymentHistory {
  id: number;
  payrollId: number;
  paymentDate: string;
  amount: number;
  installmentNumber: number;
  createdAt: string;
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
        sortBy,
        sortDirection,
        page = 0,
        pageSize = 10,
      } = params;

      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append("keyword", keyword);
      if (month !== undefined) queryParams.append("month", month.toString());
      if (year !== undefined) queryParams.append("year", year.toString());
      if (isPaid !== undefined) queryParams.append("isPaid", isPaid.toString());
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortDirection) queryParams.append("sortDirection", sortDirection);
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

  // Lấy bảng lương tổng hợp (new API: GET /api/payrolls/summary)
  getPayrollSummary: async (month?: number, year?: number): Promise<PayrollSummaryItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (month !== undefined) queryParams.append("month", month.toString());
      if (year !== undefined) queryParams.append("year", year.toString());

      const response = await apiService.get<any>(`/payrolls/summary?${queryParams.toString()}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payroll summary');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching payroll summary:', error);
      throw error;
    }
  },

  // Lấy tổng quan bảng lương cho trang quản lý
  getPayrollOverview: async (params: Omit<PayrollFilterParams, 'page' | 'pageSize' | 'sortBy' | 'sortDirection'> = {}): Promise<PayrollOverview> => {
    try {
      const {
        keyword = "",
        month,
        year,
        isPaid,
      } = params;

      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append("keyword", keyword);
      if (month !== undefined) queryParams.append("month", month.toString());
      if (year !== undefined) queryParams.append("year", year.toString());
      if (isPaid !== undefined) queryParams.append("isPaid", isPaid.toString());

      const response = await apiService.get<any>(`/payrolls/overview?${queryParams.toString()}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payroll overview');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching payroll overview:', error);
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
  exportExcel: async (month: number, year: number) => {
    console.log("2 Exporting Excel file...");
    const blob = await apiService.getFile(`/payrolls/export/excel/${month}/${year}`);
    console.log("Exporting Excel file...");
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    console.log("link: ", link);
    link.href = url;
    link.download = `Bảng lương: ${month}/${year}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
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

  // Cập nhật thanh toán lương (trả sớm hoặc trả đủ)
  // @deprecated Use processPayment instead for the new payment API
  updatePaymentStatus: async (id: number, paidAmount: number): Promise<Payroll> => {
    try {
      const response = await apiService.put<any>(`/payrolls/${id}/payment-status?paidAmount=${paidAmount}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update payment status');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Thanh toán lương (new API: POST /api/payrolls/{id}/payment)
  processPayment: async (id: number, data: PaymentRequest): Promise<Payroll> => {
    try {
      const response = await apiService.post<any>(`/payrolls/${id}/payment`, data);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to process payment');
      }

      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Lấy cảnh báo thanh toán (new API: GET /api/payrolls/{id}/payment-warning)
  getPaymentWarning: async (id: number, amount: number): Promise<string | null> => {
    try {
      const response = await apiService.get<any>(`/payrolls/${id}/payment-warning?amount=${amount}`);

      if (!response.success) {
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Error fetching payment warning:', error);
      return null;
    }
  },

  // Tính lương cho nhân viên (hoặc tất cả nếu không có employeeId)
  calculatePayroll: async (data: PayrollCalculateRequest): Promise<PayrollAssignmentResponse[]> => {
    try {
      const response = await apiService.post<any>("/payrolls/calculate", data);
      console.log("response calculatePayroll12321321321:", response);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to calculate payroll');
      }

      return response.data;
    } catch (error) {
      console.error('Error calculating payroll:', error);
      throw error;
    }
  },

  // Lấy danh sách bảng lương theo assignment với filter và phân trang
  getPayrollAssignments: async (params: PayrollAssignmentFilterParams = {}): Promise<{
    content: PayrollAssignmentResponse[];
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  }> => {
    try {
      const {
        keyword = "",
        month,
        year,
        page = 0,
        pageSize = 10,
      } = params;

      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append("keyword", keyword);
      if (month !== undefined) queryParams.append("month", month.toString());
      if (year !== undefined) queryParams.append("year", year.toString());
      queryParams.append("page", page.toString());
      queryParams.append("pageSize", pageSize.toString());

      const response = await apiService.get<any>(`/payrolls/assignments/filter?${queryParams.toString()}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payroll assignments');
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
      console.error('Error fetching payroll assignments:', error);
      throw error;
    }
  },

  // Cập nhật và tính lại bảng lương
  recalculatePayroll: async (id: number, data: PayrollUpdateRequest): Promise<Payroll> => {
    try {
      const response = await apiService.put<any>(`/payrolls/${id}/recalculate`, data);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to recalculate payroll');
      }

      return response.data;
    } catch (error) {
      console.error('Error recalculating payroll:', error);
      throw error;
    }
  },

  // Lấy lịch sử thanh toán
  getPaymentHistory: async (payrollId: number): Promise<PaymentHistory[]> => {
    try {
      const response = await apiService.get<any>(`/payrolls/${payrollId}/payment-history`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payment history');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  },

  // Lấy chi tiết payroll cho các assignment (for employee view)
  getAssignmentPayrollDetails: async (
    employeeId: number,
    month: number,
    year: number
  ): Promise<import('@/types').AssignmentPayrollDetail[]> => {
    try {
      const response = await apiService.get<any>(
        `/payrolls/employee/${employeeId}/assignment-details?month=${month}&year=${year}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch assignment payroll details');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching assignment payroll details:', error);
      throw error;
    }
  },

  // Lấy danh sách các năm có dữ liệu payroll
  getDistinctYears: async (): Promise<number[]> => {
    try {
      const response = await apiService.get<any>('/payrolls/years');

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch payroll years');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching payroll years:', error);
      throw error;
    }
  },
};

export default payrollService;
