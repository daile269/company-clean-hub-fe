# Clean Hub - Hệ thống quản lý công ty vệ sinh công nghiệp

## Cấu trúc dự án

```
company-clean-hub-fe/
├── app/
│   ├── (user)/              # Giao diện người dùng public
│   │   ├── layout.tsx       # Layout cho user
│   │   └── page.tsx         # Trang chủ user
│   ├── (admin)/             # Giao diện quản trị admin
│   │   ├── layout.tsx       # Layout cho admin (sidebar, header)
│   │   └── dashboard/       # Dashboard admin
│   ├── api/                 # API routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Root page (redirect)
│
├── components/
│   ├── user/                # Components cho user interface
│   ├── admin/               # Components cho admin interface
│   └── shared/              # Components dùng chung
│       ├── Button.tsx       # Component button
│       ├── Input.tsx        # Component input
│       └── Card.tsx         # Component card
│
├── lib/
│   └── auth.ts              # Authentication utilities
│
├── types/
│   └── index.ts             # TypeScript types & interfaces
│
├── utils/
│   ├── constants.ts         # Hằng số
│   └── helpers.ts           # Helper functions
│
├── hooks/                   # Custom React hooks
│
└── public/                  # Static assets
```

## Các module chức năng

### 1. Quản lý khách hàng
- CRUD khách hàng
- Quản lý hợp đồng
- Lịch sử thay đổi
- Nhắc nhở hết hạn

### 2. Quản lý nhân viên
- CRUD nhân viên (chính thức/tạm thời)
- Quản lý thông tin cá nhân
- Lịch sử làm việc

### 3. Điều động & Lịch làm
- Gán nhân viên cho khách hàng
- Lịch cố định/tạm thời
- Tự động chấm công

### 4. Chấm công & Tính lương
- Chấm công tự động/thủ công
- Tính lương theo tháng/ngày
- Xuất bảng lương

### 5. Đánh giá
- Khách hàng đánh giá nhân viên
- Xem điểm đánh giá

### 6. Quản lý vật tư
- Danh mục vật tư
- Tồn kho
- Cấp phát

### 7. Báo cáo
- Báo cáo doanh thu
- Xuất Excel/PDF
- Bảng công có chữ ký

### 8. Phân quyền
6 loại user:
- Khách hàng
- Quản lý tổng 1 (QLT1)
- Quản lý tổng 2 (QLT2)
- Quản lý vùng (QLV)
- Nhân viên
- Kế toán

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: (Sẽ thêm sau - Redux/Zustand)
- **API**: REST API / GraphQL (Sẽ quyết định)
- **Database**: (Backend - PostgreSQL/MySQL)

## Cài đặt

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Tạo file `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Roadmap

- [x] Setup cấu trúc dự án cơ bản
- [x] Tạo layouts cho User và Admin
- [x] Tạo TypeScript types
- [ ] Implement authentication
- [ ] Tạo các pages cho modules chính
- [ ] Tích hợp API
- [ ] Implement form validation
- [ ] Thêm state management
- [ ] Tối ưu performance
- [ ] Testing
- [ ] Deployment

## License

Private - Clean Hub Company © 2025
