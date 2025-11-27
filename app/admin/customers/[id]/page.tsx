"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { customerService } from "@/services/customerService";
import { employeeService } from "@/services/employeeService";
import { assignmentService, AssignmentCreateRequest, TemporaryReassignmentRequest, Assignment } from "@/services/assignmentService";
import { Customer, Employee } from "@/types";

export default function CustomerDetail() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState<Customer | null>(null);
  
  // Assignment states
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [assignedEmployees, setAssignedEmployees] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [notAssignedEmployees, setNotAssignedEmployees] = useState<Employee[]>([]);
  const [loadingNotAssigned, setLoadingNotAssigned] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState<Partial<AssignmentCreateRequest>>({
    startDate: new Date().toISOString().split('T')[0],
    status: "ACTIVE",
    workDays: 20,
    salaryAtTime: 0,
    description: "",
  });
  const [reassignmentForm, setReassignmentForm] = useState<{
    replacementEmployeeId: number | null;
    replacedEmployeeId: number | null;
    date: string;
    salaryAtTime?: number;
    description: string;
  }>({
    replacementEmployeeId: null,
    replacedEmployeeId: null,
    date: new Date().toISOString().split('T')[0],
    salaryAtTime: 0,
    description: "",
  });

  // Load customer data from API
  useEffect(() => {
    if (id) {
      loadCustomer();
      loadAssignedEmployees();
    }
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await customerService.getById(id!);
      setCustomer(data);
    } catch (error) {
      console.error("Error loading customer:", error);
      toast.error("Không thể tải thông tin khách hàng");
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedEmployees = async () => {
    try {
      setLoadingAssignments(true);
      const data = await assignmentService.getByCustomerId(id!);
      setAssignedEmployees(data);
    } catch (error) {
      console.error("Error loading assigned employees:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

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

  if (!customer) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Không tìm thấy khách hàng</h1>
      </div>
    );
  }

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat("vi-VN").format(new Date(date));

  const formatDateInput = (date: Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handleEdit = () => {
    setEditForm({
      ...customer!,
      username: customer?.username || "",
      password: customer?.password || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      const response = await customerService.update(editForm.id, editForm);
      if (response.success) {
        toast.success("Đã cập nhật thông tin khách hàng thành công");
        setShowEditModal(false);
        // Reload customer data
        loadCustomer();
      } else {
        toast.error(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!customer) return;

    try {
      const response = await customerService.delete(customer.id);
      if (response.success) {
        toast.success("Đã xóa khách hàng thành công");
        setShowDeleteModal(false);
        // Navigate back to customers list
        router.push("/admin/customers");
      } else {
        toast.error(response.message || "Xóa thất bại");
      }
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    }
  };

  // Load employees for assignment
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await employeeService.getAll({
        keyword: searchEmployee,
        page: 0,
        pageSize: 100,
      });
      setEmployees(response.content);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleOpenAssignmentModal = () => {
    setShowAssignmentModal(true);
    loadEmployees();
  };

  const handleOpenReassignmentModal = async () => {
    setShowReassignmentModal(true);
    // Load assigned employees for "replaced" column
    await loadAssignedEmployees();
    // Load not-assigned employees for "replacement" column
    await loadNotAssignedEmployees();
  };

  const loadNotAssignedEmployees = async () => {
    try {
      setLoadingNotAssigned(true);
      const data = await assignmentService.getNotAssignedByCustomerId(id!, {
        page: 0,
        pageSize: 100,
      });
      console.log("Not assigned employees:", data);
      setNotAssignedEmployees(data);
    } catch (error) {
      console.error("Error loading not-assigned employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoadingNotAssigned(false);
    }
  };

  const handleTemporaryReassignment = async () => {
    if (!reassignmentForm.replacementEmployeeId || !reassignmentForm.replacedEmployeeId) {
      toast.error("Vui lòng chọn đầy đủ nhân viên thay thế và nhân viên bị thay");
      return;
    }

    try {
      const data: TemporaryReassignmentRequest = {
        replacementEmployeeId: reassignmentForm.replacementEmployeeId,
        replacedEmployeeId: reassignmentForm.replacedEmployeeId,
        date: reassignmentForm.date,
        salaryAtTime: reassignmentForm.salaryAtTime ?? 0,
        description: reassignmentForm.description || "Điều động tạm thời",
      };

      const response = await assignmentService.temporaryReassignment(data);
      
      if (response.success) {
        toast.success("Điều động tạm thời thành công");
        setShowReassignmentModal(false);
        setReassignmentForm({
          replacementEmployeeId: null,
          replacedEmployeeId: null,
          date: new Date().toISOString().split('T')[0],
          description: "",
        });
      } else {
        toast.error(response.message || "Điều động thất bại");
      }
    } catch (error: any) {
      console.error("Error temporary reassignment:", error);
      toast.error(error.message || "Có lỗi xảy ra khi điều động");
    }
  };

  const handleAssignEmployee = async (employee: Employee) => {
    if (!customer) return;

    try {
      const assignmentData: AssignmentCreateRequest = {
        employeeId: Number(employee.id),
        customerId: Number(customer.id),
        startDate: assignmentForm.startDate || new Date().toISOString().split('T')[0],
        status: assignmentForm.status || "ACTIVE",
        salaryAtTime: assignmentForm.salaryAtTime || employee.monthlySalary || employee.dailySalary || 0,
        workDays: assignmentForm.workDays || 20,
        description: assignmentForm.description || `Phân công ${employee.name} đến ${customer.name}`,
      };

      const response = await assignmentService.create(assignmentData);
      
      if (response.success) {
        toast.success(`Đã phân công nhân viên ${employee.name} thành công`);
        setShowAssignmentModal(false);
        // Reset form
        setAssignmentForm({
          startDate: new Date().toISOString().split('T')[0],
          status: "ACTIVE",
          workDays: 20,
          salaryAtTime: 0,
          description: "",
        });
        // Reload assigned employees list
        loadAssignedEmployees();
      } else {
        toast.error(response.message || "Phân công thất bại");
      }
    } catch (error: any) {
      console.error("Error assigning employee:", error);
      toast.error(error.message || "Có lỗi xảy ra khi phân công");
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Chi tiết khách hàng</h1>
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
            onClick={handleOpenAssignmentModal}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Phân công nhân viên
          </button>
          <button
            onClick={handleOpenReassignmentModal}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 inline-flex items-center gap-2"
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Điều động tạm thời
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
          {/* <button
            onClick={() => setShowDeleteModal(true)}
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
          </button> */}
        </div>
      </div>

      {/* Main Information Grid - 2 Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin cơ bản
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Mã khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {customer.code}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    customer.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {customer.status === "ACTIVE"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tên khách hàng</p>
                <p className="text-sm font-semibold text-gray-900">
                  {customer.name}
                </p>
              </div>
              {customer.username && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tên đăng nhập</p>
                  <p className="text-sm text-gray-900">{customer.username}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                <p className="text-sm text-gray-900">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-900">
                  {customer.email || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
              <p className="text-sm text-gray-900">{customer.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                <p className="text-sm text-gray-900">
                  {customer.createdAt ? formatDate(customer.createdAt) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-900">
                  {customer.updatedAt ? formatDate(customer.updatedAt) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Thông tin doanh nghiệp */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
            Thông tin doanh nghiệp
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tên công ty</p>
              <p className="text-sm font-semibold text-gray-900">
                {customer.company || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Mã số thuế</p>
              <p className="text-sm font-mono font-medium text-gray-900">
                {customer.taxCode || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Người liên hệ</p>
              <p className="text-sm text-gray-900">
                {customer.contactPerson || "N/A"}
              </p>
            </div>

            {customer.description && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {customer.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Nhân viên đang phụ trách */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Nhân viên đang phụ trách
          </h3>
          <button
            onClick={loadAssignedEmployees}
            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Làm mới
          </button>
        </div>

        {loadingAssignments ? (
          <div className="flex justify-center items-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
        ) : assignedEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mx-auto mb-3 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-sm">Chưa có nhân viên nào được phân công cho khách hàng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã phân công</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mã NV</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Tên nhân viên</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Lương</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Ngày công</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {assignedEmployees.map((assignment) => (
                  <tr
                    key={assignment.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/admin/assignments/${assignment.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") router.push(`/admin/assignments/${assignment.id}`);
                      }}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-blue-600">
                        {assignment.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-blue-600">
                        {assignment.employeeCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        {assignment.employeeName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {formatDate(assignment.startDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          assignment.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {assignment.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(assignment.salaryAtTime)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {assignment.workDays} ngày
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {assignment.description || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Phân công nhân viên cho {customer.name}
              </h2>
              <button
                onClick={() => setShowAssignmentModal(false)}
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

            {/* Assignment Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin phân công</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Số ngày làm việc *
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.workDays}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, workDays: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lương tại thời điểm (VND)
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.salaryAtTime}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, salaryAtTime: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sẽ lấy từ lương nhân viên"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={assignmentForm.status}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ghi chú về phân công..."
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchEmployee}
                onChange={(e) => {
                  setSearchEmployee(e.target.value);
                  loadEmployees();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Employee List */}
            {loadingEmployees ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Không tìm thấy nhân viên</p>
                ) : (
                  employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-600">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.code} • {employee.phone}</p>
                          <p className="text-xs text-gray-400">
                            {employee.employeeType === "FIXED_BY_CONTRACT"
                              ? "Nhân viên chính tại chỗ"
                              : employee.employeeType === "FIXED_BY_DAY"
                              ? "Nhân viên chính điều động"
                              : "Nhân viên thời vụ"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {employee.monthlySalary
                            ? formatCurrency(employee.monthlySalary) + "/tháng"
                            : employee.dailySalary
                            ? formatCurrency(employee.dailySalary) + "/ngày"
                            : "N/A"}
                        </p>
                        <button
                          onClick={() => handleAssignEmployee(employee)}
                          className="mt-2 px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Chọn
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa khách hàng
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
                  Mã khách hàng *
                </label>
                <input
                  type="text"
                  value={editForm.code}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng *
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
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  Tên công ty
                </label>
                <input
                  type="text"
                  value={editForm.company || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, company: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã số thuế
                </label>
                <input
                  type="text"
                  value={editForm.taxCode || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, taxCode: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người liên hệ
                </label>
                <input
                  type="text"
                  value={editForm.contactPerson || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contactPerson: e.target.value })
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
                  Mô tả
                </label>
                <textarea
                  value={editForm.description || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ghi chú thêm về khách hàng..."
                />
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

      {/* Temporary Reassignment Modal */}
      {showReassignmentModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Điều động nhân viên tạm thời
              </h2>
              <button
                onClick={() => setShowReassignmentModal(false)}
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

            {/* Reassignment Form */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin điều động</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ngày điều động *
                  </label>
                  <input
                    type="date"
                    value={reassignmentForm.date}
                    onChange={(e) =>
                      setReassignmentForm({ ...reassignmentForm, date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lương tại thời điểm (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reassignmentForm.salaryAtTime ?? 0}
                    onChange={(e) =>
                      setReassignmentForm({ ...reassignmentForm, salaryAtTime: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Lý do điều động
                  </label>
                  <textarea
                    value={reassignmentForm.description}
                    onChange={(e) =>
                      setReassignmentForm({ ...reassignmentForm, description: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="VD: Nhân viên A nghỉ ốm, B thay thế..."
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={searchEmployee}
                onChange={(e) => {
                  setSearchEmployee(e.target.value);
                  loadEmployees();
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Two Columns for Selection */}
            <div className="grid grid-cols-2 gap-6">
              {/* Column 1: Nhân viên bị thay (đang phụ trách) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                  Nhân viên bị thay (đang phụ trách)
                  {reassignmentForm.replacedEmployeeId && (
                    <span className="ml-2 text-xs text-purple-600">
                      ✓ Đã chọn
                    </span>
                  )}
                </h3>
                {loadingAssignments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {assignedEmployees.length === 0 ? (
                      <p className="text-center text-gray-500 py-8 text-sm">
                        Chưa có nhân viên phụ trách
                      </p>
                    ) : (
                      assignedEmployees.map((assignment) => (
                        <div
                          key={`replaced-${assignment.employeeId}`}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            reassignmentForm.replacedEmployeeId === assignment.employeeId
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            setReassignmentForm({
                              ...reassignmentForm,
                              replacedEmployeeId: assignment.employeeId,
                            })
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-red-600">
                                {assignment.employeeName?.charAt(0) || 'N'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {assignment.employeeName}
                              </p>
                              <p className="text-xs text-gray-500">{assignment.employeeCode}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Column 2: Nhân viên thay thế (không phụ trách) */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">
                  Nhân viên thay thế (chưa phụ trách)
                  {reassignmentForm.replacementEmployeeId && (
                    <span className="ml-2 text-xs text-green-600">
                      ✓ Đã chọn
                    </span>
                  )}
                </h3>
                {loadingNotAssigned ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {notAssignedEmployees.length === 0 ? (
                      <p className="text-center text-gray-500 py-8 text-sm">
                        Không có nhân viên khả dụng
                      </p>
                    ) : (
                      notAssignedEmployees.map((employee) => (
                        <div
                          key={`replacement-${employee.id}`}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            reassignmentForm.replacementEmployeeId === Number(employee.id)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            setReassignmentForm({
                              ...reassignmentForm,
                              replacementEmployeeId: Number(employee.id),
                            })
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-green-600">
                                {employee.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {employee.name}
                              </p>
                              <p className="text-xs text-gray-500">{employee.code}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReassignmentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleTemporaryReassignment}
                disabled={!reassignmentForm.replacedEmployeeId || !reassignmentForm.replacementEmployeeId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
                Xác nhận điều động
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
