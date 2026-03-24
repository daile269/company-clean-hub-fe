import { apiService } from './api';

export const employeeLeaveService = {
  /**
   * Đánh dấu nhân viên nghỉ làm một ngày cụ thể (Soft-delete)
   * @param employeeId ID Nhân viên
   * @param leaveDate Ngày nghỉ định dạng YYYY-MM-DD
   */
  takeCompanyLeave: async (employeeId: string | number, leaveDate: string) => {
    return await apiService.put(`/employees/${employeeId}/company-leave?leaveDate=${leaveDate}`, {});
  },

  /**
   * Xoá ngày nghỉ để nhân viên lại được đi làm bình thường (Rollback)
   * @param employeeId ID Nhân viên
   * @param leaveDate Ngày nghỉ định dạng YYYY-MM-DD
   */
  cancelCompanyLeave: async (employeeId: string | number, leaveDate: string) => {
    return await apiService.put(`/employees/${employeeId}/cancel-company-leave?leaveDate=${leaveDate}`, {});
  },

  /**
   * Báo nhân viên chính thức ngừng hợp đồng văn phòng
   * @param employeeId ID Nhân viên
   * @param resignDate Ngày chính thức ngừng làm (YYYY-MM-DD)
   */
  resignOffice: async (employeeId: string | number, resignDate: string) => {
    return await apiService.put(`/employees/${employeeId}/resign-office?resignDate=${resignDate}`, {});
  },

  /**
   * Hoàn tác hành động báo nhân viên chính thức ngừng hợp đồng văn phòng
   * @param employeeId ID Nhân viên
   */
  cancelResignOffice: async (employeeId: string | number) => {
    return await apiService.put(`/employees/${employeeId}/cancel-resign-office`, {});
  },

  /**
   * Lấy danh sách các ngày đã đăng ký nghỉ (deleted=true)
   * @param employeeId ID Nhân viên
   * @param month Tháng
   * @param year Năm
   */
  getCompanyLeaves: async (employeeId: string | number, month?: number, year?: number) => {
    let url = `/employees/${employeeId}/company-leaves`;
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return await apiService.get(url);
  }
};
