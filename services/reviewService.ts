import { apiService } from './api';

export interface ApiReview {
  id: number | string;
  contractId?: number;
  assignmentId?: number;
  customerId?: number;
  customerName?: string;
  contractDescription?: string;
  employeeId?: number;
  employeeName?: string;
  employeeCode?: string;
  employeeRole?: string;
  reviewId?: string;
  reviewName?: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewerRole?: string;
  rating?: number;
  comment?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  contractId?: number;
  assignmentId?: number;
  customerId?: number;
  customerName?: string;
  contractDescription?: string;
  employeeId?: number;
  employeeName?: string;
  employeeCode?: string;
  employeeRole?: string;
  rating?: number;
  comment?: string;
  createdBy?: string;
  reviewId?: string;
  reviewName?: string;
  reviewerId?: number;
  reviewerName?: string;
  reviewerRole?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface ReviewPaginationParams {
  contractId?: number;
  assignmentId?: number;
  customerId?: number;
  employeeId?: number;
  page?: number;
  pageSize?: number;
}

export interface ReviewPaginationResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

class ReviewService {
  private mapApiReview(a: ApiReview): Review {
    return {
      id: String(a.id),
      contractId: a.contractId,
      assignmentId: a.assignmentId,
      customerId: a.customerId,
      customerName: a.customerName,
      contractDescription: a.contractDescription,
      employeeId: a.employeeId,
      employeeName: a.employeeName,
      employeeCode: a.employeeCode,
      employeeRole: a.employeeRole,
      reviewerId: a.reviewerId ?? (a.reviewId ? Number(a.reviewId) : undefined),
      reviewerName: a.reviewerName ?? a.reviewName,
      reviewerRole: a.reviewerRole,
      rating: a.rating,
      comment: a.comment,
      createdBy: a.createdBy,
      createdAt: a.createdAt ? new Date(a.createdAt) : null,
      updatedAt: a.updatedAt ? new Date(a.updatedAt) : null,
    };
  }

  async getAll(params?: ReviewPaginationParams): Promise<ReviewPaginationResponse> {
    const q = new URLSearchParams();
    if (params?.contractId !== undefined) q.append('contractId', String(params.contractId));
    if (params?.assignmentId !== undefined) q.append('assignmentId', String(params.assignmentId));
    if (params?.customerId !== undefined) q.append('customerId', String(params.customerId));
    if (params?.employeeId !== undefined) q.append('employeeId', String(params.employeeId));
    q.append('page', String(params?.page ?? 0));
    q.append('pageSize', String(params?.pageSize ?? 20));

    const response = await apiService.get<any>(`/reviews?${q.toString()}`);

    if (response.success && response.data) {
      // backend might return paginated object or raw array
      const rawList: any[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.content)
        ? response.data.content
        : [];

      const reviews = rawList.map((r: ApiReview) => this.mapApiReview(r));

      return {
        content: reviews,
        totalElements: response.data.totalElements ?? 0,
        totalPages: response.data.totalPages ?? 0,
        currentPage: response.data.page ?? response.data.currentPage ?? 0,
        pageSize: response.data.pageSize ?? params?.pageSize ?? 20,
      };
    }

    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: params?.pageSize ?? 20,
    };
  }

  async getById(id: string | number): Promise<Review | null> {
    try {
      const response = await apiService.get<ApiReview>(`/reviews/${id}`);
      if (response.success && response.data) return this.mapApiReview(response.data);
      return null;
    } catch (error) {
      console.error('Error fetching review:', error);
      return null;
    }
  }

  async getByContractId(contractId: string | number): Promise<Review[]> {
    try {
      const response = await apiService.get<any>(`/reviews/contract/${contractId}`);
      if (response.success && response.data) {
        const rawList: any[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.content)
          ? response.data.content
          : [];

        return rawList.map((r: ApiReview) => this.mapApiReview(r));
      }
      return [];
    } catch (error) {
      console.error('Error fetching reviews by contract:', error);
      return [];
    }
  }

  async getByEmployeeId(employeeId: string | number): Promise<Review[]> {
    try {
      const response = await apiService.get<any>(`/reviews/employee/${employeeId}`);
      if (response.success && response.data) {
        const rawList: any[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.content)
          ? response.data.content
          : [];

        return rawList.map((r: ApiReview) => this.mapApiReview(r));
      }
      return [];
    } catch (error) {
      console.error('Error fetching reviews by employee:', error);
      return [];
    }
  }

  async getByCustomerId(customerId: string | number): Promise<Review[]> {
    try {
      const response = await apiService.get<any>(`/reviews/customer/${customerId}`);
      if (response.success && response.data) {
        const rawList: any[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.content)
          ? response.data.content
          : [];

        return rawList.map((r: ApiReview) => this.mapApiReview(r));
      }
      return [];
    } catch (error) {
      console.error('Error fetching reviews by customer:', error);
      return [];
    }
  }

  async getByReviewerId(reviewerId: string | number): Promise<Review[]> {
    try {
      const response = await apiService.get<any>(`/reviews/reviewer/${reviewerId}`);
      if (response.success && response.data) {
        const rawList: any[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.content)
          ? response.data.content
          : [];

        return rawList.map((r: ApiReview) => this.mapApiReview(r));
      }
      return [];
    } catch (error) {
      console.error('Error fetching reviews by reviewer:', error);
      return [];
    }
  }

  async create(payload: Partial<ApiReview>) {
    console.log('Create review payload:', payload);
    const response = await apiService.post<any>('/reviews', payload);
    return response;
  }

  async update(id: string | number, payload: Partial<ApiReview>) {
    const response = await apiService.put<any>(`/reviews/${id}`, payload);
    return response;
  }

  async delete(id: string | number) {
    const response = await apiService.delete<any>(`/reviews/${id}`);
    return response;
  }
}

export const reviewService = new ReviewService();

export default reviewService;
