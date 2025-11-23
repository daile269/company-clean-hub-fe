// Enum cho các loại user
export enum UserRole {
  CUSTOMER = 'CUSTOMER',           // Khách hàng
  MANAGER_LEVEL_1 = 'QLT1',       // Quản lý tổng 1
  MANAGER_LEVEL_2 = 'QLT2',       // Quản lý tổng 2
  REGIONAL_MANAGER = 'QLV',       // Quản lý vùng
  EMPLOYEE = 'EMPLOYEE',          // Nhân viên
  ACCOUNTANT = 'ACCOUNTANT'       // Kế toán
}

// Enum cho loại nhân viên
export enum EmployeeType {
  FIXED_BY_CONTRACT = 'FIXED_BY_CONTRACT',        // Chính thức (Hợp đồng cố định)
  FIXED_BY_DAY = 'FIXED_BY_DAY',        // Bán thời gian (Cố định theo ngày)
  TEMPORARY = 'TEMPORARY'         // Tạm thời
}

// Enum cho loại lịch làm việc
export enum ScheduleType {
  FIXED = 'FIXED',               // Cố định
  TEMPORARY = 'TEMPORARY'        // Tạm thời
}

// Enum cho trạng thái lương
export enum SalaryStatus {
  UNPAID = 'UNPAID',             // Chưa trả
  PAID = 'PAID',                 // Đã trả
  ADVANCE = 'ADVANCE'            // Ứng lương
}

// User/Account
export interface User {
  id: string;
  code: string;                  // Mã tài khoản
  email?: string;
  phone?: string;
  password: string;
  role: UserRole;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Khách hàng
export interface Customer {
  id: string;
  code: string;                  // Mã KH (customerCode)
  username?: string;             // Tên đăng nhập
  password?: string;             // Mật khẩu
  name: string;
  address: string;
  phone: string;
  email?: string;
  contactPerson?: string;        // Người liên hệ (contactInfo)
  taxCode?: string;              // Mã số thuế
  company?: string;              // Tên công ty
  status?: string;               // Trạng thái (ACTIVE/INACTIVE)
  description?: string;          // Mô tả
  createdAt: Date;
  updatedAt: Date;
}

// Hợp đồng
export interface Contract {
  id: string;
  customerId: string;
  customerName?: string;         // Tên khách hàng (từ API)
  serviceIds?: number[];         // Danh sách ID dịch vụ
  serviceNames?: string[];       // Danh sách tên dịch vụ
  contractNumber?: string;       // Số hợp đồng
  startDate: Date;
  endDate: Date;
  basePrice: number;             // Giá cơ bản
  vat: number;                   // VAT (số tiền)
  total: number;                 // Tổng (basePrice + vat)
  extraCost: number;             // Chi phí phát sinh
  discountCost: number;          // Giảm giá
  finalPrice: number;            // Giá cuối cùng
  paymentStatus: string;         // Trạng thái thanh toán
  description?: string;
  notes?: string;
  value?: number;                // Legacy field (backward compatible)
  createdAt: Date;
  updatedAt: Date;
}

// Nhân viên (Frontend model)
export interface Employee {
  id: string;
  code: string;                  // Mã NV
  name: string;
  avatar?: string;
  address: string;
  phone: string;
  email?: string;
  username?: string;             // Tên đăng nhập
  password?: string;             // Mật khẩu
  bankAccount?: string;          // Số tài khoản
  bankName?: string;             // Tên ngân hàng
  idCard: string;                // CCCD
  employeeType: EmployeeType;
  monthlySalary?: number;        // Lương tháng (NV chính thức)
  dailySalary?: number;          // Lương ngày (NV tạm thời)
  socialInsurance?: number;      // Bảo hiểm xã hội
  healthInsurance?: number;      // Bảo hiểm y tế
  roleId?: number;               // ID vai trò
  status?: string;               // Trạng thái
  description?: string;          // Mô tả
  regionalManagerId?: string;    // Thuộc QLV nào
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Employee Response (Backend model)
export interface ApiEmployee {
  id: number;
  employeeCode: string;
  username: string;
  phone: string;
  email: string;
  roleId: number;
  roleName: string;
  status: string;
  cccd: string;
  address: string;
  name: string;
  bankAccount: string;
  bankName: string;
  employmentType: string;        // FIXED_BY_CONTRACT, TEMPORARY, etc.
  baseSalary: number;
  dailySalary: number;
  socialInsurance: number;
  healthInsurance: number;
  allowance: number | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

// Điều động nhân viên
export interface Assignment {
  id: string;
  customerId: string;
  employeeId: string;
  scheduleType: ScheduleType;
  startDate: Date;
  endDate?: Date;
  workSchedule?: string;         // Mô tả lịch làm (VD: T2-T6, 8h-17h)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chấm công
export interface Attendance {
  id: string;
  employeeId: string;
  customerId: string;
  assignmentId: string;
  date: Date;
  isPresent: boolean;
  isAutomatic: boolean;          // Tự động hay thủ công
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bảng lương
export interface Payroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
  totalAmount: number;
  status: SalaryStatus;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Đánh giá
export interface Rating {
  id: string;
  employeeId: string;
  customerId: string;
  assignmentId: string;
  rating: number;                // 1-5 sao
  feedback?: string;
  createdAt: Date;
}

// Vật tư
export interface Supply {
  id: string;
  code: string;                  // Mã vật tư
  name: string;
  unit: string;                  // Đơn vị tính
  stock: number;                 // Tồn kho
  monthlyAllowance: number;      // Định mức cấp phát hàng tháng
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Cấp phát vật tư
export interface SupplyDistribution {
  id: string;
  supplyId: string;
  employeeId: string;
  quantity: number;
  distributionDate: Date;
  notes?: string;
  createdAt: Date;
}

// Thông báo
export interface Notification {
  id: string;
  userId: string;
  type: string;                  // contract_expiry, salary_due, supply_alert, etc.
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Dịch vụ
export interface Service {
  id: string;
  code: string;                  // Mã dịch vụ
  name: string;
  description?: string;
  unit: string;                  // Đơn vị tính (giờ, ngày, tháng, lần)
  basePrice: number;             // Giá cơ bản
  isActive: boolean;             // Đang hoạt động
  category?: string;             // Loại dịch vụ (vệ sinh văn phòng, công nghiệp, ...)
  createdAt: Date;
  updatedAt: Date;
}
