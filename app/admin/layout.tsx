import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - PANPACIFIC Management',
  description: 'Hệ thống quản trị nội bộ PANPACIFIC',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">PANPACIFIC Admin</h1>
            <nav className="space-y-2">
              <a href="/admin/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800">
                📊 Dashboard
              </a>
              <a href="/admin/customers" className="block px-4 py-2 rounded hover:bg-gray-800">
                👥 Khách hàng
              </a>
              <a href="/admin/employees" className="block px-4 py-2 rounded hover:bg-gray-800">
                👷 Nhân viên
              </a>
              <a href="/admin/assignments" className="block px-4 py-2 rounded hover:bg-gray-800">
                📅 Điều động
              </a>
              <a href="/admin/attendance" className="block px-4 py-2 rounded hover:bg-gray-800">
                ✓ Chấm công
              </a>
              <a href="/admin/payroll" className="block px-4 py-2 rounded hover:bg-gray-800">
                💰 Lương
              </a>
              <a href="/admin/supplies" className="block px-4 py-2 rounded hover:bg-gray-800">
                📦 Vật tư
              </a>
              <a href="/admin/reports" className="block px-4 py-2 rounded hover:bg-gray-800">
                📈 Báo cáo
              </a>
              <a href="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-800">
                ⚙️ Cài đặt
              </a>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Header */}
          <header className="bg-white shadow-sm">
            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Quản trị hệ thống</h2>
              <div className="flex items-center gap-4">
                <button className="relative">
                  🔔
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  <img 
                    src="/avatar-placeholder.png" 
                    alt="User" 
                    className="w-8 h-8 rounded-full bg-gray-300"
                  />
                  <span className="text-sm font-medium">Admin User</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
