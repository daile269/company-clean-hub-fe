import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Opti Clean — PANPACIFIC",
  description: "Opti Clean — giải pháp vệ sinh công nghiệp do PANPACIFIC phát triển",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header */}
        <header className="bg-[#19AD70] shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <a href="/">
              <div className="flex items-center">
                <img src="/logo2.jpg" alt="PANPACIFIC" className="w-10 h-10 object-contain mr-3" />
                <h1 className="text-2xl font-bold text-white">PANPACIFIC</h1>
              </div>
              </a>
              <nav className="hidden md:flex gap-8">
                <a
                  href="/"
                  className="text-white font-bold transition uppercase relative pb-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
                >
                  Trang chủ
                </a>
                <a
                  href="/#about"
                  className="text-white font-bold transition uppercase relative pb-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
                >
                  Giới thiệu
                </a>
                
                {/* Dropdown Dịch vụ */}
                <div className="relative group">
                  <a 
                    href="/#services"
                    className="text-white font-bold transition uppercase flex items-center gap-1 pb-1 group-hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
                  >
                    Dịch vụ
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <a href="/services/ve-sinh-kinh-alu" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh kính-alu
                      </a>
                      <a href="/services/ve-sinh-van-phong" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh văn phòng
                      </a>
                      <a href="/services/ve-sinh-theo-gio" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh theo giờ
                      </a>
                      <a href="/services/ve-sinh-truong-hoc" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh trường học
                      </a>
                      <a href="/services/ve-sinh-giat-ghe-tham" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh, giặt ghế thảm
                      </a>
                      <a href="/services/tong-ve-sinh" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Tổng vệ sinh
                      </a>
                      <a href="/services/ve-sinh-tttm-sieu-thi" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh TTTM-siêu thị
                      </a>
                      <a href="/services/ve-sinh-nha-xuong" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        Vệ sinh nhà xưởng
                      </a>
                    </div>
                  </div>
                </div>

                <a
                  href="/#customers"
                  className="text-white font-bold transition uppercase relative pb-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
                >
                  Khách hàng
                </a>
                <a
                  href="/#news"
                  className="text-white font-bold transition uppercase relative pb-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
                >
                  Tin tức
                </a>
                <a
                  href="/#contact"
                  className="text-white font-bold transition uppercase relative pb-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
                >
                  Liên hệ
                </a>
              </nav>
              <div className="flex gap-4 items-center">
                {/* <a
                  href="/admin/dashboard"
                  className="text-white hover:text-gray-200 font-bold transition"
                >
                  Admin
                </a> */}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Floating Contact Buttons */}
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4">
          {/* Zalo Button */}
          <a
            href="https://zalo.me/0367897956"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
          >
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-110 animate-pulse">
              <img src="/zalo.png" alt="Zalo" className="w-8 h-8" />
            </div>
          </a>

          {/* Phone Button */}
          <a
            href="tel:02866838966"
            className="group relative"
          >
            <div className="flex items-center gap-3 bg-[#19AD70] rounded-full px-6 py-3 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#19AD70]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">02866838966</span>
            </div>
          </a>
        </div>

        {/* Footer */}
        <footer className="bg-[#19AD70] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-1">
              <div>
                <h3 className="text-xl font-bold mb-4">PANPACIFIC</h3>
                <p className="text-white mb-4">
                  Dịch vụ vệ sinh công nghiệp chuyên nghiệp hàng đầu Việt Nam
                </p>
                <div className="space-y-2 text-white text-sm">
                  <p className="font-semibold text-white">
                    CÔNG TY TNHH PANPACIFIC
                  </p>
                  <p>MST: 0317443120</p>
                  <p>
                    📞 Hotline:{" "}
                    <a href="tel:02866838966" className="hover:text-white">
                      028 6683 8966
                    </a>
                  </p>
                  <p>
                    💬 Zalo:{" "}
                    <a href="tel:0367897956" className="hover:text-white">
                      036 789 7956
                    </a>
                  </p>
                  <p>
                    ✉️{" "}
                    <a
                      href="mailto:panpacific365@gmail.com"
                      className="hover:text-white"
                    >
                      panpacific365@gmail.com
                    </a>
                  </p>
                  <p>
                    🌐{" "}
                    <a
                      href="https://www.panpacific.com.vn"
                      target="_blank"
                      className="hover:text-white"
                    >
                      www.panpacific.com.vn
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Trụ Sở & PDD Hồ Chí Minh</h4>
                <ul className="space-y-3 text-white text-sm">
                  <li>
                    <p className="font-medium text-white mb-1">Trụ sở chính:</p>
                    <p>349B Lạc Long Quân, P.5, Q.11, TP.HCM</p>
                  </li>
                  <li>
                    <p className="font-medium text-white mb-1">Chi nhánh 2:</p>
                    <p>877 Lê Đức Thọ, P.16, Q.Gò Vấp, TP.HCM</p>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">
                  PDD Miền Trung & Miền Bắc
                </h4>
                <ul className="space-y-3 text-white text-sm">
                  <li>
                    <p className="font-medium text-white mb-1">PDD Đà Nẵng:</p>
                    <p>68 Vũ Lập, P.Hòa Khánh Nam, Q.Liên Chiểu, TP.Đà Nẵng</p>
                  </li>
                  <li>
                    <p className="font-medium text-white mb-1">PDD Hà Nội:</p>
                    <p>
                      54 Nguyễn Chí Thanh, P.Láng Thượng, Q.Đống Đa, TP.Hà Nội
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            
          </div>
        </footer>
      </body>
    </html>
  );
}
