## Hướng dẫn bảo mật giao diện (UI) và Router theo Permission & Role

Tài liệu này giải thích **cách frontend đang dùng permission** để ẩn/hiện UI và **cách middleware bảo vệ router page** dựa trên quyền (Permission) và vai trò (Role) mà backend trả về.

---

## 1. Kiến trúc bảo mật - 2 lớp

### Lớp 1: Router Protection (Middleware)
- **Nơi:** `middleware.ts`
- **Khi:** User truy cập vào admin route (VD: `/admin/payroll`, `/admin/employees`...)
- **Cách:**
  1. Middleware kiểm tra JWT token trong cookie
  2. Decode JWT để lấy `role` của user (VD: `ROLE_QLV`, `ROLE_QLT1`...)
  3. So sánh với danh sách `ROUTE_ROLES` trong `config/routeRole.ts`
  4. Nếu role không match → redirect về `/admin` (dashboard)
  5. Nếu match → cho phép truy cập

**Lợi ích:** Bảo vệ ở server-side, user không thể bypass bằng console hoặc dev tools

### Lớp 2: UI Permission (Client-side)
- **Nơi:** Các component React (`hooks/usePermission.ts`)
- **Khi:** Component render lên, kiểm tra permission chi tiết
- **Cách:**
  1. Component dùng `usePermission('PERMISSION_CODE')`
  2. Check xem user có quyền thực hiện action cụ thể (CREATE, EDIT, DELETE, EXPORT...)
  3. Ẩn/hiện nút hoặc disable chức năng
  4. Chặn handler nếu không có quyền

**Lợi ích:** Giảm tải server, trải nghiệm UX tốt hơn (nút ẩn ngay, không gửi request)

---

## 2. Route Protection – Cấu hình vai trò

### 2.1. Danh sách quy tắc Route-Role

File: `config/routeRole.ts`

```typescript
export const ROUTE_ROLES: Record<string, string[]> = {
  '/admin/payroll': ['QLT1', 'QLT2', 'ACCOUNTANT'],
  '/admin/payroll/[id]': ['QLT1', 'QLT2', 'ACCOUNTANT'],

  '/admin/employees': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],
  '/admin/employees/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT'],

  '/admin/customers': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],
  '/admin/customers/[id]': ['QLT1', 'QLT2', 'QLV', 'ACCOUNTANT', 'CUSTOMER'],

  '/admin/assignments': ['QLT1', 'QLT2', 'QLV'],
  '/admin/assignments/[id]': ['QLT1', 'QLT2', 'QLV'],

  '/admin/attendances': ['QLT1', 'QLT2', 'ACCOUNTANT'],
  '/admin/attendances/[id]': ['QLT1', 'QLT2', 'ACCOUNTANT'],

  '/admin/users': ['QLT1'],  // Chỉ QLT1 (Quản lý tổng)
  '/admin/users/[id]': ['QLT1'],
};
```

### 2.2. Cách thêm route mới

1. Thêm entry vào `ROUTE_ROLES` với roles được phép:
```typescript
'/admin/invoices': ['QLT1', 'QLT2', 'ACCOUNTANT'],
'/admin/invoices/[id]': ['QLT1', 'QLT2', 'ACCOUNTANT'],
```

2. Middleware tự động kiểm tra khi user truy cập

### 2.3. Luồng kiểm tra trong middleware

```
User truy cập /admin/payroll/123
    ↓
middleware.ts nhận request
    ↓
Lấy token từ cookie
    ↓
Decode JWT → lấy role (VD: "ROLE_QLV")
    ↓
Extract role: "ROLE_QLV" → "QLV" (loại bỏ prefix "ROLE_")
    ↓
getRequiredRoles('/admin/payroll/123') → ['QLT1', 'QLT2', 'ACCOUNTANT']
    ↓
"QLV" có trong ['QLT1', 'QLT2', 'ACCOUNTANT']? → NO
    ↓
Redirect về /admin ✓ Access Denied
```

---

## 3. Luồng tổng quan (Permission)

1. **Backend** gán `Role` và `Permission` cho `User`.
2. Khi **đăng nhập thành công**, FE gọi API `/users/me/permissions` và lưu danh sách permission vào:
   - `permissionService` (trong bộ nhớ).
   - `localStorage` key `permissions`.
