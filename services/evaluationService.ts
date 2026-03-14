import { apiService, ApiResponse } from "./api";

export interface Evaluation {
  id?: number;
  attendanceId: number;
  employeeId?: number;
  employeeName?: string;
  evaluatedByUsername?: string;
  status: 'PENDING' | 'APPROVED';
  internalNotes?: string;
  evaluatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationRequest {
  attendanceId: number;
  employeeId?: number;
  status: 'PENDING' | 'APPROVED';
  internalNotes?: string;
}

const evaluationService = {
  evaluate: async (data: EvaluationRequest): Promise<ApiResponse<Evaluation>> => {
    return await apiService.post<Evaluation>("/v1/evaluations", data);
  },

  getByAttendanceId: async (attendanceId: number): Promise<ApiResponse<Evaluation>> => {
    return await apiService.get<Evaluation>(`/v1/evaluations/attendance/${attendanceId}`);
  },
};

export default evaluationService;
