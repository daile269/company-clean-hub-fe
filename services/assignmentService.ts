// Assignment service (class-based) lives below; do not redeclare here.
import { apiService, ApiResponse } from "./api";
import { Employee } from "@/types";

export interface AssignmentCreateRequest {
  employeeId: number;
  contractId?: number | null;  // Optional for COMPANY scope
  startDate: string;
  scope?: string;  // "CONTRACT" or "COMPANY"
  status?: string;
  salaryAtTime?: number;
  assignmentType?: string;
  additionalAllowance?: number;
  workingDaysPerWeek?: string[];  // Required for COMPANY scope
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
  // Backend additional fields
  contractId?: number;
  contractDescription?: string;
  scope?: string; // "CONTRACT" or "COMPANY"
  // Optional nested contract object if backend returns it
  contract?: {
    id?: number;
    name?: string;
    type?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    finalPrice?: number;
  };
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

export interface EmployeePaginationResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface TemporaryReassignmentRequest {
  replacementEmployeeId: number;
  replacedEmployeeId: number;
  replacedAssignmentId: number; // ID phân công của nhân viên bị thay (để xác định chính xác attendance cần điều động)
  dates: string[];
  salaryAtTime?: number;
  description?: string;
}

export interface AssignmentHistory {
  historyId: number;
  replacedEmployeeName: string;
  replacedEmployeeCode: string;
  replacementEmployeeName: string;
  replacementEmployeeCode: string;
  customerName: string;
  reassignmentDates: string[];
  status: string; // ACTIVE, ROLLED_BACK
  createdByName: string;
  createdAt: string;
  rolledBackAt?: string;
}

export interface RollbackResponse {
  historyId: number;
  oldAssignmentId: number;
  newAssignmentId: number;
  affectedDates: string[];
  message: string;
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
      scope: data.scope,
      status: data.status || "IN_PROGRESS",
      assignmentType: data.assignmentType,
      salaryAtTime: data.salaryAtTime,
      additionalAllowance: data.additionalAllowance,
      workingDaysPerWeek: data.workingDaysPerWeek,
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

  async getAllByCustomerId(
    customerId: string,
    params?: {
      contractType?: string;
      status?: string;
      month?: number;
      year?: number;
      page?: number;
      pageSize?: number;
      contractId?: number;
    }
  ): Promise<Assignment[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.contractId) {
        queryParams.append("contractId", params.contractId.toString());
      }
      if (params?.contractType) {
        queryParams.append("contractType", params.contractType);
      }
      if (params?.status) {
        queryParams.append("status", params.status);
      }
      if (params?.month) {
        queryParams.append("month", params.month.toString());
      }
      if (params?.year) {
        queryParams.append("year", params.year.toString());
      }
      queryParams.append("page", (params?.page ?? 0).toString());
      queryParams.append("pageSize", (params?.pageSize ?? 10).toString());

      const response = await apiService.get<any>(
        `/assignments/customer/${customerId}/by-contract?${queryParams.toString()}`
      );
      console.log('Assignments by customer (by-contract) response:', response);
      
      if (response.success && response.data) {
        // Return grouped data instead of flattening
        return Array.isArray(response.data.content) ? response.data.content : [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    }
  }

  async getNotAssignedByCustomerId(
    customerId: string,
    params?: {
      page?: number;
      pageSize?: number;
      month?: number;
      year?: number;
      keyword?: string;
      employmentType?: string;
    }
  ): Promise<EmployeePaginationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.keyword) {
        queryParams.append("keyword", params.keyword);
      }
      queryParams.append("page", (params?.page ?? 0).toString());
      queryParams.append("pageSize", (params?.pageSize ?? 100).toString());
      if (params?.month) {
        queryParams.append("month", params.month.toString());
      }
      if (params?.year) {
        queryParams.append("year", params.year.toString());
      }
      if (params?.employmentType) {
        queryParams.append("employmentType", params.employmentType);
      }

      const response = await apiService.get<any>(
        `/assignments/customer/${customerId}/not-assigned?${queryParams.toString()}`
      );