3. Trong từng component, FE dùng:
   - Hook `usePermission('PERMISSION_CODE')` để **kiểm tra quyền**.
   - Hoặc gọi trực tiếp `permissionService.hasPermission('PERMISSION_CODE')`.
4. Dựa trên kết quả:
   - **Không có quyền VIEW** → ẩn nút hoặc hiển thị thông báo.
   - **Không có quyền action** (CREATE / EDIT / DELETE / EXPORT / MARK_PAID …) → ẩn nút hoặc chặn handler.

---

## 4. Hook `usePermission` – cách dùng cơ bản

File: `hooks/usePermission.ts`

### 2.1. Kiểm tra 1 quyền

```tsx
import { usePermission } from '@/hooks/usePermission';

const canCreateCustomer = usePermission('CUSTOMER_CREATE');

if (canCreateCustomer) {
  // Hiện nút / chức năng tạo khách hàng
}
```

### 2.2. Kiểm tra nhiều quyền – có ÍT NHẤT 1 quyền (ANY)

```tsx
const canManageAssignment = usePermission(
  ['ASSIGNMENT_CREATE', 'ASSIGNMENT_UPDATE', 'ASSIGNMENT_DELETE'],
  false // false = chỉ cần 1 trong các quyền
);
```

### 2.3. Kiểm tra nhiều quyền – phải có ĐẦY ĐỦ (ALL)

```tsx
const canExportPayroll = usePermission(
  ['PAYROLL_VIEW', 'PAYROLL_EXPORT'],
  true // true = phải có đủ tất cả
);
```

---

## 3. Quy ước chung khi bảo mật UI

### 3.1. Quyền VIEW – chặn cả trang

Các trang list/detail đều có 1 quyền VIEW tương ứng:

- Khách hàng: `CUSTOMER_VIEW`  
- Nhân viên: `EMPLOYEE_VIEW` / `EMPLOYEE_VIEW_OWN`  
- Phân công: `ASSIGNMENT_VIEW`  
- Chấm công: `ATTENDANCE_VIEW`  
- Hợp đồng: `CONTRACT_VIEW`  
- Lương: `PAYROLL_VIEW`

**Cách áp dụng:**

```tsx
const canView = usePermission('PAYROLL_VIEW');

if (!canView) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">
        Bạn không có quyền xem bảng lương
      </p>
    </div>
  );
}
```

> Quy ước: **không redirect vòng vòng**, chỉ hiển thị thông báo rõ ràng để dev/test dễ debug.

### 3.2. Quyền CREATE – ẩn nút “Thêm / Tạo / Tính”

Ví dụ trang **Khách hàng**:

```tsx
const canCreate = usePermission('CUSTOMER_CREATE');

{canCreate && (
  <button onClick={() => setShowAddModal(true)}>Thêm khách hàng</button>
)}

{showAddModal && canCreate && (
  // Modal thêm khách hàng
)}
```

Tương tự cho:

- `EMPLOYEE_CREATE` – nút thêm nhân viên.  
- `ASSIGNMENT_CREATE` – phân công nhân viên.  
- `ATTENDANCE_CREATE` – tạo bản ghi chấm công (nếu có).  
- `CONTRACT_CREATE` – thêm hợp đồng mới.  
- `PAYROLL_CREATE` – nút **Tính lương** và `PayrollCalculateModal`.

### 3.3. Quyền EDIT – ẩn nút “Sửa / Cập nhật”

Ví dụ **Employee detail**:

```tsx
const canEdit = usePermission('EMPLOYEE_EDIT');

{canEdit && (
  <button onClick={handleEdit}>Sửa</button>
)}

const handleEdit = () => {
  if (!canEdit) return;
  // mở modal, set form...
};
```

Áp dụng cho:

- `CUSTOMER_EDIT` – sửa thông tin khách hàng.  
- `EMPLOYEE_EDIT` – sửa thông tin nhân viên, upload/xóa ảnh.  
- `ASSIGNMENT_UPDATE` – sửa phân công.  
- `ATTENDANCE_EDIT` – sửa chấm công (detail + trong bảng lương).  
- `CONTRACT_EDIT` – sửa hợp đồng, dịch vụ trong hợp đồng.  
- `PAYROLL_EDIT` – nút **“Cập nhật & Tính lại”** bảng lương.

### 3.4. Quyền DELETE – ẩn nút “Xóa”

Ví dụ **Assignment detail**:

