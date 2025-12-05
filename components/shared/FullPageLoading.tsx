"use client";

export default function FullPageLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/90 z-[9999]">
      <div className="w-14 h-14 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-700 text-base">Đang tải, vui lòng chờ...</p>
    </div>
  );
}
