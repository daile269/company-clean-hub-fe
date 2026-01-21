"use client";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="
    bg-[#19AD70]          /* mobile: chỉ màu xanh */
    md:bg-gradient-to-r   /* desktop: gradient */
    md:from-white 
    md:from-[20%] 
    md:to-[#19AD70] 
    md:to-[20%]
    shadow-sm sticky top-0 z-50
  "
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <a href="/">
            <div className="flex items-center">
              <div className="w-16 h-16 flex-shrink-0 rounded">
                <img
                  src="/logo.png"
                  alt="PANPACIFIC"
                  className="w-full h-full object-contain transform scale-180 ml-8"
                />
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8  px-4 sm:px-6 lg:px-8">
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </a>
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <a href="/services/ve-sinh-kinh-alu" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh kính-alu</a>
                  <a href="/services/ve-sinh-van-phong" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh văn phòng</a>
                  <a href="/services/ve-sinh-theo-gio" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh theo giờ</a>
                  <a href="/services/ve-sinh-truong-hoc" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh trường học</a>
                  <a href="/services/ve-sinh-giat-ghe-tham" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh, giặt ghế thảm</a>
                  <a href="/services/tong-ve-sinh" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Tổng vệ sinh</a>
                  <a href="/services/ve-sinh-tttm-sieu-thi" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh TTTM-siêu thị</a>
                  <a href="/services/ve-sinh-nha-xuong" className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100">Vệ sinh nhà xưởng</a>
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
            <a
              href="/admin/login"
              className="text-white font-bold transition uppercase relative pb-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300"
            >
              🔐 Đăng nhập
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:bg-[#159461] rounded transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <nav className="flex flex-col gap-3">
              <a
                href="/"
                className="text-white font-bold uppercase py-2 hover:bg-[#159461] px-3 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trang chủ
              </a>
              <a
                href="/#about"
                className="text-white font-bold uppercase py-2 hover:bg-[#159461] px-3 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Giới thiệu
              </a>

              {/* Mobile Services Submenu */}
              <div className="border-l-2 border-white/30 pl-3">
                <p className="text-white/80 text-sm uppercase mb-2">Dịch vụ</p>
                <div className="flex flex-col gap-2">
                  <a href="/services/ve-sinh-kinh-alu" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh kính-alu</a>
                  <a href="/services/ve-sinh-van-phong" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh văn phòng</a>
                  <a href="/services/ve-sinh-theo-gio" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh theo giờ</a>
                  <a href="/services/ve-sinh-truong-hoc" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh trường học</a>
                  <a href="/services/ve-sinh-giat-ghe-tham" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh, giặt ghế thảm</a>
                  <a href="/services/tong-ve-sinh" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Tổng vệ sinh</a>
                  <a href="/services/ve-sinh-tttm-sieu-thi" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh TTTM-siêu thị</a>
                  <a href="/services/ve-sinh-nha-xuong" onClick={() => setMobileMenuOpen(false)} className="text-white py-1.5 px-3 rounded transition text-sm hover:bg-[#159461]">Vệ sinh nhà xưởng</a>
                </div>
              </div>

              <a
                href="/#customers"
                className="text-white font-bold uppercase py-2 hover:bg-[#159461] px-3 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Khách hàng
              </a>
              <a
                href="/#news"
                className="text-white font-bold uppercase py-2 hover:bg-[#159461] px-3 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tin tức
              </a>
              <a
                href="/#contact"
                className="text-white font-bold uppercase py-2 hover:bg-[#159461] px-3 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Liên hệ
              </a>
              <a
                href="/admin/login"
                className="text-white font-bold uppercase py-2 hover:bg-[#159461] px-3 rounded transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔐 Đăng nhập
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
