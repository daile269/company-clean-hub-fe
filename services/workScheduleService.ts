import { apiService } from "./api";

export interface WorkScheduleResponse {
  id: number;
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  contractId?: number;
  scheduledDate: string;
  status: "SCHEDULED" | "VERIFIED" | "MISSED" | "CANCELLED";
  statusDescription: string;
  reason: "NEW_EMPLOYEE_VERIFICATION" | "CONTRACT_REQUIREMENT";
  reasonDescription: string;
  assignmentVerificationId?: number;
  verificationImageId?: number;
  attendanceId?: number;
  photoCapturedAt?: string;
  canCapturePhoto: boolean;
  attendanceDeleted: boolean;
  syncNote?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkScheduleStatsResponse {
  total: number;
  verified: number;
  missed: number;
  scheduled: number;
  cancelled: number;
  verifiedPercentage: number;
  missedPercentage: number;
  scheduledPercentage: number;
}

export interface EmployeeScheduleSummary {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  totalSchedules: number;
  verifiedCount: number;
  missedCount: number;
  scheduledCount: number;
}

export interface WorkScheduleContractSummary {
  contractId: number;
  contractCode: string;
  customerName: string;
  customerId: number;
  totalEmployees: number;
  totalSchedules: number;
  verifiedCount: number;
  missedCount: number;
  scheduledCount: number;
  verifiedPercentage: number;
}

export interface VerificationImageData {
  id: number;
  verificationId?: number;
  employeeId: number;
  attendanceId?: number;
  cloudinaryPublicId: string;
  cloudinaryUrl: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  capturedAt: string;
  faceConfidence?: number;
  imageQualityScore?: number;
  createdAt: string;
}

export interface WorkScheduleCaptureRequest {
  workScheduleId: number;
  imageBase64: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  faceConfidence?: number;
  imageQualityScore?: number;
}

const workScheduleService = {
  getContractsSummary: async (month?: number, year?: number, sort?: string): Promise<WorkScheduleContractSummary[]> => {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    if (sort) params.append("sort", sort);
    const response = await apiService.get<WorkScheduleContractSummary[]>(`/work-schedules/contracts-summary?${params}`);
    return response.data ?? [];
  },

  getEmployeesWithSchedules: async (month?: number, year?: number): Promise<EmployeeScheduleSummary[]> => {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    const response = await apiService.get<EmployeeScheduleSummary[]>(`/work-schedules/employees-with-schedules?${params}`);
    return response.data ?? [];
  },

  getByAssignment: async (assignmentId: number): Promise<WorkScheduleResponse[]> => {
    const response = await apiService.get<WorkScheduleResponse[]>(`/work-schedules/assignment/${assignmentId}`);
    return response.data ?? [];
  },

  getByEmployee: async (employeeId: number, startDate: string, endDate: string): Promise<WorkScheduleResponse[]> => {
    const response = await apiService.get<WorkScheduleResponse[]>(
      `/work-schedules/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data ?? [];
  },

  getByDateRange: async (startDate: string, endDate: string, employeeId?: number, status?: string): Promise<WorkScheduleResponse[]> => {
    const params = new URLSearchParams({ startDate, endDate });
    if (employeeId) params.append("employeeId", employeeId.toString());
    if (status) params.append("status", status);
    const response = await apiService.get<WorkScheduleResponse[]>(`/work-schedules/by-date-range?${params}`);
    return response.data ?? [];
  },

  getStats: async (month?: number, year?: number, employeeId?: number): Promise<WorkScheduleStatsResponse> => {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    if (employeeId) params.append("employeeId", employeeId.toString());
    const response = await apiService.get<WorkScheduleStatsResponse>(`/work-schedules/stats?${params}`);
    return response.data;
  },

  getImageByWorkScheduleId: async (workScheduleId: number): Promise<VerificationImageData | null> => {
    try {
      const response = await apiService.get<VerificationImageData>(`/work-schedules/${workScheduleId}/image`);
      return response.data ?? null;
    } catch {
      return null;
    }
  },

  createAttendance: async (id: number, reason: string): Promise<WorkScheduleResponse> => {
    const response = await apiService.post<WorkScheduleResponse>(
      `/work-schedules/${id}/create-attendance?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },

  capturePhoto: async (request: WorkScheduleCaptureRequest): Promise<WorkScheduleResponse> => {
    const response = await apiService.post<WorkScheduleResponse>(`/work-schedules/capture`, request);
    return response.data;
  },

  getMissed: async (month?: number, year?: number): Promise<WorkScheduleResponse[]> => {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    const response = await apiService.get<WorkScheduleResponse[]>(`/work-schedules/missed?${params}`);
    return response.data ?? [];
  },

  cancel: async (id: number, reason: string): Promise<WorkScheduleResponse> => {
    const response = await apiService.put<WorkScheduleResponse>(
      `/work-schedules/${id}/cancel?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },
};

export default workScheduleService;
