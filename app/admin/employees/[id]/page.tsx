"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  mockPayrolls,
  mockAssignments,
  mockRatings,
  mockCustomers,
} from "@/lib/mockData";
import { Employee, EmployeeType } from "@/types";

import { employeeService, buildCloudinaryUrl, type EmployeeImage } from "@/services/employeeService";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { assignmentService, Assignment } from "@/services/assignmentService";


export default function EmployeeDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;

  const router = useRouter();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Employee | null>(null);
  const [employeeImages, setEmployeeImages] = useState<EmployeeImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageManageModal, setShowImageManageModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEmployeeImage, setIsUploadingEmployeeImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getById(id!);
      console.log(data);
      setEmployee(data);
      
      // Load employee images
      const images = await employeeService.getEmployeeImages(id!);
      setEmployeeImages(images);
      setSelectedImageIndex(0);
    } catch (error) {
      console.error("Error loading employee:", error);
    } finally {
      setLoading(false);
    }
  };

  // keep payrolls/ratings from mock for now
  const payrolls = mockPayrolls.filter((p) => p.employeeId === id).slice(0, 6);
  const ratings = mockRatings.filter((r) => r.employeeId === id).slice(0, 6);

  useEffect(() => {
    if (id) loadAssignments();
  }, [id]);

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await assignmentService.getByEmployeeId(id!);
      setAssignments(data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };
  // previous mockAssignments removed in favor of real API

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Không tìm thấy nhân viên</h1>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("vi-VN").format(new Date(date));

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleEdit = () => {
    // include username and an empty password field so hidden inputs exist
    setEditForm({
      ...(employee as Employee),
      username: (employee as any).username || "",
      password: (employee as any).password || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const response = await employeeService.update(editForm.id, editForm);
      if (response.success) {
        toast.success("Đã cập nhật thông tin nhân viên thành công");
        setShowEditModal(false);
        // Reload employee data
        loadEmployee();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setIsDeletingImage(true);
      await employeeService.deleteImage(id!, imageId);
      toast.success("Đã xóa ảnh thành công");
      // Reload images
      const images = await employeeService.getEmployeeImages(id!);
      setEmployeeImages(images);
      setImageToDelete(null);
    } catch (error: any) {
      console.error("Error deleting image:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa ảnh");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }
 
      const response = await employeeService.uploadImages(id, formData);
      if (response.success) {
        toast.success("Đã tải lên ảnh thành công");
        // Reload images
        const images = await employeeService.getEmployeeImages(id!);
        setEmployeeImages(images);
      } else {
        toast.error(response.message || "Tải lên thất bại");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải lên");
    } finally {
      setIsUploadingImage(false);
      // Reset input
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadEmployeeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !id) return;

    try {
      setIsUploadingEmployeeImage(true);
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      const response = await employeeService.uploadImages(id, formData);
      if (response.success) {
        toast.success("Đã tải lên ảnh thành công");
        // Reload images
        const images = await employeeService.getEmployeeImages(id!);
        setEmployeeImages(images);
        setSelectedImageIndex(0);
      } else {
        toast.error(response.message || "Tải lên thất bại");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Có lỗi xảy ra khi tải lên");
    } finally {
      setIsUploadingEmployeeImage(false);
      // Reset input
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Chi tiết nhân viên</h1>
        {employee && (
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
              className="px-3 py-1 bg-[#19AD70] text-white rounded hover:bg-[#158F60] inline-flex items-center gap-2 cursor-pointer"
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
          </div>
        )}
      </div>

      {/* Main Information Grid - 2 Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin cá nhân */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Mã nhân viên</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.employeeCode}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    employee.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.status === "ACTIVE"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                <p className="text-sm font-semibold text-gray-900">
                  {employee.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">CCCD</p>
                <p className="text-sm text-gray-900">
                  {employee.idCard || "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
                <p className="text-sm text-gray-900">
                  {(employee as any).username || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Vai trò</p>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {(employee as any).roleName || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
              <p className="text-sm text-gray-900">{employee.phone}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
              <p className="text-sm text-gray-900">{employee.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                <p className="text-sm text-gray-900">
                  {employee.createdAt ? formatDate(employee.createdAt) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-900">
                  {employee.updatedAt ? formatDate(employee.updatedAt) : "N/A"}
                </p>
              </div>
            </div>

            {employee.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {employee.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Thông tin ngân hàng */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin ngân hàng
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Số tài khoản</p>
              <p className="text-sm font-mono font-medium text-gray-900">
                {employee.bankAccount || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ngân hàng</p>
              <p className="text-sm font-medium text-gray-900">
                {employee.bankName || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Images Section */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Hình ảnh nhân viên
          </h3>
          {employeeImages.length > 0 && (
            <button
              onClick={() => setShowImageManageModal(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2 cursor-pointer text-sm"
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
          )}
        </div>
        
        {employeeImages.length > 0 ? (
          <>
            <div className="space-y-4 flex gap-3">
              
              {/* Main Image - Fixed size container */}
              <div className="w-9/12 h-96 bg-gray-100 rounded-lg py-3 overflow-hidden flex justify-center items-center">
                {employeeImages[selectedImageIndex] ? (
                  <img
                    src={buildCloudinaryUrl(employeeImages[selectedImageIndex].cloudinaryPublicId)}
                    alt={`Employee image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center text-gray-400">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnail Images - Square grid */}
              {employeeImages.length > 1 && (
                <div className="w-3/12 grid grid-cols-3 gap-2">
                  {employeeImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`aspect-square cursor-pointer rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                      onMouseEnter={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={buildCloudinaryUrl(image.cloudinaryPublicId)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Info */}
            {employeeImages[selectedImageIndex] && (
              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <p>
                  Ảnh {selectedImageIndex + 1} / {employeeImages.length}
                </p>
                {employeeImages[selectedImageIndex].uploadedAt && (
                  <p>
                    Ngày tải lên:{" "}
                    {new Intl.DateTimeFormat("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(employeeImages[selectedImageIndex].uploadedAt))}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <ImageUploader
            onChange={handleUploadEmployeeImage}
            isLoading={isUploadingEmployeeImage}
            loadingText="Đang tải..."
            emptyText="Chưa có hình ảnh"
            helpText="Click để chọn hoặc kéo thả ảnh"
            aspectRatio="video"
            width="w-7/12"
            multiple={true}
          />
        )}
      </div>

      {/* Assignments */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">
          Phân công
        </h2>
        {loadingAssignments ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có phân công nào</p>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a) => {
              // prefer customerName returned by API, fallback to mockCustomers
              const customer = (a.customerName && { name: a.customerName }) || mockCustomers.find((c) => c.id === String(a.customerId));
              return (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/admin/assignments/${a.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") router.push(`/admin/assignments/${a.id}`);
                  }}
                  className="p-4 bg-white rounded shadow-sm border cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">
                        {customer?.name || a.customerId}
                      </p>
                      <p className="text-sm text-gray-500">
                        { (a as any).workSchedule || a.description || (a.workDays ? `${a.workDays} ngày` : "") }
                      </p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {a.startDate ? new Intl.DateTimeFormat("vi-VN").format(new Date(a.startDate)) : ""}
                    </div>
                  </div>
                  {a.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      Ghi chú: {a.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>


      {/* Ratings */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Đánh giá từ khách hàng</h2>
        {ratings.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có đánh giá</p>
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded shadow-sm border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      Khách hàng:{" "}
                      {mockCustomers.find((c) => c.id === r.customerId)?.name ||
                        r.customerId}
                    </div>
                    <div className="text-yellow-500">
                      {"★".repeat(r.rating)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Intl.DateTimeFormat("vi-VN").format(
                      new Date(r.createdAt)
                    )}
                  </div>
                </div>
                {r.feedback && (
                  <p className="mt-2 text-sm text-gray-600">{r.feedback}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa nhân viên
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
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  value={editForm.employeeCode}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CCCD *
                </label>
                <input
                  type="text"
                  value={editForm.idCard}
                  onChange={(e) =>
                    setEditForm({ ...editForm, idCard: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={editForm.status || "ACTIVE"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={editForm.bankAccount || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bankAccount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngân hàng
                </label>
                <input
                  type="text"
                  value={editForm.bankName || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bankName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: VietBank"
                />
              </div>



              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm về nhân viên..."
                />
              </div>
              <input type="hidden" value={editForm.username || ""} />
              <input type="hidden" value={editForm.password || ""} />
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

      {/* Image Management Modal */}
      {showImageManageModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Loading Overlay */}
            {(isUploadingImage || isDeletingImage) && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-40">
                <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
                  <svg
                    className="animate-spin h-10 w-10 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700">{isDeletingImage ? "Đang xóa..." : "Đang tải..."}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Quản lý hình ảnh nhân viên
              </h2>
              <button
                onClick={() => setShowImageManageModal(false)}
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

            {/* Confirm Delete Toast */}
            {imageToDelete && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Bạn có chắc muốn xóa ảnh này? Hành động này không thể hoàn tác.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImageToDelete(null)}
                    disabled={isDeletingImage}
                    className="px-3 py-2 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleDeleteImage(imageToDelete)}
                    disabled={isDeletingImage}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isDeletingImage ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang xóa...
                      </>
                    ) : (
                      "Xóa"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Images Grid */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-4">
                Hình ảnh hiện tại ({employeeImages.length})
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {employeeImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-square group"
                  >
                    <img
                      src={buildCloudinaryUrl(image.cloudinaryPublicId)}
                      alt={`Employee image ${image.id}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    {/* Delete button */}
                    <button
                      onClick={() => setImageToDelete(image.id.toString())}
                      disabled={isDeletingImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa ảnh"
                    >
                      <svg
                        className="w-5 h-5"
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
                ))}

                {/* Upload area */}
                <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors bg-gray-50">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="animate-spin h-6 w-6 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <p className="text-xs font-medium text-gray-600">Đang tải...</p>
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <svg
                      className="w-8 h-8 mx-auto text-gray-400 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-xs font-medium text-gray-600">
                      {isUploadingImage ? "Đang tải..." : "Thêm ảnh"}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => setShowImageManageModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
