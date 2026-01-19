import Intro from "../components/Intro";
import FadeInSection from "../components/FadeInSection";
import ClientsSlider from "../components/ClientsSlider";
import Link from "next/link";
import NewsSlider from "../components/NewsSlider";

export default function Home() {
  return (
    <div className="bg-[#e4efe7]">
      {/* Hero Section */}

      <section
        className="relative text-white w-full h-[20vh] md:h-[80vh] bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('/banner-hd.jpg')`,
        }}
      ></section>
      <img src="/banner-bg-5.png" alt="" />
      {/* Animated Intro (image + text) */}
      <Intro />

      {/* Lời Cảm Ơn Chân Thành */}
      <FadeInSection>
        <section id="about" className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-[#4CCF96] mb-6">
                  Giới Thiệu Opti Clean
                </h2>

                <div className="space-y-4 text-gray-700">
                  <p className="italic font-semibold">
                    PANPACIFIC chân thành cảm ơn quý khách hàng đã quan tâm tới
                    sản phẩm và dịch vụ Opti Clean của chúng tôi.
                  </p>

                  <p>
                    Opti Clean kết hợp đội ngũ chuyên viên kỹ thuật nhiều năm
                    kinh nghiệm và nhân viên được đào tạo bài bản, vận hành theo
                    quy trình chuẩn.
                  </p>

                  <p>
                    Bên cạnh đó, Opti Clean sử dụng máy móc, dụng cụ và hóa chất
                    hiện đại, liên tục cải tiến để đảm bảo hiệu quả và an toàn
                    cho khách hàng.
                  </p>

                  <p className="text-center text-[#FF6B6B] font-bold text-xl italic py-4">
                    "Tận Tâm Trong Công Việc - Tận Tình Với Khách Hàng"
                  </p>

                  <p>
                    Chúng tôi tự tin mang lại giải pháp tối ưu với sản phẩm Opti
                    Clean, giúp tiết kiệm chi phí và nâng cao chất lượng cuộc
                    sống cho khách hàng.
                  </p>
                </div>
              </div>

              {/* Right side - Image */}
              <div className="relative">
                <img
                  src="/thank.png"
                  alt="Opti Clean - PANPACIFIC"
                  className="rounded-lg shadow-2xl w-[90%] h-[400px] object-cover"
                  width="800"
                  height="600"
                />
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Services Section */}
      <FadeInSection>
        <section id="services" className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Giải pháp & dịch vụ Opti Clean
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Vệ sinh kính-alu */}
              <div className="block">
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
                    Dịch vụ vệ sinh kính, cửa nhôm kính chuyên nghiệp cho tòa
                    nhà, văn phòng với đội ngũ lành nghề và thiết bị hiện đại.
                  </p>
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Vệ sinh văn phòng */}
              <div className="block">
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
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Vệ sinh theo giờ */}
              <div className="block">
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
                    Dịch vụ vệ sinh linh hoạt theo giờ, phù hợp với mọi nhu cầu
                    và thời gian của quý khách hàng, nhanh chóng – tiện lợi.
                  </p>
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Vệ sinh trường học */}
              <div className="block">
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
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Vệ sinh, giặt ghế thảm */}
              <div className="block">
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
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Tổng vệ sinh */}
              <div className="block">
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
                    Dịch vụ tổng vệ sinh toàn diện sau xây dựng, sự kiện hoặc
                    định kỳ nhanh chóng với đội ngũ chuyên nghiệp.
                  </p>
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Vệ sinh TTTM-siêu thị */}
              <div className="block">
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
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>

              {/* Vệ sinh nhà xưởng */}
              <div className="block">
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
                    đảm bảo sạch sẽ,an toàn và vệ sinh lao động.
                  </p>
                  {/* <span className="text-blue-600 font-medium hover:text-blue-800">
                    Xem Thêm →
                  </span> */}
                </div>
              </div>
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

      {/* Tin Tức Mới Nhất */}
      <FadeInSection>
        <section id="news" className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Tin Tức</h2>
            </div>

            <div className="">
              {/* News slider replaces grid */}
              <div className="max-w-7xl mx-auto">
                <div className="px-4 sm:px-6 lg:px-8">
                  {/* Lazy load client component on client side only */}
                  {/* eslint-disable-next-line @next/next/no-jsx-in-html-comments */}
                  <div>
                    {/* Importing component directly */}
                    {/* @ts-ignore */}
                    <NewsSlider />
                  </div>
                </div>
              </div>
            </div>
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
                  <img src="/Icon_of_Zalo.svg.png" alt="Zalo" className="w-8 h-8" />
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
                    href="mailto: info@opticlean.com.vn"
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                   info@opticlean.com.vn
                  </a>
                  hoặc
                  <a
                    href="mailto: info@opticlean.com.vn"
                    className="text-blue-600 hover:text-blue-800 ml-2"
                  >
                   info@opticlean.com.vn
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