```tsx
const canDelete = usePermission('ASSIGNMENT_DELETE');

{canDelete && (
  <button onClick={handleDelete}>Xóa</button>
)}

const handleDelete = async () => {
  if (!canDelete) return;
  // confirm + gọi API delete
};
```

Quyền xóa tương ứng:

- `CUSTOMER_DELETE`, `EMPLOYEE_DELETE`, `ASSIGNMENT_DELETE`,  
  `ATTENDANCE_DELETE`, `CONTRACT_DELETE`, `USER_DELETE`, ...

### 3.5. Các quyền đặc thù

- `PAYROLL_MARK_PAID`  
  - Điều khiển nút **“Thanh toán lương”** và `PayrollPaymentModal`.  
- `PAYROLL_ADVANCE`  
  - Điều khiển nút **“Ứng lương / Bảo hiểm”** trong Employee detail.  
- `PAYROLL_EXPORT`, `ATTENDANCE_EXPORT`  
  - Ẩn/hiện nút **Xuất Excel** (luôn kết hợp cùng quyền VIEW).  
- `COST_MANAGE`  
  - Cho phép tạo/sửa/xóa hóa đơn, cập nhật trạng thái hóa đơn trong Contract detail.  

---

## 4. Ví dụ tổng hợp theo màn hình

### 4.1. Payroll list (`app/admin/payroll/page.tsx`)

- `PAYROLL_VIEW` – vào được trang list lương.  
- `PAYROLL_CREATE` – nút **Tính lương** + `PayrollCalculateModal`.  
- `PAYROLL_EXPORT` – nút **Xuất Excel** (dùng `usePermission(['PAYROLL_VIEW','PAYROLL_EXPORT'], true)`).

### 4.2. Payroll detail (`app/admin/payroll/[id]/page.tsx`)

- `PAYROLL_VIEW` – xem chi tiết bảng lương.  
- `PAYROLL_EDIT` – nút **“Cập nhật & Tính lại”** + `PayrollUpdateModal`.  
- `PAYROLL_MARK_PAID` – nút **“Thanh toán lương”** + `PayrollPaymentModal`.  
- `ATTENDANCE_EDIT` – cho phép sửa chấm công trong `AttendanceCalendar`:

```tsx
const canEditAttendance = usePermission('ATTENDANCE_EDIT');

<AttendanceCalendar
  onEditAttendance={canEditAttendance ? handleEditAttendance : undefined}
  ...
/>
```

### 4.3. Customers / Employees / Assignments / Attendances / Contracts

Mỗi phần đều tuân theo mẫu:

- `*_VIEW` – kiểm soát quyền truy cập trang.  
- `*_CREATE` – nút thêm + modal thêm.  
- `*_EDIT` – nút sửa + modal sửa.  
- `*_DELETE` – nút xóa + API delete.  
- Các quyền đặc thù (như `CUSTOMER_ASSIGN`, `COST_MANAGE`…) sẽ điều khiển **các nút/action riêng** được đặt tên rõ ràng.

---

## 5. Lưu ý khi thêm UI mới

1. **Luôn hỏi backend** xem permission nào biểu diễn đúng nghiệp vụ.  
2. Dùng **tên permission đúng với enum bên BE** (ví dụ `PAYROLL_MARK_PAID`, không tự nghĩ tên khác).  
3. Ở UI:
   - Dùng `usePermission()` ngay trong component.  
   - Ẩn/hiện nút (hoặc disable) thay vì chỉ chặn ở handler.  
4. Không bọc toàn bộ app bằng wrapper phức tạp – ưu tiên **check ngay tại chỗ** (gần nút / action) để dễ đọc và dễ bảo trì.

---

## 6. Nơi cần sửa khi backend đổi permission

1. Enum `Permission` bên backend.  
2. API `/users/me/permissions` (hoặc endpoint tương ứng).  
3. FE:
   - Các file page/detail/list có gọi `usePermission('PERMISSION_OLD')`.  
   - Tài liệu này (`UI_PERMISSION_GUIDE.md`) để cập nhật lại mô tả.

> Nếu bạn thêm module mới (ví dụ quản lý vật tư, thông báo…), hãy **tạo permission rõ nghĩa** (VD: `SUPPLY_VIEW`, `SUPPLY_CREATE`…) và áp dụng đúng các quy tắc trên để giữ hệ thống thống nhất và dễ hiểu.


