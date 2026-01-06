"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { reviewService, Review } from "@/services/reviewService";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const getReviewerRoleLabel = (role?: string) => {
    if (!role) return undefined;
    switch (role) {
      case "CUSTOMER":
        return "Khách hàng";
      case "QLT1":
        return "Quản lý tổng 1";
      case "QLT2":
        return "Quản lý tổng 2";
      case "QLV":
        return "Quản lý vùng";
      case "EMPLOYEE":
        return "Nhân viên";
      case "ACCOUNTANT":
        return "Kế toán";
      default:
        return role;
    }
  };

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<{ rating: number; comment: string }>(
    { rating: 5, comment: "" }
  );
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const r = await reviewService.getById(id);
        console.log("Loaded review:", r);
        setReview(r);
      } catch (err) {
        console.error("Error loading review:", err);
        toast.error("Không thể tải chi tiết đánh giá");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) return;
    try {
      setDeleting(true);
      const res = await reviewService.delete(id);
      if (res && res.success) {
        toast.success("Đã xóa đánh giá");
        router.back();
      } else {
        toast.error(res?.message || "Xóa thất bại");
      }
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(err?.message || "Lỗi khi xóa đánh giá");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Chi tiết đánh giá</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded cursor-pointer"
          >
            {" "}
            ← Quay lại
          </button>
          <button
            onClick={() => {
              if (review) {
                setEditForm({
                  rating: review.rating ?? 5,
                  comment: review.comment ?? "",
                });
                setShowEditModal(true);
              }
            }}
            className="px-3 py-2 bg-green-500 hover:bg-green-700 text-white rounded cursor-pointer inline-flex items-center gap-2"
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
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-2 bg-red-500 hover:bg-red-700 text-white rounded disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
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
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !review ? (
            <p className="text-center text-gray-500">Không tìm thấy đánh giá</p>
          ) : (
            <div className="space-y-4 text-sm text-gray-800">
              <div>
                <div className="text-xs text-gray-500">Người đánh giá</div>
                <div>
                  {review.reviewerName ?? (review.reviewerId ? `#${review.reviewerId}` : (review.customerName ?? "-"))} -
                  {review.reviewerRole ? (
                    <span className="ml-2 text-xs text-gray-500">({getReviewerRoleLabel(review.reviewerRole)})</span>
                  ) : null}
                </div>
              </div>
              {review.employeeName && (
                <div>
                  <div className="text-xs text-gray-500">
                    Nhân viên được đánh giá
                  </div>
                  <div className="font-medium">{review.employeeName} - {review.employeeRole ? getReviewerRoleLabel(review.employeeRole) : "-"}</div>
                </div>
              )}

              {review.employeeCode && (
                <div>
                  <div className="text-xs text-gray-500">
                    Mã nhân viên được đánh giá
                  </div>
                  <div>{review.employeeCode ?? "-"}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-500">Khách hàng</div>
                <div>{review.customerName ?? "-"}</div>
              </div>

              
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : !review ? (
            <p className="text-center text-gray-500">Không tìm thấy đánh giá</p>
          ) : (
            <div className="space-y-4 text-sm text-gray-800">
              <div>
                <div className="text-xs text-gray-500">Điểm đánh giá</div>
                <div className="text-lg font-semibold">
                  {review.rating ?? "-"} / 5
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Bình luận</div>
                <div className="whitespace-pre-wrap">
                  {review.comment || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Ngày tạo</div>
                <div>
                  {review.createdAt
                    ? new Intl.DateTimeFormat("vi-VN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(review.createdAt))
                    : "-"}
                </div>
              </div>

              
            </div>
          )}
        </div>
      </div>
      {/* Edit Review Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chỉnh sửa đánh giá</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Đánh giá
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      title={`${s} sao`}
                      onClick={() => setEditForm({ ...editForm, rating: s })}
                      className="text-2xl focus:outline-none"
                    >
                      {editForm.rating >= s ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.973a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.287 3.973c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.784.57-1.84-.197-1.54-1.118l1.287-3.973a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69L9.05 2.927z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.973a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.383 2.46a1 1 0 00-.364 1.118l1.287 3.973c.3.921-.755 1.688-1.54 1.118l-3.383-2.46a1 1 0 00-1.176 0l-3.383 2.46c-.784.57-1.84-.197-1.54-1.118l1.287-3.973a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69L11.05 2.927z"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                  <span className="text-sm text-gray-600">
                    {editForm.rating} sao
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Bình luận
                </label>
                <textarea
                  rows={4}
                  value={editForm.comment}
                  onChange={(e) =>
                    setEditForm({ ...editForm, comment: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!id) return toast.error("Không có mã đánh giá");
                  if (
                    !editForm.rating ||
                    editForm.rating < 1 ||
                    editForm.rating > 5
                  )
                    return toast.error("Điểm phải từ 1 tới 5");
                  try {
                    setSavingEdit(true);
                    const payload: any = {
                      rating: Number(editForm.rating),
                      comment: editForm.comment,
                    };
                    const res = await reviewService.update(id, payload);
                    if (res && res.success) {
                      toast.success("Đã cập nhật đánh giá");
                      setShowEditModal(false);
                      // reload review
                      try {
                        setLoading(true);
                        const r = await reviewService.getById(id);
                        setReview(r);
                      } catch (err) {
                        console.error(
                          "Error reloading review after update:",
                          err
                        );
                      } finally {
                        setLoading(false);
                      }
                    } else {
                      toast.error(res?.message || "Cập nhật thất bại");
                    }
                  } catch (err: any) {
                    console.error("Error updating review:", err);
                    toast.error(err?.message || "Lỗi khi cập nhật đánh giá");
                  } finally {
                    setSavingEdit(false);
                  }
                }}
                disabled={savingEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {savingEdit ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
