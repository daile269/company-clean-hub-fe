import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PANPACIFIC - Dịch vụ vệ sinh công nghiệp',
  description: 'Hệ thống quản lý dịch vụ vệ sinh công nghiệp chuyên nghiệp',
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* User Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">PANPACIFIC</h1>
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="/user" className="text-gray-700 hover:text-blue-600 font-medium transition">Trang chủ</a>
              <a href="/user/about" className="text-gray-700 hover:text-blue-600 font-medium transition">Về chúng tôi</a>
              <a href="/user/services" className="text-gray-700 hover:text-blue-600 font-medium transition">Dịch vụ</a>
              <a href="/user/customers" className="text-gray-700 hover:text-blue-600 font-medium transition">Khách hàng</a>
              <a href="/user/news" className="text-gray-700 hover:text-blue-600 font-medium transition">Tin tức</a>
              <a href="/user/contact" className="text-gray-700 hover:text-blue-600 font-medium transition">Liên hệ</a>
            </nav>
            <div className="flex gap-4 items-center">
              <a href="/admin/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition">
                Admin
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PANPACIFIC</h3>
              <p className="text-gray-400">
                Dịch vụ vệ sinh công nghiệp chuyên nghiệp hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dịch Vụ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Dịch Vụ Vệ Sinh</a></li>
                <li><a href="#" className="hover:text-white transition">Kiểm Soát Côn Trùng</a></li>
                <li><a href="#" className="hover:text-white transition">Chăm Sóc Mảng Xanh</a></li>
                <li><a href="#" className="hover:text-white transition">Cung Ứng Lao Động</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên Hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📍 39 Hải Thượng Lãn Ông, Q.5, TP.HCM</li>
                <li>📞 028 3957 4483</li>
                <li>✉️ info@cleanhub.com</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Theo Dõi Chúng Tôi</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition">f</a>
                <a href="#" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition">in</a>
                <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition">yt</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PANPACIFIC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
