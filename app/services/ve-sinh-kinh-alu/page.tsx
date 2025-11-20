import FadeInSection from "@/components/FadeInSection";

export default function VeSinhKinhAlu() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-32 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/vs-alu.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Vệ Sinh Kính - Alu</h1>
          <p className="text-xl text-gray-200">
            Dịch vụ vệ sinh kính, cửa nhôm kính chuyên nghiệp cho tòa nhà cao
            tầng
          </p>
        </div>
      </section>

      {/* Giới thiệu dịch vụ */}
      <FadeInSection>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-[#4CCF96] mb-6">
                  Dịch Vụ Vệ Sinh Kính - Alu
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Kính là loại vật liệu có độ bền cao, sức chịu lực tốt. Nhưng
                    đó là trong trường hợp nó được vệ sinh một cách định kỳ và
                    thường xuyên. Sau một khoảng thời gian sử dụng với tiếp xúc
                    của thời tiết, nếu chúng không được vệ sinh và bảo dưỡng thì
                    có thể sẽ bị ăn mòn, làm mất lớp men bảo vệ, dẫn tới hiện
                    tượng dột, thấm nước tòa nhà.
                  </p>
                  <p>
                    Với bề dày kinh nghiệm chúng tôi mang đến dịch vụ với chất
                    lượng tốt nhất. Với kinh nghiệm và am hiểu sâu sắc về tính
                    chất hoạt động của từng loại hình, chúng tôi xây dựng quy
                    trình chuẩn hóa và kiểm chứng trong nhiều năm với các loại
                    hình khác nhau.
                  </p>
                  <p>
                    Chúng tôi cung cấp dịch vụ vệ sinh toàn diện và bảo trì hàng
                    ngày cho mọi loại hình, ví dụ như chung cư, tòa nhà, văn
                    phòng, ngân hàng, bệnh viện, trường học, nhà máy, sân bay,
                    phòng gym…
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/vs-alu.jpg"
                  alt="Vệ sinh kính alu"
                  className="rounded-lg shadow-xl w-full h-auto object-cover"
                  width={800}
                  height={600}
                />
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Dịch vụ khác */}
      <FadeInSection>
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              DỊCH VỤ
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {/* Vệ Sinh Kính Mặt Ngoài */}
              <a href="/services/ve-sinh-kinh-mat-ngoai" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48">
                    <img
                      src="/vs-kmtt.jpg"
                      alt="Vệ Sinh Kính Mặt Ngoài"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vệ Sinh Kính Mặt Ngoài
                    </h3>
                  </div>
                </div>
              </a>

              {/* Vệ Sinh Kính Mặt Trong */}
              <a href="/services/ve-sinh-kinh-mat-trong" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48">
                    <img
                      src="/vs-kmt.jpg"
                      alt="Vệ Sinh Kính Mặt Trong"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vệ Sinh Kính Mặt Trong
                    </h3>
                  </div>
                </div>
              </a>

              {/* Vệ Sinh Alu */}
              <a href="/services/ve-sinh-alu" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48">
                    <img
                      src="/vs-alu.jpg"
                      alt="Vệ Sinh Alu"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vệ Sinh Alu
                    </h3>
                  </div>
                </div>
              </a>

              {/* Vệ Sinh Logo - Bảng Hiệu */}
              <a href="/services/ve-sinh-logo-bang-hieu" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48">
                    <img
                      src="/vs-bh.jpg"
                      alt="Vệ Sinh Logo - Bảng Hiệu"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vệ Sinh Logo - Bảng Hiệu
                    </h3>
                  </div>
                </div>
              </a>

              {/* Vệ Sinh Kính Sào Xây Dựng */}
              <a href="/services/ve-sinh-kinh-sao-xay-dung" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48">
                    <img
                      src="/vsk-s.jpg"
                      alt="Vệ Sinh Kính Sào Xây Dựng"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Vệ Sinh Kính Sào Xây Dựng
                    </h3>
                  </div>
                </div>
              </a>

              {/* Tẩy Ố Trên Kính */}
              <a href="/services/tay-o-tren-kinh" className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                  <div className="relative h-48">
                    <img
                      src="/tayok.jpg"
                      alt="Tẩy Ố Trên Kính"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-bold text-gray-900">
                      Tẩy Ố Trên Kính
                    </h3>
                  </div>
                </div>
              </a>
            </div>

            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 mt-16">
              DỊCH VỤ KHÁC
            </h2>
            <FadeInSection>
              <section id="services" className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      Giải pháp & dịch vụ Opti Clean
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Vệ sinh văn phòng */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
                      <img
                        src="/vs-vp.jpg"
                        alt="Vệ sinh văn phòng"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Vệ sinh văn phòng
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Duy trì văn phòng luôn sạch sẽ, thoáng mát với quy trình
                        chuyên nghiệp, đảm bảo môi trường làm việc tốt nhất.
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
                      <img
                        src="/vs-time.jpg"
                        alt="Vệ sinh theo giờ"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Vệ sinh theo giờ
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Dịch vụ vệ sinh linh hoạt theo giờ, phù hợp với mọi nhu
                        cầu và thời gian của quý khách hàng.
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
                      <img
                        src="/vs-sc.jpg"
                        alt="Vệ sinh trường học"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Vệ sinh trường học
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Dịch vụ vệ sinh chuyên biệt cho trường học, đảm bảo môi
                        trường học tập an toàn và sạch sẽ cho học sinh.
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
                      <img
                        src="/vs-tham.jpg"
                        alt="Vệ sinh, giặt ghế thảm"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Vệ sinh, giặt ghế thảm
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Giặt hấp ghế sofa, thảm chuyên nghiệp với công nghệ hiện
                        đại, loại bỏ vi khuẩn và mùi hôi hiệu quả.
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
                      <img
                        src="/vs-tong.jpg"
                        alt="Tổng vệ sinh"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Tổng vệ sinh
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Dịch vụ tổng vệ sinh toàn diện sau xây dựng, sự kiện
                        hoặc định kỳ với đội ngũ chuyên nghiệp.
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
                      <img
                        src="/vs-st.webp"
                        alt="Vệ sinh TTTM - siêu thị"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Vệ sinh TTTM-siêu thị
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Vệ sinh trung tâm thương mại, siêu thị với quy trình
                        chuyên nghiệp, đảm bảo môi trường mua sắm sạch sẽ.
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
                      <img
                        src="/vs-nx.jpg"
                        alt="Vệ sinh nhà xưởng"
                        className="w-full h-40 object-cover rounded-md mb-4"
                        width={640}
                        height={240}
                      />
                      <h3 className="text-xl font-bold mb-3 text-[#4CCF96]">
                        Vệ sinh nhà xưởng
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Vệ sinh nhà máy, xưởng sản xuất theo tiêu chuẩn công
                        nghiệp, đảm bảo an toàn và vệ sinh lao động.
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
            </FadeInSection>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}
