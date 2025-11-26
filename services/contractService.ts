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

// Interface cho Contract data từ API (mapping với backend)
export interface ApiContract {
  id: string;
  customerId: string;
  customerName?: string;
  serviceIds?: number[];
  serviceNames?: string[];
  startDate: string;
  endDate: string;
  basePrice: number;
  vat: number;
  total: number;
  extraCost: number;
  discountCost: number;
  finalPrice: number;
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
      serviceIds: apiContract.serviceIds,
      serviceNames: apiContract.serviceNames,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      basePrice: apiContract.basePrice,
      vat: apiContract.vat,
      total: apiContract.total,
      extraCost: apiContract.extraCost,
      discountCost: apiContract.discountCost,
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
      serviceIds: apiContract.serviceIds,
      serviceNames: apiContract.serviceNames,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      basePrice: apiContract.basePrice,
      vat: apiContract.vat,
      total: apiContract.total,
      extraCost: apiContract.extraCost,
      discountCost: apiContract.discountCost,
      finalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
      description: apiContract.description,
      createdAt: new Date(apiContract.createdAt),
      updatedAt: new Date(apiContract.updatedAt),
    };
  } catch (error) {
    console.error('Error fetching contract:', error);
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
      basePrice: contractData.basePrice,
      vat: contractData.vat,
      total: contractData.total,
      extraCost: contractData.extraCost || 0,
      discountCost: contractData.discountCost || 0,
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
      serviceIds: apiContract.serviceIds,
      serviceNames: apiContract.serviceNames,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      basePrice: apiContract.basePrice,
      vat: apiContract.vat,
      total: apiContract.total,
      extraCost: apiContract.extraCost,
      discountCost: apiContract.discountCost,
      finalPrice: apiContract.finalPrice,
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
    
    if (contractData.basePrice !== undefined) {
      payload.basePrice = contractData.basePrice;
    }
    
    if (contractData.vat !== undefined) {
      payload.vat = contractData.vat;
    }
    
    if (contractData.total !== undefined) {
      payload.total = contractData.total;
    }
    
    if (contractData.extraCost !== undefined) {
      payload.extraCost = contractData.extraCost;
    }
    
    if (contractData.discountCost !== undefined) {
      payload.discountCost = contractData.discountCost;
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

    const response = await apiService.put<any>(`/contracts/${id}`, payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update contract');
    }

    const apiContract = response.data;
    
    return {
      id: apiContract.id,
      customerId: apiContract.customerId,
      customerName: apiContract.customerName,
      serviceIds: apiContract.serviceIds,
      serviceNames: apiContract.serviceNames,
      startDate: new Date(apiContract.startDate),
      endDate: new Date(apiContract.endDate),
      basePrice: apiContract.basePrice,
      vat: apiContract.vat,
      total: apiContract.total,
      extraCost: apiContract.extraCost,
      discountCost: apiContract.discountCost,
      finalPrice: apiContract.finalPrice,
      paymentStatus: apiContract.paymentStatus,
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

const contractService = {
  getAll,
  getById,
  create,
  update,
  delete: delete_,
};

export default contractService;
