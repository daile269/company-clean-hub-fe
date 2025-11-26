# API Integration Guide

## Cách sử dụng API với Token tự động

Sau khi đăng nhập thành công, token sẽ tự động được thêm vào tất cả các request.

## Cách 1: Sử dụng apiService trực tiếp

```typescript
import { apiService } from '@/services/api';

// GET request
const response = await apiService.get('/employees');

// POST request
const response = await apiService.post('/employees', {
  name: 'Nguyễn Văn A',
  email: 'nva@example.com'
});

// PUT request
const response = await apiService.put('/employees/1', {
  name: 'Nguyễn Văn B'
});

// DELETE request
const response = await apiService.delete('/employees/1');
```

## Cách 2: Sử dụng useApi hook (Recommended)

```typescript
'use client';
import { useApi } from '@/hooks/useApi';

export default function EmployeesPage() {
  const { loading, error, data, get, post, put, delete: del } = useApi();

  const loadEmployees = async () => {
    try {
      const employees = await get('/employees', {
        onSuccess: (data) => {
          console.log('Loaded:', data);
        },
        onError: (error) => {
          alert('Lỗi: ' + error);
        }
      });
      console.log(employees);
    } catch (err) {
      console.error(err);
    }
  };

  const createEmployee = async () => {
    const newEmployee = await post('/employees', {
      name: 'Nguyễn Văn A',
      email: 'nva@example.com'
    });
  };

  const updateEmployee = async (id: string) => {
    const updated = await put(`/employees/${id}`, {
      name: 'Nguyễn Văn B'
    });
  };

  const deleteEmployee = async (id: string) => {
    await del(`/employees/${id}`);
  };

  return (
    <div>
      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={loadEmployees}>Load Employees</button>
    </div>
  );
}
```

## Token Management

Token được quản lý tự động:
- ✅ Sau khi đăng nhập, token được lưu vào localStorage
- ✅ Token tự động được thêm vào header của mọi request: `Authorization: Bearer <token>`
- ✅ Khi logout, token được xóa khỏi localStorage và apiService
- ✅ Nếu token hết hạn, server trả về 401, bạn cần redirect về trang login

## Xử lý lỗi 401 Unauthorized

Bạn có thể thêm interceptor để tự động logout khi token hết hạn:

```typescript
// Trong services/api.ts, thêm vào response handling
if (!response.ok) {
  if (response.status === 401) {
    // Token expired or invalid
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  // ... rest of error handling
}
```

## Environment Variables

Tạo file `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Hoặc để production:

```
NEXT_PUBLIC_API_URL=https://api.yourcompany.com/api
```
