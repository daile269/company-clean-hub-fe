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
  PERMANENT = 'PERMANENT',        // Chính thức
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
  code: string;                  // Mã KH
  name: string;
  address: string;
  phone: string;
  email?: string;
  contactPerson?: string;        // Người liên hệ
  taxCode?: string;              // Mã số thuế
  createdAt: Date;
  updatedAt: Date;
}

// Hợp đồng
export interface Contract {
  id: string;
  customerId: string;
  contractNumber: string;        // Số hợp đồng
  value: number;                 // Giá trị hợp đồng
  vat: number;                   // VAT (%)
  startDate: Date;
  endDate: Date;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Nhân viên
export interface Employee {
  id: string;
  code: string;                  // Mã NV
  name: string;
  avatar?: string;
  address: string;
  phone: string;
  email?: string;
  bankAccount?: string;          // Số tài khoản
  idCard: string;                // CCCD
  employeeType: EmployeeType;
  monthlySalary?: number;        // Lương tháng (NV chính thức)
  dailySalary?: number;          // Lương ngày (NV tạm thời)
  regionalManagerId?: string;    // Thuộc QLV nào
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
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
