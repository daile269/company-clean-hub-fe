import { apiService } from './api';

// Interface cho Attendance từ API
export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  assignmentId: number;
  customerId: number;
  customerName: string;
  date: string;
  workHours: number;
  bonus: number;
  penalty: number;
  supportCost: number;
  isOvertime: boolean;
  overtimeAmount: number;
  approvedBy: number | null;
  approvedByName: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Interface cho query params phân trang
export interface AttendancePaginationParams {
  keyword?: string;
  month?: number;
  year?: number;
  page: number;
  pageSize: number;
}

// Interface cho response phân trang từ backend
export interface AttendancePaginationResponse {
  content: Attendance[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Lấy danh sách attendance với phân trang và filter
export const getAll = async (params: AttendancePaginationParams): Promise<AttendancePaginationResponse> => {
  try {
    const { keyword = '', month, year, page, pageSize } = params;
    
    let url = `/attendances/filter?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`;
    
    if (month !== undefined) {
      url += `&month=${month}`;
    }
    if (year !== undefined) {
      url += `&year=${year}`;
    }

    const response = await apiService.get<any>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendances');
    }

    return {
      content: Array.isArray(response.data.content) ? response.data.content : [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      currentPage: response.data.page || page,
      pageSize: response.data.pageSize || pageSize,
    };
  } catch (error) {
    console.error('Error fetching attendances:', error);
    throw error;
  }
};

// Lấy danh sách attendance của 1 nhân viên theo tháng/năm kèm phân trang
export const getByEmployeeAndMonth = async (
  employeeId: string | number,
  params: { month?: number; year?: number; page?: number; pageSize?: number }
): Promise<AttendancePaginationResponse> => {
  try {
    const month = params.month;
    const year = params.year;
    const page = params.page ?? 0;
    const pageSize = params.pageSize ?? 10;

    let url = `/attendances/employee/${employeeId}?page=${page}&pageSize=${pageSize}`;
    if (month !== undefined) url += `&month=${month}`;
    if (year !== undefined) url += `&year=${year}`;

    const response = await apiService.get<any>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendances by employee');
    }

    return {
      content: Array.isArray(response.data.content) ? response.data.content : [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      currentPage: response.data.page || page,
      pageSize: response.data.pageSize || pageSize,
    };
  } catch (error) {
    console.error('Error fetching attendances by employee:', error);
    throw error;
  }
};

// Lấy danh sách attendance theo assignmentId với phân trang và filter tháng/năm
export const getByAssignmentId = async (
  assignmentId: string | number,
  params: { month?: number; year?: number; page?: number; pageSize?: number }
): Promise<AttendancePaginationResponse> => {
  try {
    const month = params.month;
    const year = params.year;
    const page = params.page ?? 0;
    const pageSize = params.pageSize ?? 20;

    let url = `/assignments/${assignmentId}/attendances?page=${page}&pageSize=${pageSize}`;
    if (month !== undefined) url += `&month=${month}`;
    if (year !== undefined) url += `&year=${year}`;

    const response = await apiService.get<any>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendances by assignment');
    }

    return {
      content: Array.isArray(response.data.content) ? response.data.content : [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      currentPage: response.data.page ?? page,
      pageSize: response.data.pageSize ?? pageSize,
    };
  } catch (error) {
    console.error('Error fetching attendances by assignment:', error);
    throw error;
  }
};

// Lấy chi tiết attendance theo ID
export const getById = async (id: string): Promise<Attendance> => {
  try {
    const response = await apiService.get<any>(`/attendances/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch attendance');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

// Tạo attendance mới
export const create = async (attendanceData: Partial<Attendance>): Promise<Attendance> => {
  try {
    const response = await apiService.post<any>('/attendances', attendanceData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create attendance');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating attendance:', error);
    throw error;
  }
};

// Cập nhật attendance
export const update = async (id: string, attendanceData: Partial<Attendance>): Promise<Attendance> => {
  try {
    const response = await apiService.put<any>(`/attendances/${id}`, attendanceData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update attendance');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

// Xóa attendance
export const deleteAttendance = async (id: string): Promise<void> => {
  try {
    const response = await apiService.delete<any>(`/attendances/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete attendance');
    }
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};

const attendanceService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteAttendance,
  getByEmployeeAndMonth,
  getByAssignmentId,
};

export default attendanceService;
