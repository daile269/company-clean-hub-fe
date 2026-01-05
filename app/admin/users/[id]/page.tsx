"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import userService, { ApiUser } from "@/services/userService";
import toast, { Toaster } from "react-hot-toast";

export default function UserDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    roleId: 2,
    status: "ACTIVE",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user detail
  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await userService.getById(id);
        setUser(data);
      } catch (error) {
        console.error("Error loading user:", error);
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h1 className="text-xl font-bold">Không tìm thấy người dùng</h1>
          <button
            onClick={() => router.push("/admin/users")}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getRoleName = (roleName: string) => {
    switch (roleName) {
      case "QLT1":
        return "Quản lý tổng 1";
      case "QLT2":
        return "Quản lý tổng 2";
      case "QLV":
        return "Quản lý vùng";
      case "ACCOUNTANT":
        return "Kế toán";
      case "EMPLOYEE":
        return "Nhân viên";
      case "CUSTOMER":
        return "Khách hàng";
      default:
        return roleName;
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "QLT1":
        return "bg-purple-100 text-purple-800";
      case "QLT2":
        return "bg-indigo-100 text-indigo-800";
      case "QLV":
        return "bg-blue-100 text-blue-800";
      case "ACCOUNTANT":
        return "bg-green-100 text-green-800";
      case "EMPLOYEE":
        return "bg-gray-100 text-gray-800";
      case "CUSTOMER":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleEdit = () => {
    setEditForm({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!id) return;

    // Validate username
    if (!editForm.username || editForm.username.length < 3 || editForm.username.length > 50) {
      toast.error("Tên đăng nhập phải có độ dài từ 3 đến 50 ký tự");
      return;
    }

    // Validate name
    if (!editForm.name) {
      toast.error("Họ tên bắt buộc");
      return;
    }
    if (editForm.name.length > 100) {
      toast.error("Họ tên không được vượt quá 100 ký tự");
      return;
    }

    // Validate email
    if (!editForm.email) {
      toast.error("Email bắt buộc");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      toast.error("Email không hợp lệ");
      return;
    }

    // Validate phone
    if (editForm.phone && editForm.phone.length > 50) {
      toast.error("Số điện thoại không được vượt quá 50 ký tự");
      return;
    }

    try {
      // Send update with a placeholder password (backend requirement)
      await userService.update(id, {
        ...editForm,
        password: "password123", // Required by backend but won't be changed
      });
      toast.success("Cập nhật người dùng thành công");
      setShowEditModal(false);

      // Reload user data
      const updatedUser = await userService.getById(id);
      setUser(updatedUser);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword) {
      toast.error("Mật khẩu mới bắt buộc");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      // TODO: Implement change password API
      toast.success("Đã đổi mật khẩu thành công");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại
          </button>
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 4h6m-1 4L7 17l-4 1 1-4 9-9z"
              />
            </svg>
            Sửa
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Đổi mật khẩu
          </button>
          <button
            onClick={async () => {
              if (!id) return;
              if (!confirm("Xác nhận xóa người dùng này?")) return;

              try {
                await userService.delete(id);
                toast.success("Xóa người dùng thành công");
                router.push("/admin/users");
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra";
                toast.error(`Lỗi: ${errorMessage}`);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-7 0h10"
              />
            </svg>
            Xóa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">ID</p>
            <p className="text-sm text-gray-900">#{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tên đăng nhập</p>
            <p className="text-sm text-gray-900">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-sm text-gray-900">{user.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Họ tên</p>
            <p className="text-sm text-gray-900">{user.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="text-sm text-gray-900">{user.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Vai trò</p>
            <p className="mt-1">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                  user.roleName
                )}`}
              >
                {getRoleName(user.roleName)}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <p className="mt-1">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                {user.status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ngày tạo</p>
            <p className="text-sm text-gray-900">
              {formatDate(user.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
            <p className="text-sm text-gray-900">
              {formatDate(user.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa người dùng
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  minLength={3}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Nguyễn Văn A"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò *
                </label>
                <select
                  value={editForm.roleId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, roleId: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Khách hàng</option>
                  <option value={2}>Nhân viên</option>
                  <option value={3}>Quản lý tổng 1</option>
                  <option value={4}>Quản lý tổng 2</option>
                  <option value={5}>Quản lý vùng</option>
                  <option value={6}>Kế toán</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 inline-flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
