import { apiService } from './api';
import { Contract } from '@/types';

// Interface cho query params phân trang
export interface ContractPaginationParams {
  keyword?: string;
  page: number;
  pageSize: number;
}

// Interface cho response phân trang từ backend
export interface ContractPaginationResponse {
  content: Contract[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Interface cho Service từ backend
export interface ApiService {
  id: number;
  title: string;
  description?: string;
  price: number;
  vat: number;
  createdAt: string;
  updatedAt: string;
}

// Interface cho Contract data từ API (mapping với backend)
export interface ApiContract {
  id: string;
  customerId: string;
  customerName?: string;
  services?: ApiService[];       // Danh sách dịch vụ từ backend
  startDate: string;
  endDate: string;
  finalPrice: number;
  contractType: string;
  workingDaysPerWeek: string[];
  paymentStatus: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Lấy danh sách hợp đồng với phân trang và tìm kiếm
export const getAll = async (params: ContractPaginationParams): Promise<ContractPaginationResponse> => {
  try {
    const { keyword = '', page, pageSize } = params;
    
    const response = await apiService.get<any>(`/contracts/filter?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch contracts');
    }

    // Map API response to Contract type
    const contracts: Contract[] = response.data.content.map((apiContract: ApiContract) => ({
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      services: apiContract.services,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      finalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
      description: apiContract.description,
      createdAt: new Date(apiContract.createdAt),
      updatedAt: new Date(apiContract.updatedAt),
    }));

    return {
      content: contracts,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      currentPage: response.data.page,
      pageSize: response.data.pageSize,
    };
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

// Lấy danh sách hợp đồng theo customerId
export const getByCustomerId = async (customerId: string): Promise<Contract[]> => {
  try {
    const response = await apiService.get<any>(`/contracts/customer/${customerId}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch contracts');
    }

    // Map API response to Contract array
    const contracts: Contract[] = response.data.map((apiContract: ApiContract) => ({
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      services: apiContract.services,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      finalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
      contractType: apiContract.contractType,
      workingDaysPerWeek: apiContract.workingDaysPerWeek,
      description: apiContract.description,
      createdAt: new Date(apiContract.createdAt),
      updatedAt: new Date(apiContract.updatedAt),
    }));

    return contracts;
  } catch (error) {
    console.error('Error fetching contracts by customer:', error);
    throw error;
  }
};

// Lấy chi tiết hợp đồng theo ID
export const getById = async (id: string): Promise<Contract> => {
  try {
    const response = await apiService.get<any>(`/contracts/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch contract');
    }

    const apiContract = response.data;
    
    return {
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      services: apiContract.services,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      plannedDays: apiContract.plannedDays,
      finalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
      contractType: apiContract.contractType,
      workingDaysPerWeek: apiContract.workingDaysPerWeek,
      description: apiContract.description,
      createdAt: new Date(apiContract.createdAt),
      updatedAt: new Date(apiContract.updatedAt),
    };
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

// Lấy thông tin hợp đồng liên quan đến một phân công (assignment)
export const getByAssignmentId = async (assignmentId: number): Promise<any> => {
  try {
    const response = await apiService.get<any>(`/contracts/assignment/${assignmentId}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch contract by assignment id');
    }

    const apiContract = response.data;

    // Normalize/mapping so callers can rely on consistent keys
    const mapped = {
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      services: apiContract.services,
      startDate: apiContract.startDate,
      endDate: apiContract.endDate,
      workingDaysPerWeek: apiContract.workingDaysPerWeek,
      contractType: apiContract.contractType,
      // alias 'type' for older usages
      type: apiContract.contractType,
      finalPrice: apiContract.finalPrice,
      // alias expected by some components
      contractFinalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
      description: apiContract.description,
      // use explicit 'name' field if backend provides one, otherwise fall back to description
      name: apiContract.name ?? apiContract.description ?? `HĐ #${apiContract.id}`,
      // number of working days per week (if provided as array)
      workDays: Array.isArray(apiContract.workingDaysPerWeek) ? apiContract.workingDaysPerWeek.length : undefined,
      createdAt: apiContract.createdAt,
      updatedAt: apiContract.updatedAt,
    };

    return mapped;
  } catch (error) {
    console.error('Error fetching contract by assignment id:', error);
    throw error;
  }
};

// Tạo hợp đồng mới
export const create = async (contractData: any): Promise<Contract> => {
  try {
    // Prepare payload matching backend API requirements
    const payload: any = {
      customerId: Number(contractData.customerId),
      serviceIds: contractData.serviceIds || [],
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      workingDaysPerWeek: contractData.workingDaysPerWeek || [],
      contractType: contractData.contractType || 'ONE_TIME',
      finalPrice: contractData.finalPrice,
      paymentStatus: contractData.paymentStatus || 'PENDING',
      description: contractData.description || '',
    };

    const response = await apiService.post<any>('/contracts', payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create contract');
    }

    const apiContract = response.data;
    
    return {
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      services: apiContract.services,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      finalPrice: apiContract.finalPrice,
      contractType: apiContract.contractType,
      workingDaysPerWeek: apiContract.workingDaysPerWeek,
      paymentStatus: apiContract.paymentStatus,
      description: apiContract.description,
      createdAt: new Date(apiContract.createdAt),
      updatedAt: new Date(apiContract.updatedAt),
    };
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
};

// Cập nhật hợp đồng
export const update = async (id: string, contractData: Partial<Contract>): Promise<Contract> => {
  try {
    // Prepare payload matching backend API requirements
    const payload: any = {};
    
    if (contractData.customerId !== undefined) {
      payload.customerId = Number(contractData.customerId);
    }
    
    if (contractData.serviceIds !== undefined) {
      payload.serviceIds = contractData.serviceIds;
    }
    
    if (contractData.startDate !== undefined) {
      payload.startDate = contractData.startDate instanceof Date 
        ? contractData.startDate.toISOString().split('T')[0]
        : contractData.startDate;
    }
    
    if (contractData.endDate !== undefined) {
      payload.endDate = contractData.endDate instanceof Date
        ? contractData.endDate.toISOString().split('T')[0]
        : contractData.endDate;
    }
    
    if (contractData.finalPrice !== undefined) {
      payload.finalPrice = contractData.finalPrice;
    }
    
    if (contractData.paymentStatus !== undefined) {
      payload.paymentStatus = contractData.paymentStatus;
    }
    
    if (contractData.description !== undefined) {
      payload.description = contractData.description;
    }
    if (contractData.contractType !== undefined) {
      payload.contractType = contractData.contractType;
    }
    if (contractData.workingDaysPerWeek !== undefined) {
      payload.workingDaysPerWeek = contractData.workingDaysPerWeek;
    }
    const response = await apiService.put<any>(`/contracts/${id}`, payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update contract');
    }

    const apiContract = response.data;
    
    return {
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      services: apiContract.services,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      finalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
      contractType: apiContract.contractType,
      workingDaysPerWeek: apiContract.workingDaysPerWeek,
      description: apiContract.description,
      createdAt: new Date(apiContract.createdAt),
      updatedAt: new Date(apiContract.updatedAt),
    };
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};

// Xóa hợp đồng
export const delete_ = async (id: string): Promise<void> => {
  try {
    const response = await apiService.delete<any>(`/contracts/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete contract');
    }
  } catch (error) {
    console.error('Error deleting contract:', error);
    throw error;
  }
};

// Thêm dịch vụ vào hợp đồng
export const addServiceToContract = async (contractId: string, serviceId: number): Promise<void> => {
  try {
    const response = await apiService.post<any>(`/contracts/${contractId}/services/${serviceId}`, {});

    if (!response.success) {
      throw new Error(response.message || 'Failed to add service to contract');
    }
  } catch (error) {
    console.error('Error adding service to contract:', error);
    throw error;
  }
};

const contractService = {
  getAll,
  getById,
  getByCustomerId,
  getByAssignmentId,
  create,
  update,
  delete: delete_,
  addServiceToContract,
};

export default contractService;
