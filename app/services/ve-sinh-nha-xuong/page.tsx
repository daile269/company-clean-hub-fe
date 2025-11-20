import FadeInSection from "@/components/FadeInSection";

export default function VeSinhNhaXuong() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-32 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/vs-nx.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Vệ Sinh Nhà Xưởng</h1>
          <p className="text-xl text-gray-200">
            Vệ sinh nhà máy, xưởng sản xuất theo tiêu chuẩn công nghiệp
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
                  Dịch Vụ Vệ Sinh Nhà Xưởng
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Nhà máy và xưởng sản xuất có yêu cầu vệ sinh rất cao để đảm
                    bảo an toàn vệ sinh lao động và chất lượng sản phẩm. Dịch vụ
                    vệ sinh nhà xưởng của Opti Clean được thiết kế đặc biệt để
                    đáp ứng các tiêu chuẩn nghiêm ngặt của môi trường công
                    nghiệp.
                  </p>
                  <p>
                    Chúng tôi có kinh nghiệm làm việc với nhiều loại hình nhà
                    máy khác nhau: điện tử, thực phẩm, dược phẩm, may mặc, cơ
                    khí... Đội ngũ được đào tạo chuyên sâu về an toàn lao động,
                    sử dụng thiết bị công nghiệp và hóa chất phù hợp cho từng
                    loại hình sản xuất.
                  </p>
                  <p>
                    Cam kết: không gây gián đoạn sản xuất, tuân thủ nghiêm ngặt
                    quy định an toàn, vệ sinh đúng tiêu chuẩn ISO, GMP, 5S...
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/vs-nx.jpg"
                  alt="Vệ sinh nhà xưởng"
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
              CÁC DỊCH VỤ KHÁC
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Vệ sinh kính-alu */}
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
                <img
                  src="/vs-alu.jpg"
                  alt="Vệ sinh kính-alu"
                  className="w-full h-40 object-cover rounded-md mb-4"
                  width={640}
                  height={240}
                />
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
            </div>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}
