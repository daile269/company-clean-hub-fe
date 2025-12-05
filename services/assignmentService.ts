import { apiService, ApiResponse } from "./api";
import { Employee } from "@/types";

export interface AssignmentCreateRequest {
  employeeId: number;
  contractId: number;
  startDate: string;
  status?: string;
  salaryAtTime?: number;
  assignmentType?: string;
  additionalAllowance?: number;
  description?: string;
}

export interface Assignment {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  customerId: number;
  customerName?: string;
  customerCode?: string;
  startDate: string;
  endDate?: string;
  status: string;
  salaryAtTime: number;
  workDays: number;
  plannedDays?: number;
  workingDaysPerWeek?: string[];
  additionalAllowance?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  assignmentType?: string;
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

export interface TemporaryReassignmentRequest {
  replacementEmployeeId: number;
  replacedEmployeeId: number;
  dates: string[];
  salaryAtTime?: number;
  description?: string;
}

class AssignmentService {
  async getAll(
    params?: AssignmentPaginationParams
  ): Promise<AssignmentPaginationResponse> {
    const queryParams = new URLSearchParams();

    if (params?.keyword) {
      queryParams.append("keyword", params.keyword);
    }
    queryParams.append("page", (params?.page ?? 0).toString());
    queryParams.append("pageSize", (params?.pageSize ?? 10).toString());

    const response = await apiService.get<any>(
      `/assignments/filter?${queryParams.toString()}`
    );

    if (response.success && response.data) {
      return {
        content: Array.isArray(response.data.content)
          ? response.data.content
          : [],
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
      console.error("Error fetching assignment:", error);
      return null;
    }
  }

  async create(
    data: AssignmentCreateRequest
  ): Promise<ApiResponse<Assignment>> {
    const payload = {
      employeeId: data.employeeId,
      contractId: data.contractId,
      startDate: data.startDate,
      status: data.status || "IN_PROGRESS",
      assignmentType: data.assignmentType,
      salaryAtTime: data.salaryAtTime,
      additionalAllowance: data.additionalAllowance,
      description: data.description || "",
    };

    return await apiService.post<Assignment>("/assignments", payload);
  }

  async getByCustomerId(customerId: string): Promise<Assignment[]> {
    try {
      const response = await apiService.get<any>(
        `/assignments/customer/${customerId}`
      );

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  }

  async getAllByCustomerId(customerId: string): Promise<Assignment[]> {
    try {
      const response = await apiService.get<any>(
        `/assignments/customer/${customerId}/all`
      );

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  }

  async getNotAssignedByCustomerId(
    customerId: string,
    params?: { page?: number; pageSize?: number }
  ): Promise<Employee[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", (params?.page ?? 0).toString());
      queryParams.append("pageSize", (params?.pageSize ?? 100).toString());

      const response = await apiService.get<any>(
        `/assignments/customer/${customerId}/not-assigned?${queryParams.toString()}`
      );

      if (response.success && response.data) {
        return Array.isArray(response.data.content)
          ? response.data.content
          : [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching not assigned employees:", error);
      return [];
    }
  }

  async getByEmployeeId(employeeId: string): Promise<Assignment[]> {
    try {
      const response = await apiService.get<any>(
        `/assignments/employee/${employeeId}`
      );
      if (response.success && response.data) {
        console.log('Assignments response:', response);
        return Array.isArray(response.data) ? response.data : [];
      }

      return [];
    } catch (error) {
      // Improved error logging to capture useful details from API errors
      try {
        const errDetails =
          error && typeof error === "object"
            ? JSON.stringify(error)
            : String(error);
        console.error(
          `Error fetching assignments for employeeId=${employeeId}: ${errDetails}`
        );
      } catch (e) {
        console.error("Error fetching assignments (and failed to stringify error):", error);
      }
      return [];
    }
  }
  async getAssignmentsByEmployeeId(employeeId: string,month: number, year:number): Promise<Assignment[]> {
    try {
      const response = await apiService.get<any>(
        `/assignments/assignments/${employeeId}/${month}/${year}`
      );
      if (response.success && response.data) {
        console.log('Assignments response:', response);
        return Array.isArray(response.data) ? response.data : [];
      }

      return [];
    } catch (error) {
      // Improved error logging to capture useful details from API errors
      try {
        const errDetails =
          error && typeof error === "object"
            ? JSON.stringify(error)
            : String(error);
        console.error(
          `Error fetching assignments for employeeId=${employeeId}: ${errDetails}`
        );
      } catch (e) {
        console.error("Error fetching assignments (and failed to stringify error):", error);
      }
      return [];
    }
  }

  async update(
    id: number,
    data: Partial<AssignmentCreateRequest>
  ): Promise<ApiResponse<Assignment>> {
    return await apiService.put<Assignment>(`/assignments/${id}`, data);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return await apiService.delete<void>(`/assignments/${id}`);
  }

  async temporaryReassignment(
    data: TemporaryReassignmentRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiService.post<any>(
        "/assignments/temporary-reassignment",
        data
      );
      return response;
    } catch (error) {
      console.error("Error creating temporary reassignment:", error);
      throw error;
    }
  }
}

export const assignmentService = new AssignmentService();
