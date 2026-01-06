import { apiService } from './api';

// Interface cho User từ API
export interface ApiUser {
  id: number;
  username: string;
  name: string;
  phone: string;
  email: string;
  roleId: number;
  roleName: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

// Interface cho query params phân trang
export interface UserPaginationParams {
  keyword?: string;
  roleId?: number | null;
  page: number;
  pageSize: number;
}

// Interface cho response phân trang từ backend
export interface UserPaginationResponse {
  content: ApiUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Lấy danh sách user với phân trang và tìm kiếm
export const getAll = async (params: UserPaginationParams): Promise<UserPaginationResponse> => {
  try {
    const { keyword = '', roleId, page, pageSize } = params;

    // Build query string
    let queryString = `/users/filter?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`;
    if (roleId !== null && roleId !== undefined) {
      queryString += `&roleId=${roleId}`;
    }

    const response = await apiService.get<any>(queryString);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch users');
    }

    // Return full pagination response
    return {
      content: Array.isArray(response.data.content) ? response.data.content : [],
      totalElements: response.data.totalElements || 0,
      totalPages: response.data.totalPages || 0,
      currentPage: response.data.currentPage || page,
      pageSize: response.data.pageSize || pageSize,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Lấy chi tiết user theo ID
export const getById = async (id: string): Promise<ApiUser> => {
  try {
    const response = await apiService.get<any>(`/users/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch user');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Tạo user mới
export const create = async (userData: any): Promise<ApiUser> => {
  try {
    const payload = {
      username: userData.username,
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      roleId: userData.roleId,
    };

    const response = await apiService.post<any>('/users', payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create user');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Cập nhật user
export const update = async (id: string, userData: any): Promise<ApiUser> => {
  try {
    const payload = {
      username: userData.username,
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password, // Required by backend
      roleId: userData.roleId,
      status: userData.status,
    };

    const response = await apiService.put<any>(`/users/${id}`, payload);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update user');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Xóa user
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const response = await apiService.delete<any>(`/users/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Đổi mật khẩu cho user theo ID
export const changePassword = async (
  id: string,
  payload: { newPassword: string; confirmPassword: string }
): Promise<void> => {
  try {
    const response = await apiService.post<any>(`/users/${id}/change-password`, payload);

    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

const userService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteUser,
  changePassword,
};

export default userService;
