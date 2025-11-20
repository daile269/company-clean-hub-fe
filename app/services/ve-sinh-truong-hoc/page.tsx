import FadeInSection from "@/components/FadeInSection";

export default function VeSinhTruongHoc() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-32 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/vs-sc.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Vệ Sinh Trường Học</h1>
          <p className="text-xl text-gray-200">
            Dịch vụ vệ sinh chuyên biệt cho trường học, đảm bảo môi trường học
            tập an toàn
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
                  Dịch Vụ Vệ Sinh Trường Học
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Môi trường học tập sạch sẽ, an toàn là điều kiện tiên quyết
                    để các em học sinh có thể phát triển toàn diện. Dịch vụ vệ
                    sinh trường học của Opti Clean được thiết kế đặc biệt để đáp
                    ứng các tiêu chuẩn vệ sinh nghiêm ngặt trong môi trường giáo
                    dục.
                  </p>
                  <p>
                    Chúng tôi sử dụng hóa chất thân thiện với trẻ em, an toàn
                    tuyệt đối, không gây kích ứng da hay đường hô hấp. Đội ngũ
                    nhân viên được đào tạo chuyên sâu về vệ sinh môi trường
                    trường học, hiểu rõ các yêu cầu đặc thù của từng khu vực.
                  </p>
                  <p>
                    Chúng tôi phục vụ đa dạng các loại hình: mầm non, tiểu học,
                    trung học, đại học, trung tâm ngoại ngữ, dạy nghề với quy
                    trình vệ sinh phù hợp cho từng độ tuổi.
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/vs-sc.jpg"
                  alt="Vệ sinh trường học"
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
                  Vệ sinh nhà máy, xưởng sản xuất theo tiêu chuẩn công nghiệp,
                  đảm bảo an toàn và vệ sinh lao động.
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
  );
}
