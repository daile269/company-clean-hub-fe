export default function UserHomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Dịch Vụ Vệ Sinh Công Nghiệp Chuyên Nghiệp
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Chúng tôi là công ty hàng đầu về dịch vụ vệ sinh công nghiệp, với sứ mệnh mang lại những không gian sạch sẽ, thoáng mát
            </p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
              Đặt Dịch Vụ Ngay
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Về Chúng Tôi</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Tận tâm trong công việc, Tận tình với khách hàng
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600">Năm Kinh Nghiệm</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">300+</div>
              <div className="text-gray-600">Khách Hàng</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">3700+</div>
              <div className="text-gray-600">Nhân Sự</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Cam Kết Chất Lượng</div>
            </div>
          </div>

          <div className="bg-blue-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Lịch Sử Hình Thành Và Phát Triển</h3>
            <p className="text-gray-700 leading-relaxed">
              Được thành lập với hơn 15 năm kinh nghiệm, hợp tác với hơn 300 khách hàng và đội ngũ với hơn 3700 nhân sự trong lĩnh vực dịch vụ vệ sinh công nghiệp, chúng tôi hoàn toàn tự tin sẽ tạo ra giá trị cho khách và đối tác. Chúng tôi luôn cam kết duy nhất một chất lượng và thái độ tận tâm phục vụ quý khách hàng.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Dịch Vụ Của Chúng Tôi</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🧹</div>
              <h3 className="text-xl font-bold mb-3">Dịch Vụ Vệ Sinh</h3>
              <p className="text-gray-600 mb-4">
                Chúng tôi duy trì vệ sinh văn phòng, nhà máy, trường học, bệnh viện,... luôn sạch sẽ bằng các quy trình chuyên nghiệp theo tiêu chuẩn quốc tế.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-800">Xem Thêm →</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="text-xl font-bold mb-3">Chăm Sóc Mảng Xanh</h3>
              <p className="text-gray-600 mb-4">
                Thiết kế thi công vườn. Cho thuê, cung cấp, chăm sóc hoa và cây cảnh. Chăm sóc nền, bãi cỏ, cắt tỉa cành, cắt cỏ.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-800">Xem Thêm →</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">🐛</div>
              <h3 className="text-xl font-bold mb-3">Kiểm Soát Côn Trùng</h3>
              <p className="text-gray-600 mb-4">
                Kiểm soát côn trùng, động vật gây hại cho các doanh nghiệp, nhà máy, tòa nhà, văn phòng… với đội ngũ kỹ thuật chuyên nghiệp.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-800">Xem Thêm →</button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
              <div className="text-4xl mb-4">👷</div>
              <h3 className="text-xl font-bold mb-3">Cung Ứng Lao Động</h3>
              <p className="text-gray-600 mb-4">
                Với kinh nghiệm trong ngành tuyển dụng nhân sự nhiều năm. Cam kết chỉ cung cấp lao động chất lượng, đã được tuyển chọn kỹ càng.
              </p>
              <button className="text-blue-600 font-medium hover:text-blue-800">Xem Thêm →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tiên Phong Mang Robot Vào Vệ Sinh Công Nghiệp
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Tăng năng suất</h4>
                    <p className="text-gray-600">Sử dụng robot trong vệ sinh công nghiệp giúp tăng năng suất đáng kể, dễ vận hành và có khả năng làm việc liên tục.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Giảm chi phí dài hạn</h4>
                    <p className="text-gray-600">Mặc dù đầu tư ban đầu có thể cao hơn, sử dụng robot có thể giảm chi phí dài hạn thông qua tăng năng suất.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-blue-600 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Đảm bảo chất lượng</h4>
                    <p className="text-gray-600">Robot có khả năng làm việc một cách chính xác và đồng nhất, giúp đảm bảo chất lượng vệ sinh tốt hơn.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-12 rounded-lg text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-4">Công nghệ 4.0</h3>
              <p className="text-gray-700">
                "Mang đổi mới đến mọi nơi, chúng tôi tự hào là tổ chức sáng tạo thông qua công nghệ vệ sinh robot 4.0"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trải Nghiệm Của Khách Hàng</h2>
            <p className="text-lg text-gray-600">Đối Tác Lâu Năm</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
            <p className="text-gray-700 text-lg mb-6 italic">
              "Là đối tác lâu năm với chúng tôi về dịch vụ vệ sinh công nghiệp, luôn mang đến sự an tâm cho chúng tôi về không gian sạch sẽ, với đội ngũ tận tâm và chuyên nghiệp."
            </p>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                LH
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Ông Lương Quang Hiển</h4>
                <p className="text-gray-600">Tổng Giám đốc - Công ty TNHH Đầu tư xây dựng Bắc Bình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Sẵn sàng làm việc cùng chúng tôi?</h2>
          <p className="text-xl mb-8">Liên hệ ngay để được tư vấn miễn phí</p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
              📞 Gọi ngay: 028 3957 4483
            </button>
            <button className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-400 transition border-2 border-white">
              ✉️ Gửi yêu cầu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
