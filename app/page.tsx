export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative text-white py-20 w-full h-[100vh] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/banner-home.png')`,
        }}
      ></section>

      <section className="py-16 bg-[#A6F4D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Right side - Image */}
            <div className="relative">
              <img
                src="/intro-image.png"
                alt="PANPACIFIC Cleaning Services"
                className="rounded-lg shadow-2xl w-[60%] h-auto object-cover"
                width="600"
                height="400"
              />
            </div>
            {/* Left side - Text content */}
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-6 text-[#262626]">
                PANPACIFIC - DỊCH VỤ VỆ SINH CÔNG NGHIỆP CHUYÊN NGHIỆP
              </h1>
              <p className="text-xl mb-8 text-gray-800">
                Chúng tôi là công ty hàng đầu về dịch vụ vệ sinh công nghiệp,
                với sứ mệnh mang lại những không gian sạch sẽ, thoáng mát
              </p>
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
                Đặt Dịch Vụ Ngay
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lời Cảm Ơn Chân Thành */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-[#4CCF96] mb-6">
                Lời Cảm Ơn Chân Thành
              </h2>

              <div className="space-y-4 text-gray-700">
                <p className="italic font-semibold">
                  PANPACIFIC chân thành cảm ơn quý khách hàng đã quan tâm tới
                  dịch vụ của công ty chúng tôi.
                </p>

                <p>
                  Với đội ngũ chuyên viên kỹ thuật có nhiều năm kinh nghiệm,
                  cùng với đội ngũ nhân viên vệ sinh có lý lịch nhân thân rõ
                  ràng, được đào tạo kỹ năng nghiệp vụ.
                </p>

                <p>
                  Bên cạnh đó với sự đầu tư hạ tầng của máy móc, công cụ dụng cụ
                  hiện đại và luôn được cải tiến đổi mới sẽ cung cấp dịch vụ tốt
                  nhất cho khách hàng với tiêu chí...
                </p>

                <p className="text-center text-[#FF6B6B] font-bold text-xl italic py-4">
                  "Tận Tâm Trong Công Việc - Tận Tình Với Khách Hàng"
                </p>

                <p>
                  Chúng tôi tự tin mang lại những dịch vụ tối ưu, tiết kiệm nhất
                  góp phần nâng cao hơn những giá trị cuộc sống cho quý khách
                  hàng và cộng đồng!
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative">
              <img
                src="/thank.png"
                alt="PANPACIFIC cleaning service"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
                width="800"
                height="600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dịch Vụ Của Chúng Tôi
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Vệ sinh kính-alu */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🪟</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh kính-alu
              </h3>
              <p className="text-gray-600 mb-4">
                Dịch vụ vệ sinh kính, cửa nhôm kính chuyên nghiệp cho tòa nhà,
                văn phòng với đội ngũ lành nghề và thiết bị hiện đại.
              </p>
              <a
                href="/services/ve-sinh-kinh-alu"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Vệ sinh văn phòng */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh văn phòng
              </h3>
              <p className="text-gray-600 mb-4">
                Duy trì văn phòng luôn sạch sẽ, thoáng mát với quy trình chuyên
                nghiệp, đảm bảo môi trường làm việc tốt nhất.
              </p>
              <a
                href="/services/ve-sinh-van-phong"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Vệ sinh theo giờ */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh theo giờ
              </h3>
              <p className="text-gray-600 mb-4">
                Dịch vụ vệ sinh linh hoạt theo giờ, phù hợp với mọi nhu cầu và
                thời gian của quý khách hàng.
              </p>
              <a
                href="/services/ve-sinh-theo-gio"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Vệ sinh trường học */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🏫</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh trường học
              </h3>
              <p className="text-gray-600 mb-4">
                Dịch vụ vệ sinh chuyên biệt cho trường học, đảm bảo môi trường
                học tập an toàn và sạch sẽ cho học sinh.
              </p>
              <a
                href="/services/ve-sinh-truong-hoc"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Vệ sinh, giặt ghế thảm */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🛋️</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh, giặt ghế thảm
              </h3>
              <p className="text-gray-600 mb-4">
                Giặt hấp ghế sofa, thảm chuyên nghiệp với công nghệ hiện đại,
                loại bỏ vi khuẩn và mùi hôi hiệu quả.
              </p>
              <a
                href="/services/ve-sinh-giat-ghe-tham"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Tổng vệ sinh */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🧹</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Tổng vệ sinh
              </h3>
              <p className="text-gray-600 mb-4">
                Dịch vụ tổng vệ sinh toàn diện sau xây dựng, sự kiện hoặc định
                kỳ với đội ngũ chuyên nghiệp.
              </p>
              <a
                href="/services/tong-ve-sinh"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Vệ sinh TTTM-siêu thị */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh TTTM-siêu thị
              </h3>
              <p className="text-gray-600 mb-4">
                Vệ sinh trung tâm thương mại, siêu thị với quy trình chuyên
                nghiệp, đảm bảo môi trường mua sắm sạch sẽ.
              </p>
              <a
                href="/services/ve-sinh-tttm-sieu-thi"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>

            {/* Vệ sinh nhà xưởng */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                Vệ sinh nhà xưởng
              </h3>
              <p className="text-gray-600 mb-4">
                Vệ sinh nhà máy, xưởng sản xuất theo tiêu chuẩn công nghiệp, đảm
                bảo an toàn và vệ sinh lao động.
              </p>
              <a
                href="/services/ve-sinh-nha-xuong"
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Xem Thêm →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Khách Hàng Tiêu Biểu */}
      <section id="customers" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#8B6F47] mb-4">
              ĐỐI TÁC LÂU NĂM
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Đội ngũ nhân viên và quản lí PANPACIFIC luôn làm việc chuyên
              nghiệp và hiệu quả, để mọi không gian của khách hàng luôn sạch sẽ,
              thoáng đãng và góp phần tạo nên môi trường làm việc tốt nhất cho
              đội ngũ nhân viên. Các đối tác tin tưởng và đánh giá cao sự đáng
              tin cậy của PANPACIFIC trong việc mang đến không gian sống và làm
              việc hoàn hảo.
            </p>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img src="/mb.png" alt="Samsung" className="max-w-full h-auto" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img
                src="/ex.png"
                alt="First Solar"
                className="max-w-full h-auto"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img
                src="/nk.png"
                alt="AEON Mall"
                className="max-w-full h-auto"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img src="/acb.jpg" alt="Olam" className="max-w-full h-auto" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img src="/cgv.jpg" alt="Jabil" className="max-w-full h-auto" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img src="/school1.jpg" alt="H&M" className="max-w-full h-auto" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img
                src="/vh.png"
                alt="Coca Cola"
                className="max-w-full h-auto"
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img src="/flc.jpg" alt="HSBC" className="max-w-full h-auto" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img src="/kd.png" alt="Client 9" className="max-w-full h-auto" />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center hover:shadow-xl transition">
              <img
                src="/th.png"
                alt="Client 10"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tin Tức Mới Nhất */}
      <section id="news" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tin Tức Mới Nhất
            </h2>
            <p className="text-gray-600">
              Cập nhật thông tin và xu hướng vệ sinh công nghiệp
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src="/rb.png"
                alt="News 1"
                className="w-full h-48 object-cover"
                width="400"
                height="192"
              />
              <div className="p-6">
                <span className="text-sm text-[#4CCF96] font-semibold">
                  Công nghệ
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3 text-[#4CCF96]">
                  Robot vệ sinh thông minh - Xu hướng mới trong ngành
                </h3>
                <p className="text-gray-600 mb-4">
                  Công nghệ robot vệ sinh đang dần thay đổi cách thức quản lý vệ
                  sinh tại các tòa nhà lớn...
                </p>
                <a
                  href="/news/robot-ve-sinh"
                  className="text-blue-600 font-medium hover:text-blue-800"
                >
                  Đọc thêm →
                </a>
              </div>
            </div>

            {/* Article 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src="/mt.png"
                alt="News 2"
                className="w-full h-48 object-cover"
                width="400"
                height="192"
              />
              <div className="p-6">
                <span className="text-sm text-[#4CCF96] font-semibold">
                  Môi trường
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3 text-[#4CCF96]">
                  Sử dụng hóa chất thân thiện với môi trường
                </h3>
                <p className="text-gray-600 mb-4">
                  PANPACIFIC cam kết sử dụng các sản phẩm vệ sinh không gây hại
                  cho môi trường và sức khỏe...
                </p>
                <a
                  href="/news/hoa-chat-xanh"
                  className="text-blue-600 font-medium hover:text-blue-800"
                >
                  Đọc thêm →
                </a>
              </div>
            </div>

            {/* Article 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
              <img
                src="/dd.png"
                alt="News 3"
                className="w-full h-48 object-cover"
                width="400"
                height="192"
              />
              <div className="p-6">
                <span className="text-sm text-[#4CCF96] font-semibold">
                  Dự án
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3 text-[#4CCF96]">
                  Ký kết hợp đồng với tập đoàn Samsung
                </h3>
                <p className="text-gray-600 mb-4">
                  PANPACIFIC vinh dự trở thành đối tác vệ sinh công nghiệp cho
                  các nhà máy Samsung tại Việt Nam...
                </p>
                <a
                  href="/news/hop-tac-samsung"
                  className="text-blue-600 font-medium hover:text-blue-800"
                >
                  Đọc thêm →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liên Hệ */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Liên Hệ Với Chúng Tôi
            </h2>
            <p className="text-gray-600">
              Hãy liên hệ ngay để được tư vấn và báo giá miễn phí
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Zalo */}
            <a
              href="https://zalo.me/0367897956"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-6 p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all hover:scale-110 animate-pulse">
                <img src="/zalo.png" alt="Zalo" className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Chat Zalo
                </h3>
                <p className="text-gray-600 text-lg mb-1">036 789 7956</p>
                <p className="text-blue-600 font-semibold">Nhắn tin ngay →</p>
              </div>
            </a>

            {/* Hotline */}
            <a
              href="#contact"
              className="flex items-center gap-6 p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="flex-shrink-0 w-16 h-16 bg-[#4CCF96] rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Hotline
                </h3>
                <p className="text-gray-600 text-lg mb-1">028 6683 8966</p>
                <p className="text-[#4CCF96] font-semibold">Gọi ngay →</p>
              </div>
            </a>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-gray-50 px-8 py-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:panpacific365@gmail.com"
                  className="text-blue-600 hover:text-blue-800"
                >
                  panpacific365@gmail.com
                </a>
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Thời gian làm việc:</span> Thứ 2
                - Chủ Nhật (8:00 - 18:00)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
