# Hướng dẫn sử dụng hệ thống phân quyền

## 1. Cách sử dụng trong Component

### Ví dụ 1: Ẩn/hiện nút dựa trên 1 quyền

```tsx
"use client";
import { usePermission } from '@/hooks/usePermission';

export default function CustomerList() {
  const canCreate = usePermission('CUSTOMER_CREATE');
  const canDelete = usePermission('CUSTOMER_DELETE');
  const canEdit = usePermission('CUSTOMER_EDIT');

  return (
    <div>
      <h1>Danh sách khách hàng</h1>
      
      {/* Nút thêm mới - chỉ hiện nếu có quyền CUSTOMER_CREATE */}
      {canCreate && (
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Thêm khách hàng
        </button>
      )}

      {/* Danh sách khách hàng */}
      <table>
        {/* ... */}
        <tbody>
          <tr>
            <td>Khách hàng A</td>
            <td>
              {/* Nút sửa - chỉ hiện nếu có quyền CUSTOMER_EDIT */}
              {canEdit && (
                <button className="px-2 py-1 bg-green-600 text-white rounded">
                  Sửa
                </button>
              )}
              
              {/* Nút xóa - chỉ hiện nếu có quyền CUSTOMER_DELETE */}
              {canDelete && (
                <button className="px-2 py-1 bg-red-600 text-white rounded ml-2">
                  Xóa
                </button>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

### Ví dụ 2: Check nhiều quyền (có 1 trong các quyền này)

```tsx
"use client";
import { usePermission } from '@/hooks/usePermission';

export default function AssignmentPage() {
  // User cần có ít nhất 1 trong các quyền này
  const canManageAssignment = usePermission(
    ['ASSIGNMENT_CREATE', 'ASSIGNMENT_EDIT', 'ASSIGNMENT_DELETE'],
    false // false = cần ANY (1 trong các quyền), true = cần ALL (tất cả quyền)
  );

  return (
    <div>
      <h1>Phân công</h1>
      
      {canManageAssignment ? (
        <div>
          <button>Tạo phân công</button>
          <button>Sửa phân công</button>
          <button>Xóa phân công</button>
        </div>
      ) : (
        <p>Bạn không có quyền quản lý phân công</p>
      )}
    </div>
  );
}
```

### Ví dụ 3: Check tất cả quyền (phải có đủ tất cả)

```tsx
"use client";
import { usePermission } from '@/hooks/usePermission';

export default function PayrollExport() {
  // User phải có đủ cả 2 quyền
  const canExportPayroll = usePermission(
    ['PAYROLL_VIEW', 'PAYROLL_EXPORT'],
    true // true = cần ALL (tất cả quyền)
  );

  return (
    <div>
      {canExportPayroll && (
        <button className="px-4 py-2 bg-green-600 text-white rounded">
          Xuất Excel lương
        </button>
      )}
    </div>
  );
}
```

### Ví dụ 4: Disable nút thay vì ẩn

```tsx
"use client";
import { usePermission } from '@/hooks/usePermission';