      if (response.success && response.data) {
        // If backend returns a raw array
        if (Array.isArray(response.data)) {
          return {
            content: response.data,
            totalElements: response.data.length,
            totalPages: 1,
            currentPage: 0,
            pageSize: response.data.length,
          };
        }

        const content = Array.isArray(response.data.content)
          ? response.data.content
          : [];

        return {
          content,
          totalElements: response.data.totalElements ?? 0,
          totalPages: response.data.totalPages ?? 0,
          currentPage: response.data.number ?? 0,
          pageSize: response.data.size ?? (params?.pageSize ?? 100),
        };
      }

      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params?.pageSize ?? 100,
      };
    } catch (error) {
      console.error("Error fetching not assigned employees:", error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: params?.pageSize ?? 100,
      };
    }
  }

  async getByContractMonthYear(
    contractId: number,
    month?: number,
    year?: number,
    page = 0,
    pageSize = 10,
    status?: string
  ): Promise<AssignmentPaginationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (month !== undefined) queryParams.append('month', String(month));
      if (year !== undefined) queryParams.append('year', String(year));
      if (status) queryParams.append('status', status);
      queryParams.append('page', String(page));
      queryParams.append('pageSize', String(pageSize));

      const response = await apiService.get<any>(
        `/assignments/contract/${contractId}?${queryParams.toString()}`
      );

      if (response.success && response.data) {
        // Normalize to AssignmentPaginationResponse shape.
        const content = Array.isArray(response.data.content)
          ? response.data.content
          : Array.isArray(response.data.items)
          ? response.data.items
          : Array.isArray(response.data)
          ? response.data
          : [];

        const totalElementsRaw = response.data.totalElements ?? response.data.total ?? (content.length || 0);
        const totalElements = Number(totalElementsRaw);

        const totalPagesRaw = response.data.totalPages ?? Math.ceil(totalElements / pageSize) ?? 0;
        const totalPages = Number(totalPagesRaw);

        const currentPage = Number(response.data.page ?? response.data.number ?? page ?? 0);

        const resolvedPageSize = Number(response.data.pageSize ?? response.data.size ?? pageSize ?? 10);

        return {
          content,
          totalElements,
          totalPages,
          currentPage,
          pageSize: resolvedPageSize,
        };
      }

      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: pageSize,
      };
    } catch (error) {
      console.error('Error fetching assignments by contract:', error);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: pageSize,
      };
    }
  }

  async getByEmployeeId(
    employeeId: string,
    params?: {
      customerId?: number;
      month?: number;
      year?: number;
      page?: number;
      pageSize?: number;
    }
  ): Promise<AssignmentPaginationResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.customerId) {
        queryParams.append("customerId", params.customerId.toString());
      }
      if (params?.month) {
        queryParams.append("month", params.month.toString());
      }
      if (params?.year) {
        queryParams.append("year", params.year.toString());
      }
      queryParams.append("page", (params?.page ?? 0).toString());
      queryParams.append("pageSize", (params?.pageSize ?? 10).toString());

      const response = await apiService.get<any>(
        `/assignments/employee/${employeeId}?${queryParams.toString()}`
      );
      
      if (response.success && response.data) {
        console.log('Assignments response:', response);
        return {
          content: Array.isArray(response.data.content) ? response.data.content : [],
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
          currentPage: response.data.page || 0,
          pageSize: response.data.pageSize || 10,
        };
      }

      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
      };
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
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
      };
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

  async getHistoryByContractId(contractId: number): Promise<AssignmentHistory[]> {
    try {
      const response = await apiService.get<any>(
        `/assignments/history/contract/${contractId}`
      );

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }

      return [];
    } catch (error) {
      console.error("Error fetching assignment history:", error);
      return [];
    }
  }

  async getHistoryByCustomerId(
    customerId: string,
    params?: {
      contractId?: number;
      page?: number;
      pageSize?: number;
    }
  ): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.contractId) {
        queryParams.append("contractId", params.contractId.toString());
      }
      if (params?.page !== undefined) {
        queryParams.append("page", params.page.toString());
      }
      if (params?.pageSize) {
        queryParams.append("pageSize", params.pageSize.toString());
      }

      const response = await apiService.get<any>(
        `/assignments/history/customer/${customerId}?${queryParams.toString()}`
      );

      if (response.success && response.data) {
        return {
          content: response.data.content || [],
          page: response.data.page || 0,
          pageSize: response.data.pageSize || 10,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0,
        };
      }

      return {
        content: [],
        page: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
      };
    } catch (error) {
      console.error("Error fetching assignment history by customer:", error);
      return {
        content: [],
        page: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
      };
    }
  }

  async rollbackHistory(historyId: number): Promise<ApiResponse<RollbackResponse>> {
    try {
      const response = await apiService.post<RollbackResponse>(
        `/assignments/history/${historyId}/rollback`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Error rolling back assignment:", error);
      throw error;
    }
  }
}

export const assignmentService = new AssignmentService();
