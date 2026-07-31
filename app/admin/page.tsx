export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Banner Section - Scaled down for dashboard preview and rounded */}
      <div className="relative w-full h-[25vh] md:h-[40vh] rounded-2xl overflow-hidden shadow-lg border border-emerald-100/30 group">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('/banner-hd.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 via-transparent to-black/30" />
      </div>

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
              Thông tin Hệ thống & Liên hệ
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              Thông tin pháp lý và mạng lưới văn phòng đại diện trên toàn quốc
            </p>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Legal & General Info */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-gray-900 text-lg">Thông tin pháp lý</h3>
            </div>
            <div className="space-y-3.5 text-sm text-gray-600">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Đơn vị chủ quản</p>
                <p className="font-semibold text-gray-800 mt-0.5">CÔNG TY TNHH PANPACIFIC</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mã số thuế</p>
                  <p className="font-semibold text-gray-800 mt-0.5">0317443120</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Website</p>
                  <a
                    href="https://opticlean.com.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    opticlean.com.vn
                  </a>
                </div>
              </div>
              <div className="pt-2.5 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📞</span>
                  <span>
                    Hotline:{" "}
                    <a href="tel:02866838966" className="text-gray-800 hover:text-emerald-600 font-medium">
                      028 6683 8966
                    </a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">💬</span>
                  <span>
                    Zalo:{" "}
                    <a href="tel:0367897956" className="text-gray-800 hover:text-emerald-600 font-medium">
                      036 789 7956
                    </a>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">📧</span>
                  <div className="flex flex-col text-xs md:text-sm">
                    <a href="mailto:info@opticlean.com.vn" className="text-gray-800 hover:text-emerald-600 font-medium break-all">
                      info@opticlean.com.vn
                    </a>
                    <a href="mailto:sp.opticlean@gmail.com" className="text-gray-500 hover:text-emerald-600 break-all">
                      sp.opticlean@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Southern Offices */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-gray-900 text-lg">Khu vực Miền Nam</h3>
            </div>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50/20 transition-all duration-300">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Trụ sở chính
                </p>
                <p className="font-semibold text-gray-800 mt-1">349B Lạc Long Quân</p>
                <p className="text-xs text-gray-500 mt-0.5">Phường 5, Quận 11, TP. Hồ Chí Minh</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50/20 transition-all duration-300">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Chi nhánh Gò Vấp</p>
                <p className="font-semibold text-gray-800 mt-1">877 Lê Đức Thọ</p>
                <p className="text-xs text-gray-500 mt-0.5">Phường 16, Quận Gò Vấp, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Central & Northern Offices */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </span>
              <h3 className="font-bold text-gray-900 text-lg">Miền Trung & Miền Bắc</h3>
            </div>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50/20 transition-all duration-300">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Văn phòng Đà Nẵng</p>
                <p className="font-semibold text-gray-800 mt-1">68 Vũ Lập</p>
                <p className="text-xs text-gray-500 mt-0.5">P. Hòa Khánh Nam, Q. Liên Chiểu, TP. Đà Nẵng</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-emerald-50/20 transition-all duration-300">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Văn phòng Hà Nội</p>
                <p className="font-semibold text-gray-800 mt-1">54 Nguyễn Chí Thanh</p>
                <p className="text-xs text-gray-500 mt-0.5">Phường Láng Thượng, Quận Đống Đa, TP. Hà Nội</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