export default function UserManagement() {
  const canDelete = usePermission('USER_DELETE');

  return (
    <div>
      <button
        disabled={!canDelete}
        className={`px-4 py-2 rounded ${
          canDelete 
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Xóa người dùng
      </button>
    </div>
  );
}
```

### Ví dụ 5: Xem tất cả quyền của user

```tsx
"use client";
import { usePermissions } from '@/hooks/usePermission';

export default function UserProfile() {
  const permissions = usePermissions();

  return (
    <div>
      <h2>Quyền của bạn</h2>
      <ul>
        {permissions.map(permission => (
          <li key={permission}>{permission}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 2. Cách sử dụng trực tiếp (không dùng hook)

```typescript
import { permissionService } from '@/services/permissionService';

// Check 1 quyền
if (permissionService.hasPermission('CUSTOMER_CREATE')) {
  console.log('User có quyền tạo khách hàng');
}

// Check nhiều quyền (có 1 trong các quyền)
if (permissionService.hasAnyPermission(['CUSTOMER_EDIT', 'CUSTOMER_DELETE'])) {
  console.log('User có quyền sửa hoặc xóa khách hàng');
}

// Check nhiều quyền (phải có đủ tất cả)
if (permissionService.hasAllPermissions(['PAYROLL_VIEW', 'PAYROLL_EXPORT'])) {
  console.log('User có quyền xem và xuất lương');
}

// Lấy tất cả quyền
const allPermissions = permissionService.getPermissions();
console.log('Tất cả quyền:', allPermissions);
```

## 3. Danh sách quyền mẫu

Dựa trên response từ backend, các quyền có thể bao gồm:

### Khách hàng (CUSTOMER)
- `CUSTOMER_VIEW` - Xem khách hàng
- `CUSTOMER_CREATE` - Tạo khách hàng
- `CUSTOMER_EDIT` - Sửa khách hàng
- `CUSTOMER_DELETE` - Xóa khách hàng
- `CUSTOMER_ASSIGN` - Phân công khách hàng

### Nhân viên (EMPLOYEE)
- `EMPLOYEE_VIEW` - Xem nhân viên
- `EMPLOYEE_CREATE` - Tạo nhân viên
- `EMPLOYEE_EDIT` - Sửa nhân viên
- `EMPLOYEE_DELETE` - Xóa nhân viên

### Hợp đồng (CONTRACT)
- `CONTRACT_VIEW` - Xem hợp đồng
- `CONTRACT_CREATE` - Tạo hợp đồng
- `CONTRACT_EDIT` - Sửa hợp đồng
- `CONTRACT_DELETE` - Xóa hợp đồng

### Phân công (ASSIGNMENT)
- `ASSIGNMENT_VIEW` - Xem phân công
- `ASSIGNMENT_CREATE` - Tạo phân công
- `ASSIGNMENT_UPDATE` - Cập nhật phân công
- `ASSIGNMENT_DELETE` - Xóa phân công
- `ASSIGNMENT_REASSIGN` - Điều động nhân viên

### Chấm công (ATTENDANCE)
- `ATTENDANCE_VIEW` - Xem chấm công
- `ATTENDANCE_CREATE` - Tạo chấm công
- `ATTENDANCE_EDIT` - Sửa chấm công
- `ATTENDANCE_DELETE` - Xóa chấm công
- `ATTENDANCE_EXPORT` - Xuất dữ liệu chấm công

### Lương (PAYROLL)
- `PAYROLL_VIEW` - Xem lương
- `PAYROLL_CREATE` - Tạo bảng lương
- `PAYROLL_EDIT` - Sửa lương
- `PAYROLL_MARK_PAID` - Đánh dấu đã thanh toán
- `PAYROLL_ADVANCE` - Ứng lương
- `PAYROLL_EXPORT` - Xuất dữ liệu lương

### Người dùng (USER)
- `USER_VIEW` - Xem người dùng
- `USER_CREATE` - Tạo người dùng
- `USER_EDIT` - Sửa người dùng
- `USER_DELETE` - Xóa người dùng
- `USER_MANAGE_ALL` - Quản lý tất cả người dùng

### Khác
- `APPROVE_PROFILE_CHANGE` - Phê duyệt thay đổi hồ sơ
- `AUDIT_VIEW` - Xem lịch sử hoạt động
- `COST_MANAGE` - Quản lý chi phí

## 4. Lưu ý

1. **Permissions được lưu trong localStorage** và tự động load khi user đăng nhập
2. **Khi logout**, permissions sẽ tự động bị xóa
3. Hook `usePermission` **tự động cập nhật** khi permissions thay đổi
4. Nên sử dụng **hook trong component**, dùng service trực tiếp trong **utility functions**
5. **Backend endpoint**: `/users/permissions` (GET)
