import ClientsSlider from "@/components/ClientsSlider";
import FadeInSection from "@/components/FadeInSection";
import Link from "next/link";

export default function VeSinhGiatGheTham() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative text-white py-32 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/vs-tham.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4">Vệ Sinh, Giặt Ghế Thảm</h1>
          <p className="text-xl text-gray-200">
            Giặt hấp ghế sofa, thảm chuyên nghiệp với công nghệ hiện đại
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
                  Dịch Vụ Vệ Sinh, Giặt Ghế Thảm
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Ghế sofa và thảm là những vật dụng dễ tích tụ bụi bẩn, vi
                    khuẩn và mùi hôi khó chịu. Dịch vụ giặt hấp ghế thảm của
                    Opti Clean sử dụng công nghệ hấp nóng chuyên sâu, loại bỏ
                    triệt để vết bẩn, vi khuẩn, bụi bẩn và mùi hôi.
                  </p>
                  <p>
                    Chúng tôi sử dụng máy móc hiện đại nhập khẩu từ Châu Âu, hóa
                    chất chuyên dụng an toàn cho da, không gây kích ứng. Quy
                    trình giặt hấp khoa học giúp làm sạch sâu bên trong sợi vải,
                    đồng thời bảo vệ chất liệu, màu sắc của ghế và thảm.
                  </p>
                  <p>
                    Phục vụ đa dạng: ghế sofa vải, da, nỉ; thảm trải sàn, thảm
                    văn phòng, thảm cao cấp; nệm, rèm cửa, đệm ghế ô tô...
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/vs-tham.jpg"
                  alt="Vệ sinh giặt ghế thảm"
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
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
              CÁC DỊCH VỤ KHÁC
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vệ sinh kính-alu */}
              <Link href="/services/ve-sinh-kinh-alu" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                    Dịch vụ vệ sinh kính, cửa nhôm kính chuyên nghiệp cho tòa
                    nhà, văn phòng với đội ngũ lành nghề và thiết bị hiện đại.
                  </p>
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>

              {/* Vệ sinh văn phòng */}
              <Link href="/services/ve-sinh-van-phong" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>

              {/* Vệ sinh theo giờ */}
              <Link href="/services/ve-sinh-theo-gio" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                    Dịch vụ vệ sinh linh hoạt theo giờ, phù hợp với mọi nhu cầu
                    và thời gian của quý khách hàng, nhanh chóng – tiện lợi..
                  </p>
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>

              {/* Vệ sinh trường học */}
              <Link href="/services/ve-sinh-truong-hoc" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>

              {/* Tổng vệ sinh */}
              <Link href="/services/tong-ve-sinh" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                    Dịch vụ tổng vệ sinh toàn diện sau xây dựng, sự kiện hoặc
                    định kỳ nhanh chóng với đội ngũ chuyên nghiệp.
                  </p>
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>

              {/* Vệ sinh TTTM-siêu thị */}
              <Link href="/services/ve-sinh-tttm-sieu-thi" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>

              {/* Vệ sinh nhà xưởng */}
              <Link href="/services/ve-sinh-nha-xuong" className="block">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer">
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
                    đảm bảo sạch sẽ,an toàn và vệ sinh lao động.
                  </p>
                  <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>
      {/* Khách Hàng Tiêu Biểu */}
      <FadeInSection>
        <section id="customers" className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#8B6F47] mb-4">
                ĐỐI TÁC LÂU NĂM
              </h2>
            </div>

            {/* Logo Slider */}
            <ClientsSlider />
          </div>
        </section>
      </FadeInSection>
      {/* Liên Hệ */}
      <FadeInSection>
        <section id="contact" className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Liên Hệ Với Chúng Tôi
              </h2>
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
            <div className="mt-6 text-center">
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
                  <span className="font-semibold">Thời gian làm việc:</span> Thứ
                  2 - Chủ Nhật (8:00 - 18:00)
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>
    </div>
  );
}
