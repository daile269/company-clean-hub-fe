# Hướng dẫn tích hợp API Backend

## Cấu hình

1. **Tạo file `.env.local`** từ template:
```bash
cp .env.local.example .env.local
```

2. **Cập nhật URL API** trong `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Đăng nhập

### API Endpoint
```
POST http://localhost:8080/api/auth/login
```

### Request Body
```json
{
  "username": "accountant01",
  "password": "Pass123456"
}
```

### Response
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGci...",
    "type": "Bearer",
    "id": 6,
    "username": "accountant01",
    "email": "accountant01@gmail.com",
    "phone": "0909000006",
    "roleName": "ACCOUNTANT",
    "roleId": 6,
    "userType": "USER"
  },
  "code": 200
}
```

## Cấu trúc Service

### 1. API Service (`services/api.ts`)
- Base service để gọi API
- Tự động thêm Bearer token vào headers
- Xử lý response và errors

### 2. Auth Service (`services/authService.ts`)
- `login(credentials)` - Đăng nhập
- `logout()` - Đăng xuất
- `getCurrentUser()` - Lấy thông tin user hiện tại
- `getToken()` - Lấy token
- `isAuthenticated()` - Kiểm tra đã đăng nhập chưa

### 3. Auth Context (`contexts/AuthContext.tsx`)
- Provider để quản lý auth state toàn app
- Hook `useAuth()` để sử dụng trong components

## Authentication Flow

1. **Đăng nhập**:
   - User nhập username & password
   - Call API `/auth/login`
   - Lưu token và user info vào localStorage
   - Redirect đến `/admin`

2. **Protected Routes**:
   - Middleware check token trước khi vào `/admin/*`
   - Nếu chưa login → redirect `/admin/login`
   - Nếu đã login vào `/admin/login` → redirect `/admin`

3. **Đăng xuất**:
   - Xóa token và user info khỏi localStorage
   - Redirect về `/admin/login`

## Sử dụng trong Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && (
        <div>
          <p>Xin chào {user?.username}</p>
          <p>Role: {user?.roleName}</p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
}
```

## Role Mapping

Backend roles được map sang UserRole enum:

| Backend Role | Frontend Enum |
|-------------|---------------|
| ACCOUNTANT | UserRole.ACCOUNTANT |
| QLT1 | UserRole.MANAGER_LEVEL_1 |
| QLT2 | UserRole.MANAGER_LEVEL_2 |
| QLV | UserRole.REGIONAL_MANAGER |
| EMPLOYEE | UserRole.EMPLOYEE |
| CUSTOMER | UserRole.CUSTOMER |

## Storage

Token và user info được lưu trong localStorage:
- `token` - JWT token
- `user` - User object (JSON string)
- `isLoggedIn` - Boolean flag
- `userEmail` - Email (backward compatibility)
- `userRole` - Role name (backward compatibility)

## CORS

Đảm bảo backend cho phép CORS từ `http://localhost:3000`:

```java
@CrossOrigin(origins = "http://localhost:3000")
```
