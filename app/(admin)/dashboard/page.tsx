export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Tổng khách hàng</p>
          <p className="text-3xl font-bold text-gray-900">156</p>
          <p className="text-green-600 text-sm mt-2">↑ 12% so với tháng trước</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Nhân viên hoạt động</p>
          <p className="text-3xl font-bold text-gray-900">89</p>
          <p className="text-blue-600 text-sm mt-2">65 chính thức, 24 tạm thời</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Hợp đồng sắp hết hạn</p>
          <p className="text-3xl font-bold text-orange-600">7</p>
          <p className="text-gray-600 text-sm mt-2">Trong 30 ngày tới</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Doanh thu tháng này</p>
          <p className="text-3xl font-bold text-gray-900">2.4 tỷ</p>
          <p className="text-green-600 text-sm mt-2">↑ 8% so với tháng trước</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Hoạt động gần đây</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b">
              <span className="text-2xl">👷</span>
              <div>
                <p className="font-medium">Điều động nhân viên mới</p>
                <p className="text-sm text-gray-600">Nguyễn Văn A → Công ty ABC - 2 giờ trước</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-medium">Thanh toán lương tháng 10</p>
                <p className="text-sm text-gray-600">45 nhân viên - 5 giờ trước</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium">Hợp đồng mới</p>
                <p className="text-sm text-gray-600">Công ty XYZ - 1 ngày trước</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Thông báo quan trọng</h2>
          <div className="space-y-3">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-3">
              <p className="font-medium text-orange-900">7 hợp đồng sắp hết hạn</p>
              <p className="text-sm text-orange-700">Cần gia hạn trong 30 ngày tới</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3">
              <p className="font-medium text-blue-900">Cấp phát vật tư tháng 11</p>
              <p className="text-sm text-blue-700">Đến hạn cấp phát cho 89 nhân viên</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-3">
              <p className="font-medium text-green-900">Đánh giá tốt từ khách hàng</p>
              <p className="text-sm text-green-700">15 đánh giá 5 sao trong tuần</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
